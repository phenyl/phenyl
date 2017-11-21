// @flow
import {
  Versioning,
} from './versioning.js'

import {
  PhenylSessionClient
} from './phenyl-session-client.js'

import type {
  EntityClient,
  DbClient,
  DeleteCommand,
  DeleteCommandResult,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommand,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  GetCommandResult,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  IdUpdateCommandResult,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  QueryResult,
  SessionClient,
  SingleQueryResult,
  SingleInsertCommand,
  SingleInsertCommandResult,
  WhereQuery,
} from 'phenyl-interfaces'

export class AbstractEntityClient implements EntityClient {
  dbClient: DbClient

  /**
   *
   */
  async find(query: WhereQuery): Promise<QueryResult> {
    const entities = await this.dbClient.find(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResult> {
    const entity = await this.dbClient.findOne(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResult> {
    const entity = await this.dbClient.get(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResult> {
    const entities = await this.dbClient.getByIds(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async pull(query: PullQuery): Promise<PullQueryResult> {
    const { versionId, entityName, id } = query
    const entity = await this.dbClient.get({ entityName, id })
    return Versioning.createPullQueryResult(entity, versionId)
  }

  /**
   *
   */
  async insertOne(command: SingleInsertCommand): Promise<SingleInsertCommandResult> {
    const result = await this.insertAndGet(command)
    return { ok: 1, n: 1, versionId: result.versionId }
  }

  /**
   *
   */
  async insertMulti(command: MultiInsertCommand): Promise<MultiInsertCommandResult> {
    const result = await this.insertAndGetMulti(command)
    return { ok: 1, n: result.n, versionsById: result.versionsById }
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResult> {
    const { entityName, value } = command
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value)
    const entity = await this.dbClient.insertAndGet({ entityName, value: valueWithMeta })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResult> {
    const { entityName, values } = command
    const valuesWithMeta = values.map(value => Versioning.attachMetaInfoToNewEntity(value))
    const entities = await this.dbClient.insertAndGetMulti({ entityName, values: valuesWithMeta })
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async updateById(command: IdUpdateCommand): Promise<IdUpdateCommandResult> {
    const result = await this.updateAndGet((command: IdUpdateCommand))
    return { ok: 1, n: 1, prevVersionId: result.prevVersionId, versionId: result.versionId }
  }

  /**
   *
   */
  async updateMulti(command: MultiUpdateCommand): Promise<MultiUpdateCommandResult> {
    const result = await this.updateAndFetch((command: MultiUpdateCommand))
    return { ok: 1, n: result.n, prevVersionsById: result.prevVersionsById, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResult> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entity = await this.dbClient.updateAndGet(metaInfoAttachedCommand)
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResult> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entities = await this.dbClient.updateAndFetch(metaInfoAttachedCommand)
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async push(command: PushCommand): Promise<PushCommandResult> {
    const { entityName, id, versionId, operations } = command
    const entity = await this.dbClient.get({ entityName, id })
    const newOperation = Versioning.mergeUpdateOperations(...operations)
    const updatedEntity = await this.dbClient.updateAndGet({ entityName, id, operation: newOperation })
    return Versioning.createPushCommandResult(entity, updatedEntity, versionId, newOperation)
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<DeleteCommandResult> {
    return { ok: 1, n: await this.dbClient.delete(command) }
  }

  /**
   *
   */
  createSessionClient(): SessionClient {
    return new PhenylSessionClient(this.dbClient)
  }
}
