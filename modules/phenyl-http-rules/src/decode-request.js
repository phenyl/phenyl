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
  const sessionId = request.headers.authorization || null
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

/**
 * @private
 */
function decodeGETRequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    qsParams,
  } = request

  const payload = decodeQsParams(qsParams)
  const paths = path.split('/') // path[0] must be an empty string.

  // custom queries: path: /{name}
  if (!paths[2]) {
    const name = paths[1]
    if (payload.name && payload.name !== name) {
      throw new Error(`CustomQuery name in payload is different from that in URL. in payload: "${payload.name}", in URL: "${name}".`)
    }
    return {
      method: 'runCustomQuery',
      payload: Object.assign(payload, { name })
    }
  }
  const [__empty, entityName, methodName] = paths

  // if no payload, it's "get-by-id" method
  if (Object.keys(payload).length === 0) {
    return {
      method: 'get',
      payload: { entityName, id: methodName }
    }
  }

  switch (methodName) {
    case 'find':
    case 'findOne':
    case 'getByIds': {
      if (payload.entityName && payload.entityName !== entityName) {
        throw new Error(`Invalid GET request (method=${methodName}). entityName in payload is different from that in URL. in payload: "${payload.entityName}", in URL: "${entityName}".`)
      }
      // $FlowIssue(this-is-always-valid-request-data)
      return {
        method: methodName,
        payload: Object.assign(payload, { entityName })
      }
    }
    default:
      throw new Error(`Could not decode the given GET request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }
}

/**
 * @private
 */
function decodePOSTRequest(request: EncodedHttpRequest): RequestData {
  const {
    headers,
    path,
    body
  } = request

  if (!body) {
    throw new Error(`Request body is empty in the given POST request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }

  const payload = decodeBody(body)
  const paths = path.split('/') // path[0] must be an empty string.

  // custom command: path: /{name}
  if (!paths[2]) {
    const name = paths[1]
    if (payload.name && payload.name !== name) {
      throw new Error(`CustomQuery command in payload is different from that in URL. in payload: "${payload.name}", in URL: "${name}".`)
    }
    return {
      method: 'runCustomCommand',
      payload: Object.assign(payload, { name })
    }
  }
  const [__empty, entityName, methodName] = paths

  switch (methodName) {
    case 'login':
    case 'logout':
    case 'insert':
    case 'insertAndGet':
    case 'insertAndGetMulti': {
      if (payload.entityName && payload.entityName !== entityName) {
        throw new Error(`Invalid POST request (method=${methodName}). entityName in payload is different from that in URL. in payload: "${payload.entityName}", in URL: "${entityName}".`)
      }
      // $FlowIssue(this-is-always-valid-request-data)
      return {
        method: methodName,
        payload: Object.assign(payload, { entityName }),
      }
    }
    default:
      throw new Error(`Could not decode the given POST request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }
}

/**
 * @private
 */
function decodePUTRequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    body
  } = request

  if (!body) {
    throw new Error(`Request body is empty in the given PUT request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }

  const payload = decodeBody(body)
  const paths = path.split('/') // path[0] must be an empty string.
  const [__empty, entityName, methodName] = paths

  switch (methodName) {
    case 'update':
    case 'updateAndGet':
    case 'updateAndFetch': {
      if (payload.entityName && payload.entityName !== entityName) {
        throw new Error(`Invalid PUT request (method=${methodName}). entityName in payload is different from that in URL. in payload: "${payload.entityName}", in URL: "${entityName}".`)
      }
      // $FlowIssue(this-is-always-valid-request-data)
      return {
        method: methodName,
        payload: Object.assign(payload, { entityName }),
      }
    }
    default:
      throw new Error(`Could not decode the given PUT request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }
}

/**
 * @private
 */
function decodeDELETERequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    qsParams,
  } = request

  const payload = decodeQsParams(qsParams)
  const paths = path.split('/') // path[0] must be an empty string.
  const [__empty, entityName, methodName] = paths

  // multi deletion
  if (methodName === 'delete' && Object.keys(payload).length > 0) {
    return {
      method: 'delete',
      // $FlowIssue(this-is-MultiDeleteCommand)
      payload: Object.assign(payload, { entityName })
    }
  }

  if (methodName != null) {
    // single deletion
    return {
      method: 'delete',
      payload: {
        entityName,
        id: methodName
      }
    }
  }
  throw new Error(`Could not decode the given DELETE request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
}

function decodeBody(body: string): any { // return "any" type for suppressing flow error
  return JSON.parse(body)
}


function decodeQsParams(qsParams: ?QueryStringParams): Object { // return "any" type for suppressing flow error
  if (qsParams == null || qsParams.d == null) {
    return {}
  }
  return JSON.parse(qsParams.d)
}
