// @flow

import { it, describe } from 'kocha'
import assert from 'power-assert'
import encodeRequest from '../src/encode-request.js'
import decodeRequest from '../src/decode-request.js'

describe('Check encode/decode deep equality: ', () => {

  it('find', () => {
    const reqData = {
      method: 'find',
      payload: {
        entityName: 'hospital',
        where: {
          name: 'Tokyo Hospital'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('findOne', () => {
    const reqData = {
      method: 'findOne',
      payload: {
        entityName: 'hospital',
        where: {
          name: 'Tokyo Hospital'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('get', () => {
    const reqData = {
      method: 'get',
      payload: {
        entityName: 'hospital',
        id: 'tokyo',
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('getByIds', () => {
    const reqData = {
      method: 'getByIds',
      payload: {
        entityName: 'hospital',
        ids: ['tokyo', 'nagoya', 'osaka']
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('insert', () => {
    const reqData = {
      method: 'insert',
      payload: {
        entityName: 'hospital',
        value: {
          name: 'Tokyo Hospital',
          address: 'dummy-dummy'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('insertAndGet', () => {
    const reqData = {
      method: 'insertAndGet',
      payload: {
        entityName: 'hospital',
        value: {
          name: 'Tokyo Hospital',
          address: 'dummy-dummy'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('insertAndGetMulti', () => {
    const reqData = {
      method: 'insertAndGetMulti',
      payload: {
        entityName: 'hospital',
        values: [{
          name: 'Tokyo Hospital',
          address: 'dummy-dummy'
        }, {
          name: 'Nagoya Hospital',
          address: 'dummy-dummy-dummy'
        }]
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('update', () => {
    const reqData = {
      method: 'update',
      payload: {
        id: 'tokyo',
        entityName: 'hospital',
        operation: {
          $set: {
            tel: 'dummy'
          }
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('updateAndGet', () => {
    const reqData = {
      method: 'updateAndGet',
      payload: {
        id: 'tokyo',
        entityName: 'hospital',
        operation: {
          $set: {
            tel: 'dummy'
          }
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('updateAndFetch', () => {
    const reqData = {
      method: 'updateAndFetch',
      payload: {
        entityName: 'hospital',
        where: {
          name: 'tokyo'
        },
        operation: {
          $set: {
            tel: 'dummy'
          }
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('delete', () => {
    const reqData = {
      method: 'delete',
      payload: {
        entityName: 'hospital',
        where: {
          name: 'tokyo'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('runCustomQuery', () => {
    const reqData = {
      method: 'runCustomQuery',
      payload: {
        name: 'is-occupied',
        params: {
          email: 'abc@example.com'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('runCustomQuery without params', () => {
    const reqData = {
      method: 'runCustomQuery',
      payload: {
        name: 'is-occupied',
      }
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
  })

  it('runCustomCommand', () => {
    const reqData = {
      method: 'runCustomCommand',
      payload: {
        name: 'reset-password',
        params: {
          email: 'abc@example.com'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('login', () => {
    const reqData = {
      method: 'login',
      payload: {
        entityName: 'doctor',
        credentials: {
          email: 'abc@example.com',
          password: 'dummy'
        }
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

  it('logout', () => {
    const reqData = {
      method: 'logout',
      payload: {
        entityName: 'doctor',
        sessionId: 'foobar',
        userId: 'shinout'
      }
    }
    const sessionId = 'foobar'
    const encodedHttpRequest = encodeRequest(reqData, sessionId)
    const [decodedReqData, decodedSessionId] = decodeRequest(encodedHttpRequest)
    assert.deepEqual(reqData, decodedReqData)
    assert.deepEqual(sessionId, decodedSessionId)
  })

})
