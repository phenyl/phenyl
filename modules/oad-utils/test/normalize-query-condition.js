// @flow
import { describe, it } from 'kocha'
import assert from 'power-assert'
import {
  normalizeQueryCondition,
} from '../src/normalize-query-condition.js'

describe('normalizeQueryCondition', function () {
  it ('converts plain EqCondition to QueryCondition', function () {
    const cond = { name: 'Shin' }
    const normalized = normalizeQueryCondition(cond)
    assert.deepEqual(normalized, { $eq: { name: 'Shin' } })
  })
})
