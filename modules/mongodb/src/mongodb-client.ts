import mongodb from 'mongodb'
import bson from 'bson'
import {
  createServerError,
} from '@phenyl/utils'

import {
  Key,
  Entity,
  GeneralEntityMap,
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
  EntityOf,
} from '@phenyl/interfaces'

import {
  FindOperation,
  UpdateOperand,
  GeneralUpdateOperation,
  SimpleFindOperation,
  visitUpdateOperation,
  visitFindOperation,
  convertToDotNotationString,
  $bind,
  update,
} from 'sp2'

import { MongoDbConnection } from './connection'
import {
  ChangeStreamPipeline,
  ChangeStreamOptions,
  ChangeStream,
} from './change-stream'

type SetOperator = { [field: string]: any }

// convert 24-byte hex lower string to ObjectId
function ObjectID(id: any): any {
  if (id instanceof mongodb.ObjectID) return id
  if (typeof id !== 'string') return id
  try {
    // @ts-ignore ObjectID is not class type
    return /^[0-9a-f]{24}$/.test(id) ? bson.ObjectID(id) : id
  } catch (e) {
    return id
  }
}

function assignToEntity<E extends Entity>(entity: E, op: GeneralUpdateOperation | SetOperator): E {
  return Object.assign(entity, op)
}

function convertToObjectIdRecursively(src: any): any {
  if (Array.isArray(src)) return src.map(id => ObjectID(id))
  if (typeof src !== 'object') return ObjectID(src)
  return Object.keys(src).reduce((dst: any, key: string) => {
    dst[key] = convertToObjectIdRecursively(src[key])
    return dst
  }, {})
}

function convertIdToObjectIdInWhere(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  const { $set, $docPath } = $bind<typeof simpleFindOperation>()
  return simpleFindOperation.id
    ? update(simpleFindOperation, $set($docPath('id'), convertToObjectIdRecursively(simpleFindOperation.id)))
    : simpleFindOperation
}

// $FlowIssue(this-is-SimpleFindOperation)
function setIdTo_idInWhere(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  const { $set, $docPath } = $bind<SimpleFindOperation>()
  // @ts-ignore @TODO: ??
  return update(simpleFindOperation, $set($docPath('$rename', 'id'), '_id'))
}

