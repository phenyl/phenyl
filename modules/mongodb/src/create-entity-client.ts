// @ts-ignore remove this comment after @phenyl/interfaces release
import { EntityMap } from '@phenyl/interfaces'
// @ts-ignore remove this comment after @phenyl/central-state release
import { PhenylEntityClient, PhenylEntityClientOptions } from 'phenyl-central-state'
import { PhenylMongoDbClient } from './mongodb-client'
import { MongoDbConnection } from './connection'

export function createEntityClient<M extends EntityMap>(conn: MongoDbConnection, options: PhenylEntityClientOptions<M> = {}): PhenylMongoDbEntityClient<M> {
  return new PhenylMongoDbEntityClient(conn, options)
}

export class PhenylMongoDbEntityClient<M extends EntityMap> extends PhenylEntityClient<M> {
  // @ts-ignore dbClient is unused?
  dbClient: PhenylMongoDbClient<M>

  constructor(conn: MongoDbConnection, options: PhenylEntityClientOptions<M> = {}) {
    const dbClient = new PhenylMongoDbClient(conn)
    super(dbClient, options)
  }
}
