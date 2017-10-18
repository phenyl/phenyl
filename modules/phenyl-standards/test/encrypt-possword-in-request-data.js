// @flow

import { it, describe } from 'kocha'
import powerCrypt from 'power-crypt'
import assert from 'power-assert'
import { encryptPasswordInRequestData } from '../src/encrypt-password-in-request-data.js'

describe('encryptPasswordInRequestData', function () {
  it ('does nothing if request isnt update', function () {
    const requestData = {
      method: 'get',
      payload: {
        entityName: 'user',
        id: 'user1',
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)
    assert.deepEqual(encryptedRequestData, requestData)
  })

  it ('encrypts password if password is in request data with insert method', function () {
    const requestData = {
      method: 'insert',
      payload: {
        entityName: 'user',
        value: { password: 'test1234' },
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)

    const expectedRequestData = {
      method: 'insert',
      payload: {
        entityName: 'user',
        value: { password: 'OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=' },
      }
    }

    assert.deepEqual(encryptedRequestData, expectedRequestData)
  })

  it ('encrypts password if password is in request data with update method', function () {
    const requestData = {
      method: 'update',
      payload: {
        entityName: 'user',
        operators: { $set: { password: 'test1234' } },
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)

    const expectedRequestData = {
      method: 'update',
      payload: {
        entityName: 'user',
        operators: { $set: { password: 'OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=' }},
      },
    }

    assert.deepEqual(encryptedRequestData, expectedRequestData)
  })
})
