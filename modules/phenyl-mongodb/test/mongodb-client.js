// @flow

import { it, describe } from 'kocha'
import assert from 'power-assert'
import type { AndFindOperation } from 'phenyl-interfaces'
import { filterFindOperation } from '../src/mongodb-client.js'

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
})
