// @flow

import kocha from 'kocha'
import PhenylMongoDbClient from '../src/mongodb-client.js'
import { connect } from '../src/connection.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

let mongoDBClient
const { describe, it, before } = kocha

describe('PhenylMongoDbClient', () => {
  before(async () => {
    const mongoDBConnection = await connect('mongodb://localhost:27017')
    mongoDBClient = new PhenylMongoDbClient(mongoDBConnection)
  })

  it('assertEntityClient', () => {
    assertEntityClient(mongoDBClient, kocha)
  })
})
