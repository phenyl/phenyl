// @flow
import { PhenylEntityClient } from 'phenyl-central-state/jsnext'
import { PhenylMongoDbClient } from './mongodb-client.js'
import type { MongoDbConnection } from './connection.js'

export function createEntityClient(conn: MongoDbConnection) {
  return new PhenylMongoDbEntityClient(conn)
}

export class PhenylMongoDbEntityClient extends PhenylEntityClient {

  constructor(conn: MongoDbConnection) {
    super()
    this.dbClient = new PhenylMongoDbClient(conn)
  }
}