function convertDocumentPathToDotNotationInFindOperation(simpleFindOperation: SimpleFindOperation): SimpleFindOperation {
  return Object.keys(simpleFindOperation).reduce((operation: any, srcKey: string) => {
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

function convertNewNameWithParent(operation: GeneralUpdateOperation): GeneralUpdateOperation {
  const renameOperator = operation.$rename
  if (!renameOperator) return operation

  const renameOperatorWithParent = Object.keys(renameOperator).reduce((operator: UpdateOperand<"$rename">, key: string) => {
    operator[key] = key.split('.').slice(0, -1).concat(renameOperator[key]).join('.')
    return operator
  }, {})

  const { $set, $docPath } = $bind<typeof operation>()
  // @ts-ignore @TODO: ??
  return update(operation, $set($docPath('$set', '$rename'), renameOperatorWithParent))
}

function convertDocumentPathToDotNotationInUpdateOperation(updateOperation: GeneralUpdateOperation): GeneralUpdateOperation {
  return visitUpdateOperation(updateOperation, {
    operation: (op: UpdateOperand<'$set'>) => {
      return Object.keys(op).reduce((acc: any, srcKey: string) => {
        const dstKey = convertToDotNotationString(srcKey)
        // $FlowIssue(op[srcKey])
        acc[dstKey] = op[srcKey]
        return acc
      }, {})
    }
  })
}

export function filterUpdateOperation(updateOperation: GeneralUpdateOperation): GeneralUpdateOperation {
  return [
    convertNewNameWithParent,
    convertDocumentPathToDotNotationInUpdateOperation,
  ].reduce((operation, filterFunc) => filterFunc(operation), updateOperation)
}


function convertIdToObjectIdInEntity<E extends Entity>(entity: E): E {
  return entity.id
    ? assignToEntity(entity, { id: ObjectID(entity.id) })
    : entity
}

function setIdTo_idInEntity<E extends Entity>(entity: E): E {
  return assignToEntity(entity, { $rename: { id: '_id' } })
}

export function filterInputEntity<E extends PreEntity<Entity>>(srcEntity: E): E {
  return [
    convertIdToObjectIdInEntity,
    setIdTo_idInEntity,
  // @ts-ignore @TODO 
  ].reduce((entity: Entity, filterFunc) => filterFunc(entity), srcEntity)
}


function convertObjectIdToIdInEntity<E extends Entity>(entity: E): E {
  // @ts-ignore @TODO: should we improve Entity Type or create new Type?
  return entity._id instanceof mongodb.ObjectID
    // @ts-ignore @TODO: should we improve Entity Type or create new Type?
    ? assignToEntity(entity, { _id: entity._id.toString() })
    : entity
}

function set_idToIdInEntity<E extends Entity>(entity: E): E {
  return assignToEntity(entity, { $rename: { _id: 'id' } })
}

export function filterOutputEntity<E extends Entity>(srcEntity: E): E {
  return [
    convertObjectIdToIdInEntity,
    set_idToIdInEntity,
  ].reduce((entity: E, filterFunc) => filterFunc(entity), srcEntity)
}

export class PhenylMongoDbClient<M extends GeneralEntityMap> implements DbClient<M> {
  conn: MongoDbConnection

  constructor(conn: MongoDbConnection) {
    this.conn = conn
  }

  async find<N extends Key<M>>(query: WhereQuery<N>): Promise<Array<EntityOf<M, N>>> {
    const { entityName, where, skip, limit } = query
    const coll = this.conn.collection(entityName)
    const options: FindOperation = {}
    if (skip) options.skip = skip
    if (limit) options.limit = limit

    const result = await coll.find(filterFindOperation(where), options)
    return result.map<any>(filterOutputEntity)
  }

  async findOne<N extends Key<M>>(query: WhereQuery<N>): Promise<EntityOf<M, N>> {
    const { entityName, where } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find(filterFindOperation(where), { limit: 1 })
    if (result.length === 0) {
      throw createServerError('findOne()', 'NotFound')
    }
    return filterOutputEntity<any>(result[0] || null)
  }

  async get<N extends Key<M>>(query: IdQuery<N>): Promise<EntityOf<M, N>> {
    const { entityName, id } = query
    const coll = this.conn.collection(entityName)
    const result = await coll.find({ _id: ObjectID(id) })
    if (result.length === 0) {
      throw createServerError(
        '"PhenylMongodbClient#get()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return filterOutputEntity<any>(result[0])
  }

  async getByIds<E extends Key<M>>(query: IdsQuery<E>): Promise<Array<EntityOf<M, E>>> {
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
    return result.map<any>(filterOutputEntity)
  }

  async insertOne<N extends Key<M>>(command: SingleInsertCommand<N, PreEntity<M[N]>>): Promise<number> {
    const { entityName, value } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertOne(filterInputEntity(value))
    return result.insertedCount
  }

  async insertMulti<N extends Key<M>>(command: MultiInsertCommand<N, PreEntity<EntityOf<M, N>>>): Promise<number> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertMany(command.values.map(filterInputEntity))
    return result.insertedCount
  }

  async insertAndGet<N extends Key<M>>(command: SingleInsertCommand<N, PreEntity<M[N]>>): Promise<M[N]> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    const result = await coll.insertOne(filterInputEntity(command.value))
    // TODO transactional operation needed
    return this.get({ entityName, id: result.insertedId })
  }

  async insertAndGetMulti<N extends Key<M>>(command: MultiInsertCommand<N, PreEntity<EntityOf<M, N>>>): Promise<EntityOf<M, N>[]> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)

    const result = await coll.insertMany(command.values.map(filterInputEntity))
    const ids: string[] = Object.values(result.insertedIds)
    // TODO: transactional operation needed
    return this.getByIds({ entityName, ids })
  }

  async updateAndGet<N extends Key<M>>(command: IdUpdateCommand<N>): Promise<EntityOf<M, N>> {
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

  async updateAndFetch<N extends Key<M>>(command: MultiUpdateCommand<N>): Promise<EntityOf<M, N>[]> {
    const { entityName, where, operation } = command
    const coll = this.conn.collection(entityName)
    await coll.updateMany(filterFindOperation(where), filterUpdateOperation(operation))
    // FIXME: the result may be different from updated entities.
    return this.find({ entityName, where })
  }

  async delete<N extends Key<M>>(command: DeleteCommand<N>): Promise<number> {
    const { entityName } = command
    const coll = this.conn.collection(entityName)
    let result
     // @ts-ignore TODO: improve the type of DeleteCommand
     const { id, where } = command;
    if (id) {
      result = await coll.deleteOne({ _id: ObjectID(id) })
    }
    else if (where) {
      result = await coll.deleteMany(filterFindOperation(where))
    }
    // @ts-ignore deleteCount-exists
    const { deletedCount } = result
    return deletedCount
  }

  watch<N extends Key<M>>(entityName: N, pipeline?: ChangeStreamPipeline, options?: ChangeStreamOptions): ChangeStream {
    return this.conn.collection(entityName).watch(pipeline, options)
  }
}
