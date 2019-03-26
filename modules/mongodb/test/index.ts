/* eslint-disable no-console */
import { after, before, describe, it } from 'mocha'
import { createEntityClient } from '../src/create-entity-client'
// @ts-ignore
import assert from 'power-assert'
import bson from 'bson'
// import { assertEntityClient } from '@phenyl/interfaces'
import { MongoDbConnection, connect } from '../src/connection'

const url = 'mongodb://localhost:27017'

// @TODO: should we implement assertEntityClient in @phenyl/interfaces
// describe('MongoDBEntityClient as EntityClient', async () => {
//   const conn = await connect(url, 'phenyl-mongodb-test')
//   const client = createEntityClient(conn)

//   assertEntityClient(client, mocha, assert)

//   after(() => {
//     conn.close()
//   })
// })

describe('MongoDBEntityClient', () => {

  let conn: MongoDbConnection
  let entityClient: any

  const HEX_24_ID = '000000000123456789abcdef'
  let generatedId: string

  before(async () => {
    conn = await connect(url, 'phenyl-mongodb-test')
    entityClient = createEntityClient(conn)
  })

  after(async () => {
    await entityClient.delete({ entityName: 'user', where: {} })
    conn.close()
  })

  describe('inserts entity', () => {
    it('without id and generates { _id: ObjectId(xxx) } ', async () => {
      const result = await entityClient.insertAndGet({
        entityName: 'user',
        value: { name: 'Jone' },
      })

      assert(result.entity.id)

      const users = await conn.collection('user').find()
      // @ts-ignore
      assert.deepEqual(users[0]._id, bson.ObjectID(result.entity.id))

      generatedId = result.entity.id
    })

    describe('with id after coverts from id', () => {
      it('to _id', async () => {
        await entityClient.insertOne({
          entityName: 'user',
          value: { id: 'jane', name: 'Jane' },
        })

        const users: any = await conn.collection('user').find({_id: 'jane'})
        assert(users[0]._id === 'jane')
      })

      it('to { _id: ObjectId(xxx) } if id is 24-byte hex lower string', async () => {
        const result = await entityClient.insertAndGet({
          entityName: 'user',
          value: { id: HEX_24_ID, name: 'Jesse' },
        })

        assert(result.entity.id === HEX_24_ID)

        const users = await conn.collection('user').find({ name: 'Jesse' })
        // @ts-ignore
        assert.deepEqual(users[0]._id, bson.ObjectID(HEX_24_ID))
      })
    })
  })

  describe('gets entity', () => {
    it('by auto generated id', async () => {
      const result = await entityClient.get({
        entityName: 'user',
        id: generatedId,
      })

      assert(result.entity.name === 'Jone')
    })

    it('by set id', async () => {
      const result = await entityClient.get({
        entityName: 'user',
        id: 'jane',
      })

      assert(result.entity.name === 'Jane')
    })

    it('by set 24-byte hex string id', async () => {
      const result = await entityClient.get({
        entityName: 'user',
        id: HEX_24_ID,
      })

      assert(result.entity.name === 'Jesse')
    })
  })

  describe('[Unstable because of the mongodb client library] ChangeStream', () => {
    it('next', (done) => {
      const stream = entityClient.dbClient.watch('user')
      stream.next((err: Error, evt: any) => {
        if (evt.operationType === 'update') {
          assert(evt.updateDescription.removedFields.length === 1)
          assert(evt.updateDescription.updatedFields['shin.a123'] === 'out')
          stream.close()
          done()
        }
        else {
          stream.close()
          done(`Operation type is invalid. ${evt.operationType} is given.`)
        }
      })

      entityClient.updateAndGet({
        entityName: 'user',
        id: HEX_24_ID,
        operation: { $set: { 'shin.a123': 'out' }, $unset: { name: '' } }
      })
    })
  })
})
