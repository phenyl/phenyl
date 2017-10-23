// @flow
import {
  assertValidRequestData
} from 'phenyl-utils/jsnext'

import type {
  EncodedHttpRequest,
  Id,
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

    case 'insert':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: addPrefix(`/${data.entityName}/insert`),
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

    case 'update':
      data = reqData.payload
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: addPrefix(`/${data.entityName}/update`),
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
      throw new Error(`Request method not given in RequestData.`)
  }
}

// params are not encoded into URI format.
function createQsParams(data: Object): QueryStringParams {
  return { d: JSON.stringify(data) }
}

function createBody(data: Object): string {
  return JSON.stringify(data)
}

/**
 * Attach prefix(="/api") to the path
 */
function addPrefix(path: string): string {
  return `/api${path}`
}
