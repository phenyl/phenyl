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
