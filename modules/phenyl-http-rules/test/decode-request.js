// @flow

import { it, describe } from 'kocha'
import assert from 'power-assert'
import decodeRequest from '../src/decode-request.js'

/**
 * DecodeRequest allows wider expressions than encodeRequest returns.
 * This test checks "wider" parts.
 */
describe('Parsing path', () => {

  it('detects first "/api/" and parse URLs', () => {
    const request = {
      headers: {},
      path: '/api/api/api',
      method: 'GET'
    }
    const reqData = decodeRequest(request)
    assert.deepEqual(reqData, {
      method: 'get',
      payload: {
        id: 'api',
        entityName: 'api'
      }
    })
  })

  it('path whose depth is greater than three are not allowed', () => {
    const request = {
      headers: {},
      path: '/api/api/api/api',
      method: 'GET'
    }
    assert.throws(() => decodeRequest(request), /greater than 3/)
  })
})

describe('sessionId', () => {

  it('uses value in querystring prior to headers', () => {
    const request = {
      headers: {
        authorization: 'sessionId-in-headers'
      },
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/api/user/xxxx',
      method: 'GET'
    }
    const reqData = decodeRequest(request)
    assert(reqData.sessionId === 'sessionId-in-querystring')
  })

  it('is null in querystring', () => {
    const request = {
      headers: {},
      path: '/api/user/xxxx',
      method: 'GET'
    }
    const reqData = decodeRequest(request)
    assert(reqData.sessionId == null)
  })
})

describe('GET request', () => {
  it('when no methodName is given and payload.where exists, regarded as "find"', () => {
    const request = {
      headers: {},
      qsParams: {
        d: JSON.stringify({ where: { firstName: 'John' } }),
        sessionId: 'sessionId-in-querystring',
      },
      path: '/api/user',
      method: 'GET'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'find')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
  })

  it('when no methodName is given and payload.where does not exist, regarded as "runCustomQuery"', () => {
    const request = {
      headers: {},
      path: '/api/user',
      method: 'GET'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'runCustomQuery')
    // $FlowIssue(payload.name-exists)
    assert(reqData.payload.name === 'user')
  })
})

describe('POST request', () => {
  it('when no methodName is given and payload.value exists, regarded as "isnertOne"', () => {
    const request = {
      headers: {},
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      body: JSON.stringify({ value: { firstName: 'John' } }),
      path: '/api/user',
      method: 'POST'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'insertOne')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
  })

  it('when no methodName is given and payload.values exists, regarded as "isnertMulti"', () => {
    const request = {
      headers: {},
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      body: JSON.stringify({ values: [{ firstName: 'John' }] }),
      path: '/api/user',
      method: 'POST'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'insertMulti')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
  })

  it('when no methodName is given and payload.value or payload.values does not exist, regarded as "runCustomCommand"', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ params: { firstName: 'John' } }),
      path: '/api/user',
      method: 'POST'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'runCustomCommand')
    // $FlowIssue(payload.name-exists)
    assert(reqData.payload.name === 'user')
  })
})

describe('PUT request', () => {
  it('when no methodName is given and payload.operation exists, regarded as "update"', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ id: 'john', operation: { $set: { firstName: 'John' } } }),
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/api/user',
      method: 'PUT'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'update')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
    // $FlowIssue(payload.id-exists)
    assert(reqData.payload.id === 'john')
  })

  it('when methodName is none of update, updateAndGet, updateAndFetch or push, regarded as IdUpdateCommand', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ operation: { $set: { firstName: 'John' } } }),
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/api/user/john',
      method: 'PUT'
    }
    const reqData = decodeRequest(request)
    assert(reqData.method === 'update')
    // $FlowIssue(payload.id-exists)
    assert(reqData.payload.id === 'john')
  })

  it('when methodName is none of update, updateAndGet, updateAndFetch or push and no operation is given in body, Error is thrown', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ params: { firstName: 'John' } }),
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/api/user/john',
      method: 'PUT'
    }
    assert.throws(() => decodeRequest(request), /Could not decode the given PUT request/)
  })
})
