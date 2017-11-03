// @flow

import assert from 'power-assert'
import { it, describe, before, after } from 'kocha'
import PhenylMongoDbClient from '../src/index.js'
import { connect } from '../src/connection.js'
import { assign } from 'power-assign/jsnext.js'

let mongoDBClient

const user1 = {
  id: 'user1',
  name: { first: 'Shin', last: 'Tanaka' },
  age: 10,
}

const user2 = {
  id: 'user2',
  name: { first: 'Shingo', last: 'Tanaka' },
  age: 16,
}

const user3 = {
  id: 'user3',
  name: { first: 'taro', last: 'Tanaka' },
  age: 19,
}

const user4 = {
  id: 'user4',
  name: { first: 'jiro', last: 'Tanaka' },
  age: 31,
}

const user5 = {
  id: 'user5',
  name: { first: 'saburo', last: 'Tanaka' },
  age: 26,
}

const user6 = {
  id: 'user6',
  name: { first: 'shiro', last: 'Tanaka' },
  age: 22,
}

const user7 = {
  id: 'user7',
  name: { first: 'goro', last: 'Tanaka' },
  age: 47,
}

describe('PhenylMongoDbClient', () => {
  before(async () => {
    const mongoDBConnection = await connect('mongodb://localhost:27017')
    mongoDBClient = new PhenylMongoDbClient(mongoDBConnection)
  })

  after(async () => {
    mongoDBClient.delete({ entityName: 'user', where: {} })
  })

  it('insert with single insert command', async () => {
    const result = await mongoDBClient.insert({
      entityName: 'user',
      value: assign(user1, { $rename: { id: '_id' }}),
    })

    assert.deepEqual(result, { ok: 1, n: 1 })
  })

  it('insert with multi insert command', async () => {
    const result = await mongoDBClient.insert({
      entityName: 'user',
      values: [
        assign(user2, { $rename: { id: '_id' }}),
        assign(user3, { $rename: { id: '_id' }}),
        assign(user4, { $rename: { id: '_id' }})
      ],
    })

    assert(result.ok === 1)
    assert(result.n === 3)
  })

  it('find', async () => {
    const result = await mongoDBClient.find({
      entityName: 'user',
      where: { 'name.first': 'Shin' },
    })

    assert(result.ok === 1)
    result.values.forEach(value => {
      assert(value.name.first === 'Shin')
    })
  })

  it('findOne', async () => {
    const result = await mongoDBClient.findOne({
      entityName: 'user',
      where: { id: user1.id },
    })

    assert(result.ok === 1)
    assert(result.value.id === user1.id )
  })

  it('get', async () => {
    const result = await mongoDBClient.get({
      entityName: 'user',
      id: user1.id,
    })

    assert.deepEqual(result.value, user1)
  })

  it('getByIds', async () => {
    const result = await mongoDBClient.getByIds({
      entityName: 'user',
      ids: [user1.id, user2.id],
    })

    assert.deepEqual(result.values, [user1, user2])
  })

  it('insertAndGet', async () => {
    const result = await mongoDBClient.insertAndGet({
      entityName: 'user',
      value: assign(user5, { $rename: { id: '_id' }}),
    })

    assert(result.ok === 1)
    assert.deepEqual(result.value, user5)
  })

  it('insertAndGetMulti', async () => {
    const result = await mongoDBClient.insertAndGetMulti({
      entityName: 'user',
      values: [
        assign(user6, { $rename: { id: '_id' }}),
        assign(user7, { $rename: { id: '_id' }})
      ],
    })

    assert.deepEqual(result.values, [user6, user7])
  })

  it ('update with id update command', async () => {
    const result = await mongoDBClient.update({
      entityName: 'user',
      id: user1.id,
      operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
    })

    assert(result.ok === 1)

    const result2 = await mongoDBClient.get({
      entityName: 'user',
      id: user1.id,
    })

    assert(result2.value.favorites.music.singer === 'Tatsuro Yamashita')
  })

  it ('update with multi update command', async () => {
    const result = await mongoDBClient.update({
      entityName: 'user',
      where: { 'name.last': 'Tanaka' },
      operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
    })

    assert(result.ok === 1)

    const result2 = await mongoDBClient.find({
      entityName: 'user',
      where: { 'name.last': 'Tanaka' },
    })

    result2.values.forEach(value => {
      assert(value.favorites.music.singer === 'Tatsuro Yamashita')
    })
  })

  it ('updateAndGet', async () => {
    const result = await mongoDBClient.updateAndGet({
      entityName: 'user',
      id: user1.id,
      operation: { $set: { 'favorites.movie': { title: 'shin godzilla' }}},
    })

    assert(result.ok === 1)
    assert(result.value.favorites.movie.title === 'shin godzilla')
  })


  it ('updateAndFetch', async () => {
    const result = await mongoDBClient.updateAndFetch({
      entityName: 'user',
      where: { 'name.last': 'Tanaka' },
      operation: { $set: { 'favorites.book': { author: 'Abe Kobo' }}},
    })

    assert(result.ok === 1)
    result.values.forEach(value => {
      assert(value.favorites.book.author === 'Abe Kobo')
    })
  })

  it ('delete with id delete command', async () => {
    const id = user1.id
    const result = await mongoDBClient.delete({
      entityName: 'user',
      id,
    })

    assert(result.ok === 1)

    const deletedResult = await mongoDBClient.get({
      entityName: 'user',
      id,
    })

    assert(deletedResult.value == null)
  })

  it ('delete with multi delete command', async () => {
    const where = { age: { $gt: 20 }}
    const result = await mongoDBClient.delete({
      entityName: 'user',
      where,
    })

    assert(result.ok === 1)
    assert(result.n === 4)

    const deletedResult = await mongoDBClient.find({
      entityName: 'user',
      where,
    })
    assert(deletedResult.values.length === 0)
  })
})