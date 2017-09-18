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
export default function encodeRequest(reqData: RequestData, sessionId?: Id): EncodedHttpRequest {
  const headers: Object = (sessionId != null) ? { Authorization: sessionId } : {}
  let data

  switch (reqData.method) {
    case 'find':
      data = reqData.find
      if (data == null) throw new Error('No params set in requestData.find')
      return {
        method: 'GET',
        headers,
        path: `/${data.entityName}/find`,
        qsParams: createQsParams(data)
      }

    case 'findOne':
      data = reqData.findOne
      if (data == null) throw new Error('No params set in requestData.findOne')
      return {
        method: 'GET',
        headers,
        path: `/${data.entityName}/findOne`,
        qsParams: createQsParams(data)
      }

    case 'get':
      data = reqData.get
      if (data == null) throw new Error('No params set in requestData.get')
      return {
        method: 'GET',
        headers,
        path: `/${data.entityName}/${data.id}`,
      }

    case 'getByIds':
      data = reqData.getByIds
      if (data == null) throw new Error('No params set in requestData.getByIds')
      return {
        method: 'GET',
        headers,
        path: `/${data.entityName}/getByIds`,
        qsParams: createQsParams(data)
      }

    case 'insert':
      data = reqData.insert
      if (data == null) throw new Error('No params set in requestData.insert')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: `/${data.entityName}/insert`,
        body: createBody(data)
      }

    case 'insertAndGet':
      data = reqData.insertAndGet
      if (data == null) throw new Error('No params set in requestData.insertAndGet')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: `/${data.entityName}/insertAndGet`,
        body: createBody(data)
      }

    case 'insertAndFetch':
      data = reqData.insertAndFetch
      if (data == null) throw new Error('No params set in requestData.insertAndFetch')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: `/${data.entityName}/insertAndFetch`,
        body: createBody(data)
      }

    case 'update':
      data = reqData.update
      if (data == null) throw new Error('No params set in requestData.update')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: `/${data.entityName}/update`,
        body: createBody(data)
      }

    case 'updateAndGet':
      data = reqData.updateAndGet
      if (data == null) throw new Error('No params set in requestData.updateAndGet')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: `/${data.entityName}/updateAndGet`,
        body: createBody(data)
      }

    case 'updateAndFetch':
      data = reqData.updateAndFetch
      if (data == null) throw new Error('No params set in requestData.updateAndFetch')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'PUT',
        headers,
        path: `/${data.entityName}/updateAndFetch`,
        body: createBody(data)
      }

    case 'delete':
      data = reqData.delete
      if (data == null) throw new Error('No params set in requestData.delete')
      headers['Content-Type'] = 'application/json'

      // single deletion
      if (data.id != null) {
        return {
          method: 'DELETE',
          headers,
          // $FlowIssue(data.id-is-string)
          path: `/${data.entityName}/${data.id}`,
        }
      }
      // multi deletion
      return {
        method: 'DELETE',
        headers,
        path: `/${data.entityName}/delete`,
        qsParams: createQsParams(data)
      }

    case 'runCustomQuery':
      data = reqData.runCustomQuery
      if (data == null) throw new Error('No params set in requestData.runCustomQuery')
      headers['X-Phenyl-Custom'] = 'query'
      return {
        method: 'GET',
        headers,
        path: `/${data.name}`,
        qsParams: createQsParams(data)
      }

    case 'runCustomCommand':
      data = reqData.runCustomCommand
      if (data == null) throw new Error('No params set in requestData.runCustomCommand')
      headers['Content-Type'] = 'application/json'
      headers['X-Phenyl-Custom'] = 'command'
      return {
        method: 'POST',
        headers,
        path: `/${data.name}`,
        body: createBody(data)
      }

    case 'login':
      data = reqData.login
      if (data == null) throw new Error('No params set in requestData.login')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: `/login`,
        body: createBody(data)
      }

    case 'logout':
      data = reqData.logout
      if (data == null) throw new Error('No params set in requestData.logout')
      headers['Content-Type'] = 'application/json'
      return {
        method: 'POST',
        headers,
        path: '/logout',
        body: createBody(data)
      }

    default:
      if (reqData.method) {
        throw new Error(`Invalid request method: "${reqData.method}"`)
      }
      throw new Error(`Request method not given in RequestData.`)
  }
}

function createQsParams(data: Object): QueryStringParams {
  return { d: encodeURIComponent(JSON.stringify(data)) }
}

function createBody(data: Object): string {
  return JSON.stringify(data)
}
