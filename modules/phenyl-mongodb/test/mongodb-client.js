// @flow

import { it, describe } from 'kocha'
import bson from 'bson'
import assert from 'power-assert'
import type { AndFindOperation, UpdateOperation } from 'phenyl-interfaces'
import {
  filterFindOperation,
  filterUpdateOperation,
  filterInputEntity,
} from '../src/mongodb-client.js'

describe('filterFindOperation', () => {
  it ('renames id to _id', () => {
    const input: AndFindOperation = {
      $and: [
        { id: 'abc' },
        { type: 'bar' },
      ]
    }
    const expected = {
      $and: [
        { _id: 'abc' },
        { type: 'bar' },
      ]
    }
    const actual = filterFindOperation(input)
    assert.deepEqual(actual, expected)
  })

  it ('converts document path to dot notation', () => {
    // $FlowIssue(this-is-and-find-operation)
    const input: AndFindOperation = {
      $and: [
        { 'values[0]': 'fizz' },
        { 'values[1].test': 'buzz' },
        { 'values[12].test': { $eq: 'fizzBuzz' } },
        { 'values[123].test': { $regex: /zz/ } },
        { 'values[1234].test': { $in: ['fizz', 'buzz'] } },
        { type: 'bar' },
      ]
    }
    const expected = {
      $and: [
        { 'values.0': 'fizz' },
        { 'values.1.test': 'buzz' },
        { 'values.12.test': { $eq: 'fizzBuzz' } },
        { 'values.123.test': { $regex: /zz/ } },
        { 'values.1234.test': { $in: ['fizz', 'buzz'] } },
        { type: 'bar' },
      ]
    }
    const actual = filterFindOperation(input)
    assert.deepEqual(actual, expected)
  })

  it ('converts matched string to ObjectId', () => {
    // $FlowIssue(this-is-and-find-operation)
    const input: AndFindOperation = {
      $and: [
        // not match
        { id: null },
        { id: 111111111111111111111111 },
        { id: 'bar' },
        { id: bson.ObjectID('222222222222222222222222') },
        // match
        { id: '000123456789abcdefABCDEF' },
      ]
    }
    const expected = {
      $and: [
        { _id: null },
        { _id: 111111111111111111111111 },
        { _id: 'bar' },
        { _id: bson.ObjectID('222222222222222222222222') },
        { _id: bson.ObjectID('000123456789abcdefABCDEF') },
      ]
    }
    const actual = filterFindOperation(input)
    assert.deepEqual(actual, expected)
  })
})

describe('filterUpdateOperation', () => {
  it ('converts new name to name with parent', () => {
    const input: UpdateOperation = {
      $rename: {
        foo: 'bar',
        'baz.qux': 'foobar',
        'baz.foo.qux': 'foobar',
      }
    }
    const expected = {
      $rename: {
        foo: 'bar',
        'baz.qux': 'baz.foobar',
        'baz.foo.qux': 'baz.foo.foobar',
      }
    }
    const actual = filterUpdateOperation(input)
    assert.deepEqual(actual, expected)
  })
})

describe('filterInputEntity', () => {
  it ('renames id to _id', () => {
    const input: Entity = {
      id: 123,
      attr: 'bar',
    }
    const expected = {
      _id: 123,
      attr: 'bar',
    }
    const actual = filterInputEntity(input)
    assert.deepEqual(actual, expected)
  })

  it ('converts id to ObjectId', () => {
    const input: Entity = {
      id: '000123456789abcdefABCDEF',
      attr: 'bar',
    }
    const expected = {
      _id: bson.ObjectID('000123456789abcdefABCDEF'),
      attr: 'bar',
    }
    const actual = filterInputEntity(input)
    assert.deepEqual(actual, expected)
  })
})
