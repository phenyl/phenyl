import { GetResponseData } from "@phenyl/interfaces";
import { it, describe } from 'mocha'
// @ts-ignore remove this comment after @phenyl/power-assert released
import assert from 'power-assert'
import { removePasswordFromResponseData } from '../../src/remove-password-from-response-data'

describe('removePasswordFromResponseData', function () {
  it ('removes password property', function () {
    const resData: GetResponseData<any> = {
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

  it ('removes password property when nested', function () {
    const resData: GetResponseData<any> = {
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
