// @flow

import kocha from 'kocha'
import PhenylMongoDbClient from '../src/mongodb-client.js'
import assert from 'power-assert'
import { connect } from '../src/connection.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

async function createMongoDBClient() {
  const mongoDBConnection = await connect('mongodb://localhost:27017')
  return new PhenylMongoDbClient(mongoDBConnection)
}

assertEntityClient(createMongoDBClient(), kocha, assert)
