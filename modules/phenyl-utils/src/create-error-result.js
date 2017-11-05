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

export function createErrorResult(error: Error, type?: ErrorResultType): ErrorResult {
  const responseError = new PhenylResponseError(error.message, type)
  responseError.stack = error.stack
  return responseError
}

function guessErrorType(error: Error): ErrorResultType {
  if (error.constructor.name === 'Error') {
    return 'BadRequest'
  }
  return 'InternalServer'
}
