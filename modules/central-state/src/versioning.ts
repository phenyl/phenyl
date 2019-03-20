import {
  normalizeUpdateOperation,
  mergeUpdateOperations,
} from 'oad-utils/jsnext'

import {
  timeStampWithRandomString
} from '@phenyl/utils'

import {
  Entity,
  EntityMetaInfo,
  EntityWithMetaInfo,
  GetCommandResult,
  MultiValuesCommandResult,
  PullQueryResult,
  PushCommandResult,
  QueryResult,
  SingleQueryResult,
} from '@phenyl/interfaces'

import { UpdateOperation, UpdateOperator } from '@sp2/format'

type Id = string

/**
 * Utility classes containing static methods to attach versioning system to EntityClients.
 */
export class Versioning {

  /**
   * @public
   * Create QueryResult with version info from entities.
   */
  static createQueryResult<E extends Entity>(entities: Array<EntityWithMetaInfo<E>>): QueryResult<E> {
    return {
      entities: entities.map(this.stripMeta),
      versionsById: this.getVersionIds(entities),
    }
  }

  /**
   * @public
   * Create SingleQueryResult with version info from a entity.
   */
  static createSingleQueryResult<E extends Entity>(entity: EntityWithMetaInfo<E>): SingleQueryResult<E> {
    return {
      entity: this.stripMeta(entity),
      versionId: this.getVersionId(entity)
    }
  }

  /**
   * @public
   * Create PullQueryResult with diff operations.
   */
  static createPullQueryResult<E extends Entity>(entity: EntityWithMetaInfo<E>, versionId: Id | null | undefined): PullQueryResult<E> {
    const operations = this.getOperationDiffsByVersion(entity, versionId)
    if (operations == null) {
      return { entity: this.stripMeta(entity), versionId: this.getVersionId(entity) }
    }
    return { pulled: 1, operations, versionId: this.getVersionId(entity) }
  }

  /**
   * @public
   * Create GetCommandResult from entity.
   */
  static createGetCommandResult<E extends Entity>(entity: EntityWithMetaInfo<E>): GetCommandResult<E> {
    const versionId = this.getVersionId(entity)
    if (versionId == null) {
      throw new Error('Entity must contain versionId after GetCommand.')
    }
    return {
      n: 1,
      entity: this.stripMeta(entity),
      prevVersionId: this.getPrevVersionId(entity),
      versionId,
    }
  }

  /**
   * @public
   * Create MultiValuesCommandResult from entities.
   */
  static createMultiValuesCommandResult<E extends Entity>(entities: Array<EntityWithMetaInfo<E>>): MultiValuesCommandResult<E> {
    return {
      n: entities.length,
      entities: entities.map(this.stripMeta),
      prevVersionsById: this.getPrevVersionIds(entities),
      versionsById: this.getVersionIds(entities),
    }
  }

  /**
   * @public
   * Create PushCommandResult from entity, updated entity and local versionId.
   */
  static createPushCommandResult<E extends Entity>(entity: EntityWithMetaInfo<E>, updatedEntity: EntityWithMetaInfo<E>, versionId: Id | null | undefined, newOperation: UpdateOperation<UpdateOperator>): PushCommandResult<E> {
    const localUncommittedOperations = this.getOperationDiffsByVersion(entity, versionId)
    const prevVersionId = this.getPrevVersionId(updatedEntity)
    const latestVersionId = this.getVersionId(updatedEntity)
    if (latestVersionId == null) {
      throw new Error('Entity must contain latestVersionId after PushCommand.')
    }
    if (localUncommittedOperations != null) {
      return { n: 1, hasEntity: 0, operations: localUncommittedOperations, prevVersionId, versionId: latestVersionId, newOperation }
    }
    return { n: 1, hasEntity: 1, entity: updatedEntity, prevVersionId, versionId: latestVersionId, newOperation }
  }

