// @flow

import { describe, it, context } from 'kocha'
import assert from 'power-assert'
import { toJSON } from '../src/to-json.js'

describe('toJSON', () => {
  it('no conversion when operation do not contain $restore property', () => {
    const operation = {
      $inc: { value: 1 }
    }
    const newOps = toJSON(operation)
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
    const newOps = toJSON(operation)
    assert.deepEqual(expected, newOps)
  })
})
