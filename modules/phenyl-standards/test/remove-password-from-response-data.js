// @flow

import { it, describe } from 'kocha'
import assert from 'power-assert'
import { removePasswordFromResponseData } from '../src/remove-password-from-response-data.js'

describe('removePasswordFromResponseData', function() {
  it('removes password property', function() {
    const resData = {
      type: 'get',
      payload: {
        ok: 1,
        entity: {
          id: 'foo',
          email: 'foo@example.com',
          password: 'foobar',
          name: 'John',
        },
        versionId: 'xyz',
      },
    }

    const modifiedResData = removePasswordFromResponseData(resData, 'password')
    assert.deepEqual(modifiedResData, {
      type: 'get',
      payload: {
        ok: 1,
        entity: {
          id: 'foo',
          email: 'foo@example.com',
          name: 'John',
        },
        versionId: 'xyz',
      },
    })
  })

  it('removes password property when nested', function() {
    const resData = {
      type: 'get',
      payload: {
        ok: 1,
        entity: {
          id: 'foo',
          account: {
            email: 'foo@example.com',
            password: 'foobar',
          },
          name: 'John',
        },
        versionId: 'xyz',
      },
    }

    const modifiedResData = removePasswordFromResponseData(
      resData,
      'account.password'
    )
    assert.deepEqual(modifiedResData, {
      type: 'get',
      payload: {
        ok: 1,
        entity: {
          id: 'foo',
          account: {
            email: 'foo@example.com',
          },
          name: 'John',
        },
        versionId: 'xyz',
      },
    })
  })
})
