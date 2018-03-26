// @flow
import type {
  ServerError,
  ResponseData,
} from 'phenyl-interfaces'

export default function getStatusCode(resData: ResponseData): number {
  if (resData.type === 'error') {
    return getErrorStatusCode(resData.payload)
  }

  // insert
  if (['insert', 'insertAndGet', 'insertAndGetMulti'].includes(resData.type)) {
    return 201
  }
  return 200
}

function getErrorStatusCode(error: ServerError): number {
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
