// @flow

import { describe, it, context } from 'kocha'
import assert from 'power-assert'
import { updateOperationToJSON } from '../src/update-operation-to-json.js'

describe('updateOperationToJSON', () => {
  it('no conversion when operation do not contain $restore property', () => {
    const operation = {
      $inc: { value: 1 }
    }
    const newOps = updateOperationToJSON(operation)
    assert(operation, newOps)
  })

  it('converts values of $restore property to empty string', () => {
    class Bar {}

    const operation = {
      $inc: { value: 1 },
      $restore: {
        foo: '',
        bar: Bar
      }
    }
    const expected = {
      $inc: { value: 1 },
      $restore: {
        foo: '',
        bar: ''
      }
    }
    const newOps = updateOperationToJSON(operation)
    assert.deepEqual(expected, newOps)
  })
})
