// @flow
import promisify from 'es6-promisify'

import type {
  EntityClient,
  IdQuery,
  IdsQuery,
  WhereQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  DeleteCommand,
  GetCommandResultOrError,
  MultiValuesCommandResultOrError,
  QueryResultOrError,
  SingleQueryResultOrError,
  CommandResultOrError,
  WhereConditions,
} from 'phenyl-interfaces'

import type { MongoDbConnection } from './connection.js'

function set_idToId(where: WhereConditions): WhereConditions {
  return where
  /*
  return visitSimpleConditions(where, (simpleConditions) => {
    if (simpleConditions.id == null) {
      return simpleConditions
    }
    const newConditions = assign(simpleConditions, { _id: simpleConditions.id })
    delete newConditions.id
    return simpleConditions
  })
  */
}

export default class PhenylMongoDbClient implements EntityClient {
  conn: MongoDbConnection

  constructor(conn: MongoDbConnection) {
    this.conn = conn
  }

  async find(query: WhereQuery): Promise<QueryResultOrError> {
    const { entityName, where, skip, limit } = query
    const coll = this.conn.collection(entityName)
    const options = {}
    if (skip) options.skip = skip
    if (limit) options.limit = limit

    const result = await coll.find(set_idToId(where), options)
    return {
      ok: 1,
      values: result
    }
  }

  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find(set_idToId(where), { limit: 1 })
    return {
      ok: 1,
      value: result[0]
    }
  }

  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: id })
    return {
      ok: 1,
      value: result[0]
    }
  }

  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    const { entityName, ids } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: { $in: ids } })
    return {
      ok: 1,
      values: result
    }
  }

  async insert(command: InsertCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    if (command.value) {
      const result = await coll.insertOne(command.value)
      return { ok: 1, n: 1 }
    }
    const result = await coll.insertMany(command.values)
    return { ok: 1, n: result.insertedCount }
  }

  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertOne(command.value)
    return { ok: 1, n: 1, value: result }
  }

  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertMany(command.values)
    return { ok: 1, n: 1, values: result }
  }

  async update(command: UpdateCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    if (command.value) {
      const result = await coll.insertOne(command.value)
      return { ok: 1, n: 1 }
    }
    if (command.values) {
      const result = await coll.insertMany(command.values)
      return { ok: 1, n: 1 }
    }
    throw new Error(`Invalid Update command is given to PhenylMongoDbClient#update().`)
  }

  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResultOrError> {
    const { entityName, id, operators } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateOne({ _id: id }, operators)
    return { ok: 1, n: 1, value: result }
  }

  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, where, operators } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateMany(where, operators)
    return { ok: 1, n: 1, values: result }
  }

  async delete(command: DeleteCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    if (command.id) {
      const result = await coll.deleteOne(command.id)
      return { ok: 1, n: 1 }
    }
    if (command.where) {
      const result = await coll.deleteMany(command.where)
      return { ok: 1, n: 1 }
    }
    throw new Error(`Invalid Update command is given to PhenylMongoDbClient#update().`)
  }

}
