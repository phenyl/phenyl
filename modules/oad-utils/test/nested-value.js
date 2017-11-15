// @flow
import { describe, it } from 'kocha'
import assert from 'power-assert'
import {
  getNestedValue,
  hasOwnNestedProperty
} from '../src/nested-value.js'

describe('getNestedValue', function () {
  const obj = { foo: { bar: [{}, {}, { baz1: false, baz2: null } ]}, foo2: undefined }

  it ('returns nested value', function () {
    assert(getNestedValue(obj, 'foo') === obj.foo)
    assert(getNestedValue(obj, 'foo.bar') === obj.foo.bar)
    assert(getNestedValue(obj, 'foo.bar[0]') === obj.foo.bar[0])
    assert(getNestedValue(obj, 'foo.bar[1]') === obj.foo.bar[1])
    assert(getNestedValue(obj, 'foo.bar[2]') === obj.foo.bar[2])
    assert(getNestedValue(obj, 'foo.bar[2].baz1') === obj.foo.bar[2].baz1)
    assert(getNestedValue(obj, 'foo.bar[2].baz2') === obj.foo.bar[2].baz2)
    assert(getNestedValue(obj, 'foo2') === obj.foo2)
  })

  it ('returns undefined when the nested value is not found.', function () {
    assert(getNestedValue(obj, 'a.b.c.d.e') === undefined)
  })

  it ('throws error when the 3rd argument is true and the nested value is not found.', function () {
    assert(() => getNestedValue(obj, 'a.b.c.d.e', true), /Cannot get value/)
  })
})

describe('hasOwnNestedProperty', function () {
  const obj = { foo: { bar: [{}, {}, { baz1: false, baz2: null } ]}, foo2: undefined }

  it ('returns true when it has own nested property', function () {
    assert(hasOwnNestedProperty(obj, 'foo') === true)
    assert(hasOwnNestedProperty(obj, 'foo.bar') === true)
    assert(hasOwnNestedProperty(obj, 'foo.bar[0]') === true)
    assert(hasOwnNestedProperty(obj, 'foo.bar[1]') === true)
    assert(hasOwnNestedProperty(obj, 'foo.bar[2]') === true)
    assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz1') === true)
    assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz2') === true)
    assert(hasOwnNestedProperty(obj, 'foo2') === true)
  })

  it ('returns false when it doesn\'t have own nested property', function () {
    assert(hasOwnNestedProperty(obj, 'bar') === false)
    assert(hasOwnNestedProperty(obj, 'foo.baz') === false)
    assert(hasOwnNestedProperty(obj, 'foo.bar[3]') === false)
    assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz3') === false)
  })
})
