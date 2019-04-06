import {
  Entity,
  EntityMetaInfo,
  EntityWithMetaInfo,
  GetCommandResult,
  MultiValuesCommandResult,
  ProEntity,
  PullQueryResult,
  PushCommandResult,
  QueryResult,
  SingleQueryResult
} from "@phenyl/interfaces";
import {
  GeneralUpdateOperation,
  mergeUpdateOperations,
  normalizeUpdateOperation
} from "sp2";

import { timeStampWithRandomString } from "@phenyl/utils";

/**
 * Utility classes containing static methods to attach versioning system to EntityClients.
 */
export class Versioning {
  /**
   * Create QueryResult with version info from entities.
   */
  public static createQueryResult<E extends Entity>(
    entities: Array<EntityWithMetaInfo<E>>
  ): QueryResult<E> {
    return {
      entities: entities.map(this.stripMeta),
      versionsById: this.getVersionIds(entities)
    };
  }

  /**
   * Create SingleQueryResult with version info from a entity.
   */
  public static createSingleQueryResult<E extends Entity>(
    entity: EntityWithMetaInfo<E>
  ): SingleQueryResult<E> {
    return {
      entity: this.stripMeta(entity),
      versionId: this.getVersionId(entity)
    };
  }

  /**
   * Create PullQueryResult with diff operations.
   */
  public static createPullQueryResult<E extends Entity>(
    entity: EntityWithMetaInfo<E>,
    versionId: string | null
  ): PullQueryResult<E> {
    const operations = this.getOperationDiffsByVersion(entity, versionId);
    if (operations == null) {
      return {
        entity: this.stripMeta(entity),
        versionId: this.getVersionId(entity)
      };
    }
    return { pulled: 1, operations, versionId: this.getVersionId(entity) };
  }

  /**
   * Create GetCommandResult from entity.
   */
  public static createGetCommandResult<E extends Entity>(
    entity: EntityWithMetaInfo<E>
  ): GetCommandResult<E> {
    const versionId = this.getVersionId(entity);
    if (versionId == null) {
      throw new Error("Entity must contain versionId after GetCommand.");
    }
    return {
      n: 1,
      entity: this.stripMeta(entity),
      prevVersionId: this.getPrevVersionId(entity),
      versionId
    };
  }

  /**
   * Create MultiValuesCommandResult from entities.
   */
  public static createMultiValuesCommandResult<E extends Entity>(
    entities: Array<EntityWithMetaInfo<E>>
  ): MultiValuesCommandResult<E> {
    return {
      n: entities.length,
      entities: entities.map(this.stripMeta),
      prevVersionsById: this.getPrevVersionIds(entities),
      versionsById: this.getVersionIds(entities)
    };
  }

  /**
   * Create PushCommandResult from entity, updated entity and local versionId.
   */
  public static createPushCommandResult<E extends Entity>({
    entity,
    updatedEntity,
    versionId,
    newOperation
  }: {
    entity: EntityWithMetaInfo<E>;
    updatedEntity: EntityWithMetaInfo<E>;
    versionId: string | null;
    newOperation: GeneralUpdateOperation;
  }): PushCommandResult<E> {
    const localUncommittedOperations = this.getOperationDiffsByVersion(
      entity,
      versionId
    );
    const prevVersionId = this.getPrevVersionId(updatedEntity);
    const latestVersionId = this.getVersionId(updatedEntity);
    if (latestVersionId == null) {
      throw new Error("Entity must contain latestVersionId after PushCommand.");
    }
    if (localUncommittedOperations != null) {
      return {
        n: 1,
        hasEntity: 0,
        operations: localUncommittedOperations,
        prevVersionId,
        versionId: latestVersionId,
        newOperation
      };
    }
    return {
      n: 1,
      hasEntity: 1,
      entity: updatedEntity,
      prevVersionId,
      versionId: latestVersionId,
      newOperation
    };
  }

  /**
   * Merge operations into one operation and attach metaInfo.
   * TODO This merge process (using mergeUpdateOperations) is incomplete.
   */
  public static mergeUpdateOperations(
    ...operations: GeneralUpdateOperation[]
  ): GeneralUpdateOperation {
    const mergedOperation = mergeUpdateOperations(...operations);
    const { operation } = this.attachMetaInfoToUpdateCommand({
      operation: mergedOperation
    });
    return operation;
  }

