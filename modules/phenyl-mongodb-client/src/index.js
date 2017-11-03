// @flow
import promisify from 'es6-promisify'

import { createErrorResult } from 'phenyl-utils/jsnext.js'
import { assign } from 'power-assign/jsnext.js'
import { visitFindOperation, visitSimpleFindOperation } from 'oad-utils/jsnext.js'

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
  Restorable,
} from 'phenyl-interfaces'

import type { MongoDbConnection } from './connection.js'

function setIdTo_id(where: FindOperation): FindOperation {
  return visitFindOperation(where, {
    simpleFindOperation: (simpleFindOperation) => {
      return assign(simpleFindOperation, { $rename: { id: '_id' } })
    }
  })
}

function set_idToId(restorable: Restorable): Restorable {
  return assign(restorable, { $rename: { _id: 'id' } })
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
      const result = await coll.find(setIdTo_id(where), options)
      if (result.length === 0) {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMongodbClient#find()" failed. Could not find any entity with the given query.',
        }
      }
      return { ok: 1, values: result.map(restorable => set_idToId(restorable)) }
    }
    catch (error) {
      return createErrorResult(error)
    }
  }

  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.find(setIdTo_id(where), { limit: 1 })
      if (result.length === 0) {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMongodbClient#findOne()" failed. Could not find any entity with the given query.',
        }
      }
      return { ok: 1, value: set_idToId(result[0]) || null }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.find({ _id: id })
      if (result.length === 0) {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMongodbClient#get()" failed. Could not find any entity with the given query.',
        }
      }
      return { ok: 1, value: set_idToId(result[0]) || null }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    const { entityName, ids } = query
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.find({ _id: { $in: ids } })
      if (result.length === 0) {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMongodbClient#getByIds()" failed. Could not find any entity with the given query.',
        }
      }
      return { ok: 1, values: result.map(restorable => set_idToId(restorable)) }
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
      return {
        ok: 1,
        n: result.insertedCount,
        value: set_idToId(insertedResult.value),
      }
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
      return {
        ok: 1,
        n: result.insertedCount,
        values: insertedResult.values.map(restorable => set_idToId(restorable)),
      }
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
        result = await coll.updateMany(setIdTo_id(command.where), operation)
      }
      return { ok: 1, n: result.matchedCount }
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
      const { matchedCount } = result
      if (matchedCount > 0) {
        const updatedResult = await this.get({ entityName, id })
        return {
          ok: 1,
          n: matchedCount,
          value: set_idToId(updatedResult.value),
        }
      }
      else {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMongodbClient#updateAndGet()" failed. Could not find any entity with the given query.',
        }
      }
    } catch (error) {
      return createErrorResult(error)
    }
  }

  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, where, operation } = command
    const coll = this.conn.collection(entityName)
    try {
      const result = await coll.updateMany(setIdTo_id(where), operation)
      const { matchedCount } = result
      if (matchedCount > 0) {
        const updatedResult = await this.find({ entityName, where: setIdTo_id(where) })
        return {
          ok: 1,
          n: result.matchedCount,
          values: updatedResult.values.map(restorable => set_idToId(restorable)),
        }
      }
      else {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMongodbClient#updateAndFetch()" failed. Could not find any entity with the given query.',
        }
      }
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
        result = await coll.deleteMany(setIdTo_id(command.where))
      }
      return { ok: 1, n: result.deletedCount }
    } catch (error) {
      createErrorResult(error)
    }
    throw new Error(`Invalid Delete command is given to PhenylMongoDbClient#delete().`)
  }
}
