// @flow
import { PhenylEntityClient } from 'phenyl-central-state/jsnext'
import { PhenylMongoDbClient } from './mongodb-client.js'
import type { MongoDbConnection } from './connection.js'
import type { PhenylEntityClientOptions } from 'phenyl-central-state/jsnext'

export function createEntityClient(conn: MongoDbConnection, options: PhenylEntityClientOptions = {}) {
  return new PhenylMongoDbEntityClient(conn, options)
}

export class PhenylMongoDbEntityClient extends PhenylEntityClient {

  constructor(conn: MongoDbConnection, options: PhenylEntityClientOptions = {}) {
    const dbClient = new PhenylMongoDbClient(conn)
    super(dbClient, options)
  }
}
