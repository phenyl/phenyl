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

const user8 = {
  // $FlowIssue(id-is-generated-automatically)
  id: undefined,
  name: { first: 'John', last: 'Test' },
  age: 30,
}

const user9 = {
  // $FlowIssue(id-is-generated-automatically)
  id: undefined,
  name: { first: 'Jane', last: 'Test' },
  age: 31,
}

const user10 = {
  // $FlowIssue(id-is-generated-automatically)
  id: undefined,
  name: { first: 'Richard', last: 'Test' },
  age: 32,
}

const user11 = {
  id: 'user11',
  name: {first: '0', last: 'Test'},
  age: 0,
}
const user12 = {
  id: 'user12',
  name: {first: 'null', last: 'Test'},
  age: null,
}
const user13 = {
  id: 'user13',
  name: {first: 'empty', last: 'Test'},
  age: 19,
  subName: ''
}
const user14 = {
  id: 'user14',
  name: {first: 'false', last: 'Test'},
  age: 19,
  passed: false
}


type ThisEntityMap = {
  user: {
    id: string,
    name: { first: string, last: string },
    age: ?number,
    passed?: boolean,
    subName?: string,
    hobbies?: Array<string>,
    favorites?: {
      music: { singer: string, writer: string },
      movie: { title: string },
      book: { author: string },
    },
    skills?: string
  }
}

