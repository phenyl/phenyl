// @flow

import { describe, it, context } from 'kocha'
import assert from 'power-assert'
import { toJSON } from '../src/to-json.js'

describe('toJSON', () => {
  it('no conversion when operators do not contain $restore property', () => {
    const ops = {
      $inc: { value: 1 }
    }
    const newOps = toJSON(ops)
    assert(ops, newOps)
  })

  it('converts values of $restore property to empty string', () => {
    class Bar {}

    const ops = {
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
    const newOps = toJSON(ops)
    assert.deepEqual(expected, newOps)
  })
})