  /**
   * Attach meta info ("_PhenylMeta" property) to the given entity.
   */
  public static attachMetaInfoToNewEntity<E extends ProEntity>(
    entity: E
  ): EntityWithMetaInfo<E> {
    const versionId = timeStampWithRandomString();
    const _PhenylMeta = {
      versions: [{ id: versionId, op: "" }]
    };
    return Object.assign({}, entity, { _PhenylMeta });
  }

  /**
   * Attach meta info to the given update command.
   */
  public static attachMetaInfoToUpdateCommand<
    T extends { operation: GeneralUpdateOperation }
  >(command: T): T {
    const normalizedOperation = normalizeUpdateOperation(command.operation);
    const version = {
      id: timeStampWithRandomString(),
      op: JSON.stringify(command.operation)
    };
    const $push = Object.assign({}, normalizedOperation.$push, {
      "_PhenylMeta.versions": { $each: [version], $slice: -100 }
    });
    const newOperation = Object.assign({}, normalizedOperation, { $push });
    return Object.assign({}, command, { operation: newOperation });
  }

  /**
   * Get operation diffs by the given versionId.
   */
  public static getOperationDiffsByVersion<E extends Entity>(
    entity: EntityWithMetaInfo<E>,
    versionId: string | null
  ): GeneralUpdateOperation[] | null {
    if (versionId == null) return null;
    if (!entity.hasOwnProperty("_PhenylMeta")) return null;
    try {
      const metaInfo: EntityMetaInfo = entity._PhenylMeta;
      let found = false;
      let idx = 0;
      for (const version of metaInfo.versions) {
        if (version.id === versionId) {
          found = true;
          break;
        }
        idx++;
      }
      if (!found) return null;

      return metaInfo.versions
        .slice(idx + 1)
        .map((version: any) => JSON.parse(version.op));
    } catch (e) {
      // Error while parsing metaInfo? It's OK
      return null;
    }
  }
  /**
   * Strip meta info ("_PhenylMeta" property) from the given entity.
   */
  public static stripMeta<E extends Entity>(entity: EntityWithMetaInfo<E>): E {
    if (entity.hasOwnProperty("_PhenylMeta")) {
      const copied = Object.assign({}, entity);
      delete copied._PhenylMeta;
      return copied;
    }
    return entity;
  }

  /**
   * Extract current version id from entity with meta info.
   */
  private static getVersionId<E extends Entity>(
    entity: EntityWithMetaInfo<E>
  ): string | null {
    const metaInfo = entity._PhenylMeta;
    if (metaInfo == null) return null;
    if (metaInfo.versions == null) return null;
    if (metaInfo.versions[metaInfo.versions.length - 1] == null) return null;
    return metaInfo.versions[metaInfo.versions.length - 1].id;
  }

  /**
   * Extract previous version id from entity with meta info.
   */
  private static getPrevVersionId<E extends Entity>(
    entity: EntityWithMetaInfo<E>
  ): string | null {
    try {
      const metaInfo: EntityMetaInfo = entity._PhenylMeta;
      return metaInfo.versions[metaInfo.versions.length - 2].id;
    } catch (e) {
      return null;
    }
  }

  /**
   * Extract current version ids from entities with meta info.
   */
  private static getVersionIds<E extends Entity>(
    entities: Array<EntityWithMetaInfo<E>>
  ): { [entityId: string]: string | null } {
    const versionsById: { [entityId: string]: string | null } = {};
    entities.forEach((entity: any) => {
      versionsById[entity.id] = this.getVersionId(entity);
    });
    return versionsById;
  }

  /**
   * Extract previous version ids from entities with meta info.
   */
  private static getPrevVersionIds<E extends Entity>(
    entities: Array<EntityWithMetaInfo<E>>
  ): { [entityId: string]: string | null } {
    const versionsById: { [entityId: string]: string | null } = {};
    entities.forEach(entity => {
      versionsById[entity.id] = this.getPrevVersionId(entity);
    });
    return versionsById;
  }
}
