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
    const newOperation = updateOperationToJSON(operation)
    assert.deepEqual(newOperation, expected)
  })

  it('converts values of $pull property', () => {

    const operation = {
      $inc: { value: 1 },
      $pull: /john/i
    }
    const expected = {
      $inc: { value: 1 },
      $pull: { $regex: 'john', $options: 'i' }
    }
    const newOperation = updateOperationToJSON(operation)
    assert.deepEqual(newOperation, expected)
  })

  it('converts both $restore and $pull properties', () => {
    class Bar {}

    const operation = {
      $inc: { value: 1 },
      $pull: /john/i,
      $restore: {
        foo: '',
        bar: Bar
      }
    }
    const expected = {
      $inc: { value: 1 },
      $pull: { $regex: 'john', $options: 'i' },
      $restore: {
        foo: '',
        bar: ''
      }
    }
    const newOperation = updateOperationToJSON(operation)
    assert.deepEqual(newOperation, expected)
  })

})
