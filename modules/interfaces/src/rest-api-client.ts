import {
  DeleteCommand,
  IdUpdateCommand,
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
  CustomCommand,
  GeneralLoginCommand,
  GeneralLogoutCommand,
  LoginCommand,
  LogoutCommand
} from "./command";
import {
  DeleteCommandResult,
  GetCommandResult,
  IdUpdateCommandResult,
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
  CustomCommandResult,
  GeneralLoginCommandResult,
  GeneralLogoutCommandResult,
  LoginCommandResult,
  LogoutCommandResult
} from "./command-result";
import {
  IdQuery,
  IdsQuery,
  PullQuery,
  WhereQuery,
  GeneralWhereQuery,
  GeneralIdQuery,
  GeneralIdsQuery,
  GeneralPullQuery,
  GeneralCustomQuery,
  CustomQuery
} from "./query";
import {
  PullQueryResult,
  QueryResult,
  SingleQueryResult,
  GeneralQueryResult,
  GeneralSingleQueryResult,
  GeneralPullQueryResult,
  GeneralCustomQueryResult,
  CustomQueryResult
} from "./query-result";
import { Key } from "./utils";
import { PreEntity } from "./entity";
import {
  GeneralEntityRestInfoMap,
  ResponseEntity,
  RequestEntity,
  EntityExtraParams,
  EntityExtraResult,
  EntityRestInfoMapOf
} from "./entity-rest-info-map";
import { BaseEntityClient } from "./entity-client";
import {
  GeneralCustomMap,
  CustomQueryParams,
  CustomQueryExtraParams,
  CustomQueryResultValue,
  CustomQueryExtraResult,
  CustomCommandParams,
  CustomCommandExtraParams,
  CustomCommandResultValue,
  CustomCommandExtraResult,
  CustomQueryMapOf,
  CustomCommandMapOf
} from "./custom-map";
import {
  GeneralAuthCommandMap,
  AuthCredentials,
  ResponseAuthUser,
  AuthSessions,
  AuthCommandMapOf
} from "./auth-command-map";
import { GeneralTypeMap } from "./type-map";
import { RestApiHandler, GeneralRestApiHandler } from "./rest-api-handler";

/**
 * A client-side client to access to entities via RestApi.
 *
 * See `RestApiEntityClient` for details.
 * When you need to pass `EntityRestInfoMap`, use `RestApiEntityClient` instead.
 */
