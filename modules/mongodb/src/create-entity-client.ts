import { EntityMap } from 'phenyl-interfaces'
import { PhenylEntityClient } from 'phenyl-central-state/jsnext'
import { PhenylMongoDbClient } from './mongodb-client'
import { MongoDbConnection } from './connection'
import { PhenylEntityClientOptions } from 'phenyl-central-state/jsnext'

export function createEntityClient<M extends EntityMap>(conn: MongoDbConnection, options: PhenylEntityClientOptions<M> = {}): PhenylMongoDbEntityClient<M> {
  return new PhenylMongoDbEntityClient(conn, options)
}

export class PhenylMongoDbEntityClient<M extends EntityMap> extends PhenylEntityClient<M> {
  dbClient: PhenylMongoDbClient<M>

  constructor(conn: MongoDbConnection, options: PhenylEntityClientOptions<M> = {}) {
    const dbClient = new PhenylMongoDbClient(conn)
    super(dbClient, options)
  }
}
