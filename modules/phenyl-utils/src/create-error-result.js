// @flow
import type {
  ErrorResult,
  ErrorResultType,
} from 'phenyl-interfaces'

export function createErrorResult(error: Error, type?: ErrorResultType): ErrorResult {
  return {
    ok: 0,
    type: type || guessErrorType(error),
    message: error.message,
    stack: error.stack
  }
}

function guessErrorType(error: Error): ErrorResultType {
  if (error.constructor.name === 'Error') {
    return 'BadRequest'
  }
  return 'InternalServer'
}
