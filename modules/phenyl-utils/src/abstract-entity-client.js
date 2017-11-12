// @flow
import {
  Versioning,
} from './versioning.js'

import type {
  EntityClient,
  EntityClientEssence,
  CommandResult,
  DeleteCommand,
  MultiValuesCommandResult,
  GetCommandResult,
  IdQuery,
  IdsQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  QueryResult,
  SingleQueryResult,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

export class AbstractEntityClient implements EntityClient {
  essence: EntityClientEssence

  /**
   *
   */
  async find(query: WhereQuery): Promise<QueryResult> {
    const entities = await this.essence.find(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResult> {
    const entity = await this.essence.findOne(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResult> {
    const entity = await this.essence.get(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResult> {
    const entities = await this.essence.getByIds(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async pull(query: PullQuery): Promise<PullQueryResult> {
    const { versionId, entityName, id } = query
    const entity = await this.essence.get({ entityName, id })
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
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value)
    const entity = await this.essence.insertAndGet({ entityName, value: valueWithMeta })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResult> {
    const { entityName, values } = command
    const valuesWithMeta = values.map(value => Versioning.attachMetaInfoToNewEntity(value))
    const entities = await this.essence.insertAndGetMulti({ entityName, values: valuesWithMeta })
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResult> {
    if (command.id != null) {
      //$FlowIssue(this-is-IdUpdateCommand)
      const result = await this.updateAndGet((command: IdUpdateCommand))
      return { ok: 1, n: 1, prevVersionId: result.prevVersionId, versionId: result.versionId }
    }
    //$FlowIssue(this-is-MultiUpdateCommand)
    const result = await this.updateAndFetch((command: MultiUpdateCommand))
    return { ok: 1, n: result.n, prevVersionsById: result.prevVersionsById, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResult> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entity = await this.essence.updateAndGet(metaInfoAttachedCommand)
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResult> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entities = await this.essence.updateAndFetch(metaInfoAttachedCommand)
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async push(command: PushCommand): Promise<PushCommandResult> {
    const { entityName, id, versionId, operations } = command
    const entity = await this.essence.get({ entityName, id })
    const operation = Versioning.mergeUpdateOperations(...operations)
    const updatedEntity = await this.essence.updateAndGet({ entityName, id, operation })
    return Versioning.createPushCommandResult(entity, updatedEntity, versionId)
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResult> {
    return { ok: 1, n: await this.essence.delete(command) }
  }
}
