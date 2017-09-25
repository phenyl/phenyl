// @flow

import { describe, it } from 'kocha'
import assert from 'assert'
import PhenylState from '../src/index.js'

describe('find', () => {
  it('', () => {
    const user1 = { id: '1', name: 'kery' }
    const user2 = { id: '2', name: 'kory' }
    const user3 = { id: '3', name: 'kiry' }
    const state = new PhenylState({
      entities: { user: {
        '1': user1,
        '2': user2,
        '3': user3,
      }}
    })
    const usersFoundByQuery = state.find({
      entityName: 'user',
      //$FlowIssue(WhereQuery value can be a string)
      where: { name: 'kery' },
    })
    assert.deepEqual(usersFoundByQuery, [user1])
  })
})

describe('findOne', () => {
  it('', () => {
    const user = { id: '1', name: 'kery' }
    const state = new PhenylState({
      entities: { user: { '1': user } },
    })
    const userFromState = state.findOne({
      entityName: 'user',
      //$FlowIssue(WhereQuery value can be a string)
      where: { name: 'kery' },
      id: '1',
    })
    assert.deepEqual(userFromState, user)
  })
})

describe('get', () => {
  it('', () => {
    const user = { id: '1', name: 'kery' }
    const state = new PhenylState({
      entities: { user: { '1': user } },
    })
    const userFromState = state.get({
      entityName: 'user',
      id: '1',
    })
    assert.deepEqual(userFromState, user)
  })
})

describe('$update', () => {
  it('', () => {
    const state = new PhenylState({
      entities: { user: { '1': { id: '1', name: 'kery' } } },
    })
    const newState = state.$update({
      entityName: 'user',
      id: '1',
      operators: { $set: { name: 'kory' }}
    })
    const expectedState = new PhenylState({
      entities: { user: { '1': { id: '1', name: 'kery' } } },
    })
    assert.deepEqual(newState, expectedState)
  })
})

describe('$delete', () => {
  it('', () => {
    const state = new PhenylState({
      entities: { user: { '1': { id: '1', name: 'kery' } } },
    })
    const newState = state.$delete({
      entityName: 'user',
      id: '1',
    })

    const expectedState = new PhenylState({
      entities: { user: {} }
    })
    assert.deepEqual(newState, expectedState)
  })
})

describe('$register', () => {
  it('', () => {
    const state = new PhenylState({
      entities: { user: { '1': { id: '1', name: 'kery' } } },
    })
    const newState = state.$insert({
      entityName: 'user',
      value: { id: 'diary1' }
    })

    const expectedState = new PhenylState({
      entities: { user: { '1': { id: '1', name: 'kery' } } },
    })
    assert.deepEqual(newState, expectedState)
  })
})
