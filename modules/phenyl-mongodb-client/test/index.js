// @flow

import { it, describe, before, after } from 'kocha'
import PhenylMongoDbClient from '../src/mongodb-client.js'
import { connect } from '../src/connection.js'
import { assertEntityClient } from 'phenyl-interfaces'

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

  it('assertEntityClient', () => {
    assertEntityClient(mongoDBClient, describe, it, after)
  })
})