export interface GeneralRestApiEntityClient extends BaseEntityClient {
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
 * Unlike `EntityClient`, it accesses to rest api while `EntityClient` accesses to database.
 *
 * When you need to pass `RM`(`EntityRestInfoMap`), use `GeneralRestApiEntityClient` instead.
 */
export interface RestApiEntityClient<RM extends GeneralEntityRestInfoMap>
  extends GeneralRestApiEntityClient {
  find<EN extends Key<RM>>(
    query: WhereQuery<EN, EntityExtraParams<RM, EN, "find">>,
    sessionId?: string | null
  ): Promise<
    QueryResult<ResponseEntity<RM, EN>, EntityExtraResult<RM, EN, "find">>
  >;
  findOne<EN extends Key<RM>>(
    query: WhereQuery<EN, EntityExtraParams<RM, EN, "findOne">>,
    sessionId?: string | null
  ): Promise<
    SingleQueryResult<
      ResponseEntity<RM, EN>,
      EntityExtraResult<RM, EN, "findOne">
    >
  >;
  get<EN extends Key<RM>>(
    query: IdQuery<EN, EntityExtraParams<RM, EN, "get">>,
    sessionId?: string | null
  ): Promise<
    SingleQueryResult<ResponseEntity<RM, EN>, EntityExtraResult<RM, EN, "get">>
  >;
  getByIds<EN extends Key<RM>>(
    query: IdsQuery<EN, EntityExtraParams<RM, EN, "getByIds">>,
    sessionId?: string | null
  ): Promise<
    QueryResult<ResponseEntity<RM, EN>, EntityExtraResult<RM, EN, "getByIds">>
  >;
  pull<EN extends Key<RM>>(
    query: PullQuery<EN, EntityExtraParams<RM, EN, "pull">>,
    sessionId?: string | null
  ): Promise<
    PullQueryResult<ResponseEntity<RM, EN>, EntityExtraResult<RM, EN, "pull">>
  >;
  insertOne<EN extends Key<RM>>(
    command: SingleInsertCommand<
      EN,
      PreEntity<RequestEntity<RM, EN>>,
      EntityExtraParams<RM, EN, "insertOne">
    >,
    sessionId?: string | null
  ): Promise<SingleInsertCommandResult<EntityExtraResult<RM, EN, "insertOne">>>;
  insertMulti<EN extends Key<RM>>(
    command: MultiInsertCommand<
      EN,
      PreEntity<RequestEntity<RM, EN>>,
      EntityExtraParams<RM, EN, "insertMulti">
    >,
    sessionId?: string | null
  ): Promise<
    MultiInsertCommandResult<EntityExtraResult<RM, EN, "insertMulti">>
  >;
  insertAndGet<EN extends Key<RM>>(
    command: SingleInsertCommand<
      EN,
      PreEntity<RequestEntity<RM, EN>>,
      EntityExtraParams<RM, EN, "insertAndGet">
    >,
    sessionId?: string | null
  ): Promise<
    GetCommandResult<
      ResponseEntity<RM, EN>,
      EntityExtraResult<RM, EN, "insertAndGet">
    >
  >;
  insertAndGetMulti<EN extends Key<RM>>(
    command: MultiInsertCommand<
      EN,
      PreEntity<RequestEntity<RM, EN>>,
      EntityExtraParams<RM, EN, "insertAndGetMulti">
    >,
    sessionId?: string | null
  ): Promise<
    MultiValuesCommandResult<
      ResponseEntity<RM, EN>,
      EntityExtraResult<RM, EN, "insertAndGetMulti">
    >
  >;
  updateById<EN extends Key<RM>>(
    command: IdUpdateCommand<EN, EntityExtraParams<RM, EN, "updateById">>,
    sessionId?: string | null
  ): Promise<IdUpdateCommandResult<EntityExtraResult<RM, EN, "updateById">>>;
  updateMulti<EN extends Key<RM>>(
    command: MultiUpdateCommand<EN, EntityExtraParams<RM, EN, "updateMulti">>,
    sessionId?: string | null
  ): Promise<
    MultiUpdateCommandResult<EntityExtraResult<RM, EN, "updateMulti">>
  >;
  updateAndGet<EN extends Key<RM>>(
    command: IdUpdateCommand<EN, EntityExtraParams<RM, EN, "updateAndGet">>,
    sessionId?: string | null
  ): Promise<
    GetCommandResult<
      ResponseEntity<RM, EN>,
      EntityExtraResult<RM, EN, "updateAndGet">
    >
  >;
  updateAndFetch<EN extends Key<RM>>(
    command: MultiUpdateCommand<
      EN,
      EntityExtraParams<RM, EN, "updateAndFetch">
    >,
    sessionId?: string | null
  ): Promise<
    MultiValuesCommandResult<
      ResponseEntity<RM, EN>,
      EntityExtraResult<RM, EN, "updateAndFetch">
    >
  >;
  push<EN extends Key<RM>>(
    command: PushCommand<EN, EntityExtraParams<RM, EN, "push">>,
    sessionId?: string | null
  ): Promise<
    PushCommandResult<ResponseEntity<RM, EN>, EntityExtraResult<RM, EN, "push">>
  >;
  delete<EN extends Key<RM>>(
    command: DeleteCommand<EN, EntityExtraParams<RM, EN, "delete">>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult<EntityExtraResult<RM, EN, "delete">>>;
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
    query: CustomQuery<
      QN,
      CustomQueryParams<QM, QN>,
      CustomQueryExtraParams<QM, QN>
    >,
    sessionId?: string | null
  ): Promise<
    CustomQueryResult<
      CustomQueryResultValue<QM, QN>,
      CustomQueryExtraResult<QM, QN>
    >
  >;
  runCustomCommand<CN extends Key<CM>>(
    command: CustomCommand<
      CN,
      CustomCommandParams<CM, CN>,
      CustomCommandExtraParams<CM, CN>
    >,
    sessionId?: string | null
  ): Promise<
    CustomCommandResult<
      CustomCommandResultValue<CM, CN>,
      CustomCommandExtraResult<CM, CN>
    >
  >;
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
  login<UN extends Key<RM> & Key<AM>>(
    command: LoginCommand<
      UN,
      AuthCredentials<AM, UN>,
      EntityExtraParams<RM, UN, "login">
    >,
    sessionId?: string | null
  ): Promise<
    LoginCommandResult<
      UN,
      ResponseAuthUser<AM, UN, RM>,
      AuthSessions<AM, UN>,
      EntityExtraResult<RM, UN, "login">
    >
  >;
  logout<UN extends Key<RM> & Key<AM>>(
    command: LogoutCommand<UN, EntityExtraParams<RM, UN, "logout">>,
    sessionId?: string | null
  ): Promise<LogoutCommandResult<EntityExtraResult<RM, UN, "logout">>>;
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
export type GeneralRestApiClient = GeneralRestApiEntityClient &
  GeneralCustomClient &
  GeneralAuthClient &
  GeneralRestApiHandler;
