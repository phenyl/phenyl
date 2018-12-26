// @flow
import {
  Versioning,
} from './versioning.js'

import {
  PhenylSessionClient
} from './session-client.js'

import type {
  Entity,
  EntityClient,
  EntityMap,
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
  PreEntity,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  PushValidation,
  QueryResult,
  SessionClient,
  SingleQueryResult,
  SingleInsertCommand,
  SingleInsertCommandResult,
  UpdateOperation,
  WhereQuery,
} from 'phenyl-interfaces'

export type PhenylEntityClientOptions<M: EntityMap> = {
  validatePushCommand?: PushValidation<M>,
}

/**
 * Validate PushCommand only when masterOperations are found.
 * masterOperations are not found when the versionId in PushCommand is over 100 commits older, as entity saves only 100 commits.
 */
function validWhenDiffsFound(command: PushCommand<*>, entity: Entity, masterOperations: ?Array<UpdateOperation>) {
  if (masterOperations == null) {
    throw new Error('Cannot apply push operations: Too many diffs from master (over 100).')
  }
}

/**
 * EntityClient used in PhenylRestApi.
 * Support versioning and push/pull synchronization.
 * Pass dbClient: DbClient which accesses to data.
 * Optionally set merge strategy by options.validatePushCommand.
 */
export class PhenylEntityClient<M: EntityMap> implements EntityClient<M> {
  dbClient: $Subtype<DbClient<M>>
  validatePushCommand: PushValidation<M>

  constructor(dbClient: DbClient<M>, options: PhenylEntityClientOptions<M> = {}) {
    this.dbClient = dbClient
    // $FlowIssue(compatible-optional-function-type)
    this.validatePushCommand = options.validatePushCommand || validWhenDiffsFound
  }

  /**
   *
   */
  async find<N: $Keys<M>>(query: WhereQuery<N>): Promise<QueryResult<$ElementType<M, N>>> {
    const entities = await this.dbClient.find(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne<N: $Keys<M>>(query: WhereQuery<N>): Promise<SingleQueryResult<$ElementType<M, N>>> {
    const entity = await this.dbClient.findOne(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get<N: $Keys<M>>(query: IdQuery<N>): Promise<SingleQueryResult<$ElementType<M, N>>> {
    const entity = await this.dbClient.get(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async getByIds<N: $Keys<M>>(query: IdsQuery<N>): Promise<QueryResult<$ElementType<M, N>>> {
    const entities = await this.dbClient.getByIds(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async pull<N: $Keys<M>>(query: PullQuery<N>): Promise<PullQueryResult<$ElementType<M, N>>> {
    const { versionId, entityName, id } = query
    const entity = await this.dbClient.get({ entityName, id })
    return Versioning.createPullQueryResult(entity, versionId)
  }

  /**
   *
   */
  async insertOne<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<SingleInsertCommandResult> {
    const result = await this.insertAndGet(command)
    return { ok: 1, n: 1, versionId: result.versionId }
  }

  /**
   *
   */
  async insertMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<MultiInsertCommandResult> {
    const result = await this.insertAndGetMulti(command)
    return { ok: 1, n: result.n, versionsById: result.versionsById }
  }

  /**
   *
   */
  async insertAndGet<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<GetCommandResult<$ElementType<M, N>>> {
    const { entityName, value } = command
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value)
    const entity = await this.dbClient.insertAndGet({ entityName, value: valueWithMeta })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async insertAndGetMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<MultiValuesCommandResult<$ElementType<M, N>, *>> {
    const { entityName, values } = command
    const valuesWithMeta = values.map(value => Versioning.attachMetaInfoToNewEntity(value))
    const entities = await this.dbClient.insertAndGetMulti({ entityName, values: valuesWithMeta })
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async updateById<N: $Keys<M>>(command: IdUpdateCommand<N>): Promise<IdUpdateCommandResult> {
    const result = await this.updateAndGet((command: IdUpdateCommand<N>))
    return { ok: 1, n: 1, prevVersionId: result.prevVersionId, versionId: result.versionId }
  }

  /**
   *
   */
  async updateMulti<N: $Keys<M>>(command: MultiUpdateCommand<N>): Promise<MultiUpdateCommandResult<*>> {
    const result = await this.updateAndFetch((command: MultiUpdateCommand<N>))
    return { ok: 1, n: result.n, prevVersionsById: result.prevVersionsById, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet<N: $Keys<M>>(command: IdUpdateCommand<N>): Promise<GetCommandResult<$ElementType<M, N>>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entity = await this.dbClient.updateAndGet(metaInfoAttachedCommand)
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch<N: $Keys<M>>(command: MultiUpdateCommand<N>): Promise<MultiValuesCommandResult<$ElementType<M, N>, *>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entities = await this.dbClient.updateAndFetch(metaInfoAttachedCommand)
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async push<N: $Keys<M>>(command: PushCommand<N>): Promise<PushCommandResult<$ElementType<M, N>>> {
    const { entityName, id, versionId, operations } = command
    const entity = await this.dbClient.get({ entityName, id })
    const masterOperations = Versioning.getOperationDiffsByVersion(entity, versionId)

    this.validatePushCommand(command, Versioning.stripMeta(entity), masterOperations)

    const newOperation = Versioning.mergeUpdateOperations(...operations)
    const updatedEntity = await this.dbClient.updateAndGet({ entityName, id, operation: newOperation })
    return Versioning.createPushCommandResult(entity, updatedEntity, versionId, newOperation)
  }

  /**
   *
   */
  async delete<N: $Keys<M>>(command: DeleteCommand<N>): Promise<DeleteCommandResult> {
    return { ok: 1, n: await this.dbClient.delete(command) }
  }

  /**
   *
   */
  createSessionClient(): SessionClient {
    return new PhenylSessionClient(this.dbClient)
  }
}
