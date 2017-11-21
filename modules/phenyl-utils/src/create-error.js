// @flow
import type {
  ServerError,
  ServerErrorType,
} from 'phenyl-interfaces'

export class PhenylServerError extends Error implements ServerError {
  type: ServerErrorType
  ok: 0
  at: 'server'

  constructor(message: string, type?: ServerErrorType) {
    super(message)
    this.type = type || 'InternalServer'
    this.ok = 0
    this.at = 'server'
  }

  toJSON(): ServerError {
    return {
      ok: 0,
      at: 'server',
      type: this.type,
      message: this.message,
      stack: this.stack
    }
  }
}

export function createServerError(error: $Supertype<Error | ServerError | string>, _type?: ServerErrorType): PhenylServerError {
  if (typeof error === 'string') {
    return createServerError(new Error(error), _type)
  }
  // $FlowIssue(type-is-compatible)
  const type: ServerErrorType = error.type || _type || guessServerErrorType(error)
  const responseError = new PhenylServerError(error.message, type)
  if (error.stack) responseError.stack = error.stack
  return responseError
}

function guessServerErrorType(error: Error): ServerErrorType { // eslint-disable-line no-unused-vars
  if (error.constructor.name === 'Error') {
    return 'BadRequest'
  }
  return 'InternalServer'
}
