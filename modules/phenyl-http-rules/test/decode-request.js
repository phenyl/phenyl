// @flow

import { it, describe } from 'kocha'
import assert from 'power-assert'
import decodeRequest from '../src/decode-request.js'

/**
 * DecodeRequest allows wider expressions than encodeRequest returns.
 * This test checks "wider" parts.
 */
describe('sessionId', () => {

  it('uses value in querystring prior to headers', () => {
    const request = {
      headers: {
        authorization: 'sessionId-in-headers'
      },
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/user/xxxx',
      method: 'GET'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(sessionId === 'sessionId-in-querystring')
  })

  it('is null in querystring', () => {
    const request = {
      headers: {},
      path: '/user/xxxx',
      method: 'GET'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(sessionId == null)
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
      path: '/user',
      method: 'GET'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(reqData.method === 'find')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
  })

  it('when no methodName is given and payload.where does not exist, regarded as "runCustomQuery"', () => {
    const request = {
      headers: {},
      path: '/user',
      method: 'GET'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(reqData.method === 'runCustomQuery')
    // $FlowIssue(payload.name-exists)
    assert(reqData.payload.name === 'user')
  })
})

describe('POST request', () => {
  it('when no methodName is given and payload.value or payload.values exists, regarded as "isnert"', () => {
    const request = {
      headers: {},
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      body: JSON.stringify({ values : { firstName: 'John' } }),
      path: '/user',
      method: 'POST'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(reqData.method === 'insert')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
  })

  it('when no methodName is given and payload.value or payload.values does not exist, regarded as "runCustomCommand"', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ params: { firstName: 'John' } }),
      path: '/user',
      method: 'POST'
    }
    const [reqData, sessionId] = decodeRequest(request)
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
      path: '/user',
      method: 'PUT'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(reqData.method === 'update')
    // $FlowIssue(payload.entityName-exists)
    assert(reqData.payload.entityName === 'user')
    // $FlowIssue(payload.id-exists)
    assert(reqData.payload.id === 'john')
  })

  it('when methodName is none of update, updateAndGet or updateAndFetch, regarded as IdUpdateCommand', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ operation: { $set: { firstName: 'John' } } }),
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/user/john',
      method: 'PUT'
    }
    const [reqData, sessionId] = decodeRequest(request)
    assert(reqData.method === 'update')
    // $FlowIssue(payload.id-exists)
    assert(reqData.payload.id === 'john')
  })

  it('when methodName is none of update, updateAndGet or updateAndFetch and no operation is given in body, Error is thrown', () => {
    const request = {
      headers: {},
      body: JSON.stringify({ params: { firstName: 'John' } }),
      qsParams: {
        sessionId: 'sessionId-in-querystring',
      },
      path: '/user/john',
      method: 'PUT'
    }
    assert.throws(() => decodeRequest(request), /Could not decode the given PUT request/)
  })
})
