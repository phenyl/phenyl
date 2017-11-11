// @flow
import {
  createErrorResult,
} from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'
import { visitFindOperation } from 'oad-utils/jsnext'

import type {
  Entity,
  EntityClientEssence,
  IdQuery,
  IdsQuery,
  WhereQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  DeleteCommand,
  FindOperation,
} from 'phenyl-interfaces'

import type { MongoDbConnection } from './connection.js'

function setIdTo_idInWhere(where: FindOperation): FindOperation {
  return visitFindOperation(where, {
    simpleFindOperation: (simpleFindOperation) => {
      return assign(simpleFindOperation, { $rename: { id: '_id' } })
    }
  })
}

function setIdTo_idInEntity(entity: Entity): Entity {
  return assign(entity, { $rename: { id: '_id' } })
}

function set_idToIdInEntity(entity: Entity): Entity {
  return assign(entity, { $rename: { _id: 'id' } })
}

export default class PhenylMongoDbClientEssence implements EntityClientEssence {
  conn: MongoDbConnection

  constructor(conn: MongoDbConnection) {
    this.conn = conn
  }

  async find(query: WhereQuery): Promise<Array<Entity>> {
    const { entityName, where, skip, limit } = query
    const coll = this.conn.collection(entityName)
    const options = {}
    if (skip) options.skip = skip
    if (limit) options.limit = limit

    const result = await coll.find(setIdTo_idInWhere(where), options)
    if (result.length === 0) {
      throw createErrorResult(
        '"PhenylMongodbClient#find()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return result.map(set_idToIdInEntity)
  }

  async findOne(query: WhereQuery): Promise<Entity> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find(setIdTo_idInWhere(where), { limit: 1 })
    if (result.length === 0) {
      throw createErrorResult(
        '"PhenylMongodbClient#findOne()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return set_idToIdInEntity(result[0])
  }

  async get(query: IdQuery): Promise<Entity> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: id })
    if (result.length === 0) {
      throw createErrorResult(
        '"PhenylMongodbClient#get()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return set_idToIdInEntity(result[0])
  }

  async getByIds(query: IdsQuery): Promise<Array<Entity>> {
    const { entityName, ids } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: { $in: ids } })
    if (result.length === 0) {
      throw createErrorResult(
        '"PhenylMongodbClient#getByIds()" failed. Could not find any entity with the given query.',
        'NotFound',
      )
    }
    return result.map(set_idToIdInEntity)
  }

  async insert(command: InsertCommand): Promise<number> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    if (command.value) {
      result = await coll.insertOne(setIdTo_idInEntity(command.value))
    }
    else {
      result = await coll.insertMany(command.values.map(setIdTo_idInEntity))
    }
    return result.insertedCount
  }

  async insertAndGet(command: SingleInsertCommand): Promise<Entity> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertOne(setIdTo_idInEntity(command.value))
    // TODO transactional operation needed
    return this.get({ entityName, id: result.insertedId })
  }

  async insertAndGetMulti(command: MultiInsertCommand): Promise<Array<Entity>> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)

    const result = await coll.insertMany(command.values.map(setIdTo_idInEntity))
    // TODO: transactional operation needed
    return this.getByIds({ entityName, ids: result.insertedIds })
  }

  async updateAndGet(command: IdUpdateCommand): Promise<Entity> {
    const { entityName, id, operation } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateOne({ _id: id }, operation)
    const { matchedCount } = result
    if (matchedCount === 0) {
      throw createErrorResult(
        '"PhenylMongodbClient#updateAndGet()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    // TODO: transactional operation needed
    return this.get({ entityName, id })
  }

  async updateAndFetch(command: MultiUpdateCommand): Promise<Array<Entity>> {
    const { entityName, where, operation } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateMany(setIdTo_idInWhere(where), operation)
    const { matchedCount } = result
    if (matchedCount === 0) {
      throw createErrorResult(
        '"PhenylMongodbClient#updateAndFetch()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    // FIXME: the result may be different from updated entities.
    return this.find({ entityName, where: setIdTo_idInWhere(where) })
  }

  async delete(command: DeleteCommand): Promise<number> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    if (command.id) {
      result = await coll.deleteOne({ _id: command.id })
    }
    else if (command.where) {
      result = await coll.deleteMany(setIdTo_idInWhere(command.where))
    }
    // $FlowIssue(deleteCount-exists)
    const { deletedCount } = result
    return deletedCount
  }
}
