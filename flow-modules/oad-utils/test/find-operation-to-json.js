// @flow
import { describe, it } from 'mocha'
import assert from 'power-assert'
import {
  findOperationToJSON,
} from '../src/find-operation-to-json.js'

describe('findOperationToJSON', function () {
  it ('converts $regex operation', function () {
    const where = { 'user.firstName': { $regex: /shin/gi }}
    const modifiedWhere = findOperationToJSON(where)
    assert.deepEqual(modifiedWhere, {
      'user.firstName': { $regex: 'shin', $options: 'gi' }
    })
  })

  it ('converts implicit regex operation', function () {
    const where = { 'user.firstName': /naomi/gi }
    const modifiedWhere = findOperationToJSON(where)
    assert.deepEqual(modifiedWhere, {
      'user.firstName': { $regex: 'naomi', $options: 'gi' }
    })
  })

  it ('converts complex find operation with regex', function () {
    const where = {
      $and: [
        { 'user.firstName': /naomi/gi },
        { 'user.lastName': { $not: { $regex: /Suzuki/ } } }
      ],
    }

    const modifiedWhere = findOperationToJSON(where)
    assert.deepEqual(modifiedWhere, {
      $and: [
        { 'user.firstName': { $regex: 'naomi', $options: 'gi' } },
        { 'user.lastName': { $not: { $regex: 'Suzuki' } } }
      ],
    })
  })
})
