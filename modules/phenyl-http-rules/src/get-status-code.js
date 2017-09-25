// @flow
import type {
  ErrorResult,
  ResponseData,
  RequestMethodName,
} from 'phenyl-interfaces'

export default function getStatusCode(resData: ResponseData): number {
  if (resData.error != null) {
    return getErrorStatusCode(resData.error)
  }

  // insert
  if (resData.insert || resData.insertAndGet || resData.insertAndGetMulti) {
    return 201
  }

  return 200
}

function getErrorStatusCode(error: ErrorResult): number {
  switch (error.type) {
    case 'BadRequest':
      return 400
    case 'Unauthorized':
      return 401
    case 'Forbidden':
      return 403
    case 'NotFound':
      return 404
    case 'InternalServer':
    default:
      return 500
  }
}
