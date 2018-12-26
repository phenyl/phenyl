// @flow
import type {
  Id
} from './id.js.flow'
import type {
  TypeMap,
  AuthCommandMap,
  AuthCredentials,
  AuthOptions,
  CustomParams,
  CustomResult,
  CustomQueryMap,
  CustomCommandMap,
  EntityMap,
  EntityMapOf,
  CustomQueryMapOf,
  CustomCommandMapOf,
  AuthCommandMapOf,
} from './type-map.js.flow'
import type {
  PreEntity,
} from './entity.js.flow'
import type {
  WhereQuery,
  IdQuery,
  IdsQuery,
  CustomQuery,
  PullQuery,
} from './query.js.flow'
import type { KvsClient } from './kvs-client.js.flow'
import type {
  Session,
} from './session.js.flow'
import type {
  CustomQueryResult,
  SingleQueryResult,
  QueryResult,
  PullQueryResult,
} from './query-result.js.flow'
import type {
  CustomCommandResult,
  DeleteCommandResult,
  GetCommandResult,
  IdUpdateCommandResult,
  MultiInsertCommandResult,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  LoginCommandResult,
  LogoutCommandResult,
  PushCommandResult,
  SingleInsertCommandResult,
} from './command-result.js.flow'
import type {
  SingleInsertCommand,
  MultiInsertCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  DeleteCommand,
  CustomCommand,
  LoginCommand,
  LogoutCommand,
  PushCommand,
} from './command.js.flow'
import type { RestApiHandler } from './rest-api-handler.js.flow'

export interface EntityClient<M: EntityMap = EntityMap> {
  find<N: $Keys<M>>(query: WhereQuery<N>, sessionId?: ?Id): Promise<QueryResult<$ElementType<M, N>>>,
  findOne<N: $Keys<M>>(query: WhereQuery<N>, sessionId?: ?Id): Promise<SingleQueryResult<$ElementType<M, N>>>,
  get<N: $Keys<M>>(query: IdQuery<N>, sessionId?: ?Id): Promise<SingleQueryResult<$ElementType<M, N>>>,
  getByIds<N: $Keys<M>>(query: IdsQuery<N>, sessionId?: ?Id): Promise<QueryResult<$ElementType<M, N>>>,
  pull<N: $Keys<M>>(query: PullQuery<N>, sessionId?: ?Id): Promise<PullQueryResult<$ElementType<M, N>>>,
  insertOne<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<SingleInsertCommandResult>,
  insertMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<MultiInsertCommandResult>,
  insertAndGet<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<GetCommandResult<$ElementType<M, N>>>,
  insertAndGetMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<MultiValuesCommandResult<$ElementType<M, N>, *>>,
  updateById<N: $Keys<M>>(command: IdUpdateCommand<N>, sessionId?: ?Id): Promise<IdUpdateCommandResult>,
  updateMulti<N: $Keys<M>>(command: MultiUpdateCommand<N>, sessionId?: ?Id): Promise<MultiUpdateCommandResult<*>>,
  updateAndGet<N: $Keys<M>>(command: IdUpdateCommand<N>, sessionId?: ?Id): Promise<GetCommandResult<$ElementType<M, N>>>,
  updateAndFetch<N: $Keys<M>>(command: MultiUpdateCommand<N>, sessionId?: ?Id): Promise<MultiValuesCommandResult<$ElementType<M, N>, *>>,
  push<N: $Keys<M>>(command: PushCommand<N>, sessionId?: ?Id): Promise<PushCommandResult<$ElementType<M, N>>>,
  delete<N: $Keys<M>>(command: DeleteCommand<N>, sessionId?: ?Id): Promise<DeleteCommandResult>,
  createSessionClient(): SessionClient
}

export interface CustomClient<QM: CustomQueryMap, CM: CustomCommandMap> {
  runCustomQuery<N: $Keys<QM>>(query: CustomQuery<N, CustomParams<QM, N>>, sessionId?: ?Id): Promise<CustomQueryResult<CustomResult<QM, N>>>,
  runCustomCommand<N: $Keys<CM>>(command: CustomCommand<N, CustomParams<CM, N>>, sessionId?: ?Id): Promise<CustomCommandResult<CustomResult<CM, N>>>,
}

export interface AuthClient<M: EntityMap, AM: AuthCommandMap> {
  login<N: $Keys<M> & $Keys<AM>>(command: LoginCommand<N, AuthCredentials<AM, N>, AuthOptions<AM, N>>, sessionId?: ?Id): Promise<LoginCommandResult<$ElementType<M, N>>>,
  logout<N: $Keys<M> & $Keys<AM>>(command: LogoutCommand<N>, sessionId?: ?Id): Promise<LogoutCommandResult>,
}

export type RestApiClient<TM: TypeMap> =
  EntityClient<EntityMapOf<TM>> &
  CustomClient<CustomQueryMapOf<TM>, CustomCommandMapOf<TM>> &
  AuthClient<EntityMapOf<TM>, AuthCommandMapOf<TM>> &
  RestApiHandler

export type SessionClient = KvsClient<Session>
