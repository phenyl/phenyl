// @flow

import type {
  EntityClient
} from '../index.js'

const user1 = {
  id: 'user1',
  name: { first: 'Shin', last: 'Tanaka' },
  age: 10,
  hobbies: ['music'],
}

const user2 = {
  id: 'user2',
  name: { first: 'Shingo', last: 'Tanaka' },
  age: 16,
  hobbies: ['football', 'music'],
}

const user3 = {
  id: 'user3',
  name: { first: 'taro', last: 'Tanaka' },
  age: 19,
  hobbies: ['baseball'],
}

const user4 = {
  id: 'user4',
  name: { first: 'jiro', last: 'Tanaka' },
  age: 31,
  hobbies: ['cooking', 'music'],
}

const user5 = {
  id: 'user5',
  name: { first: 'saburo', last: 'Tanaka' },
  age: 26,
  hobbies: ['cooking'],
}

const user6 = {
  id: 'user6',
  name: { first: 'shiro', last: 'Tanaka' },
  age: 22,
  hobbies: ['cooking'],
}

const user7 = {
  id: 'user7',
  name: { first: 'goro', last: 'Tanaka' },
  age: 47,
  hobbies: ['cooking'],
}

let entityClient

export const assertEntityClient = (
  entityClientPromise: EntityClient | Promise<EntityClient>,
  kocha: any,
  assert: Function,
) => {
  const { describe, it, after, before } = kocha

  before(async () => {
    entityClient = await entityClientPromise
  })

  describe('assertEntityClient', () => {
    after(async () => {
      entityClient.delete({ entityName: 'user', where: {} })
    })

    describe('insert', () => {
      it('inserts an entity with insertOne command', async () => {
        const result = await entityClient.insertOne({
          entityName: 'user',
          value: user1,
        })

        assert(result.ok === 1)
        assert(result.n === 1)
      })

      it('inserts entities with insertMulti command', async () => {
        const result = await entityClient.insertMulti({
          entityName: 'user',
          values: [ user2, user3, user4 ],
        })

        assert(result.ok === 1)
        assert(result.n === 3)
      })
    })

    describe('find', () => {
      it('returns entities when condition matches', async () => {
        const result = await entityClient.find({
          entityName: 'user',
          where: { 'name.first': 'Shin' },
        })

        assert(result.ok === 1)
        result.entities.forEach(entity => {
          assert(entity.name.first === 'Shin')
        })
      })

      it('does not return entities when condition does not match', async () => {
        const result = await entityClient.find({
          entityName: 'user',
          where: { 'name.first': 'naomi' },
        })

        assert(result.entities.length === 0)
      })

      it('returns entities when array index condition matches', async () => {
        const result = await entityClient.find({
          entityName: 'user',
          where: { 'hobbies[1]': 'music' },
        })

        assert.deepEqual(result.entities, [user2, user4])
      })
    })

    describe('findOne', () => {
      it('returns an entity when condition matches', async () => {
        const result = await entityClient.findOne({
          entityName: 'user',
          where: { id: user1.id },
        })

        assert(result.ok === 1)
        assert(result.entity.id === user1.id )
      })

      it('returns null when condition does not match', async () => {
        try {
          await entityClient.findOne({
            entityName: 'user',
            where: { id: 'hogehoge' },
          })
        } catch (error) {
          assert(error.type === 'NotFound')
        }
      })
    })

    describe('get', () => {
      it('returns an entity when condition matches', async () => {
        const result = await entityClient.get({
          entityName: 'user',
          id: user1.id,
        })

        assert(result.ok === 1)
        assert.deepEqual(result.entity, user1)
      })

      it('does not return any entity when condition does not matches', async () => {
        try {
          await entityClient.get({
            entityName: 'user',
            id: 'hogehoge',
          })
        } catch (error) {
          assert(error.type === 'NotFound')
        }
      })
    })

    describe('getByIds', () => {
      it('returns entities when condition matches', async () => {
        const result = await entityClient.getByIds({
          entityName: 'user',
          ids: [user1.id, user2.id],
        })

        assert.deepEqual(result.entities, [user1, user2])
      })
      it('does not return any entities when condition does not matche', async () => {
        try {
          await entityClient.getByIds({
            entityName: 'user',
            ids: ['hoge', 'fuga'],
          })
        } catch (error) {
          assert(error.type === 'NotFound')
        }
      })
    })

    describe('insertAndGet', () => {
      it('inserts and returns an entity', async () => {
        const result = await entityClient.insertAndGet({
          entityName: 'user',
          value: user5,
        })

        assert(result.ok === 1)
        assert(result.n === 1)
        assert.deepEqual(result.entity, user5)
      })
    })

    describe('insertAndGetMulti', () => {
      it('inserts and returns entities', async () => {
        const result = await entityClient.insertAndGetMulti({
          entityName: 'user',
          values: [ user6, user7 ],
        })

        assert(result.ok === 1)
        assert(result.n === 2)
        assert.deepEqual(result.entities, [user6, user7])
      })
    })

    describe('updateById', () => {
      it ('updates an entity with updateById command', async () => {
        const result = await entityClient.updateById({
          entityName: 'user',
          id: user1.id,
          operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
        })

        assert(result.ok === 1)
        assert(result.n === 1)

        const result2 = await entityClient.get({
          entityName: 'user',
          id: user1.id,
        })

        assert(result2.entity.favorites.music.singer === 'Tatsuro Yamashita')
      })
    })

    describe('updateMulti', () => {
      it ('updates entities with updateMulti command', async () => {
        const result = await entityClient.updateMulti({
          entityName: 'user',
          where: { 'name.last': 'Tanaka' },
          operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
        })

        assert(result.ok === 1)
        assert(result.n === 7)

        const result2 = await entityClient.find({
          entityName: 'user',
          where: { 'name.last': 'Tanaka' },
        })

        result2.entities.forEach(entity => {
          assert(entity.favorites.music.singer === 'Tatsuro Yamashita')
        })
      })

      it ('does not update any entity when condition does not match', async () => {
        const result = await entityClient.updateMulti({
          entityName: 'user',
          where: { id: 'hogehoge' },
          operation: { $set: { 'favorites.music': { singer: 'Tatsuro Yamashita' }}},
        })
        assert(result.n === 0)
      })
    })

    describe('updateAndGet', () => {
      it ('updates and gets entity when condition matches', async () => {
        const result = await entityClient.updateAndGet({
          entityName: 'user',
          id: user1.id,
          operation: { $set: { 'favorites.movie': { title: 'shin godzilla' }}},
        })

        assert(result.ok === 1)
        assert(result.n === 1)
        assert(result.entity.favorites.movie.title === 'shin godzilla')
      })

      it ('does not update and get any entity when condition does not match', async () => {
        try {
          await entityClient.updateAndGet({
            entityName: 'user',
            id: 'hoge',
            operation: { $set: { 'favorites.movie': { title: 'shin godzilla' }}},
          })
          throw new Error('this must not be called')
        } catch (error) {
          assert(error.type === 'NotFound')
        }
      })
    })

    describe('updateAndFetch', () => {
      it ('updates and fetches entities when condition matches', async () => {
        const result = await entityClient.updateAndFetch({
          entityName: 'user',
          where: { 'name.last': 'Tanaka' },
          operation: { $set: { 'favorites.book': { author: 'Abe Kobo' }}},
        })

        assert(result.ok === 1)
        assert(result.n === 7)
        result.entities.forEach(entity => {
          assert(entity.favorites.book.author === 'Abe Kobo')
        })
      })

      it ('does not update and fetch any entities when condition does not match', async () => {
        const result = await entityClient.updateAndFetch({
          entityName: 'user',
          where: { id: 'hoge' },
          operation: { $set: { 'favorites.book': { author: 'Abe Kobo' }}},
        })

        assert(result.entities.length === 0)
      })
    })

    describe('delete', () => {
      it ('deletes an entity with id delete command', async () => {
        const id = user1.id
        const result = await entityClient.delete({
          entityName: 'user',
          id,
        })

        assert(result.ok === 1)
        assert(result.n === 1)

        try {
          await entityClient.get({
            entityName: 'user',
            id,
          })
          throw new Error('this must not be called')
        } catch (error) {
          assert(error.type === 'NotFound')
        }
      })

      it ('deletes entities with multi delete command', async () => {
        const where = { age: { $gt: 20 }}
        const result = await entityClient.delete({
          entityName: 'user',
          where,
        })

        assert(result.ok === 1)
        assert(result.n === 4)

        const result2 = await entityClient.find({
          entityName: 'user',
          where,
        })

        assert(result2.entities.length === 0)
      })
    })
  })
}
