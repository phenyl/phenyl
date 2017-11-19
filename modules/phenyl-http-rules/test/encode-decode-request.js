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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('findOne', () => {
    const reqData = {
      method: 'findOne',
      payload: {
        entityName: 'hospital',
        where: {
          name: 'Tokyo Hospital'
        }
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('get', () => {
    const reqData = {
      method: 'get',
      payload: {
        entityName: 'hospital',
        id: 'tokyo',
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('getByIds', () => {
    const reqData = {
      method: 'getByIds',
      payload: {
        entityName: 'hospital',
        ids: ['tokyo', 'nagoya', 'osaka']
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('pull', () => {
    const reqData = {
      method: 'pull',
      payload: {
        entityName: 'hospital',
        id: 'foo',
        versionId: 'abc123',
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('insertOne', () => {
    const reqData = {
      method: 'insertOne',
      payload: {
        entityName: 'hospital',
        value: {
          name: 'Tokyo Hospital',
          address: 'dummy-dummy'
        }
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('insertMulti', () => {
    const reqData = {
      method: 'insertMulti',
      payload: {
        entityName: 'hospital',
        values: [{
          name: 'Tokyo Hospital',
          address: 'dummy-dummy'
        }]
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('push', () => {
    const reqData = {
      method: 'push',
      payload: {
        id: 'tokyo',
        entityName: 'hospital',
        versionId: 'abc123',
        operations: [{
          $set: {
            tel: 'dummy'
          }
        }]
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('delete', () => {
    const reqData = {
      method: 'delete',
      payload: {
        entityName: 'hospital',
        where: {
          name: 'tokyo'
        }
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('runCustomQuery', () => {
    const reqData = {
      method: 'runCustomQuery',
      payload: {
        name: 'is-occupied',
        params: {
          email: 'abc@example.com'
        }
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('runCustomQuery without params', () => {
    const reqData = {
      method: 'runCustomQuery',
      payload: {
        name: 'is-occupied',
      }
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
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
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })

  it('logout', () => {
    const reqData = {
      method: 'logout',
      payload: {
        entityName: 'doctor',
        sessionId: 'foobar',
        userId: 'shinout'
      },
      sessionId: 'foobar'
    }
    const encodedHttpRequest = encodeRequest(reqData)
    const decodedReqData = decodeRequest(encodedHttpRequest)
    assert.deepEqual(decodedReqData, reqData)
    assert(decodedReqData.sessionId === 'foobar')
  })
})
