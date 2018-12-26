// @flow
import type {
  PreEntity,
} from './entity.js.flow'

import type {
  EntityMap,
} from './type-map.js.flow'

import type {
  IdQuery,
  IdsQuery,
  WhereQuery,
} from './query.js.flow'

import type {
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  SingleInsertCommand,
  DeleteCommand,
} from './command.js.flow'


export interface DbClient<M: EntityMap> {
  find<N: $Keys<M>>(query: WhereQuery<N>): Promise<Array<$ElementType<M, N>>>,
  findOne<N: $Keys<M>>(query: WhereQuery<N>): Promise<$ElementType<M, N>>,
  get<N: $Keys<M>>(query: IdQuery<N>): Promise<$ElementType<M, N>>,
  getByIds<N: $Keys<M>>(query: IdsQuery<N>): Promise<Array<$ElementType<M, N>>>,
  insertOne<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<number>,
  insertMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<number>,
  insertAndGet<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<$ElementType<M, N>>,
  insertAndGetMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>): Promise<Array<$ElementType<M, N>>>,
  updateAndGet<N: $Keys<M>>(command: IdUpdateCommand<N>): Promise<$ElementType<M, N>>,
  updateAndFetch<N: $Keys<M>>(command: MultiUpdateCommand<N>): Promise<Array<$ElementType<M, N>>>,
  delete<N: $Keys<M>>(command: DeleteCommand<N>): Promise<number>,
}
