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

  const payload = decodeDataInQsParams(qsParams)
  let [entityName, methodName] = stripPrefix(path).split('/')

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
    case 'getByIds': {
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
    headers,
    path,
    body
  } = request

  if (!body) {
    throw new Error(`Request body is empty in the given POST request. Request = \n${JSON.stringify(request, null, 2)}\n\n`)
  }

  const payload = decodeBody(body)
  let [entityName, methodName] = stripPrefix(path).split('/')

  // CustomCommand or InsertCommand
  if (!methodName) {
    // InsertCommand
    if (payload.value || payload.values) {
      methodName = 'insert'
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
    case 'insert':
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
  let [entityName, methodName] = stripPrefix(path).split('/')

  // "update" method can be omitted
  if (!methodName) {
    methodName = 'update'
  }
  // irregular methodNames are regarded as id and converted into IdUpdateCommand
  if (!['update', 'updateAndGet', 'updateAndFetch'].includes(methodName)) {
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
  let [entityName, methodName] = stripPrefix(path).split('/')

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
 * @private
 */
function decodeSessionId(request: EncodedHttpRequest): ?Id {
  const {
    headers,
    qsParams,
  } = request
  return (qsParams && qsParams.sessionId) || headers.authorization || null
}

/**
 *
 */
 function stripPrefix(path: string): string {
   const index = path.indexOf('/api/')
   if (index === -1) {
     throw new Error(`Invalid request path: "${path}". Paths must include "/api/" prefix.`)
   }
   return path.slice(index + 5)
 }
