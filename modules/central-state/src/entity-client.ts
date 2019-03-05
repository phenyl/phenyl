import {
  Versioning,
} from './versioning'

import {
  PhenylSessionClient
} from './session-client'

import {
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
  Key,
  // @ts-ignore remove comment after @phenyl/interfaces fixed
} from "@phenyl/interfaces"; 

export type PhenylEntityClientOptions<M extends EntityMap> = {
  validatePushCommand?: PushValidation<M>,
}

/**
 * Validate PushCommand only when masterOperations are found.
 * masterOperations are not found when the versionId in PushCommand is over 100 commits older, as entity saves only 100 commits.
 */
function validWhenDiffsFound(command: PushCommand<*>, entity: Entity, masterOperations: Array<UpdateOperation> | null | undefined) {
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
export class PhenylEntityClient<M extends EntityMap> implements EntityClient<M> {
  dbClient: DbClient<M>
  validatePushCommand: PushValidation<M>

  constructor(dbClient: DbClient<M>, options: PhenylEntityClientOptions<M> = {}) {
    this.dbClient = dbClient
    // $FlowIssue(compatible-optional-function-type)
    this.validatePushCommand = options.validatePushCommand || validWhenDiffsFound
  }

  /**
   *
   */
  async find(query: WhereQuery<Key<M>>): Promise<QueryResult<M[Key<M>]>> {
    const entities = await this.dbClient.find(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne(query: WhereQuery<Key<M>>): Promise<SingleQueryResult<M[Key<M>]>> {
    const entity = await this.dbClient.findOne(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get(query: IdQuery<Key<M>>): Promise<SingleQueryResult<M[Key<M>]>> {
    const entity = await this.dbClient.get(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery<Key<M>>): Promise<QueryResult<M[Key<M>]>> {
    const entities = await this.dbClient.getByIds(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async pull(query: PullQuery<Key<M>>): Promise<PullQueryResult<M[Key<M>]>> {
    const { versionId, entityName, id } = query
    const entity = await this.dbClient.get({ entityName, id })
    return Versioning.createPullQueryResult(entity, versionId)
  }

  /**
   *
   */
  async insertOne(command: SingleInsertCommand<Key<M>, PreEntity<M[Key<M>]>>): Promise<SingleInsertCommandResult> {
    const result = await this.insertAndGet(command)
    return { ok: 1, n: 1, versionId: result.versionId }
  }

  /**
   *
   */
  async insertMulti(command: MultiInsertCommand<Key<M>, PreEntity<M[Key<M>]>>): Promise<MultiInsertCommandResult> {
    const result = await this.insertAndGetMulti(command)
    return { ok: 1, n: result.n, versionsById: result.versionsById }
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand<Key<M>, PreEntity<M[Key<M>]>>): Promise<GetCommandResult<M[Key<M>]>> {
    const { entityName, value } = command
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value)
    const entity = await this.dbClient.insertAndGet({ entityName, value: valueWithMeta })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand<Key<M>, PreEntity<M[Key<M>]>>): Promise<MultiValuesCommandResult<M[Key<M>], *>> {
    const { entityName, values } = command
    const valuesWithMeta = values.map((value: PreEntity<M[Key<M>]>) => Versioning.attachMetaInfoToNewEntity(value))
    const entities = await this.dbClient.insertAndGetMulti({ entityName, values: valuesWithMeta })
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async updateById(command: IdUpdateCommand<Key<M>>): Promise<IdUpdateCommandResult> {
    const result = await this.updateAndGet(command)
    return { ok: 1, n: 1, prevVersionId: result.prevVersionId, versionId: result.versionId }
  }

  /**
   *
   */
  async updateMulti(command: MultiUpdateCommand<Key<M>>): Promise<MultiUpdateCommandResult<*>> {
    const result = await this.updateAndFetch(command)
    return { ok: 1, n: result.n, prevVersionsById: result.prevVersionsById, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand<Key<M>>): Promise<GetCommandResult<M[Key<M>]>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entity = await this.dbClient.updateAndGet(metaInfoAttachedCommand)
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand<Key<M>>): Promise<MultiValuesCommandResult<M[Key<M>], *>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entities = await this.dbClient.updateAndFetch(metaInfoAttachedCommand)
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async push(command: PushCommand<Key<M>>): Promise<PushCommandResult<M[Key<M>]>> {
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
  async delete(command: DeleteCommand<Key<M>>): Promise<DeleteCommandResult> {
    return { ok: 1, n: await this.dbClient.delete(command) }
  }

  /**
   *
   */
  createSessionClient(): SessionClient {
    return new PhenylSessionClient(this.dbClient)
  }
}
