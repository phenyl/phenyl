// @flow
import {
  PhenylStateFinder,
  PhenylStateUpdater,
} from 'phenyl-state/jsnext'
import {
  mergeUpdateOperations,
  normalizeUpdateOperation,
} from 'oad-utils/jsnext'
import {
  PhenylResponseError,
  createErrorResult,
  Versioning,
  randomStringWithTimeStamp,
} from 'phenyl-utils/jsnext'
import { assign } from 'power-assign/jsnext'

import type {
  Entity,
  EntityClient,
  EntityState,
  CommandResult,
  DeleteCommand,
  MultiValuesCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  RequestData,
  ResponseData,
  QueryResult,
  QueryStringParams,
  SingleQueryResult,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
  UpdateOperation,
} from 'phenyl-interfaces'

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
  async find(query: WhereQuery): Promise<QueryResult> {
    const entities = PhenylStateFinder.find(this.entityState, query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResult> {
    const entity = PhenylStateFinder.findOne(this.entityState, query)
    if (entity == null) {
      throw new PhenylResponseError(
        '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query.',
        'NotFound'
      )
    }
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResult> {
    try {
      const entity = PhenylStateFinder.get(this.entityState, query)
      return Versioning.createSingleQueryResult(entity)
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        throw new PhenylResponseError(
          `"PhenylMemoryClient#get()" failed. Could not find any entity with the given id: "${query.id}"`,
          'NotFound'
        )
      }
      throw createErrorResult(e)
    }
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResult> {
    try {
      const entities = PhenylStateFinder.getByIds(this.entityState, query)
      return Versioning.createQueryResult(entities)
    }
    catch (e) {
      if (e.constructor.name === 'Error') { // Error from entityState
        throw new PhenylResponseError(
          `"PhenylMemoryClient#getByIds()" failed. Some ids are not found. ids: "${query.ids.join(', ')}"`, // TODO: prevent from showing existing ids
          'NotFound',
        )
      }
      throw createErrorResult(e)
    }
  }

  /**
   *
   */
  async pull(query: PullQuery): Promise<PullQueryResult> {
    const { versionId, entityName, id } = query
    const entity = PhenylStateFinder.get(this.entityState, { entityName, id })
    return Versioning.createPullQueryResult(entity, versionId)
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResult> {
    if (command.values) {
      const result = await this.insertAndGetMulti(command)
      return { ok: 1, n: result.n, versionsById: result.versionsById }
    }
    const result = await this.insertAndGet(command)
    return { ok: 1, n: 1, versionId: result.versionId }
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResult> {
    const { entityName, value } = command
    const newValue = value.id
      ? value
      : assign(value, { id: randomStringWithTimeStamp() })
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(newValue)
    const operation = PhenylStateUpdater.$register(this.entityState, entityName, valueWithMeta)
    this.entityState = assign(this.entityState, operation)
    return Versioning.createGetCommandResult(valueWithMeta)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResult> {
    const { entityName, values} = command
    const valuesWithMeta = []
    for (const value of values) {
      const newValue = value.id
        ? value
        : assign(value, { id: randomStringWithTimeStamp() })
      const valueWithMeta = Versioning.attachMetaInfoToNewEntity(newValue)
      const operation = PhenylStateUpdater.$register(this.entityState, entityName, valueWithMeta)
      this.entityState = assign(this.entityState, operation)
      valuesWithMeta.push(newValue)
    }
    return Versioning.createMultiValuesCommandResult(valuesWithMeta)
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResult> {
    if (command.id != null) {
      // $FlowIssue(this-is-IdUpdateCommand)
      const result = await this.updateAndGet((command: IdUpdateCommand))
      return { ok: 1, n: 1, versionId: result.versionId }
    }
    // $FlowIssue(this-is-MultiUpdateCommand)
    const result = await this.updateAndFetch((command: MultiUpdateCommand))
    return { ok: 1, n: result.n, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResult> {
    const { entityName, id } = command
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const operation = PhenylStateUpdater.$update(this.entityState, metaInfoAttachedCommand)
    this.entityState = assign(this.entityState, operation)
    const entity = PhenylStateFinder.get(this.entityState, { entityName, id })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResult> {
    const { entityName, where } = command
    // TODO Performance issue: find() runs twice for just getting N
    const values = PhenylStateFinder.find(this.entityState, { entityName, where })
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const ids = values.map(value => value.id)
    const operation = PhenylStateUpdater.$update(this.entityState, metaInfoAttachedCommand)
    this.entityState = assign(this.entityState, operation)
    const updatedValues = PhenylStateFinder.getByIds(this.entityState, { ids, entityName })
    return Versioning.createMultiValuesCommandResult(updatedValues)
  }

  /**
   *
   */
  async push(command: PushCommand): Promise<PushCommandResult> {
    const { entityName, id, versionId, operations } = command
    const entity = PhenylStateFinder.get(this.entityState, { entityName, id })
    const operation = Versioning.mergeUpdateOperations(...operations)
    const retargetedOperation = PhenylStateUpdater.$update(this.entityState, { entityName, id, operation })
    this.entityState = assign(this.entityState, retargetedOperation)
    const updatedEntity = PhenylStateFinder.get(this.entityState, { entityName, id })
    return Versioning.createPushCommandResult(entity, updatedEntity, versionId)
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResult> {
    const { entityName } = command
    // TODO Performance issue: find() runs twice for just getting N
    const n = command.where ? PhenylStateFinder.find(this.entityState, { where: command.where, entityName }).length : 1
    const operation = PhenylStateUpdater.$delete(this.entityState, command)
    this.entityState = assign(this.entityState, operation)
    return { ok: 1, n }
  }
}
