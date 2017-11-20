// @flow
import { AbstractEntityClient } from 'phenyl-utils/jsnext'
import { PhenylMongoDbClient } from './mongodb-client.js'
import type { MongoDbConnection } from './connection.js'

export function createEntityClient(conn: MongoDbConnection) {
  return new PhenylMongoDbEntityClient(conn)
}

export class PhenylMongoDbEntityClient extends AbstractEntityClient {

  constructor(conn: MongoDbConnection) {
    super()
    this.dbClient = new PhenylMongoDbClient(conn)
  }
}
