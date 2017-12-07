// @flow

import { it, describe } from 'kocha'
import bson from 'bson'
import assert from 'power-assert'
import type { AndFindOperation, UpdateOperation } from 'phenyl-interfaces'
import {
  filterFindOperation,
  filterUpdateOperation,
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
        { id: '333333333333333333333333' },
      ]
    }
    const expected = {
      $and: [
        { _id: null },
        { _id: 111111111111111111111111 },
        { _id: 'bar' },
        { _id: bson.ObjectID('222222222222222222222222') },
        { _id: bson.ObjectID('333333333333333333333333') },
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
