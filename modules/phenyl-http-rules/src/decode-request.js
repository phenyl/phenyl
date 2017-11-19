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
export default function decodeRequest(request: EncodedHttpRequest): RequestData {
  let reqData: RequestData
  const sessionId = decodeSessionId(request)
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
  return (sessionId) ? Object.assign(reqData, { sessionId }) : reqData
}

/**
 * @private
 */
function decodeGETRequest(request: EncodedHttpRequest): RequestData {
  const {
    path,
    qsParams,
  } = request

  const payload = decodeDataInQsParams(qsParams)
  let { entityName, methodName } = parsePath(path)

  // CustomQuery or WhereQuery?
  if (!methodName) {
    // WhereQuery => method is "find"
    if (payload.where) {
      methodName = 'find'
    }
    // CustomQuery
    else {
      const name = entityName
      if (payload.name && payload.name !== name) {
        throw new Error(`CustomQuery name in payload is different from that in URL. in payload: "${payload.name}", in URL: "${name}".`)
      }
      return {
        method: 'runCustomQuery',
        payload: Object.assign(payload, { name })
      }
    }
  }

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
    case 'getByIds':
    case 'pull': {
      if (payload.entityName && payload.entityName !== entityName) {
        throw new Error(`Invalid GET request (method="${methodName}"). entityName in payload is different from that in URL. in payload: "${payload.entityName}", in URL: "${entityName}".`)
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
    path,
    body
  } = request

  if (!body) {
    throw new Error(`Request body is empty in the given POST request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }

  const payload = decodeBody(body)
  let { entityName, methodName } = parsePath(path)

  // CustomCommand or InsertCommand
  if (!methodName) {
    // SingleInsertCommand
    if (payload.value) {
      methodName = 'insertOne'
    }
    else if (payload.values) {
      methodName = 'insertMulti'
    }
    // CustomCommand
    else {
      const name = entityName
      if (payload.name && payload.name !== name) {
        throw new Error(`CustomQuery command in payload is different from that in URL. in payload: "${payload.name}", in URL: "${name}".`)
      }
      return {
        method: 'runCustomCommand',
        payload: Object.assign(payload, { name })
      }
    }
  }

  switch (methodName) {
    case 'login':
    case 'logout':
    case 'insertOne':
    case 'insertMulti':
    case 'insertAndGet':
    case 'insertAndGetMulti': {
      if (payload.entityName && payload.entityName !== entityName) {
        throw new Error(`Invalid POST request (method="${methodName}"). entityName in payload is different from that in URL. in payload: "${payload.entityName}", in URL: "${entityName}".`)
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
  let { entityName, methodName } = parsePath(path)

  // "update" method can be omitted
  if (!methodName) {
    methodName = 'update'
  }
  // irregular methodNames are regarded as id and converted into IdUpdateCommand
  if (!['update', 'updateAndGet', 'updateAndFetch', 'push'].includes(methodName)) {
    const id = methodName
    if (payload.id && payload.id !== id) {
      throw new Error(`Invalid PUT request (method="update"). id in payload is different from that in URL. in payload: "${payload.id}", in URL: "${id}".`)
    }

    if (!payload.operation) {
      throw new Error(`Could not decode the given PUT request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
    }

    payload.id = id
    methodName = 'update'
  }

  if (payload.entityName && payload.entityName !== entityName) {
    throw new Error(`Invalid PUT request (method="${methodName}"). entityName in payload is different from that in URL. in payload: "${payload.entityName}", in URL: "${entityName}".`)
  }

  // $FlowIssue(this-is-always-valid-request-data)
  return {
    method: methodName,
    payload: Object.assign(payload, { entityName }),
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

  const payload = decodeDataInQsParams(qsParams)
  let { entityName, methodName } = parsePath(path)

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


/**
 * extract data from query string params
 * parse JSON in "d" field
 * @private
 */
function decodeDataInQsParams(qsParams: ?QueryStringParams): Object { // return "any" type for suppressing flow error
  if (qsParams == null || qsParams.d == null) {
    return {}
  }
  return JSON.parse(qsParams.d)
}

/**
 * extract sessionId from request
 * 1. return "sessionId" value in query string if exists
 * 2. return "authorization" value in header if exists
 * 3. return null
 */
export function decodeSessionId(request: EncodedHttpRequest): ?Id {
  const {
    headers,
    qsParams,
  } = request
  return (qsParams && qsParams.sessionId) || headers.authorization || null
}

/**
*
*/
function parsePath(path: string): { entityName: string, methodName: ?string } {
  const prefix = path.slice(0, 5)
  if (prefix !== '/api/') {
    throw new Error(`Invalid request path: "${path}". Paths must start with "/api/" prefix.`)
  }
  const strippedPaths = path.slice(5).split('/')
  if (strippedPaths.length >= 3) {
    throw new Error(`Invalid request path: "${path}". Paths depth must not be greater than 3.`) // this error comments consider prefix /api/
  }
  return { entityName: strippedPaths[0], methodName: strippedPaths[1] }
}