  /**
   * @public
   * Merge operations into one operation and attach metaInfo.
   * TODO This merge process (using mergeUpdateOperations) is incomplete.
   */
  static mergeUpdateOperations(...operations: Array<UpdateOperation<UpdateOperator>>): UpdateOperation<UpdateOperator> {
    const mergedOperation = mergeUpdateOperations(...operations)
    const { operation } = this.attachMetaInfoToUpdateCommand({ operation: mergedOperation })
    return operation
  }

  /**
   * @public
   * Attach meta info ("_PhenylMeta" property) to the given entity.
   */
  static attachMetaInfoToNewEntity<E extends Entity>(entity: E): EntityWithMetaInfo<E> {
    const versionId = timeStampWithRandomString()
    const _PhenylMeta = {
      versions: [ { id: versionId, op: '' }],
    }
    return Object.assign({}, entity, { _PhenylMeta })
  }

  /**
   * @public
   * Attach meta info to the given update command.
   */
  static attachMetaInfoToUpdateCommand<T extends { operation: UpdateOperation<UpdateOperator> }>(command: T): T {
    const normalizedOperation = normalizeUpdateOperation(command.operation)
    const version = { id: timeStampWithRandomString(), op: JSON.stringify(command.operation) }
    const $push = Object.assign({}, normalizedOperation.$push, {
      '_PhenylMeta.versions': { $each: [version], $slice: -100 }
    })
    const newOperation = Object.assign({}, normalizedOperation, { $push })
    return Object.assign({}, command, { operation: newOperation })
  }

  /**
   * @public
   * Get operation diffs by the given versionId.
   */
  static getOperationDiffsByVersion<E extends Entity>(entity: EntityWithMetaInfo<E>, versionId: Id | null | undefined): Array<UpdateOperation<UpdateOperator>> | null | undefined {
    if (versionId == null) return null
    if (!entity.hasOwnProperty('_PhenylMeta')) return null
    try {
      const metaInfo: EntityMetaInfo = entity._PhenylMeta
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
  /**
   * @public
   * Strip meta info ("_PhenylMeta" property) from the given entity.
   */
  static stripMeta<E extends Entity>(entity: EntityWithMetaInfo<E>): E {
    if (entity.hasOwnProperty('_PhenylMeta')) {
      const copied = Object.assign({}, entity)
      delete copied._PhenylMeta
      // $FlowIssue(stripping-instance-prototype)
      return copied
    }
    return entity
  }

  /**
   * @private
   * Extract current version id from entity with meta info.
   */
  static getVersionId<E extends Entity>(entity: EntityWithMetaInfo<E>): Id | null | undefined {
    const metaInfo = entity._PhenylMeta
    if (metaInfo == null) return null
    if (metaInfo.versions == null) return null
    if (metaInfo.versions[metaInfo.versions.length - 1] == null) return null
    return metaInfo.versions[metaInfo.versions.length - 1].id
  }

  /**
   * @private
   * Extract previous version id from entity with meta info.
   */
  static getPrevVersionId<E extends Entity>(entity: EntityWithMetaInfo<E>): Id | null | undefined {
    try {
      const metaInfo: EntityMetaInfo = entity._PhenylMeta
      return metaInfo.versions[metaInfo.versions.length - 2].id
    }
    catch (e) {
      return null
    }
  }


  /**
   * @private
   * Extract current version ids from entities with meta info.
   */
  static getVersionIds<E extends Entity>(entities: Array<EntityWithMetaInfo<E>>): { [entityId: string]: Id | null | undefined } {
    const versionsById = {}
    entities.forEach(entity => {
      versionsById[entity.id] = this.getVersionId(entity)
    })
    return versionsById
  }

  /**
   * @private
   * Extract previous version ids from entities with meta info.
   */
  static getPrevVersionIds<E extends Entity>(entities: Array<EntityWithMetaInfo<E>>): { [entityId: string]: Id | null | undefined } {
    const versionsById = {}
    entities.forEach(entity => {
      versionsById[entity.id] = this.getPrevVersionId(entity)
    })
    return versionsById
  }
}
