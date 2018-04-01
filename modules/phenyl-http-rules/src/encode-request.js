// @flow
import {
  assertValidRequestData
} from 'phenyl-utils'

import type {
  EncodedHttpRequest,
  QueryStringParams,
  RequestData,
} from 'phenyl-interfaces'

/**
 *
 */
export default function encodeRequest(reqData: RequestData): EncodedHttpRequest {
  assertValidRequestData(reqData)
  const { sessionId } = reqData
  const headers: Object = (sessionId != null) ? { authorization: sessionId } : {}
  let data

  switch (reqData.method) {
    case 'find':
      data = reqData.payload
      return {
        method: 'GET',
        headers,
        path: addPrefix(`/${data.entityName}/find`),
        qsParams: createQsParams(data)
      }

    case 'findOne':
      data = reqData.payload
      return {
        method: 'GET',
        headers,
        path: addPrefix(`/${data.entityName}/findOne`),
        qsParams: createQsParams(data)
      }

    case 'get':
      data = reqData.payload
      return {
        method: 'GET',
        headers,
        path: addPrefix(`/${data.entityName}/${data.id}`),
      }

    case 'getByIds':
      data = reqData.payload
      return {
        method: 'GET',
        headers,
        path: addPrefix(`/${data.entityName}/getByIds`),
        qsParams: createQsParams(data)
      }

    case 'pull':
      data = reqData.payload
      return {
        method: 'GET',
        headers,
        path: addPrefix(`/${data.entityName}/pull`),
        qsParams: createQsParams(data)
      }

    case 'insertOne':
    case 'insertMulti':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.entityName}/${reqData.method}`),
        body: createBody(data)
      }

    case 'insertAndGet':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.entityName}/insertAndGet`),
        body: createBody(data)
      }

    case 'insertAndGetMulti':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.entityName}/insertAndGetMulti`),
        body: createBody(data)
      }

    case 'updateById':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: addPrefix(`/${data.entityName}/updateById`),
        body: createBody(data)
      }

    case 'updateMulti':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: addPrefix(`/${data.entityName}/updateMulti`),
        body: createBody(data)
      }

    case 'updateAndGet':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: addPrefix(`/${data.entityName}/updateAndGet`),
        body: createBody(data)
      }

    case 'updateAndFetch':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: addPrefix(`/${data.entityName}/updateAndFetch`),
        body: createBody(data)
      }

    case 'push':
      data = reqData.payload
      return {
        method: 'PUT',
        headers,
        path: addPrefix(`/${data.entityName}/push`),
        body: createBody(data)
      }

    case 'delete':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'

      // single deletion
      if (data.id != null) {
        return {
          method: 'DELETE',
          headers,
          path: addPrefix(`/${data.entityName}/${data.id}`),
        }
      }
      // multi deletion
      return {
        method: 'DELETE',
        headers,
        path: addPrefix(`/${data.entityName}/delete`),
        qsParams: createQsParams(data)
      }

    case 'runCustomQuery':
      data = reqData.payload
      return {
        method: 'GET',
        headers,
        path: addPrefix(`/${data.name}`),
        qsParams: createQsParams(data)
      }

    case 'runCustomCommand':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.name}`),
        body: createBody(data)
      }

    case 'login':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.entityName}/login`),
        body: createBody(data)
      }

    case 'logout':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.entityName}/logout`),
        body: createBody(data)
      }

    default:
      if (reqData.method) {
        throw new Error(`Invalid request method: "${reqData.method}"`)
      }
      throw new Error('Request method not given in RequestData.')
  }
}

export function isApiRequest(path: string): boolean {
  return path.slice(0, 5) === '/api/'
}


function undefinedToNull(key: string, value: any): any {
  return (value === undefined) ? null : value
}


// params are not encoded into URI format.
function createQsParams(data: Object): QueryStringParams {

  return { d: JSON.stringify(data, undefinedToNull) }
}

function createBody(data: Object): string {
  return JSON.stringify(data, undefinedToNull)
}

/**
 * Attach prefix(="/api") to the path
 */
function addPrefix(path: string): string {
  return `/api${path}`
}
