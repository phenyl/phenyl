// @flow
import {
  normalizeUpdateOperation
} from 'oad-utils/jsnext'

import {
  randomStringWithTimeStamp
} from './random-string.js'

import type {
  Entity,
  Id,
  UpdateOperation,
  EntityMetaInfo,
  EntityVersion,
} from 'phenyl-interfaces'

export class Versioning {

  static stripMeta(entity: Entity): Entity {
    if (entity.hasOwnProperty('_PhenylMeta')) {
      const copied = Object.assign({}, entity)
      delete copied._PhenylMeta
      return copied
    }
    return entity
  }

  static getVersionId(entity: Entity): ?Id {
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

  static getVersionIds(entities: Array<Entity>): { [entityId: Id]: Id } {
    const versionsById = {}
    entities.forEach(entity => {
      const versionId = this.getVersionId(entity)
      if (versionId) versionsById[entity.id] = versionId
    })
    return versionsById
  }

  static getInitialMeta(): EntityMetaInfo {
    const versionId = randomStringWithTimeStamp()
    return {
      versions: [ { id: versionId, op: '' }],
    }
  }

  static attachMetaInfo(entity: Entity): Entity {
    return Object.assign({}, entity, { _PhenylMeta: this.getInitialMeta() })
  }

  static getOperationDiffsByVersion(entity: Entity, versionId: Id): ?Array<UpdateOperation> {
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

  static attachMetaInfoToUpdateCommand<T: { operation: UpdateOperation }>(command: T): T {
    const normalizedOperation = normalizeUpdateOperation(command.operation)
    const version = { id: randomStringWithTimeStamp(), op: JSON.stringify(command.operation) }
    const $push = Object.assign({}, normalizedOperation.$push, {
      '_PhenylMeta.versions': { $each: [version], $slice: -100 }
    })
    const newOperation = Object.assign({}, normalizedOperation, { $push })
    return Object.assign({}, command, { operation: newOperation })
  }
}
