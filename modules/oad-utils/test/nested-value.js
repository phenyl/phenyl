// @flow
import { describe, it } from 'kocha'
import assert from 'power-assert'
import {
  hasOwnNestedProperty
} from '../src/nested-value.js'

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
  })

  it ('returns true when it has own nested property', function () {
    assert(hasOwnNestedProperty(obj, 'bar') === false)
    assert(hasOwnNestedProperty(obj, 'foo.baz') === false)
    assert(hasOwnNestedProperty(obj, 'foo.bar[3]') === false)
    assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz3') === false)
    assert(hasOwnNestedProperty(obj, 'foo.bar2') === false)
  })
})
