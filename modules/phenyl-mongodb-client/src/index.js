// @flow
import promisify from 'es6-promisify'

import {
  createErrorResult,
  PhenylResponseError,
} from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'
import { visitFindOperation } from 'oad-utils/jsnext'

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
  GetCommandResult,
  MultiValuesCommandResult,
  QueryResult,
  SingleQueryResult,
  CommandResult,
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

  async find(query: WhereQuery): Promise<QueryResult> {
    const { entityName, where, skip, limit } = query
    const coll = this.conn.collection(entityName)
    const options = {}
    if (skip) options.skip = skip
    if (limit) options.limit = limit

    const result = await coll.find(setIdTo_id(where), options)
    if (result.length === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#find()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return { ok: 1, values: result.map(restorable => set_idToId(restorable)) }
  }

  async findOne(query: WhereQuery): Promise<SingleQueryResult> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find(setIdTo_id(where), { limit: 1 })
    if (result.length === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#findOne()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return { ok: 1, value: set_idToId(result[0]) }
  }

  async get(query: IdQuery): Promise<SingleQueryResult> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: id })
    if (result.length === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#get()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return { ok: 1, value: set_idToId(result[0]) }
  }

  async getByIds(query: IdsQuery): Promise<QueryResult> {
    const { entityName, ids } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: { $in: ids } })
    if (result.length === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#getByIds()" failed. Could not find any entity with the given query.',
        'NotFound',
      )
    }
    return { ok: 1, values: result.map(restorable => set_idToId(restorable)) }
  }

  async insert(command: InsertCommand): Promise<CommandResult> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    if (command.value) {
      result = await coll.insertOne(command.value)
    }
    else {
      result = await coll.insertMany(command.values)
    }
    return { ok: 1, n: result.insertedCount }
  }

  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResult> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
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
  }

  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResult> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)

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
  }

  async update(command: UpdateCommand): Promise<CommandResult> {
    const { entityName, operation } = command
    const coll = this.conn.collection(entityName)
    let result

    if (command.id) {
      result = await coll.updateOne({ _id: command.id }, operation)
    }
    if (command.where) {
      result = await coll.updateMany(setIdTo_id(command.where), operation)
    }
    // $FlowIssue(matchedCount-exists)
    const { matchedCount } = result
    if (matchedCount === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#getByIds()" failed. Could not find any entity with the given query.',
        'NotFound',
      )
    }
    return { ok: 1, n: matchedCount }
  }

  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResult> {
    const { entityName, id, operation } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateOne({ _id: id }, operation)
    const { matchedCount } = result
    if (matchedCount === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#updateAndGet()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    const updatedResult = await this.get({ entityName, id })
    return {
      ok: 1,
      n: matchedCount,
      value: set_idToId(updatedResult.value),
    }
  }

  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResult> {
    const { entityName, where, operation } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateMany(setIdTo_id(where), operation)
    const { matchedCount } = result
    if (matchedCount === 0) {
      throw new PhenylResponseError(
        '"PhenylMongodbClient#updateAndFetch()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    const updatedResult = await this.find({ entityName, where: setIdTo_id(where) })
    return {
      ok: 1,
      n: result.matchedCount,
      values: updatedResult.values.map(restorable => set_idToId(restorable)),
    }
  }

  async delete(command: DeleteCommand): Promise<CommandResult> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    if (command.id) {
      result = await coll.deleteOne({ _id: command.id })
    }
    else if (command.where) {
      result = await coll.deleteMany(setIdTo_id(command.where))
    }
    // $FlowIssue(deleteCount-exists)
    const { deletedCount } = result
    return { ok: 1, n: deletedCount }
  }
}
