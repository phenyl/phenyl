import {
  AllSessions,
  AuthCommandMapOf,
  AuthCredentials,
  AuthSessions,
  CustomCommandMapOf,
  CustomCommandParams,
  CustomCommandResultValue,
  CustomQueryMapOf,
  CustomQueryParams,
  CustomQueryResultValue,
  GeneralAuthCommandMap,
  GeneralCustomMap,
  GeneralReqResEntityMap,
  GeneralTypeMap,
  ReqResEntityMapOf,
  RequestEntity,
  ResponseAuthUser,
  ResponseEntity
} from "./type-map";
import {
  CustomCommand,
  DeleteCommand,
  IdUpdateCommand,
  LoginCommand,
  LogoutCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  PushCommand,
  SingleInsertCommand
} from "./command";
import {
  CustomCommandResult,
  DeleteCommandResult,
  GetCommandResult,
  IdUpdateCommandResult,
  LoginCommandResult,
  LogoutCommandResult,
  MultiInsertCommandResult,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  PushCommandResult,
  SingleInsertCommandResult
} from "./command-result";
import { CustomQuery, IdQuery, IdsQuery, PullQuery, WhereQuery } from "./query";
import {
  CustomQueryResult,
  PullQueryResult,
  QueryResult,
  SingleQueryResult
} from "./query-result";
import { Key } from "./utils";
import { KvsClient } from "./kvs-client";
import { PreEntity } from "./entity";
import { RestApiHandler } from "./rest-api-handler";

export type EntityClient<
  M extends GeneralReqResEntityMap = GeneralReqResEntityMap
> = RawEntityClient<M> | NormalizedEntityClient<M>;
export interface RawEntityClient<
  M extends GeneralReqResEntityMap = GeneralReqResEntityMap
> {
  find<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<M, EN>>>;
  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<M, EN>>>;
  get<EN extends Key<M>>(
    query: IdQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<M, EN>>>;
  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<M, EN>>>;
  pull<EN extends Key<M>>(
    query: PullQuery<EN>,
    sessionId?: string | null
  ): Promise<PullQueryResult<ResponseEntity<M, EN>>>;
  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<SingleInsertCommandResult>;
  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<MultiInsertCommandResult>;
  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<M, EN>>>;
  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>>;
  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<IdUpdateCommandResult>;
  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiUpdateCommandResult>;
  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<M, EN>>>;
  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>>;
  push<EN extends Key<M>>(
    command: PushCommand<EN>,
    sessionId?: string | null
  ): Promise<PushCommandResult<ResponseEntity<M, EN>>>;
  delete<EN extends Key<M>>(
    command: DeleteCommand<EN>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult>;
}
export interface NormalizedEntityClient<
  M extends GeneralReqResEntityMap = GeneralReqResEntityMap
> {
  find<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<M, EN>>>;
  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<M, EN>>>;
  get<EN extends Key<M>>(
    query: IdQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<M, EN>>>;
  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<M, EN>>>;
  pull<EN extends Key<M>>(
    query: PullQuery<EN>,
    sessionId?: string | null
  ): Promise<PullQueryResult<ResponseEntity<M, EN>>>;
  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<SingleInsertCommandResult>;
  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<MultiInsertCommandResult>;
  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<M, EN>>>;
  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<RequestEntity<M, EN>>>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>>;
  updateById<EN extends Key<M>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<IdUpdateCommandResult>;
  updateMulti<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiUpdateCommandResult>;
  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<M, EN>>>;
  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<M, EN>>>;
  push<EN extends Key<M>>(
    command: PushCommand<EN>,
    sessionId?: string | null
  ): Promise<PushCommandResult<ResponseEntity<M, EN>>>;
  delete<EN extends Key<M>>(
    command: DeleteCommand<EN>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult>;
}
export interface CustomClient<
  QM extends GeneralCustomMap,
  CM extends GeneralCustomMap
> {
  runCustomQuery<QN extends Key<QM>>(
    query: CustomQuery<QN, CustomQueryParams<QM, QN>>,
    sessionId?: string | null
  ): Promise<CustomQueryResult<CustomQueryResultValue<QM, QN>>>;
  runCustomCommand<CN extends Key<CM>>(
    command: CustomCommand<CN, CustomCommandParams<CM, CN>>,
    sessionId?: string | null
  ): Promise<CustomCommandResult<CustomCommandResultValue<CM, CN>>>;
}
export interface AuthClient<
  M extends GeneralReqResEntityMap,
  AM extends GeneralAuthCommandMap
> {
  login<EN extends Key<AM>>(
    command: LoginCommand<EN, AuthCredentials<AM, EN>>,
    sessionId?: string | null
  ): Promise<
    LoginCommandResult<EN, ResponseAuthUser<AM, EN, M>, AuthSessions<AM, EN>>
  >;
  logout<EN extends Key<AM>>(
    command: LogoutCommand<EN>,
    sessionId?: string | null
  ): Promise<LogoutCommandResult>;
  createSessionClient(): SessionClient<AM>;
}
export type RestApiClient<TM extends GeneralTypeMap> = NormalizedEntityClient<
  ReqResEntityMapOf<TM>
> &
  CustomClient<CustomQueryMapOf<TM>, CustomCommandMapOf<TM>> &
  AuthClient<ReqResEntityMapOf<TM>, AuthCommandMapOf<TM>> &
  RestApiHandler<TM>;
export type SessionClient<
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> = KvsClient<AllSessions<AM>>;
