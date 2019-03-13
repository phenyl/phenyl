import mongodb from 'mongodb'
import bson from 'bson'
import {
  createServerError,
} from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'
import {
  convertToDotNotationString,
  visitFindOperation,
  visitUpdateOperation,
} from 'oad-utils/jsnext'

import type {
  Entity,
  EntityMap,
  PreEntity,
  DbClient,
  IdQuery,
  IdsQuery,
  WhereQuery,
  SingleInsertCommand,
  MultiInsertCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  DeleteCommand,
  FindOperation,
  UpdateOperation,
  SetOperator,
  SimpleFindOperation,
} from 'phenyl-interfaces'

import type { MongoDbConnection } from './connection.js'
import type {
  ChangeStreamPipeline,
  ChangeStreamOptions,
  ChangeStream,
} from './change-stream.js'


// convert 24-byte hex lower string to ObjectId
function ObjectID(id: any): any {
  if (id instanceof mongodb.ObjectID) return id
  if (typeof id !== 'string') return id
  try {
    return /^[0-9a-f]{24}$/.test(id) ? bson.ObjectID(id) : id
  } catch (e) {
    return id
  }
}

function assignToEntity<E: Entity>(entity: E, op: UpdateOperation | SetOperator): E {
  // $FlowIssue(structure-is-entity)
  return assign(entity, op)
}

function convertToObjectIdRecursively(src: any): any {
  if (Array.isArray(src)) return src.map(id => ObjectID(id))
  if (typeof src !== 'object') return ObjectID(src)
  return Object.keys(src).reduce((dst, key) => {
    dst[key] = convertToObjectIdRecursively(src[key])
    return dst
  }, {})
}

function convertIdToObjectIdInWhere(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  return simpleFindOperation.id
    ? assign(simpleFindOperation, { id: convertToObjectIdRecursively(simpleFindOperation.id) })
    : simpleFindOperation
}

// $FlowIssue(this-is-SimpleFindOperation)
function setIdTo_idInWhere(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  return assign(simpleFindOperation, { $rename: { id: '_id' } })
}

function convertDocumentPathToDotNotationInFindOperation(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  return Object.keys(simpleFindOperation).reduce((operation, srcKey) => {
    const dstKey = convertToDotNotationString(srcKey)
    operation[dstKey] = simpleFindOperation[srcKey]
    return operation
  }, {})
}

function composedFindOperationFilters(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  return [
    convertIdToObjectIdInWhere,
    setIdTo_idInWhere,
    convertDocumentPathToDotNotationInFindOperation, // execute last because power-assign required documentPath
  ].reduce((operation, filterFunc) => filterFunc(operation), simpleFindOperation)
}

export function filterFindOperation(operation: FindOperation): FindOperation {
  return visitFindOperation(operation, { simpleFindOperation: composedFindOperationFilters })
}

function convertNewNameWithParent(operation: UpdateOperation): UpdateOperation {
  const renameOperator = operation.$rename
  if (!renameOperator) return operation

  const renameOperatorWithParent = Object.keys(renameOperator).reduce((operator, key) => {
    operator[key] = key.split('.').slice(0, -1).concat(renameOperator[key]).join('.')
    return operator
  }, {})

  return assign(operation, { $set: { $rename: renameOperatorWithParent }})
}

function convertDocumentPathToDotNotationInUpdateOperation(updateOperation: UpdateOperation): UpdateOperation {
  return visitUpdateOperation(updateOperation, {
    operation: op => {
      return Object.keys(op).reduce((acc, srcKey) => {
        const dstKey = convertToDotNotationString(srcKey)
        // $FlowIssue(op[srcKey])
        acc[dstKey] = op[srcKey]
        return acc
      }, {})
    }
  })
}

export function filterUpdateOperation(updateOperation: UpdateOperation): UpdateOperation {
  return [
    convertNewNameWithParent,
    convertDocumentPathToDotNotationInUpdateOperation,
  ].reduce((operation, filterFunc) => filterFunc(operation), updateOperation)
}


function convertIdToObjectIdInEntity<E: Entity>(entity: E): E {
  return entity.id
    ? assignToEntity(entity, { id: ObjectID(entity.id) })
    : entity
}

function setIdTo_idInEntity<E: Entity>(entity: E): E {
  return assignToEntity(entity, { $rename: { id: '_id' } })
}

export function filterInputEntity<E: Entity>(srcEntity: E): E {
  return [
    convertIdToObjectIdInEntity,
    setIdTo_idInEntity,
  ].reduce((entity: E, filterFunc) => filterFunc(entity), srcEntity)
}


