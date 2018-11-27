// @flow
import type { UpdateOperation } from 'mongolike-operations'
import type { EntityMap } from './type-map.js.flow'
import type { Entity } from './entity.js.flow'
import type { Id } from './id.js.flow'
import type { Session } from './session.js.flow'
import type { PhenylErrorType, ErrorLocation } from './error.js.flow'
import type { ActionTag } from './action.js.flow'

export type LocalEntityInfo<E: Entity> = {
  origin: E,
  +versionId: ?Id,
  commits: Array<UpdateOperation>,
  head: ?E,
}

export type LocalEntityInfoById<E: Entity> = {
  [entityId: Id] : LocalEntityInfo<E>
}

export type LocalEntityState<M: EntityMap> = $ObjMap<M, <T: Entity>(T) => LocalEntityInfoById<T>>

export type UnreachedCommit<N: string = string> = {|
  entityName: N, // "update" key in MongoDB reference
  id: Id,
  commitCount: number,
|}


export type LocalState<M: EntityMap> = {
  entities: LocalEntityState<M>,
  network: {
    requests: Array<ActionTag>,
    isOnline: boolean,
  },
  unreachedCommits: Array<UnreachedCommit<$Keys<M>>>,
  error?: {
    type: PhenylErrorType,
    at: ErrorLocation,
    message: string,
    actionTag: ActionTag,
  },
  session?: ?Session,
}
