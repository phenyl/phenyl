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
  }
  // $FlowIssue(reqData-is-always-initialized)
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
      get: { entityName: path[1], id: path[2] }
    }
  }
  const methodName = path[2]

  if (!methodName) {
    return {
      method: 'runCustomQuery',
      runCustomQuery: decodeQsParams(qsParams)
    }
  }

  if (methodName === 'find') {
    return {
      method: 'find',
      find: decodeQsParams(qsParams)
    }
  }

  if (methodName === 'findOne') {
    return {
      method: 'findOne',
      findOne: decodeQsParams(qsParams)
    }
  }

  if (methodName === 'getByIds') {
    return {
      method: 'getByIds',
      getByIds: decodeQsParams(qsParams)
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
      runCustomCommand: decodeBody(body),
    }
  }

  if (path === '/login') {
    return {
      method: 'login',
      login: decodeBody(body),
    }
  }

  if (path === '/logout') {
    return {
      method: 'logout',
      logout: decodeBody(body),
    }
  }
  const paths = path.split('/')
  const methodName = path[2]

  if (methodName === 'insert') {
    return {
      method: 'insert',
      insert: decodeBody(body),
    }
  }

  if (methodName === 'insertAndGet') {
    return {
      method: 'insertAndGet',
      insertAndGet: decodeBody(body),
    }
  }
  if (methodName === 'insertAndFetch') {
    return {
      method: 'insertAndFetch',
      insertAndFetch: decodeBody(body),
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
  const methodName = path[2]

  if (methodName === 'update') {
    return {
      method: 'update',
      update: decodeBody(body),
    }
  }

  if (methodName === 'updateAndGet') {
    return {
      method: 'updateAndGet',
      updateAndGet: decodeBody(body),
    }
  }
  if (methodName === 'updateAndFetch') {
    return {
      method: 'updateAndFetch',
      updateAndFetch: decodeBody(body),
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
  if (path[2] === 'delete' && qsParams) {
    return {
      method: 'delete',
      delete: decodeQsParams(qsParams),
    }
  }

  if (path[1] && path[2]) {
    // single deletion
    return {
      method: 'delete',
      delete: {
        entityName: path[1],
        id: path[2],
      }
    }
  }
  throw new Error(`Could not decode the given DELETE request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
}

function decodeBody(body: string): any { // return "any" type for suppressing flow error
  return JSON.parse(body)
}


function decodeQsParams(qsParams: QueryStringParams): Object {
  return JSON.parse(qsParams.d)
}
