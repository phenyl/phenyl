// @flow
// Sorry for poor typing

import { MongoClient } from 'mongodb'
import promisify from 'es6-promisify'

const connectToMongoDb = promisify(MongoClient.connect)

export interface MongoDbConnection {
  close(): void,
  collection(entityName: string): Object,
}

export type MongoDbCollection = Object

export async function connect(url: string): Promise<MongoDbConnection> {
  const db = await connectToMongoDb(url)
  return new PhenylMongoDbConnection({ db })
}

export function close(db: MongoDbConnection): void {
  db.close()
}

type PhenylMongoDbConnectionParams = {
  db: Object,
  collections?: {
    [entityName: string]: MongoDbCollection
  }
}

export class PhenylMongoDbConnection implements MongoDbConnection {
  db: Object
  collections: {
    [entityName: string]: MongoDbCollection
  }

  constructor(params: PhenylMongoDbConnectionParams) {
    this.db = params.db
    this.collections = params.collections || {}
  }

  collection(entityName: string): MongoDbCollection {
    if (this.collections[entityName] == null) {
      const coll = this.db.collection(entityName)
      this.collections[entityName] = promisifyCollection(coll)
    }
    return this.collections[entityName]
  }

  close(): void {
    this.db.close()
  }
}

function promisifyCollection(coll: Object): MongoDbCollection {
  return {
    find: promisifyFindChain(coll.find.bind(coll)),
    insertOne: promisify(coll.insertOne, coll),
    insertMany: promisify(coll.insertMany, coll),
    updateOne: promisify(coll.updateOne, coll),
    updateMany: promisify(coll.updateMany, coll),
    deleteOne: promisify(coll.deleteOne, coll),
    deleteMany: promisify(coll.deleteMany, coll),
  }
}

type FindChainParams = {
  skip?: number,
  limit?: number,
}

type PromisifiedFind = (where?: Object, params?: FindChainParams) => Promise<any>

function promisifyFindChain(find: (where?: Object) => Object): PromisifiedFind {
  return function(where?: Object = {}, params?: FindChainParams = {}): Promise<any> {
    const findChain = find(where)
    const newFindChain = Object.keys(params).reduce((chain, name) =>
      chain[name](params[name])
    , findChain)
    return promisify(newFindChain.toArray, newFindChain)()
  }
}
