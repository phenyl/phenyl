// @flow

import kocha, { after, before, describe, it } from 'kocha'
import { createEntityClient } from '../src/create-entity-client.js'
import assert from 'power-assert'
import bson from 'bson'
import { connect } from '../src/connection.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

async function createMongoDBClient() {
  try {
    const mongoDBConnection = await connect('mongodb://localhost:27017')
    return createEntityClient(mongoDBConnection)
  }
  catch (e) {
    throw new Error('Test was skipped as connection to mongodb failed.')
  }
}

assertEntityClient(createMongoDBClient(), kocha, assert)



describe('mongoDBEntityClient', () => {

  let conn
  let entityClient

  const HEX_24_ID = '000123456789abcdefABCDEF'
  let generatedId

  before(async () => {
    conn = await connect('mongodb://localhost:27017')
    entityClient = await createEntityClient(conn)
  })

  after(async () => {
    entityClient.delete({ entityName: 'user', where: {} })
  })

  describe('inserts entity', () => {
    it('without id and generates { _id: ObjectId(xxx) } ', async () => {
      const result = await entityClient.insertAndGet({
        entityName: 'user',
        value: { name: 'Jone' },
      })

      assert(result.entity.id)

      const users = await conn.collection('user').find()
      assert.deepEqual(users[0]._id, bson.ObjectID(result.entity.id))

      generatedId = result.entity.id
    })

    describe('with id after coverts from id', () => {
      it('to _id', async () => {
        await entityClient.insertOne({
          entityName: 'user',
          value: { id: 'jane', name: 'Jane' },
        })

        const users = await conn.collection('user').find({_id: 'jane'})
        assert(users[0]._id === 'jane')
      })

      it('to { _id: ObjectId(xxx) } if id is 24-byte hex string', async () => {
        const result = await entityClient.insertAndGet({
          entityName: 'user',
          value: { id: HEX_24_ID, name: 'Jesse' },
        })

        assert(result.entity.id === HEX_24_ID.toLowerCase())

        const users = await conn.collection('user').find({ name: 'Jesse' })
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
})