export const assertEntityClient = (
  entityClient: EntityClient<ThisEntityMap>,
  mocha: any,
  assert: Function,
) => {
  const { describe, it, after, before } = mocha

  after(async () => {
    await entityClient.delete({ entityName: 'user', where: {} })
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

    it('returns an entity with id', async () => {
      const result = await entityClient.insertAndGet({
        entityName: 'user',
        value: user8,
      })

      assert(result.ok === 1)
      assert(result.n === 1)
      assert(!user8.id)
      assert(result.entity.id)
      user8.id = result.entity.id
      assert.deepEqual(result.entity, user8)
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

    it('inserts entities without id and returns entities with id', async () => {
      const result = await entityClient.insertAndGetMulti({
        entityName: 'user',
        values: [ user9, user10 ],
      })

      assert(result.ok === 1)
      assert(result.n === 2)
      assert(!user9.id)
      assert(!user10.id)
      assert(result.entities[0].id)
      assert(result.entities[1].id)
      user9.id = result.entities[0].id
      user10.id = result.entities[1].id
      assert.deepEqual(result.entities, [user9, user10])
    })
  })

  describe('find', () => {
    before(async () => {
      await entityClient.insertAndGetMulti({
        entityName: 'user',
        values: [user11, user12, user13, user14]
      })
    })
    it('returns entities when condition matches', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: { 'name.first': 'Shin' },
      })

      assert(result.ok === 1)
      assert(result.entities.length > 0)
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

    it('returns an entity by autogenerated id', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: { id: user8.id },
      })
      assert.deepEqual(
        result.entities[0], user8)
    })

    it('returns an entity when condition (is 0) matches', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {age: 0},
      })

      assert(result.ok === 1)
      assert(result.entities.length === 1)
      assert(result.entities[0].id === user11.id)
    })

    it('returns an entity when condition (is null) matches', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {age: null},
      })
      assert(result.ok === 1)
      assert(result.entities.length === 1)
      assert(result.entities[0].id === user12.id)
    })

    it('returns an entity when condition (is false) matches', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {subName: ''},
      })
      assert(result.ok === 1)
      assert(result.entities.length === 1)
      assert(result.entities[0].id === user13.id)
    })

    it('returns an entity when condition (is false) matches', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {passed: false},
      })
      assert(result.ok === 1)
      assert(result.entities.length === 1)
      assert(result.entities[0].id === user14.id)
    })

    it('does not return entities when condition empty string and does not match', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {id: ''}
      })
      assert(result.ok === 1)
      assert(result.entities.length === 0)
    })
    it('does not return entities when condition 0 and does not match', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {id: 0}
      })
      assert(result.ok === 1)
      assert(result.entities.length === 0)
    })
    it('does not return entities when condition null and does not match', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        where: {id: null}
      })
      assert(result.ok === 1)
      assert(result.entities.length === 0)
    })
    it('does not return entities when condition undefined and does not match', async () => {
      const result = await entityClient.find({
        entityName: 'user',
        // $FlowIssue(undefined-is-allowed-here)
        where: {id: undefined}
      })
      assert(result.ok === 1)
      assert(result.entities.length === 0)
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

    it('returns an entity when condition (is 0) matches', async () => {
      const result = await entityClient.findOne({
        entityName: 'user',
        where: {age: 0},
      })

      assert(result.ok === 1)
      assert(result.entity.id === user11.id)
    })
    it('returns an entity when condition (is null) matches', async () => {
      const result = await entityClient.findOne({
        entityName: 'user',
        where: {age: null},
      })
      assert(result.ok === 1)
      assert(result.entity.id === user12.id)
    })
    it('returns an entity when condition (is false) matches', async () => {
      const result = await entityClient.findOne({
        entityName: 'user',
        where: {subName: ''},
      })
      assert(result.ok === 1)
      assert(result.entity.id === user13.id)
    })
    it('returns an entity when condition (is false) matches', async () => {
      const result = await entityClient.findOne({
        entityName: 'user',
        where: {passed: false},
      })
      assert(result.ok === 1)
      assert(result.entity.id === user14.id)
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

    it('returns an entity by autogenerated id', async () => {
      const result = await entityClient.findOne({
        entityName: 'user',
        where: { id: user8.id },
      })
      assert.deepEqual(result.entity, user8)
    })


    it('returns a NotFound error when "where" query contains empty string', async () => {
      try {
        await entityClient.findOne({
          entityName: 'user',
          where: { id: '' }
        })
        throw new Error('this must not be called')
      }
      catch (error) {
        assert(error.ok === 0)
        assert(error.type === 'NotFound')
      }
    })
    it('returns a NotFound error when "where" query contains 0 and no data with the value', async () => {
      try {
        await entityClient.findOne({
          entityName: 'user',
          where: { id: 0 }
        })
      }
      catch (error) {
        assert(error.ok === 0)
        assert(error.type === 'NotFound')
      }
    })
    it('returns a NotFound error when "where" query contains null', async () => {
      try {
        await entityClient.findOne({
          entityName: 'user',
          where: { id: null }
        })
      }
      catch (error) {
        assert(error.ok === 0)
        assert(error.type === 'NotFound')
      }
    })
    it('returns a NotFound error when "where" query contains undefined', async () => {
      try {
        await entityClient.findOne({
          entityName: 'user',
          // $FlowIssue(undefined-property-is-valid-in-test-here)
          where: { id: undefined }
        })
      }
      catch (error) {
        assert(error.ok === 0)
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

    it('returns an entity by autogenerated id', async () => {
      const result = await entityClient.get({
        entityName: 'user',
        id: user8.id,
      })
      assert.deepEqual(result.entity, user8)
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

    it('returns an entity by autogenerated id', async () => {
      const result = await entityClient.getByIds({
        entityName: 'user',
        ids: [user8.id],
      })
      assert.deepEqual(result.entities, [user8])
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

      assert(result2.entity.favorites && result2.entity.favorites.music.singer === 'Tatsuro Yamashita')
    })

    it ('updates an entity by auto generated id', async () => {
      const result = await entityClient.updateById({
        entityName: 'user',
        id: user8.id,
        operation: { $set: { age: 33 }},
      })

      assert(result.ok === 1)
      assert(result.n === 1)

      const result2 = await entityClient.get({
        entityName: 'user',
        id: user8.id,
      })

      assert(result2.entity.age === 33)
    })

    it ('rename an entity with updateById command', async () => {
      const result = await entityClient.updateById({
        entityName: 'user',
        id: user1.id,
        operation: {
          $rename: {
            hobbies: 'skills',
            'favorites.music.singer': 'writer',
          }
        },
      })

      assert(result.ok === 1)
      assert(result.n === 1)

      const result2 = await entityClient.get({
        entityName: 'user',
        id: user1.id,
      })

      assert(result2.entity.skills && result2.entity.skills.length === 1)
      assert(result2.entity.favorites && result2.entity.favorites.music.writer === 'Tatsuro Yamashita')
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

      assert(result2.entities.length > 0)
      result2.entities.forEach(entity => {
        assert(entity.favorites && entity.favorites.music.singer === 'Tatsuro Yamashita')
      })
    })

    it ('updates entities by autogenerated id', async () => {
      const result = await entityClient.updateMulti({
        entityName: 'user',
        // $FlowIssue(find-operation)
        where: { id: { $in: [user9.id, user10.id] } },
        operation: { $set: { age: 40 }},
      })

      assert(result.ok === 1)
      assert(result.n === 2)

      const result2 = await entityClient.find({
        entityName: 'user',
        // $FlowIssue(find-operation)
        where: { id: { $in: [user9.id, user10.id] } },
      })

      assert(result2.entities.length === 2)
      result2.entities.forEach(entity => {
        assert(entity.age != null && entity.age === 40)
      })
    })

    it ('rename entities with updateMulti command', async () => {
      const result = await entityClient.updateMulti({
        entityName: 'user',
        where: { 'name.last': 'Tanaka' },
        operation: {
          $rename: {
            hobbies: 'skills',
            'favorites.music.singer': 'writer',
          }
        },
      })

      assert(result.ok === 1)
      assert(result.n === 7)

      const result2 = await entityClient.find({
        entityName: 'user',
        where: { 'name.last': 'Tanaka' },
      })

      assert(result2.entities.length > 0)
      result2.entities.forEach(entity => {
        assert(entity.skills && entity.skills.length > 0)
        assert(
          entity.favorites &&
          entity.favorites.music.writer === 'Tatsuro Yamashita')
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
        operation: { $set: { 'favorites.movie': { title: 'Shin Godzilla' }}},
      })

      assert(result.ok === 1)
      assert(result.n === 1)
      assert(
        result.entity.favorites &&
        result.entity.favorites.movie.title === 'Shin Godzilla')
    })

    it ('does not update and get any entity when condition does not match', async () => {
      try {
        await entityClient.updateAndGet({
          entityName: 'user',
          id: 'hoge',
          operation: { $set: { 'favorites.movie': { title: 'Shin Godzilla' }}},
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
      assert(result.entities.length > 0)
      result.entities.forEach(entity => {
        assert(
          entity.favorites &&
          entity.favorites.book.author === 'Abe Kobo')
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

    it ('deletes an entity with by auto generated id', async () => {
      const id = user8.id
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
      assert(result.n === 6)

      const result2 = await entityClient.find({
        entityName: 'user',
        where,
      })

      assert(result2.entities.length === 0)
    })
  })
}
