import { it, describe } from 'mocha'
import { GeneralRequestData } from "@phenyl/interfaces";
// @ts-ignore remove this comment after @phenyl/power-crypt released
import powerCrypt from 'power-crypt/jsnext'
// @ts-ignore remove this comment after @phenyl/power-assert released
import assert from 'power-assert'
import { encryptPasswordInRequestData } from '../../src/encrypt-password-in-request-data.js'

describe('encryptPasswordInRequestData', (): void => {
  it ('does nothing if request isnt update', (): void => {
    const requestData: GeneralRequestData = {
      method: 'get',
      payload: {
        entityName: 'user',
        id: 'user1',
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)
    assert.deepEqual(encryptedRequestData, requestData)
  })

  it ('encrypts password if password is in request data with insertOne method', (): void => {
    const requestData: GeneralRequestData = {
      method: 'insertOne',
      payload: {
        entityName: 'user',
        value: { password: 'test1234' },
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)

    const expectedRequestData = {
      method: 'insertOne',
      payload: {
        entityName: 'user',
        value: { password: 'OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=' },
      }
    }

    assert.deepEqual(encryptedRequestData, expectedRequestData)
  })

  it ('encrypts password if password is in request data with insertMulti method', (): void => {
    const requestData: GeneralRequestData = {
      method: 'insertMulti',
      payload: {
        entityName: 'user',
        values: [{ password: 'test1234' }, { name: 'user1' }],
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)

    const expectedRequestData = {
      method: 'insertMulti',
      payload: {
        entityName: 'user',
        values: [{ password: 'OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=' }, { name: 'user1' }],
      }
    }

    assert.deepEqual(encryptedRequestData, expectedRequestData)
  })

  it ('encrypts password if password is in request data with update method', (): void => {
    const requestData: GeneralRequestData = {
      method: 'updateById',
      payload: {
        id: 'foo',
        entityName: 'user',
        operation: {
          $set: { password: 'test1234' },
          $inc: { friends: 3 },
        },
      },
    }

    const encryptedRequestData = encryptPasswordInRequestData(requestData, 'password', powerCrypt)

    const expectedRequestData = {
      method: 'updateById',
      payload: {
        id: 'foo',
        entityName: 'user',
        operation: {
          $set: { password: 'OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=' },
          $inc: { friends: 3 },
        },
      },
    }

    assert.deepEqual(encryptedRequestData, expectedRequestData)
  })
})
