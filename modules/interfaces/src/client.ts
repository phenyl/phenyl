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
  GeneralEntityRestInfoMap,
  GeneralTypeMap,
  EntityRestInfoMapOf,
  ResponseAuthUser,
  GeneralEntityMap,
  RequestEntity,
  ResponseEntity,
  ResponseEntityMapOf
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
  SingleInsertCommand,
  GeneralSingleInsertCommand,
  GeneralMultiInsertCommand,
  GeneralIdUpdateCommand,
  GeneralMultiUpdateCommand,
  GeneralPushCommand,
  GeneralDeleteCommand,
  GeneralCustomCommand,
  GeneralLoginCommand,
  GeneralLogoutCommand
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
  SingleInsertCommandResult,
  GeneralSingleInsertCommandResult,
  GeneralMultiInsertCommandResult,
  GeneralGetCommandResult,
  GeneralMultiValuesCommandResult,
  GeneralIdUpdateCommandResult,
  GeneralPushCommandResult,
  GeneralDeleteCommandResult,
  GeneralCustomCommandResult,
  GeneralLogoutCommandResult,
  GeneralLoginCommandResult
} from "./command-result";
import {
  CustomQuery,
  IdQuery,
  IdsQuery,
  PullQuery,
  WhereQuery,
  GeneralWhereQuery,
  GeneralIdsQuery,
  GeneralIdQuery,
  GeneralPullQuery,
  GeneralCustomQuery
} from "./query";
import {
  CustomQueryResult,
  PullQueryResult,
  QueryResult,
  SingleQueryResult,
  GeneralQueryResult,
  GeneralSingleQueryResult,
  GeneralPullQueryResult,
  GeneralCustomQueryResult
} from "./query-result";

import { Key } from "./utils";
import { KvsClient } from "./kvs-client";
import { PreEntity } from "./entity";
import { RestApiHandler, GeneralRestApiHandler } from "./rest-api-handler";
import { DbClient, GeneralDbClient } from "./db-client";

/**
 * A common interface for client-side and server-side client to access to entities.
 */
export interface BaseEntityClient {
  find(
    query: GeneralWhereQuery,
    sessionId?: string | null
  ): Promise<GeneralQueryResult>;
  findOne(
    query: GeneralWhereQuery,
    sessionId?: string | null
  ): Promise<GeneralSingleQueryResult>;
  get(
    query: GeneralIdQuery,
    sessionId?: string | null
  ): Promise<GeneralSingleQueryResult>;
  getByIds(
    query: GeneralIdsQuery,
    sessionId?: string | null
  ): Promise<GeneralQueryResult>;
  pull(
    query: GeneralPullQuery,
    sessionId?: string | null
  ): Promise<GeneralPullQueryResult>;
  insertOne(
    command: GeneralSingleInsertCommand,
    sessionId?: string | null
  ): Promise<GeneralSingleInsertCommandResult>;
  insertMulti(
    command: GeneralMultiInsertCommand,
    sessionId?: string | null
  ): Promise<GeneralMultiInsertCommandResult>;
  insertAndGet(
    command: GeneralSingleInsertCommand,
    sessionId?: string | null
  ): Promise<GeneralGetCommandResult>;
  insertAndGetMulti(
    command: GeneralMultiInsertCommand,
    sessionId?: string | null
  ): Promise<GeneralMultiValuesCommandResult>;
  updateById(
    command: GeneralIdUpdateCommand,
    sessionId?: string | null
  ): Promise<GeneralIdUpdateCommandResult>;
  updateMulti(
    command: GeneralMultiUpdateCommand,
    sessionId?: string | null
  ): Promise<MultiUpdateCommandResult>;
  updateAndGet(
    command: GeneralIdUpdateCommand,
    sessionId?: string | null
  ): Promise<GeneralGetCommandResult>;
  updateAndFetch(
    command: GeneralMultiUpdateCommand,
    sessionId?: string | null
  ): Promise<GeneralMultiValuesCommandResult>;
  push(
    command: GeneralPushCommand,
    sessionId?: string | null
  ): Promise<GeneralPushCommandResult>;
  delete(
    command: GeneralDeleteCommand,
    sessionId?: string | null
  ): Promise<GeneralDeleteCommandResult>;
}

/**
 * A client-side client to access to entities via RestApi.
 *
 * See `RestApiEntityClient` for details.
 * When you need to pass `EntityRestInfoMap`, use `RestApiEntityClient` instead.
 */
export interface GeneralRestApiEntityClient extends BaseEntityClient {}

/**
 * A client-side client to access to entities via RestApi.
 *
 * Unlike `EntityClient`, it accesses to rest api while `EntityClient` accesses to database.
 *
 * When you need to pass `RM`(`EntityRestInfoMap`), use `GeneralRestApiEntityClient` instead.
 */
