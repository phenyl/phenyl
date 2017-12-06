// @flow

import kocha from 'kocha'
import { createEntityClient } from '../src/create-entity-client.js'
import assert from 'power-assert'
import { connect } from '../src/connection.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'

async function createMongoDBClient() {
  try {
    const mongoDBConnection = await connect('mongodb://localhost:27017')
    return createEntityClient(mongoDBConnection)
  } catch (e) {
    throw new Error('Test was skipped as connection to mongodb failed.')
  }
}

assertEntityClient(createMongoDBClient(), kocha, assert)
