// @flow

import assert from 'power-assert'
import { it, describe, before, after } from 'kocha'
import PhenylMongoDbClient from '../src/mongodb-client.js'
import { connect } from '../src/connection.js'
import { assign } from 'power-assign/jsnext'

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

  describe('insert', () => {
    it('inserts an entity with single insert command', async () => {
      const result = await mongoDBClient.insert({
        entityName: 'user',
        value: assign(user1, { $rename: { id: '_id' }}),
      })

      assert.deepEqual(result, { ok: 1, n: 1 })
    })

    it('inserts entities with multi insert command', async () => {
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
  })

  describe('find', () => {
    it('returns entities when condition matches', async () => {
      const result = await mongoDBClient.find({
        entityName: 'user',
        where: { 'name.first': 'Shin' },
      })

      assert(result.ok === 1)
      result.values.forEach(value => {
        assert(value.name.first === 'Shin')
      })
    })

    it('does not return entities when condition does not match', async () => {
      const result = await mongoDBClient.find({
        entityName: 'user',
        where: { 'name.first': 'naomi' },
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('findOne', () => {
    it('returns an entity when condition matches', async () => {
      const result = await mongoDBClient.findOne({
        entityName: 'user',
        where: { id: user1.id },
      })

      assert(result.ok === 1)
      assert(result.value.id === user1.id )
    })

    it('does not return any entity when condition does not match', async () => {
      const result = await mongoDBClient.findOne({
        entityName: 'user',
        where: { id: 'hogehoge' },
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('get', () => {
    it('returns an entity when condition matches', async () => {
      const result = await mongoDBClient.get({
        entityName: 'user',
        id: user1.id,
      })

      assert(result.ok === 1)
      assert.deepEqual(result.value, user1)
    })

    it('does not return any entity when condition does not matches', async () => {
      const result = await mongoDBClient.get({
        entityName: 'user',
        id: 'hogehoge',
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('getByIds', () => {
    it('returns entities when condition matches', async () => {
      const result = await mongoDBClient.getByIds({
        entityName: 'user',
        ids: [user1.id, user2.id],
      })

      assert.deepEqual(result.values, [user1, user2])
    })
    it('does not return any entities when condition does not matche', async () => {
      const result = await mongoDBClient.getByIds({
        entityName: 'user',
        ids: ['hoge', 'fuga'],
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('insertAndGet', () => {
    it('inserts and returns an entity', async () => {
      const result = await mongoDBClient.insertAndGet({
        entityName: 'user',
        value: assign(user5, { $rename: { id: '_id' }}),
      })

      assert(result.ok === 1)
      assert(result.n === 1)
      assert.deepEqual(result.value, user5)
    })
  })

  describe('insertAndGetMulti', () => {
    it('inserts and returns entities', async () => {
      const result = await mongoDBClient.insertAndGetMulti({
        entityName: 'user',
        values: [
          assign(user6, { $rename: { id: '_id' }}),
          assign(user7, { $rename: { id: '_id' }})
        ],
      })

      assert(result.ok === 1)
      assert(result.n === 2)
      assert.deepEqual(result.values, [user6, user7])
    })
  })

  describe('update', () => {
    it ('updates an entity with id update command', async () => {
      const result = await mongoDBClient.update({
        entityName: 'user',
        id: user1.id,
        operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
      })

      assert(result.ok === 1)
      assert(result.n === 1)

      const result2 = await mongoDBClient.get({
        entityName: 'user',
        id: user1.id,
      })

      assert(result2.value.favorites.music.singer === 'Tatsuro Yamashita')
    })

    it ('updates entities with multi update command', async () => {
      const result = await mongoDBClient.update({
        entityName: 'user',
        where: { 'name.last': 'Tanaka' },
        operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
      })

      assert(result.ok === 1)
      assert(result.n === 7)

      const result2 = await mongoDBClient.find({
        entityName: 'user',
        where: { 'name.last': 'Tanaka' },
      })

      result2.values.forEach(value => {
        assert(value.favorites.music.singer === 'Tatsuro Yamashita')
      })
    })

    it ('does not update any entity when condition does not match', async () => {
      const result = await mongoDBClient.update({
        entityName: 'user',
        where: { id: 'hogehoge' },
        operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('updateAndGet', () => {
    it ('updates and gets an entity when condition matches', async () => {
      const result = await mongoDBClient.updateAndGet({
        entityName: 'user',
        id: user1.id,
        operation: { $set: { 'favorites.movie': { title: 'shin godzilla' }}},
      })

      assert(result.ok === 1)
      assert(result.n === 1)
      assert(result.value.favorites.movie.title === 'shin godzilla')
    })

    it ('does not update and get any entity when condition does not match', async () => {
      const result = await mongoDBClient.updateAndGet({
        entityName: 'user',
        id: 'hoge',
        operation: { $set: { 'favorites.movie': { title: 'shin godzilla' }}},
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('updateAndFetch', () => {
    it ('updates and fetches entities when condition matches', async () => {
      const result = await mongoDBClient.updateAndFetch({
        entityName: 'user',
        where: { 'name.last': 'Tanaka' },
        operation: { $set: { 'favorites.book': { author: 'Abe Kobo' }}},
      })

      assert(result.ok === 1)
      assert(result.n === 7)
      result.values.forEach(value => {
        assert(value.favorites.book.author === 'Abe Kobo')
      })
    })

    it ('does not update and fetch any entities when condition does not match', async () => {
      const result = await mongoDBClient.updateAndFetch({
        entityName: 'user',
        where: { id: 'hoge' },
        operation: { $set: { 'favorites.book': { author: 'Abe Kobo' }}},
      })

      assert(result.ok === 0)
      assert(result.type === 'NotFound')
    })
  })

  describe('delete', () => {
    it ('deletes an entity with id delete command', async () => {
      const id = user1.id
      const result = await mongoDBClient.delete({
        entityName: 'user',
        id,
      })

      assert(result.ok === 1)
      assert(result.n === 1)

      const deletedResult = await mongoDBClient.get({
        entityName: 'user',
        id,
      })

      assert(deletedResult.value == null)
    })

    it ('deletes entities with multi delete command', async () => {
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
      assert(deletedResult.ok === 0)
      assert(deletedResult.type === 'NotFound')
    })
  })
})
