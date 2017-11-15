// @flow
import { describe, it } from 'kocha'
import assert from 'power-assert'
import {
  visitFindOperation,
} from '../src/visit-find-operation.js'

describe('visitFindOperation', function () {
  it ('converts FindOperation by `simpleFindOperation` visitor', function () {
    const where = {
      $or: [
        { email: 'foo@example.com', password: 'foo-bar' },
        { email: 'bar@example.com', password: 'foo-bar' },
      ]
    }
    const modifiedWhere = visitFindOperation(where, {
      simpleFindOperation: op => {
        return Object.assign({}, op, { isUser: true })
      }
    })
    assert.deepEqual(modifiedWhere, {
      $or: [
        { email: 'foo@example.com', password: 'foo-bar', isUser: true },
        { email: 'bar@example.com', password: 'foo-bar', isUser: true },
      ]
    })
  })

  it ('converts FindOperation by `queryCondition` visitor', function () {
    const where = {
      name: { $regex: /foo/ }
    }
    const modifiedWhere = visitFindOperation(where, {
      queryCondition: cond => {
        if (cond.$regex) {
          // $FlowIssue($options-can-exist)
          return Object.assign({}, cond, { $options: 'i' })
        }
        return cond
      }
    })
    assert.deepEqual(modifiedWhere, {
      name: { $regex: /foo/, $options: 'i' }
    })
  })
})