export interface RestApiEntityClient<RM extends GeneralEntityRestInfoMap>
  extends GeneralRestApiEntityClient {
  find<EN extends Key<RM>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<RM, EN>>>;
  findOne<EN extends Key<RM>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<RM, EN>>>;
  get<EN extends Key<RM>>(
    query: IdQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<ResponseEntity<RM, EN>>>;
  getByIds<EN extends Key<RM>>(
    query: IdsQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<ResponseEntity<RM, EN>>>;
  pull<EN extends Key<RM>>(
    query: PullQuery<EN>,
    sessionId?: string | null
  ): Promise<PullQueryResult<ResponseEntity<RM, EN>>>;
  insertOne<EN extends Key<RM>>(
    command: SingleInsertCommand<EN, PreEntity<RequestEntity<RM, EN>>>,
    sessionId?: string | null
  ): Promise<SingleInsertCommandResult>;
  insertMulti<EN extends Key<RM>>(
    command: MultiInsertCommand<EN, PreEntity<RequestEntity<RM, EN>>>,
    sessionId?: string | null
  ): Promise<MultiInsertCommandResult>;
  insertAndGet<EN extends Key<RM>>(
    command: SingleInsertCommand<EN, PreEntity<RequestEntity<RM, EN>>>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<RM, EN>>>;
  insertAndGetMulti<EN extends Key<RM>>(
    command: MultiInsertCommand<EN, PreEntity<RequestEntity<RM, EN>>>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<RM, EN>>>;
  updateById<EN extends Key<RM>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<IdUpdateCommandResult>;
  updateMulti<EN extends Key<RM>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiUpdateCommandResult>;
  updateAndGet<EN extends Key<RM>>(
    command: IdUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<GetCommandResult<ResponseEntity<RM, EN>>>;
  updateAndFetch<EN extends Key<RM>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<ResponseEntity<RM, EN>>>;
  push<EN extends Key<RM>>(
    command: PushCommand<EN>,
    sessionId?: string | null
  ): Promise<PushCommandResult<ResponseEntity<RM, EN>>>;
  delete<EN extends Key<RM>>(
    command: DeleteCommand<EN>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult>;
}

/**
 * A server-side client to access to entities via DbClient.
 * See `EntityClient` for details.
 * When you need to pass `EntityMap`, use `EntityClient` instead.
 */
export interface GeneralEntityClient extends BaseEntityClient {
  getDbClient(): GeneralDbClient;
  createSessionClient(): GeneralSessionClient;
  createSessionClient<AM extends GeneralAuthCommandMap>(): SessionClient<AM>;
}

/**
 * A server-side client to access to entities via DbClient.
 * It does the following roles.
 *
 * 1. Git-like state management (push/pull, versioning etc...)
 * 2. Transaction management (committing order, lock etc...)
 *
 * `EntityClient` is independent of the type of given `DbClient` (memory, mongo and so on.)
 *
 * When you don't need to pass `M`(`GeneralEntityMap`), use `GeneralEntityClient` instead.
 */
export interface EntityClient<M extends GeneralEntityMap>
  extends GeneralEntityClient {
  getDbClient(): DbClient<M>;
  find<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<M[EN]>>;
  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<M[EN]>>;
  get<EN extends Key<M>>(
    query: IdQuery<EN>,
    sessionId?: string | null
  ): Promise<SingleQueryResult<M[EN]>>;
  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>,
    sessionId?: string | null
  ): Promise<QueryResult<M[EN]>>;
  pull<EN extends Key<M>>(
    query: PullQuery<EN>,
    sessionId?: string | null
  ): Promise<PullQueryResult<M[EN]>>;
  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>,
    sessionId?: string | null
  ): Promise<SingleInsertCommandResult>;
  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>,
    sessionId?: string | null
  ): Promise<MultiInsertCommandResult>;
  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>,
    sessionId?: string | null
  ): Promise<GetCommandResult<M[EN]>>;
  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<M[EN]>>;
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
  ): Promise<GetCommandResult<M[EN]>>;
  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>,
    sessionId?: string | null
  ): Promise<MultiValuesCommandResult<M[EN]>>;
  push<EN extends Key<M>>(
    command: PushCommand<EN>,
    sessionId?: string | null
  ): Promise<PushCommandResult<M[EN]>>;
  delete<EN extends Key<M>>(
    command: DeleteCommand<EN>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult>;
}

/**
 * A client-side client to access to custom queries/commands via RestApi.
 *
 * When you need to pass `CustomQueryMap` and `CustomCommandMap`, use `CustomClient`.
 */
export interface GeneralCustomClient {
  runCustomQuery(
    query: GeneralCustomQuery,
    sessionId?: string | null
  ): Promise<GeneralCustomQueryResult>;
  runCustomCommand(
    command: GeneralCustomCommand,
    sessionId?: string | null
  ): Promise<GeneralCustomCommandResult>;
}

/**
 * A client-side client to access to custom queries/commands via RestApi.
 *
 * When you don't need to pass `GeneralCustomMap`, use `GeneralCustomClient`.
 */
export interface CustomClient<
  QM extends GeneralCustomMap,
  CM extends GeneralCustomMap
> extends GeneralCustomClient {
  runCustomQuery<QN extends Key<QM>>(
    query: CustomQuery<QN, CustomQueryParams<QM, QN>>,
    sessionId?: string | null
  ): Promise<CustomQueryResult<CustomQueryResultValue<QM, QN>>>;
  runCustomCommand<CN extends Key<CM>>(
    command: CustomCommand<CN, CustomCommandParams<CM, CN>>,
    sessionId?: string | null
  ): Promise<CustomCommandResult<CustomCommandResultValue<CM, CN>>>;
}

/**
 * A client-side client to authenticate via RestApi.
 *
 * When you need to pass `EntityRestInfoMap` and `AuthCommandMap`, use `AuthClient` instead.
 */
export interface GeneralAuthClient {
  login(
    command: GeneralLoginCommand,
    sessionId?: string | null
  ): Promise<GeneralLoginCommandResult>;
  logout(
    command: GeneralLogoutCommand,
    sessionId?: string | null
  ): Promise<GeneralLogoutCommandResult>;
}

/**
 * A client-side client to authenticate via RestApi.
 *
 * When you don't need to pass `RM`(`GeneralEntityRestInfoMap`) or `AM`(`GeneralAuthCommandMap`}), use `GeneralAuthClient` instead.
 */
export interface AuthClient<
  RM extends GeneralEntityRestInfoMap,
  AM extends GeneralAuthCommandMap
> extends GeneralAuthClient {
  login<EN extends Key<RM> & Key<AM>>(
    command: LoginCommand<EN, AuthCredentials<AM, EN>>,
    sessionId?: string | null
  ): Promise<
    LoginCommandResult<EN, ResponseAuthUser<AM, EN, RM>, AuthSessions<AM, EN>>
  >;
  logout<EN extends Key<RM> & Key<AM>>(
    command: LogoutCommand<EN>,
    sessionId?: string | null
  ): Promise<LogoutCommandResult>;
}

/**
 * A client-side client to access to entities and custom queries/commands and to authenticate via RestApi.
 *
 * When you don't need to pass GeneralTypeMap, use `GeneralRestApiClient` instead.
 */
export type RestApiClient<TM extends GeneralTypeMap> = RestApiEntityClient<
  EntityRestInfoMapOf<TM>
> &
  CustomClient<CustomQueryMapOf<TM>, CustomCommandMapOf<TM>> &
  AuthClient<EntityRestInfoMapOf<TM>, AuthCommandMapOf<TM>> &
  RestApiHandler<TM>;

/**
 * A client-side client to access to entities and custom queries/commands and to authenticate via RestApi.
 *
 * When you need to pass `TypeMap`, use `RestApiClient` instead.
 */
export type GeneralRestApiClient = GeneralCustomClient &
  GeneralAuthClient &
  GeneralRestApiHandler;

/**
 * A server-side client to access to session.
 * When you don't need to pass `AM`(`AuthCommandMap`), use `GeneralSessionClient` instead.
 */
export type SessionClient<AM extends GeneralAuthCommandMap> = KvsClient<
  AllSessions<AM>
>;

/**
 * A server-side client to access to session.
 * When you need to pass `AuthCommandMap`, use `SessionClient` instead.
 */
export type GeneralSessionClient = SessionClient<GeneralAuthCommandMap>;

/**
 * A set of server-side clients.
 *
 * 1. `EntityClient` to access to entities via DbClient.
 * 2. `SessionClient` to access to session.
 *
 * When you need to pass `TypeMap`, use `PhenylClients` instead.
 */
export interface GeneralPhenylClients {
  entityClient: GeneralEntityClient;
  sessionClient: GeneralSessionClient;
}

/**
 * A set of server-side clients.
 * 1. `EntityClient` to access to entities via DbClient.
 * 2. `SessionClient` to access to session.
 *
 * When you don't need to pass `TM`(`GeneralTypeMap`), use `GeneralPhenylClients` instead.
 */
export interface PhenylClients<TM extends GeneralTypeMap>
  extends GeneralPhenylClients {
  entityClient: EntityClient<ResponseEntityMapOf<TM>>;
  sessionClient: SessionClient<AuthCommandMapOf<TM>>;
}
