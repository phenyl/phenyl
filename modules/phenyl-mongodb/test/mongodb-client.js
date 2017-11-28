// @flow

import { it, describe } from 'kocha'
import assert from 'power-assert'
import { filterWhere } from '../src/mongodb-client'
import type { AndFindOperation } from 'phenyl-interfaces'

describe('filterWhere', () => {
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
    const actual = filterWhere(input)
    assert.deepEqual(actual, expected)
  })

  it ('replaces document path to dot notation', () => {
    const input: AndFindOperation = {
      $and: [
        { 'values[0]': 'fizz' },
        { 'values[1].test': 'buzz' },
        { 'values[1234].test': 'fizzBuzz' },
        { type: 'bar' },
      ]
    }
    const expected = {
      $and: [
        { 'values.0': 'fizz' },
        { 'values.1.test': 'buzz' },
        { 'values.1234.test': 'fizzBuzz' },
        { type: 'bar' },
      ]
    }
    const actual = filterWhere(input)
    assert.deepEqual(actual, expected)
  })
})
