// @flow
import {
  normalizeUpdateOperation,
  mergeUpdateOperations,
} from 'oad-utils/jsnext'

import {
  randomStringWithTimeStamp
} from './random-string.js'

import type {
  Entity,
  EntityMetaInfo,
  EntityVersion,
  EntityWithMetaInfo,
  GetCommandResult,
  Id,
  MultiValuesCommandResult,
  PreEntity,
  PullQueryResult,
  PushCommandResult,
  QueryResult,
  SingleQueryResult,
  UpdateOperation,
} from 'phenyl-interfaces'

/**
 * Utility classes containing static methods to attach versioning system to EntityClients.
 */
export class Versioning {

  /**
   * @public
   * Create QueryResult with version info from entities.
   */
  static createQueryResult(entities: Array<EntityWithMetaInfo>): QueryResult {
    return {
      ok: 1,
      entities: entities.map(this.stripMeta),
      versionsById: this.getVersionIds(entities),
    }
  }

  /**
   * @public
   * Create SingleQueryResult with version info from a entity.
   */
  static createSingleQueryResult(entity: EntityWithMetaInfo): SingleQueryResult {
    return {
      ok: 1,
      entity: this.stripMeta(entity),
      versionId: this.getVersionId(entity)
    }
  }

  /**
   * @public
   * Create PullQueryResult with diff operations.
   */
  static createPullQueryResult(entity: EntityWithMetaInfo, versionId: Id): PullQueryResult {
    const operations = this.getOperationDiffsByVersion(entity, versionId)
    if (operations == null) {
      return { ok: 1, entity: this.stripMeta(entity), versionId: null }
    }
    return { ok: 1, pulled: 1, operations, versionId: this.getVersionId(entity) }
  }

  /**
   * @public
   * Create GetCommandResult from entity.
   */
  static createGetCommandResult(entity: EntityWithMetaInfo): GetCommandResult {
    return {
      ok: 1,
      n: 1,
      entity: this.stripMeta(entity),
      versionId: this.getVersionId(entity),
    }
  }

  /**
   * @public
   * Create MultiValuesCommandResult from entities.
   */
  static createMultiValuesCommandResult(entities: Array<EntityWithMetaInfo>): MultiValuesCommandResult {
    return {
      ok: 1,
      n: entities.length,
      entities: entities.map(this.stripMeta),
      versionsById: this.getVersionIds(entities),
    }
  }

  /**
   * @public
   * Create PushCommandResult from entity, updated entity and local versionId.
   */
  static createPushCommandResult(entity: EntityWithMetaInfo, updatedEntity: EntityWithMetaInfo, versionId: Id): PushCommandResult {
    const localUncommittedOperations = this.getOperationDiffsByVersion(entity, versionId)
    const latestVersionId = this.getVersionId(updatedEntity)
    if (localUncommittedOperations != null) {
      return { ok: 1, n: 1, operations: localUncommittedOperations, versionId: latestVersionId }
    }
    return { ok: 1, n: 1, entity: updatedEntity, versionId: latestVersionId }
  }

  /**
   * @public
   * Merge operations into one operation and attach metaInfo.
   * TODO This merge process (using mergeUpdateOperations) is incomplete.
   */
  static mergeUpdateOperations(...operations: Array<UpdateOperation>): UpdateOperation {
    const mergedOperation = mergeUpdateOperations(...operations)
    const { operation } = this.attachMetaInfoToUpdateCommand({ operation: mergedOperation })
    return operation
  }

  /**
   * @public
   * Attach meta info ("_PhenylMeta" property) to the given entity.
   */
  static attachMetaInfoToNewEntity(entity: Entity): EntityWithMetaInfo {
    const versionId = randomStringWithTimeStamp()
    const _PhenylMeta = {
      versions: [ { id: versionId, op: '' }],
    }
    return Object.assign({}, entity, { _PhenylMeta })
  }

  /**
   * @public
   * Attach meta info to the given update command.
   */
  static attachMetaInfoToUpdateCommand<T: { operation: UpdateOperation }>(command: T): T {
    const normalizedOperation = normalizeUpdateOperation(command.operation)
    const version = { id: randomStringWithTimeStamp(), op: JSON.stringify(command.operation) }
    const $push = Object.assign({}, normalizedOperation.$push, {
      '_PhenylMeta.versions': { $each: [version], $slice: -100 }
    })
    const newOperation = Object.assign({}, normalizedOperation, { $push })
    return Object.assign({}, command, { operation: newOperation })
  }

  /**
   * @private
   * Strip meta info ("_PhenylMeta" property) from the given entity.
   */
  static stripMeta(entity: EntityWithMetaInfo): Entity {
    if (entity.hasOwnProperty('_PhenylMeta')) {
      const copied = Object.assign({}, entity)
      delete copied._PhenylMeta
      return copied
    }
    return entity
  }

  /**
   * @private
   * Extract current version id from entity with meta info.
   */
  static getVersionId(entity: EntityWithMetaInfo): ?Id {
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

  /**
   * @private
   * Extract current version ids from entities with meta info.
   */
  static getVersionIds(entities: Array<EntityWithMetaInfo>): { [entityId: Id]: Id } {
    const versionsById = {}
    entities.forEach(entity => {
      const versionId = this.getVersionId(entity)
      if (versionId) versionsById[entity.id] = versionId
    })
    return versionsById
  }

  /**
   * @private
   * Get operation diffs by the given versionId.
   */
  static getOperationDiffsByVersion(entity: EntityWithMetaInfo, versionId: Id): ?Array<UpdateOperation> {
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
}
