import {
  Versioning,
} from './versioning'

import {
  PhenylSessionClient
} from './session-client'

import {
  Entity,
  EntityClient,
  GeneralReqResEntityMap,
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
  ResponseEntity,
  RequestEntity,
  QueryResult,
  SessionClient,
  SingleQueryResult,
  SingleInsertCommand,
  SingleInsertCommandResult,
  WhereQuery,
  Key,
} from "@phenyl/interfaces";

// @ts-ignore TODO: remove this comment after @phenyl/mongolike-operation
import { UpdateOperation } from "mongolike-operations"

export type PhenylEntityClientOptions<M extends GeneralReqResEntityMap> = {
  validatePushCommand?: PushValidation<M>,
}

/**
 * Validate PushCommand only when masterOperations are found.
 * masterOperations are not found when the versionId in PushCommand is over 100 commits older, as entity saves only 100 commits.
 */
function validWhenDiffsFound(command: PushCommand<any>, entity: Entity, masterOperations: Array<UpdateOperation> | void) {
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
export class PhenylEntityClient<M extends GeneralReqResEntityMap> implements EntityClient<M> {
  // @ts-ignore @TODO: GeneralReqResEntityMap is incompatible with GeneralEntityMap
  dbClient: DbClient<M>
  validatePushCommand: PushValidation<M>

  // @ts-ignore @TODO: GeneralReqResEntityMap is incompatible with GeneralEntityMap
  constructor(dbClient: DbClient<M>, options: PhenylEntityClientOptions<M> = {}) {
    this.dbClient = dbClient
    // @ts-ignore compatible-optional-function-type
    this.validatePushCommand = options.validatePushCommand || validWhenDiffsFound
  }

  /**
   *
   */
  async find<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<M, EN>>> {
    const entities = await this.dbClient.find(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async findOne<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<M, EN>>> {
    const entity = await this.dbClient.findOne(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async get<EN extends Key<M>>(
    query: IdQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<M, EN>>> {
    const entity = await this.dbClient.get(query)
    return Versioning.createSingleQueryResult(entity)
  }

  /**
   *
   */
  async getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<M, EN>>> {
    const entities = await this.dbClient.getByIds(query)
    return Versioning.createQueryResult(entities)
  }

  /**
   *
   */
  async pull<EN extends Key<M>>(
    query: PullQuery<EN>,
    sessionId?: string | null
  ): Promise<PullQueryResult<ResponseEntity<M, EN>>> {
    const { versionId, entityName, id } = query
    const entity = await this.dbClient.get({ entityName, id })
    return Versioning.createPullQueryResult(entity, versionId)
  }

  /**
   *
   */
  async insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<SingleInsertCommandResult> {
    const result = await this.insertAndGet(command)
    return { ok: 1, n: 1, versionId: result.versionId }
  }

  /**
   *
   */
  async insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<MultiInsertCommandResult> {
    const result = await this.insertAndGetMulti(command)
    return { ok: 1, n: result.n, versionsById: result.versionsById }
  }

  /**
   *
   */
  async insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<M, EN>>> {
    const { entityName, value } = command
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value)
    const entity = await this.dbClient.insertAndGet({ entityName, value: valueWithMeta })
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>> {
    const { entityName, values } = command
    const valuesWithMeta = values.map((value: PreEntity<M[Key<M>]>) => Versioning.attachMetaInfoToNewEntity(value))
    const entities = await this.dbClient.insertAndGetMulti({ entityName, values: valuesWithMeta })
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<IdUpdateCommandResult> {
    const result = await this.updateAndGet(command)
    return { n: 1, prevVersionId: result.prevVersionId, versionId: result.versionId }
  }

  /**
   *
   */
  async updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiUpdateCommandResult> {
    const result = await this.updateAndFetch(command)
    return { n: result.n, prevVersionsById: result.prevVersionsById, versionsById: result.versionsById }
  }

  /**
   *
   */
  async updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<M, EN>>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entity = await this.dbClient.updateAndGet(metaInfoAttachedCommand)
    return Versioning.createGetCommandResult(entity)
  }

  /**
   *
   */
  async updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(command)
    const entities = await this.dbClient.updateAndFetch(metaInfoAttachedCommand)
    return Versioning.createMultiValuesCommandResult(entities)
  }

  /**
   *
   */
  async push<EN extends Key<M>>(
    command: PushCommand<EN>,
    sessionId?: string | null
  ): Promise<PushCommandResult<ResponseEntity<M, EN>>> {
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
  async delete<EN extends Key<M>>(
    command: DeleteCommand<EN>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult> {
    return { n: await this.dbClient.delete(command) }
  }

  /**
   *
   */
  createSessionClient(): PhenylSessionClient {
    return new PhenylSessionClient(this.dbClient)
  }
}
