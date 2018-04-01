// @flow
import {
  WhereQuery,
  IdQuery,
  IdsQuery,
} from './query.js.flow'

import type {
  Entity,
  EntityName
} from './entity.js.flow'

type ForeignQuery<FN, T> = T & {
  foreign?: ForeignQueryParams<FN>
}

export type ForeignQueryParams<FN: EntityName> = {
  documentPath: string,
  entityName: FN,
}

export type ForeignQueryResult<T> = T & {
  foreign?: { entities: Array<Entity> } | { entity: Entity }
}

export type ForeignIdQuery<N: EntityName, FN: EntityName> = ForeignQuery<FN, IdQuery<N>>
export type ForeignWhereQuery<N: EntityName, FN: EntityName> = ForeignQuery<FN, WhereQuery<N>>
export type ForeignIdsQuery<N: EntityName, FN: EntityName> = ForeignQuery<FN, IdsQuery<N>>
