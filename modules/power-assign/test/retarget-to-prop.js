// @flow

import { describe, it, context } from 'kocha'
import assert from 'power-assert'
import { retargetToProp, retargetToPropWithRestoration } from '../src/retarget-to-prop.js'

describe('retargetToProp', () => {
  it('converts operators so that it sets to propName', () => {
    const ops = {
      $inc: { value: 1 },
    }
    const retargetedOps = retargetToProp('age', ops)
    const expected = {
      $inc: { 'age.value': 1 }
    }
    assert.deepEqual(expected, retargetedOps)
  })
})

describe('retargetToPropWithRestoration', () => {

  it('attaches $restore operation for restoration of the prop', () => {
    const ops = {
      $inc: { value: 1 },
    }
    const retargetedOps = retargetToPropWithRestoration('age', ops)
    const expected = {
      $inc: { 'age.value': 1 },
      $restore: { age: '' },
    }
    assert.deepEqual(expected, retargetedOps)
  })

  it('attaches $restore operation when it already exists', () => {
    class SomeClass {}
    const ops = {
      $inc: { value: 1 },
      $restore: { someValue: SomeClass },
    }
    const retargetedOps = retargetToPropWithRestoration('age', ops)
    const expected = {
      $inc: { 'age.value': 1 },
      $restore: { 'age.someValue': SomeClass, age: '' },
    }
    assert.deepEqual(expected, retargetedOps)
  })
})
