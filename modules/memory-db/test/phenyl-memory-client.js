// @flow
import { describe, it, before, beforeEach } from 'mocha'
import assert from 'power-assert'
import { createEntityClient } from '../src/create-entity-client.js'
import { assign } from 'power-assign/jsnext'

function range(n, start) {
  return Array.from(Array(n + start).keys()).slice(start)
}

describe('PhenylMemoryClient (test about versioning)', () => {
  describe('find', () => {
    let client
    const entityName = 'user'
    const users = [1, 2, 3].map(n => ({ id: `user${n}`, name: `U${n}`, num: n }))

    beforeEach(async() => {
      client = createEntityClient()
      await client.insertMulti({ entityName, values: users })
    })

    it('returns versionsById', async () => {
      const result = await client.find({ entityName, where: { num: { $gte: 2 } } })
      if (result.versionsById == null) throw new Error('result.versionsById should exist.')
      assert(result.versionsById.user1 == null)
      assert(result.versionsById.user2 && result.versionsById.user3)
    })
  })

  describe('findOne', () => {
    let client
    const entityName = 'user'
    const users = [1, 2, 3].map(n => ({ id: `user${n}`, name: `U${n}`, num: n }))

    beforeEach(async() => {
      client = createEntityClient()
      await client.insertMulti({ entityName, values: users })
    })

    it('returns versionId', async () => {
      const result = await client.findOne({ entityName, where: { num: { $gte: 2 } } })
      assert(result.versionId != null)
    })
  })

  describe('get', () => {
    let client
    const entityName = 'user'
    const users = [1, 2, 3].map(n => ({ id: `user${n}`, name: `U${n}`, num: n }))

    beforeEach(async() => {
      client = createEntityClient()
      await client.insertMulti({ entityName, values: users })
    })

    it('returns versionId', async () => {
      const result = await client.get({ entityName, id: 'user3' })
      assert(result.versionId != null)
    })
  })

  describe('getByIds', () => {
    let client
    const entityName = 'user'
    const users = [1, 2, 3].map(n => ({ id: `user${n}`, name: `U${n}`, num: n }))

    beforeEach(async() => {
      client = createEntityClient()
      await client.insertMulti({ entityName, values: users })
    })

    it('returns versionsById', async () => {
      const result = await client.getByIds({ entityName, ids: ['user1', 'user3'] })
      if (result.versionsById == null) throw new Error('result.versionsById should exist.')
      assert(result.versionsById.user2 == null)
      assert(result.versionsById.user1 && result.versionsById.user3)
    })
  })

  describe('pull', () => {
    let client
    const entityName = 'user'
    const id = 'foo'
    const user = { id, name: 'bar', age: 30, hobbies: ['guitar'] }
    let firstVersionId

    beforeEach(async() => {
      client = createEntityClient()
      firstVersionId = (await client.insertOne({ entityName: 'user', value: user })).versionId
    })
    it('returns operation diffs', async () => {
      const operation = { $inc: { age: 1 }, $push: { hobbies: 'tennis' } }
      const currentVersionId = (await client.updateById({ id, operation, entityName })).versionId
      // $FlowIssue(firstVersionId-is-string)
      const { operations, versionId } = await client.pull({ id, entityName, versionId: firstVersionId })
      assert(operations.length === 1 && versionId === currentVersionId)
      const currentUser = assign(user, operations[0])
      const { entity } = await client.get({ entityName, id })
      assert.deepEqual(currentUser, entity)

    })
  })

  describe('pull() with longer update histories', () => {
    let client
    const entityName = 'user'
    const id = 'foo'
    const user = { id, name: 'bar', age: 30, hobbies: ['guitar'] }
    const versionIds = []
    let firstVersionId
    let localVersionId
    let localUser

    before(async() => {
      client = createEntityClient()
      firstVersionId = (await client.insertOne({ entityName, value: user })).versionId
      versionIds.push(firstVersionId)

      for (const i of range(110, 1)) {
        const operation = { $inc: { age: 1 }, $push: { hobbies: `hobby${i}` } }
        versionIds.push((await client.updateById({ id, operation, entityName })).versionId)

        // Picking up version 20
        if (versionIds.length === 20) {
          localVersionId = versionIds[19]
          localUser = (await client.get({ entityName, id })).entity
        }

      }
      assert(versionIds.length === 111)
      assert(localUser.age === 49)
    })

    it('returns operation diffs', async () => {
      // $FlowIssue(localVersionId-is-string)
      const result = await client.pull({ entityName, id, versionId: localVersionId })
      if (!result.pulled) throw new Error('Result should have "pulled" property')

      let i = 20
      let currentUser = localUser
      for (const operation of result.operations) {
        const expectedOp = { $inc: { age: 1 }, $push: { hobbies: `hobby${i}` } }
        assert.deepEqual(operation, expectedOp)
        i++
        currentUser = assign(currentUser, operation)
      }
      const resultOfGet = await client.get({ entityName, id })
      assert.deepEqual(currentUser, resultOfGet.entity)
    })

    it('returns no operation diffs when the given versionId is older than 100 versions', async () => {
      // $FlowIssue(firstVersionId-is-string)
      const result = await client.pull({ entityName, id, versionId: firstVersionId })
      if (result.pulled) throw new Error('Result should not have "pulled" property')
      assert(result.entity.hobbies.length === 111)
    })

    it('returns empty operation diffs when the given versionId is the latest', async () => {
      const lastVersionId = versionIds[versionIds.length - 1]
      // $FlowIssue(lastVersionId-is-string)
      const result = await client.pull({ entityName, id, versionId: lastVersionId })
      if (!result.pulled) throw new Error('Result should not have "pulled" property')
      assert.deepEqual(result, {
        ok: 1,
        pulled: 1,
        operations: [],
        versionId: lastVersionId
      })
    })
  })

  describe('insert', () => {
    it('attaches meta info', async () => {
      const client = createEntityClient()
      const result = await client.insertOne({ entityName: 'user', value: { id: 'foo', name: 'bar' } })
      if (result.versionId == null) throw new Error('result.versionId should exist.')
      assert(client.entityState.pool.user.foo._PhenylMeta.versions, [ { id: result.versionId, op: '' }])
    })
  })

  describe('update', () => {
    let client
    const entityName = 'user'
    const id = 'foo'
    const user = { id, name: 'bar', age: 30, hobbies: ['guitar'] }

    beforeEach(async() => {
      client = createEntityClient()
      await client.insertOne({ entityName: 'user', value: user })
    })

    it('pushs version info to meta info of the updated entity', async () => {
      const operation = { $set: { name: 'John' }, $push: { hobbies: 'jogging' } }
      const result = await client.updateById({ id, operation, entityName })
      const { versions } = client.entityState.pool.user.foo._PhenylMeta
      assert(versions.length === 2)
      assert(versions[1].id === result.versionId)
      assert(versions[0].id === result.prevVersionId)
      const { entity } = await client.get({ entityName, id })
      assert(entity.name === 'John')
      assert.deepEqual(entity.hobbies, ['guitar', 'jogging'])
    })

    it('pushs version info to meta info of all the updated entities', async () => {
      const user2 = { id: 'user2', name: 'U2', age: 63, hobbies: [] }
      const user3 = { id: 'user3', name: 'U3', age: 11, hobbies: [] }
      await client.insertMulti({ entityName, values: [user2, user3] })

      const operation = { $inc: { age: 1 } }
      const result = await client.updateMulti({ operation, entityName, where: { id: { $regex: /^user/ } } })
      assert(result.n === 2)
      // $FlowIssue(versionsById-exists)
      assert(result.versionsById.user2 && result.versionsById.user2 === result.versionsById.user3)
      assert(result.prevVersionsById.user2 && result.prevVersionsById.user2 !== result.prevVersionsById.user3)
    })
  })

  // TODO more test cases
  describe('push', () => {
    let client
    const entityName = 'user'
    const id = 'foo'
    const user = { id, name: 'bar', age: 30, hobbies: ['guitar'] }
    let versionId: string

    beforeEach(async() => {
      client = createEntityClient()
      // $FlowIssue(versionId-is-string)
      versionId = (await client.insertOne({ entityName: 'user', value: user })).versionId
    })

    it('pushs operations to current entity', async () => {
      const operations = [
        { $set: { name: 'John' }, $push: { hobbies: 'jogging' } },
        { $push: { hobbies: 'tennis' } }
      ]
      const result = await client.push({ id, operations, entityName, versionId })
      if (!result.operations) throw new Error('result.operation should exist.')
      assert(result.operations.length === 0)
    })
  })
})
