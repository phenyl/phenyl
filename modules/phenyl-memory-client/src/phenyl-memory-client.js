// @flow
import {
  PhenylStateFinder,
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import {
  mergeUpdateOperations,
  normalizeUpdateOperation,
} from 'oad-utils/jsnext'
import { createErrorResult } from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'
import { randomStringWithTimeStamp } from './random-string.js'

import type {
  Entity,
  EntityClient,
  EntityState,
  CommandResultOrError,
  DeleteCommand,
  MultiValuesCommandResultOrError,
  GetCommandResultOrError,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  PullQuery,
  PullQueryResultOrError,
  PushCommand,
  PushCommandResultOrError,
  RequestData,
  ResponseData,
  QueryResultOrError,
  QueryStringParams,
  SingleQueryResultOrError,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
  UpdateOperation,
} from 'phenyl-interfaces'


/////////////////////////////////////////////////////////////////////////////

type Version = {
  id: Id,
  op: string, // stringified UpdateOperation
}

type MetaInfo = {
  versions: Array<Version>,
}

function stripMeta(entity: Entity): Entity {
  if (entity.hasOwnProperty('_PhenylMeta')) {
    return assign(entity, { $unset: { _PhenylMeta: '' }})
  }
  return entity
}

function getVersionId(entity: Entity): ?Id {
  if (!entity.hasOwnProperty('_PhenylMeta')) return null
  try {
    // $FlowIssue(has-own-prop)
    const metaInfo: MetaInfo = entity._PhenylMeta
    return metaInfo.versions[metaInfo.versions.length - 1].id
  }
  catch (e) {
    // No metaInfo? It's OK
    return null
  }
}

function getVersionIds(entities: Array<Entity>): { [entityId: Id]: Id } {
  const versionsById = {}
  entities.forEach(entity => {
    const versionId = getVersionId(entity)
    if (versionId) versionsById[entity.id] = versionId
  })
  return versionsById
}

function getInitialMeta(): MetaInfo {
  const versionId = randomStringWithTimeStamp()
  return {
    versions: [ { id: versionId, op: '' }],
  }
}

function attachMetaInfo(entity: Entity): Entity {
  return Object.assign({}, entity, { _PhenylMeta: getInitialMeta() })
}

function getOperationDiffsByVersion(entity: Entity, versionId: Id): ?Array<UpdateOperation> {
  if (!entity.hasOwnProperty('_PhenylMeta')) return null
  try {
    // $FlowIssue(has-own-prop)
    const metaInfo: MetaInfo = entity._PhenylMeta
    let found = false
    let idx = 0
    for (const version of metaInfo.versions) {
      if (version.id === versionId) {
        found = true
        break
      }
      idx++
    }
    if (!found) return null

    return metaInfo.versions
      .slice(idx + 1)
      .map(version => JSON.parse(version.op))
  }
  catch (e) {
    // Error while parsing metaInfo? It's OK
    return null
  }
}

function attachMetaInfoToUpdateCommand<T: { operation: UpdateOperation }>(command: T): T {
  const normalizedOperation = normalizeUpdateOperation(command.operation)
  const version = { id: randomStringWithTimeStamp(), op: JSON.stringify(command.operation) }
  const $push = Object.assign({}, normalizedOperation.$push, {
    '_PhenylMeta.versions': { $each: [version], $slice: -100 }
  })
  const newOperation = Object.assign({}, normalizedOperation, { $push })
  return Object.assign({}, command, { operation: newOperation })
}

/////////////////////////////////////////////////////////////////////////////

type MemoryClientParams = {
  entityState?: EntityState,
}

export default class PhenylMemoryClient implements EntityClient {
  entityState: EntityState

  constructor(params: MemoryClientParams = {}) {
    this.entityState = params.entityState ||  { pool: {} }
  }

  /**
   *
   */
  async find(query: WhereQuery): Promise<QueryResultOrError> {
    try {
      const entities = PhenylStateFinder.find(this.entityState, query)
      return {
        ok: 1,
        values: entities.map(stripMeta),
        versionsById: getVersionIds(entities),
      }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    try {
      const entity = PhenylStateFinder.findOne(this.entityState, query)
      if (entity == null) {
        return {
          ok: 0,
          type: 'NotFound',
          message: '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query.',
        }
      }
      return {
        ok: 1,
        value: entity,
        versionId: getVersionId(entity)
      }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    try {
      const entity = PhenylStateFinder.get(this.entityState, query)
      return {
        ok: 1,
        value: stripMeta(entity),
        versionId: getVersionId(entity),
      }
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        return {
          ok: 0,
          type: 'NotFound',
          message: `"PhenylMemoryClient#get()" failed. Could not find any entity with the given id: "${query.id}"`,
        }
      }
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    try {
      const entities = PhenylStateFinder.getByIds(this.entityState, query)
      return {
        ok: 1,
        values: entities.map(stripMeta),
        versionsById: getVersionIds(entities)
      }
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        return {
          ok: 0,
          type: 'NotFound',
          message: `"PhenylMemoryClient#getByIds()" failed. Some ids are not found. ids: "${query.ids.join(', ')}"`, // TODO: prevent from showing existing ids
        }
      }
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async pull(query: PullQuery): Promise<PullQueryResultOrError> {
    const { versionId, entityName, id } = query
    const entity = PhenylStateFinder.get(this.entityState, { entityName, id })
    const operations = getOperationDiffsByVersion(entity, versionId)
    if (operations == null) {
      return { ok: 1, value: stripMeta(entity), versionId: null }
    }
    return { ok: 1, pulled: 1, operations, versionId: getVersionId(entity) }
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResultOrError> {
    if (command.values) {
      const result = await this.insertAndGetMulti(command)
      return result.ok
        ? { ok: 1, n: result.n, versionsById: result.versionsById }
        : result
    }
    const result = await this.insertAndGet(command)
    return result.ok
      ? { ok: 1, n: 1, versionId: result.versionId }
      : result
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResultOrError> {
    const { entityName, value } = command
    const newValue = value.id
      ? value
      : assign(value, { id: randomStringWithTimeStamp() })
    const valueWithMeta = attachMetaInfo(newValue)
    const operation = PhenylStateUpdater.$register(this.entityState, entityName, valueWithMeta)
    this.entityState = assign(this.entityState, operation)
    return {
      ok: 1,
      n: 1,
      value: newValue,
      versionId: getVersionId(valueWithMeta),
    }
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, values} = command
    const newValues = []
    const versionsById = {}
    for (const value of values) {
      const newValue = value.id
        ? value
        : assign(value, { id: randomStringWithTimeStamp() })
      const valueWithMeta = attachMetaInfo(newValue)
      const operation = PhenylStateUpdater.$register(this.entityState, entityName, valueWithMeta)
      this.entityState = assign(this.entityState, operation)
      newValues.push(newValue)
      versionsById[newValue.id] = getVersionId(valueWithMeta)
    }
    return {
      ok: 1,
      n: newValues.length,
      values: newValues,
      versionsById,
    }
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResultOrError> {
    try {
      if (command.id != null) {
        // $FlowIssue(this-is-IdUpdateCommand)
        const result = await this.updateAndGet((command: IdUpdateCommand))
        if (!result.ok) return result
        return { ok: 1, n: 1, versionId: result.versionId }
      }
      // $FlowIssue(this-is-MultiUpdateCommand)
      const result = await this.updateAndFetch((command: MultiUpdateCommand))
      if (!result.ok) return result
      return { ok: 1, n: result.n, versionsById: result.versionsById }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResultOrError> {
    const { entityName, id } = command
    try {
      const metaInfoAttachedCommand = attachMetaInfoToUpdateCommand(command)
      const operation = PhenylStateUpdater.$update(this.entityState, metaInfoAttachedCommand)
      this.entityState = assign(this.entityState, operation)
      const entity = PhenylStateFinder.get(this.entityState, { entityName, id })
      const versionId = getVersionId(entity)
      return { ok: 1, n: 1, value: stripMeta(entity), versionId }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResultOrError> {
    const { entityName, where } = command
    try {
      // TODO Performance issue: find() runs twice for just getting N
      const values = PhenylStateFinder.find(this.entityState, { entityName, where })
      const metaInfoAttachedCommand = attachMetaInfoToUpdateCommand(command)
      const ids = values.map(value => value.id)
      const operation = PhenylStateUpdater.$update(this.entityState, metaInfoAttachedCommand)
      this.entityState = assign(this.entityState, operation)
      const updatedValues = PhenylStateFinder.getByIds(this.entityState, { ids, entityName })
      const versionsById = getVersionIds(updatedValues)
      return { ok: 1, n: values.length, values: updatedValues.map(stripMeta), versionsById }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async push(command: PushCommand): Promise<PushCommandResultOrError> {
    const { entityName, id, versionId, operations } = command
    try {
      const currentEntity = PhenylStateFinder.get(this.entityState, { entityName, id })
      const mergedOperation = mergeUpdateOperations(...operations)
      const { operation } = attachMetaInfoToUpdateCommand({ operation: mergedOperation })
      const retargetedOperation = PhenylStateUpdater.$update(this.entityState, { entityName, id, operation })

      this.entityState = assign(this.entityState, retargetedOperation)

      const localUncommittedOperations = getOperationDiffsByVersion(currentEntity, versionId)
      const entity = PhenylStateFinder.get(this.entityState, { entityName, id })
      const latestVersionId = getVersionId(entity)
      if (localUncommittedOperations != null) {
        return { ok: 1, n: 1, operations: localUncommittedOperations, versionId: latestVersionId }
      }
      return { ok: 1, n: 1, value: entity, versionId: latestVersionId }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResultOrError> {
    const { entityName } = command
    try {
      // TODO Performance issue: find() runs twice for just getting N
      const n = command.where ? PhenylStateFinder.find(this.entityState, { where: command.where, entityName }).length : 1
      const operation = PhenylStateUpdater.$delete(this.entityState, command)
      this.entityState = assign(this.entityState, operation)
      return { ok: 1, n }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }
}
