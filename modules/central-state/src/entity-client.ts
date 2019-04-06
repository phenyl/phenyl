import {
  Versioning,
} from './versioning'

import {
  PhenylSessionClient
} from './session-client'

import {
  Entity,
  RawEntityClient,
  DbClient,
  DeleteCommand,
  DeleteCommandResult,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommand,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  GetCommandResult,
  GeneralReqResEntityMap,
  GeneralEntityMap,
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
  ResponseEntity,
  WhereQuery,
  Key,
  RequestEntityMapOf,
} from '@phenyl/interfaces'

import { GeneralUpdateOperation } from 'sp2'

export type PhenylEntityClientOptions<M extends GeneralReqResEntityMap> = {
  validatePushCommand?: PushValidation<M>,
}

/**
 * Validate PushCommand only when masterOperations are found.
 * masterOperations are not found when the versionId in PushCommand is over 100 commits older, as entity saves only 100 commits.
 */
// @TODO: define any
function validWhenDiffsFound(command: PushCommand<any>, entity: Entity, masterOperations: Array<GeneralUpdateOperation> | null | undefined) {
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
export class PhenylEntityClient<M extends GeneralReqResEntityMap> implements RawEntityClient<M> {
  dbClient: DbClient<RequestEntityMapOf<M>>
  validatePushCommand: PushValidation<M>

  constructor(dbClient: DbClient<GeneralEntityMap>, options: PhenylEntityClientOptions<M> = {}) {
    this.dbClient = dbClient
    // compatible-optional-function-type
    this.validatePushCommand = options.validatePushCommand || validWhenDiffsFound
  }

  /**
   *
   */
  async find<EN extends Key<M>>(query: WhereQuery<EN>): Promise<QueryResult<ResponseEntity<M, EN>>> {
    const entities = await this.dbClient.find(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne<EN extends Key<M>>(query: WhereQuery<EN>): Promise<SingleQueryResult<ResponseEntity<M, EN>>> {
    const entity = await this.dbClient.findOne(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get<EN extends Key<M>>(query: IdQuery<EN>): Promise<SingleQueryResult<ResponseEntity<M, EN>>> {
    const entity = await this.dbClient.get(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async getByIds<EN extends Key<M>>(query: IdsQuery<EN>): Promise<QueryResult<ResponseEntity<M, EN>>> {
    const entities = await this.dbClient.getByIds(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async pull<EN extends Key<M>>(query: PullQuery<EN>): Promise<PullQueryResult<ResponseEntity<M, EN>>> {
    const { versionId, entityName, id } = query
    const entity = await this.dbClient.get({ entityName, id })
    return Versioning.createPullQueryResult(entity, versionId)
  }

  /**
   *
   */
  async insertOne<EN extends Key<M>>(command: SingleInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>): Promise<SingleInsertCommandResult> {
    const result = await this.insertAndGet(command)
    return { n: 1, versionId: result.versionId }
  }

  /**
   *
   */
  async insertMulti<EN extends Key<M>>(command: MultiInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>): Promise<MultiInsertCommandResult> {
    const result = await this.insertAndGetMulti(command)
    return { n: result.n, versionsById: result.versionsById }
  }

  /**
   *
   */
  async insertAndGet<EN extends Key<M>>(command: SingleInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>): Promise<GetCommandResult<ResponseEntity<M, EN>>> {
    const { entityName, value } = command
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value)
    const entity = await this.dbClient.insertAndGet({ entityName, value: valueWithMeta })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async insertAndGetMulti<EN extends Key<M>>(command: MultiInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>> {
    const { entityName, values } = command
    const valuesWithMeta = values.map((value: Entity) => Versioning.attachMetaInfoToNewEntity(value))
    const entities = await this.dbClient.insertAndGetMulti({ entityName, values: valuesWithMeta })
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async updateById<EN extends Key<M>>(command: IdUpdateCommand<EN>): Promise<IdUpdateCommandResult> {
    const result = await this.updateAndGet(command)
    return { n: 1, prevVersionId: result.prevVersionId, versionId: result.versionId }
  }

  /**
   *
   */
  async updateMulti<EN extends Key<M>>(command: MultiUpdateCommand<EN>): Promise<MultiUpdateCommandResult> {
    const result = await this.updateAndFetch(command)
    return { n: result.n, prevVersionsById: result.prevVersionsById, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet<EN extends Key<M>>(command: IdUpdateCommand<EN>): Promise<GetCommandResult<ResponseEntity<M, EN>>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entity = await this.dbClient.updateAndGet(metaInfoAttachedCommand)
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch<EN extends Key<M>>(command: MultiUpdateCommand<EN>): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entities = await this.dbClient.updateAndFetch(metaInfoAttachedCommand)
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async push<EN extends Key<M>>(command: PushCommand<EN>): Promise<PushCommandResult<ResponseEntity<M, EN>>> {
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
  async delete<EN extends Key<M>>(command: DeleteCommand<EN>): Promise<DeleteCommandResult> {
    return { n: await this.dbClient.delete(command) }
  }

  /**
   *
   */
  createSessionClient(): SessionClient {
    return new PhenylSessionClient(this.dbClient)
  }
}
