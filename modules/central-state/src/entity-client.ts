import {
  DbClient,
  DeleteCommand,
  DeleteCommandResult,
  EntityWithMetaInfo,
  GeneralEntityMap,
  GetCommandResult,
  IdQuery,
  IdUpdateCommand,
  IdUpdateCommandResult,
  IdsQuery,
  Key,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommand,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  PreEntity,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  PushValidation,
  QueryResult,
  SessionClient,
  SingleInsertCommand,
  SingleInsertCommandResult,
  SingleQueryResult,
  WhereQuery
} from "@phenyl/interfaces";

import { GeneralUpdateOperation } from "sp2";
import { PhenylSessionClient } from "./session-client";
import { Versioning } from "./versioning";

export type PhenylEntityClientOptions<M extends GeneralEntityMap> = {
  validatePushCommand?: PushValidation<M>;
};

type EntityMapWithMetaInfo<ReqEMap extends GeneralEntityMap> = {
  [EN in Key<ReqEMap>]: EntityWithMetaInfo<ReqEMap[EN]>
};

/**
 * EntityClient used in PhenylRestApi.
 * Support versioning and push/pull synchronization.
 * Pass dbClient: DbClient which accesses to data.
 * Optionally set merge strategy by options.validatePushCommand.
 */
export class PhenylEntityClient<M extends GeneralEntityMap> {
  // TODO implements RawEntityClient
  // implements RawEntityClient<M> {
  dbClient: DbClient<EntityMapWithMetaInfo<M>>;
  validatePushCommand: PushValidation<M>;

  constructor(
    dbClient: DbClient<EntityMapWithMetaInfo<M>>,
    options: PhenylEntityClientOptions<M> = {}
  ) {
    this.dbClient = dbClient;
    // compatible-optional-function-type
    this.validatePushCommand =
      options.validatePushCommand || this.validWhenDiffsFound.bind(this);
  }

  /**
   *
   */
  async find<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<QueryResult<M[EN]>> {
    const entities = await this.dbClient.find(query);
    return Versioning.createQueryResult(entities);
  }

  /**
   *
   */
  async findOne<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<SingleQueryResult<M[EN]>> {
    const entity = await this.dbClient.findOne(query);
    return Versioning.createSingleQueryResult(entity);
  }

  /**
   *
   */
  async get<EN extends Key<M>>(
    query: IdQuery<EN>
  ): Promise<SingleQueryResult<M[EN]>> {
    const entity = await this.dbClient.get(query);
    return Versioning.createSingleQueryResult(entity);
  }

  /**
   *
   */
  async getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>
  ): Promise<QueryResult<M[EN]>> {
    const entities = await this.dbClient.getByIds(query);
    return Versioning.createQueryResult(entities);
  }

  /**
   *
   */
  async pull<EN extends Key<M>>(
    query: PullQuery<EN>
  ): Promise<PullQueryResult<M[EN]>> {
    const { versionId, entityName, id } = query;
    const entity = await this.dbClient.get({ entityName, id });
    return Versioning.createPullQueryResult(entity, versionId);
  }

  /**
   *
   */
  async insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<SingleInsertCommandResult> {
    const result = await this.insertAndGet(command);
    return { n: 1, versionId: result.versionId };
  }

  /**
   *
   */
  async insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<MultiInsertCommandResult> {
    const result = await this.insertAndGetMulti(command);
    return { n: result.n, versionsById: result.versionsById };
  }

  /**
   *
   */
  async insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<GetCommandResult<M[EN]>> {
    const { entityName, value } = command;
    const valueWithMeta = Versioning.attachMetaInfoToNewEntity(value);
    const entity = await this.dbClient.insertAndGet({
      entityName,
      // @ts-ignore value has MetaInfo
      value: valueWithMeta
    });
    return Versioning.createGetCommandResult(entity);
  }

  /**
   *
   */
  async insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<MultiValuesCommandResult<M[EN]>> {
    const { entityName, values } = command;
    const valuesWithMeta = values.map(value =>
      Versioning.attachMetaInfoToNewEntity(value)
    );
    const entities = await this.dbClient.insertAndGetMulti({
      entityName,
      // @ts-ignore valuesWithMeta is compatible with ProEntity[]
      values: valuesWithMeta
    });
    return Versioning.createMultiValuesCommandResult(entities);
  }

  /**
   *
   */
  async updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<IdUpdateCommandResult> {
    const result = await this.updateAndGet(command);
    return {
      n: 1,
      prevVersionId: result.prevVersionId,
      versionId: result.versionId
    };
  }

  /**
   *
   */
  async updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<MultiUpdateCommandResult> {
    const result = await this.updateAndFetch(command);
    return {
      n: result.n,
      prevVersionsById: result.prevVersionsById,
      versionsById: result.versionsById
    };
  }

  /**
   *
   */
  async updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<GetCommandResult<M[EN]>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(
      command
    );
    const entity = await this.dbClient.updateAndGet(metaInfoAttachedCommand);
    return Versioning.createGetCommandResult(entity);
  }

  /**
   *
   */
  async updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<MultiValuesCommandResult<M[EN]>> {
    const metaInfoAttachedCommand = Versioning.attachMetaInfoToUpdateCommand(
      command
    );
    const entities = await this.dbClient.updateAndFetch(
      metaInfoAttachedCommand
    );
    return Versioning.createMultiValuesCommandResult(entities);
  }

  /**
   *
   */
  async push<EN extends Key<M>>(
    command: PushCommand<EN>
  ): Promise<PushCommandResult<M[EN]>> {
    const { entityName, id, versionId, operations } = command;
    const entity = await this.dbClient.get({ entityName, id });
    const masterOperations = Versioning.getOperationDiffsByVersion(
      entity,
      versionId
    );

    this.validatePushCommand(
      command,
      // @ts-ignore metainfo is stripped
      Versioning.stripMeta(entity),
      masterOperations
    );

    const newOperation = Versioning.mergeUpdateOperations(...operations);
    const updatedEntity = await this.dbClient.updateAndGet({
      entityName,
      id,
      operation: newOperation
    });
    return Versioning.createPushCommandResult({
      entity,
      updatedEntity,
      versionId,
      newOperation
    });
  }

  /**
   *
   */
  async delete<EN extends Key<M>>(
    command: DeleteCommand<EN>
  ): Promise<DeleteCommandResult> {
    return { n: await this.dbClient.delete(command) };
  }

  /**
   *
   */
  createSessionClient(): SessionClient {
    return new PhenylSessionClient(this.dbClient);
  }
  /**
   * Validate PushCommand only when masterOperations are found.
   * masterOperations are not found when the versionId in PushCommand is over 100 commits older, as entity saves only 100 commits.
   */
  private validWhenDiffsFound<EN extends Key<M>>(
    command: PushCommand<EN>,
    entity: M[EN],
    masterOperations: Array<GeneralUpdateOperation> | null | undefined
  ) {
    if (masterOperations == null) {
      throw new Error(
        "Cannot apply push operations: Too many diffs from master (over 100)."
      );
    }
  }
}
