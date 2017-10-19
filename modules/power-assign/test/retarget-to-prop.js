// @flow

import { describe, it, context } from 'kocha'
import assert from 'power-assert'
import { retargetToProp, retargetToPropWithRestoration } from '../src/retarget-to-prop.js'

describe('retargetToProp', () => {
  it('converts operation so that it sets to propName', () => {
    const operation = {
      $inc: { value: 1 },
    }
    const retargetedOps = retargetToProp('age', operation)
    const expected = {
      $inc: { 'age.value': 1 }
    }
    assert.deepEqual(expected, retargetedOps)
  })
})

describe('retargetToPropWithRestoration', () => {

  it('attaches $restore operation for restoration of the prop', () => {
    const operation = {
      $inc: { value: 1 },
    }
    const retargetedOps = retargetToPropWithRestoration('age', operation)
    const expected = {
      $inc: { 'age.value': 1 },
      $restore: { age: '' },
    }
    assert.deepEqual(expected, retargetedOps)
  })

  it('attaches $restore operation when it already exists', () => {
    class SomeClass {}
    const operation = {
      $inc: { value: 1 },
      $restore: { someValue: SomeClass },
    }
    const retargetedOperation = retargetToPropWithRestoration('age', operation)
    const expected = {
      $inc: { 'age.value': 1 },
      $restore: { 'age.someValue': SomeClass, age: '' },
    }
    assert.deepEqual(expected, retargetedOperation)
  })
})
