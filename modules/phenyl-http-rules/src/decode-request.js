// @flow

import type {
  EncodedHttpRequest,
  Id,
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
    queryString,
  } = request

  const paths = path.split('/') // path[0] must be an empty string.

  if (!queryString) {
    return {
      method: 'get',
      get: { entityName: path[1], id: path[2] }
    }
  }
  const methodName = path[2]

  if (!methodName) {
    return {
      method: 'runCustomQuery',
      runCustomQuery: decodeQueryString(queryString)
    }
  }

  if (methodName === 'find') {
    return {
      method: 'find',
      find: decodeQueryString(queryString)
    }
  }

  if (methodName === 'findOne') {
    return {
      method: 'findOne',
      findOne: decodeQueryString(queryString)
    }
  }

  if (methodName === 'getByIds') {
    return {
      method: 'getByIds',
      getByIds: decodeQueryString(queryString)
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
    queryString,
  } = request

  const paths = path.split('/')

  // multi deletion
  if (path[2] === 'delete' && queryString) {
    return {
      method: 'delete',
      delete: decodeQueryString(queryString),
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

function decodeBody(body: string): Object {
  return JSON.parse(body)
}


function decodeQueryString(queryString: string): Object {
  const qs = (queryString.charAt(0) === '?') ? queryString.slice(1) : queryString
  // TODO: use library
  return JSON.parse(qs.split('d=')[1])
}
