// @flow

import type {
  EncodedHttpRequest,
  Id,
  QueryStringParams,
  RequestData,
} from 'phenyl-interfaces'


/**
 *
 */
export default function decodeRequest(request: EncodedHttpRequest): [RequestData, ?Id] {
  let reqData: RequestData
  const sessionId = request.headers.Authorization || null
  switch (request.method) {
    case 'GET':
      reqData = decodeGETRequest(request)
      break

    case 'POST':
      reqData = decodePOSTRequest(request)
      break

    case 'PUT':
      reqData = decodePUTRequest(request)
      break

    case 'DELETE':
      reqData = decodeDELETERequest(request)
      break
    default:
      throw new Error(`Could not handle HTTP method: ${request.method}. Only GET|POST|PUT|DELETE are allowed.`)
  }
  return [reqData, sessionId]
}

function decodeGETRequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    qsParams,
  } = request

  const paths = path.split('/') // path[0] must be an empty string.

  if (qsParams == null || Object.keys(qsParams).length === 0) {
    return {
      method: 'get',
      payload: { entityName: paths[1], id: paths[2] }
    }
  }
  const methodName = paths[2]

  if (!methodName) {
    return {
      method: 'runCustomQuery',
      payload: decodeQsParams(qsParams)
    }
  }

  if (methodName === 'find') {
    return {
      method: 'find',
      payload: decodeQsParams(qsParams)
    }
  }

  if (methodName === 'findOne') {
    return {
      method: 'findOne',
      payload: decodeQsParams(qsParams)
    }
  }

  if (methodName === 'getByIds') {
    return {
      method: 'getByIds',
      payload: decodeQsParams(qsParams)
    }
  }
  throw new Error(`Could not decode the given GET request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
}

function decodePOSTRequest(request: EncodedHttpRequest): RequestData {
  const {
    headers,
    path,
    body
  } = request

  if (!body) {
    throw new Error(`Request body is empty in the given POST request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }

  if (headers['X-Phenyl-Custom']) {
    return {
      method: 'runCustomCommand',
      payload: decodeBody(body),
    }
  }

  if (path === '/login') {
    return {
      method: 'login',
      payload: decodeBody(body),
    }
  }

  if (path === '/logout') {
    return {
      method: 'logout',
      payload: decodeBody(body),
    }
  }
  const paths = path.split('/')
  const methodName = paths[2]

  if (methodName === 'insert') {
    return {
      method: 'insert',
      payload: decodeBody(body),
    }
  }

  if (methodName === 'insertAndGet') {
    return {
      method: 'insertAndGet',
      payload: decodeBody(body),
    }
  }
  if (methodName === 'insertAndGetMulti') {
    return {
      method: 'insertAndGetMulti',
      payload: decodeBody(body),
    }
  }
  throw new Error(`Could not decode the given POST request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
}

function decodePUTRequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    body
  } = request

  if (!body) {
    throw new Error(`Request body is empty in the given PUT request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }

  const paths = path.split('/')
  const methodName = paths[2]
  if (methodName === 'update') {
    return {
      method: 'update',
      payload: decodeBody(body),
    }
  }

  if (methodName === 'updateAndGet') {
    return {
      method: 'updateAndGet',
      payload: decodeBody(body),
    }
  }
  if (methodName === 'updateAndFetch') {
    return {
      method: 'updateAndFetch',
      payload: decodeBody(body),
    }
  }
  throw new Error(`Could not decode the given PUT request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
}

function decodeDELETERequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    qsParams,
  } = request

  const paths = path.split('/')

  // multi deletion
  if (paths[2] === 'delete' && qsParams) {
    return {
      method: 'delete',
      payload: decodeQsParams(qsParams),
    }
  }

  if (paths[1] && paths[2]) {
    // single deletion
    return {
      method: 'delete',
      payload: {
        entityName: paths[1],
        id: paths[2],
      }
    }
  }
  throw new Error(`Could not decode the given DELETE request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
}

function decodeBody(body: string): any { // return "any" type for suppressing flow error
  return JSON.parse(body)
}


function decodeQsParams(qsParams: QueryStringParams): any { // return "any" type for suppressing flow error
  return JSON.parse(qsParams.d)
}
