// @flow
import type {
  ErrorResult,
  ErrorResultType,
} from 'phenyl-interfaces'

export class PhenylResponseError extends Error implements ErrorResult {
  type: ErrorResultType
  ok: 0

  constructor(message: string, type?: ErrorResultType) {
    super(message)
    this.type = type || 'InternalServer'
    this.ok = 0
  }

  toJSON(): ErrorResult {
    return {
      ok: 0,
      type: this.type,
      message: this.message,
      stack: this.stack
    }
  }
}

export function createErrorResult(error: $Supertype<Error | ErrorResult | string>, _type?: ErrorResultType): PhenylResponseError {
  if (typeof error === 'string') {
    return createErrorResult(new Error(error), _type)
  }
  // $FlowIssue(error.type-will-be-ErrorResultType)
  const type: ErrorResultType = (error.type != null) ? error.type : _type
  const responseError = new PhenylResponseError(error.message, type)
  if (error.stack) responseError.stack = error.stack
  return responseError
}

function guessErrorType(error: Error): ErrorResultType { // eslint-disable-line no-unused-vars
  if (error.constructor.name === 'Error') {
    return 'BadRequest'
  }
  return 'InternalServer'
}
