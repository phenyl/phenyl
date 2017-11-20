// @flow
import { AbstractEntityClient } from 'phenyl-utils/jsnext'
import MongoDbClientEssence from './mongodb-client-essence.js'
import type { MongoDbConnection } from './connection.js'

export function createEntityClient(conn: MongoDbConnection) {
  return new PhenylMongoDbClient(conn)
}

export class PhenylMongoDbClient extends AbstractEntityClient {

  constructor(conn: MongoDbConnection) {
    super()
    this.essence = new MongoDbClientEssence(conn)
  }
}