function convertObjectIdToIdInEntity<E: Entity>(entity: E): E {
  return entity._id instanceof mongodb.ObjectID
    ? assignToEntity(entity, { _id: entity._id.toString() })
    : entity
}

function set_idToIdInEntity<E: Entity>(entity: E): E {
  return assignToEntity(entity, { $rename: { _id: 'id' } })
}

export function filterOutputEntity<E: Entity>(srcEntity: E): E {
  return [
    convertObjectIdToIdInEntity,
    set_idToIdInEntity,
  ].reduce((entity: E, filterFunc) => filterFunc(entity), srcEntity)
}

export class PhenylMongoDbClient<M: EntityMap> implements DbClient<M> {
  conn: MongoDbConnection

  constructor(conn: MongoDbConnection) {
    this.conn = conn
  }

  async find<N: $Keys<M>>(query: WhereQuery<N>): Promise<Array<$ElementType<M, N>>> {
    const { entityName, where, skip, limit } = query
    const coll = this.conn.collection(entityName)
    const options = {}
    if (skip) options.skip = skip
    if (limit) options.limit = limit

    const result = await coll.find(filterFindOperation(where), options)
    return result.map(filterOutputEntity)
  }

  async findOne<N: $Keys<M>>(query: WhereQuery<N>): Promise<$ElementType<M, N>> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find(filterFindOperation(where), { limit: 1 })
    if (result.length === 0) {
      throw createServerError('findOne()', 'NotFound')
    }
    return filterOutputEntity(result[0] || null)
  }

  async get<N: $Keys<M>>(query: IdQuery<N>): Promise<$ElementType<M, N>> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: ObjectID(id) })
    if (result.length === 0) {
      throw createServerError(
        '"PhenylMongodbClient#get()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return filterOutputEntity(result[0])
  }

  async getByIds<N: $Keys<M>>(query: IdsQuery<N>): Promise<Array<$ElementType<M, N>>> {
    const { entityName, ids } = query
    const coll = this.conn.collection(entityName)
    // $FlowIssue(find-operation)
    const result = await coll.find({ _id: { $in: ids.map(ObjectID) } })
    if (result.length === 0) {
      throw createServerError(
        '"PhenylMongodbClient#getByIds()" failed. Could not find any entity with the given query.',
        'NotFound',
      )
    }
    return result.map(filterOutputEntity)
  }

  async insertOne<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<number> {
    const { entityName, value } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertOne(filterInputEntity(value))
    return result.insertedCount
  }

  async insertMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<number> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertMany(command.values.map(filterInputEntity))
    return result.insertedCount
  }

  async insertAndGet<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<$ElementType<M, N>> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertOne(filterInputEntity(command.value))
    // TODO transactional operation needed
    return this.get({ entityName, id: result.insertedId })
  }

  async insertAndGetMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<Array<$ElementType<M, N>>> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)

    const result = await coll.insertMany(command.values.map(filterInputEntity))
    // $FlowIssue(ids-are-all-strings)
    const ids: string[] = Object.values(result.insertedIds)
    // TODO: transactional operation needed
    return this.getByIds({ entityName, ids })
  }

  async updateAndGet<N: $Keys<M>>(command: IdUpdateCommand<N>): Promise<$ElementType<M, N>> {
    const { entityName, id, operation } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.updateOne({ _id: ObjectID(id) }, filterUpdateOperation(operation))
    const { matchedCount } = result
    if (matchedCount === 0) {
      throw createServerError(
        '"PhenylMongodbClient#updateAndGet()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    // TODO: transactional operation needed
    return this.get({ entityName, id })
  }

  async updateAndFetch<N: $Keys<M>>(command: MultiUpdateCommand<N>): Promise<Array<$ElementType<M, N>>> {
    const { entityName, where, operation } = command
    const coll = this.conn.collection(entityName)
    await coll.updateMany(filterFindOperation(where), filterUpdateOperation(operation))
    // FIXME: the result may be different from updated entities.
    return this.find({ entityName, where })
  }

  async delete<N: $Keys<M>>(command: DeleteCommand<N>): Promise<number> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
    if (command.id) {
      result = await coll.deleteOne({ _id: ObjectID(command.id) })
    }
    else if (command.where) {
      result = await coll.deleteMany(filterFindOperation(command.where))
    }
    // $FlowIssue(deleteCount-exists)
    const { deletedCount } = result
    return deletedCount
  }

  watch<N: $Keys<M>>(entityName: N, pipeline?: ChangeStreamPipeline, options?: ChangeStreamOptions): ChangeStream {
    return this.conn.collection(entityName).watch(pipeline, options)
  }
}
