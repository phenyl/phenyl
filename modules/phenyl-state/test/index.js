// @flow

import { describe, it } from 'kocha'
import assert from 'assert'
import PhenylState from '../src'

describe('find', () => {
  it('', () => {
    const user1 = { id: 1, name: 'kery' }
    const user2 = { id: 2, name: 'kory' }
    const user3 = { id: 3, name: 'kiry' }
    const state = new PhenylState({
      entities: { user: [user1, user2, user3] }
    })
    const usersFoundByQuery = state.find({
      from: 'user',
      where: { $lte: { id: 2 } },
    })
    assert.deepEqual(usersFoundByQuery, [user1, user2])
  })
})

describe('findOne', () => {
  it('', () => {
    const user = { id: 1, name: 'kery' }
    const state = new PhenylState({
      entities: { user }
    })
    const userFromState = state.findOne({
      from: 'user',
      where: { name: 'kory' }
      id: 1,
    })
    assert.deepEqual(userFromState, user)
  })
})

describe('get', () => {
  it('', () => {
    const user = { id: 1, name: 'kery' }
    const state = new PhenylState({
      entities: { user }
    })
    const userFromState = state.get({
      from: 'user',
      id: 1,
    })
    assert.deepEqual(userFromState, user)
  })
})

describe('$update', () => {
  it('', () => {
    const state = new PhenylState({
      entities: { user: {
        id: 1,
        name: 'kery',
      }}
    })
    const newState = state.$update({
      from: 'user',
      id: 1,
    })
    const expectedState = new PhenylState({
      entities: { user: { id: 'user1' }}
    })
    assert.deepEqual(newState, expectedState)
  })
})

describe('$delete', () => {
  it('', () => {
    const state = new PhenylState({
      entities: { user: {
        id: 1,
        name: 'kery',
      }}
    })
    const newState = state.$delete({
      from: 'user',
      id: 'user1',
    })

    const expectedState = new PhenylState({
      entities: {
        user: {}
      }
    })
    assert.deepEqual(newState, expectedState)
  })
})

describe('$register', () => {
  it('', () => {
    const state = new PhenylState({
      entities: { user: { id: 1 } }
    })
    const newState = state.$insert({
      from: 'user',
      value: { id: 'diary1' }
    })

    const expectedState = new PhenylState({
      entities: { user: {
        id: 1,
      }}
    })
    assert.deepEqual(newState, expectedState)
  })
})

