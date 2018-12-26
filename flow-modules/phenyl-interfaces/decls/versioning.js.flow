// @flow
import type { UpdateOperation } from 'mongolike-operations'
import type { Id } from './id.js.flow'
import type { Entity } from './entity.js.flow'
import type { EntityMap } from './type-map.js.flow'

import type {
  PushCommand
} from './command.js.flow'

type EntityName = string

export type EntityVersion = {
  id: Id,
  op: string, // stringified UpdateOperation
}

export type EntityMetaInfo = {
  versions: Array<EntityVersion>,
}


export type EntityWithMetaInfo<T: Entity> = T & {
  _PhenylMeta: EntityMetaInfo
}

export type VersionDiff = {|
  entityName: EntityName,
  id: Id,
  prevVersionId: Id,
  versionId: Id,
  operation: UpdateOperation,
|}

export type SubscriptionRequest = {|
  method: 'subscribe',
  payload: {
    entityName: EntityName,
    id: Id,
  },
  sessionId?: ?Id,
|}


export type SubscriptionResult = {|
  entityName: EntityName,
  id: Id,
  result: boolean,
  ttl?: number,
|}

export type SubscriptionInfo = {|
  entityName: EntityName,
  id: Id,
  ttl?: number,
|}

export type VersionDiffListener = (versionDiff: VersionDiff) => any

export interface VersionDiffSubscriber {
  subscribeVersionDiff(listener: VersionDiffListener): any
}

export interface VersionDiffPublisher {
  publishVersionDiff(versionDiff: VersionDiff): any
}

/**
 * Validate PushCommand in PhenylEntityClient.
 */
export type PushValidation<M: EntityMap> = <N: $Keys<M>>(
  command: PushCommand<N>,
  entity: $ElementType<M, N>,
  masterOperations: ?Array<UpdateOperation>) => void
