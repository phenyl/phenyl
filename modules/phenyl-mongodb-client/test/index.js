// @flow

import { it, describe, before, after } from 'kocha'
import PhenylMongoDbClient from '../src/mongodb-client.js'
import { connect } from '../src/connection.js'
import { assertEntityClient } from 'phenyl-interfaces'

let mongoDBClient

describe('PhenylMongoDbClient', () => {
  before(async () => {
    const mongoDBConnection = await connect('mongodb://localhost:27017')
    mongoDBClient = new PhenylMongoDbClient(mongoDBConnection)
  })

  it('assertEntityClient', () => {
    assertEntityClient(mongoDBClient, describe, it, after)
  })
})