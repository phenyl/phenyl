import { it, describe } from 'mocha'
import assert from 'assert'
import { EntityResponseData } from '@phenyl/interfaces'
import { removePasswordFromResponseData } from '../src/remove-password-from-response-data'

describe('removePasswordFromResponseData', () => {
  it ('removes password property', () => {
    const resData: EntityResponseData<any> = {
      type: 'get',
      payload: {
        entity: {
          id: 'foo',
          email: 'foo@example.com',
          password: 'foobar',
          name: 'John',
        },
        versionId: 'xyz'
      },
    }

    const modifiedResData = removePasswordFromResponseData(resData, 'password')
    assert.deepEqual(modifiedResData, {
      type: 'get',
      payload: {
        entity: {
          id: 'foo',
          email: 'foo@example.com',
          name: 'John',
        },
        versionId: 'xyz'
      },
    })
  })

  // @TODO: the sp2/updater can not support nested property right now
  it ('removes password property when nested', () => {
    const resData: EntityResponseData<any> = {
      type: 'get',
      payload: {
        entity: {
          id: 'foo',
          account: {
            email: 'foo@example.com',
            password: 'foobar',
          },
          name: 'John',
        },
        versionId: 'xyz'
      },
    }

    const modifiedResData = removePasswordFromResponseData(resData, 'account.password')
    assert.deepEqual(modifiedResData, {
      type: 'get',
      payload: {
        entity: {
          id: 'foo',
          account: {
            email: 'foo@example.com',
          },
          name: 'John',
        },
        versionId: 'xyz'
      },
    })
  })


})
