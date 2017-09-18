// @flow
import type {
  ResponseData,
  ErrorResultType,
} from 'phenyl-interfaces'

export function createErrorResponse(error: Error, type?: ErrorResultType): ResponseData {
  return {
    error: {
      type: type || guessErrorType(error),
      message: error.message,

    }
  }
}

function guessErrorType(error: Error): ErrorResultType {
  if (error.constructor.name) {
    return 'BadRequest'
  }
  return 'InternalServer'
}
