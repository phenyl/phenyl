// @flow
import promisify from 'es6-promisify'

import { createErrorResult } from 'phenyl-utils/jsnext.js'

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
  FindOperation,
} from 'phenyl-interfaces'

import type { MongoDbConnection } from './connection.js'

function set_idToId(where: FindOperation): FindOperation {
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

    try {
      const result = await coll.find(set_idToId(where), options)
      return { ok: 1, values: result }
    }
    catch (error) {
      return createErrorResult(error)
    }
  }

  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.find(set_idToId(where), { limit: 1 })
      return { ok: 1, value: result[0] || null }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.find({ _id: id })
      return { ok: 1, value: result[0] || null }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    const { entityName, ids } = query
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.find({ _id: { $in: ids } })
      return { ok: 1, values: result }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async insert(command: InsertCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    try {
      if (command.value) {
        result = await coll.insertOne(command.value)
      }
      else {
        result = await coll.insertMany(command.values)
      }
      return { ok: 1, n: result.insertedCount }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.insertOne(command.value)
      const insertedResult = await this.get({
        entityName,
        id: result.insertedId,
      })
      return { ok: 1, n: result.insertedCount, value: insertedResult.value }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)

    try {
      const result = await coll.insertMany(command.values)
      const insertedResult = await this.getByIds({
        entityName,
        ids: result.insertedIds,
      })
      return { ok: 1, n: result.insertedCount, values: insertedResult.values }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async update(command: UpdateCommand): Promise<CommandResultOrError> {
    const { entityName, operation } = command
    const coll = this.conn.collection(entityName)
    let result

    try {
      if (command.id) {
        result = await coll.updateOne({ _id: command.id }, operation)
      }
      if (command.where) {
        result = await coll.updateMany(command.where, operation)
      }
      const { nModified, nMatched } = result
      return { ok: 1, nMatched, nModified }
    } catch (error) {
      return createErrorResult(error)
    }
    throw new Error(`Invalid Update command is given to PhenylMongoDbClient#update().`)
  }

  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResultOrError> {
    const { entityName, id, operation } = command
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.updateOne({ _id: id }, operation)
      const { modifiedCount } = result
      if (modifiedCount > 0) {
        const updatedResult = await this.get({ entityName, id })
        return { ok: 1, n: modifiedCount, value: updatedResult.value }
      }
      else {
        return { ok: 1, n: 0, value: null }
      }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, where, operation } = command
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.updateMany(where, operation)
      const updatedResult = await this.find({ entityName, where })
      const { nModified, nMatched } = result
      return { ok: 1, nModified, nMatched, values: updatedResult.values }
    } catch (error) {
      createErrorResult(error)
    }
  }

  async delete(command: DeleteCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    try {
      if (command.id) {
        result = await coll.deleteOne({ _id: command.id })
      }
      if (command.where) {
        result = await coll.deleteMany(command.where)
      }
      return { ok: 1, n: result.deletedCount }
    } catch (error) {
      createErrorResult(error)
    }
    throw new Error(`Invalid Delete command is given to PhenylMongoDbClient#delete().`)
  }
}
