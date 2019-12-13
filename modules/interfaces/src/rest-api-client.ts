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
import { ObjectMap } from "./utils";
import { PreEntity } from "./entity";
import {
  EntityNameOf,
  ResponseEntityOf,
  EntityExtraResultOf,
  EntityExtraParamsOf,
  RequestEntityOf
} from "./entity-rest-info-map";
import { BaseEntityClient } from "./entity-client";
import {
  CustomQueryNameOf,
  CustomQueryResultValueOf,
  CustomQueryExtraResultOf,
  CustomCommandNameOf,
  CustomCommandResultValueOf,
  CustomQueryParamsOf,
  CustomQueryExtraParamsOf,
  CustomCommandParamsOf,
  CustomCommandExtraParamsOf
} from "./custom-map";
import {
  UserEntityNameOf,
  ResponseAuthUserOf,
  AuthSessionOf,
  AuthCredentialsOf
} from "./auth-command-map";
import { GeneralTypeMap } from "./type-map";
import { RequestMethodName, GeneralRequestData } from "./request-data";
import {
  EveryNameOf,
  ResponseDataWithTypeMap,
  RequestDataWithTypeMapForResponse
} from "./bound-request-response";
import { ErrorResponseData, GeneralResponseData } from "./response-data";

/**
 * A client-side client to access to entities via RestApi.
 * When you need to pass `TypeMap`, use `RestApiClient<TM>` instead.
 */
export interface BaseRestApiClient<OP extends ObjectMap = {}>
  extends BaseEntityClient {
  handleRequestData(reqData: GeneralRequestData): Promise<GeneralResponseData>;

  find(
    query: GeneralWhereQuery,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralQueryResult>;
  findOne(
    query: GeneralWhereQuery,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralSingleQueryResult>;
  get(
    query: GeneralIdQuery,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralSingleQueryResult>;
  getByIds(
    query: GeneralIdsQuery,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralQueryResult>;
  pull(
    query: GeneralPullQuery,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralPullQueryResult>;
  insertOne(
    command: GeneralSingleInsertCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralSingleInsertCommandResult>;
  insertMulti(
    command: GeneralMultiInsertCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralMultiInsertCommandResult>;
  insertAndGet(
    command: GeneralSingleInsertCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralGetCommandResult>;
  insertAndGetMulti(
    command: GeneralMultiInsertCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralMultiValuesCommandResult>;
  updateById(
    command: GeneralIdUpdateCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralIdUpdateCommandResult>;
  updateMulti(
    command: GeneralMultiUpdateCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<MultiUpdateCommandResult>;
  updateAndGet(
    command: GeneralIdUpdateCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralGetCommandResult>;
  updateAndFetch(
    command: GeneralMultiUpdateCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralMultiValuesCommandResult>;
  push(
    command: GeneralPushCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralPushCommandResult>;
  delete(
    command: GeneralDeleteCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralDeleteCommandResult>;
  runCustomQuery(
    query: GeneralCustomQuery,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralCustomQueryResult>;
  runCustomCommand(
    command: GeneralCustomCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralCustomCommandResult>;
  login(
    command: GeneralLoginCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralLoginCommandResult>;
  logout(
    command: GeneralLogoutCommand,
    sessionId?: string | null,
    options?: OP
  ): Promise<GeneralLogoutCommandResult>;
}

export type GeneralRestApiClient = BaseRestApiClient<{}>;

/**
 * A client-side client to access to entities via RestApi.
 *
 * Unlike `EntityClient`, it accesses to rest api while `EntityClient` accesses to database.
 *
 * When you need to pass `TM`(`TypeMap`), use `GeneralRestApiClient` instead.
 */
export interface RestApiClient<
  TM extends GeneralTypeMap,
  OP extends ObjectMap = {}
> extends BaseRestApiClient<OP> {
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>
  ): Promise<ResponseDataWithTypeMap<TM, MN, N> | ErrorResponseData>;

  find<EN extends EntityNameOf<TM>>(
    query: WhereQuery<EN, EntityExtraParamsOf<TM, EN, "find">>,
    sessionId?: string | null
  ): Promise<
    QueryResult<ResponseEntityOf<TM, EN>, EntityExtraResultOf<TM, EN, "find">>
  >;

  findOne<EN extends EntityNameOf<TM>>(
    query: WhereQuery<EN, EntityExtraParamsOf<TM, EN, "findOne">>,
    sessionId?: string | null
  ): Promise<
    SingleQueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "findOne">
    >
  >;

  get<EN extends EntityNameOf<TM>>(
    query: IdQuery<EN, EntityExtraParamsOf<TM, EN, "get">>,
    sessionId?: string | null
  ): Promise<
    SingleQueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "get">
    >
  >;

  getByIds<EN extends EntityNameOf<TM>>(
    query: IdsQuery<EN, EntityExtraParamsOf<TM, EN, "getByIds">>,
    sessionId?: string | null
  ): Promise<
    QueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "getByIds">
    >
  >;

  pull<EN extends EntityNameOf<TM>>(
    query: PullQuery<EN, EntityExtraParamsOf<TM, EN, "pull">>,
    sessionId?: string | null
  ): Promise<
    PullQueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "pull">
    >
  >;

  insertOne<EN extends EntityNameOf<TM>>(
    command: SingleInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertOne">
    >,
    sessionId?: string | null
  ): Promise<
    SingleInsertCommandResult<EntityExtraResultOf<TM, EN, "insertOne">>
  >;

  insertMulti<EN extends EntityNameOf<TM>>(
    command: MultiInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertMulti">
    >,
    sessionId?: string | null
  ): Promise<
    MultiInsertCommandResult<EntityExtraResultOf<TM, EN, "insertMulti">>
  >;

  insertAndGet<EN extends EntityNameOf<TM>>(
    command: SingleInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertAndGet">
    >,
    sessionId?: string | null
  ): Promise<
    GetCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "insertAndGet">
    >
  >;

  insertAndGetMulti<EN extends EntityNameOf<TM>>(
    command: MultiInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertAndGetMulti">
    >,
    sessionId?: string | null
  ): Promise<
    MultiValuesCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "insertAndGetMulti">
    >
  >;

  updateById<EN extends EntityNameOf<TM>>(
    command: IdUpdateCommand<EN, EntityExtraParamsOf<TM, EN, "updateById">>,
    sessionId?: string | null
  ): Promise<IdUpdateCommandResult<EntityExtraResultOf<TM, EN, "updateById">>>;

  updateMulti<EN extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<EN, EntityExtraParamsOf<TM, EN, "updateMulti">>,
    sessionId?: string | null
  ): Promise<
    MultiUpdateCommandResult<EntityExtraResultOf<TM, EN, "updateMulti">>
  >;

  updateAndGet<EN extends EntityNameOf<TM>>(
    command: IdUpdateCommand<EN, EntityExtraParamsOf<TM, EN, "updateAndGet">>,
    sessionId?: string | null
  ): Promise<
    GetCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "updateAndGet">
    >
  >;

  updateAndFetch<EN extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<
      EN,
      EntityExtraParamsOf<TM, EN, "updateAndFetch">
    >,
    sessionId?: string | null
  ): Promise<
    MultiValuesCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "updateAndFetch">
    >
  >;

  push<EN extends EntityNameOf<TM>>(
    command: PushCommand<EN, EntityExtraParamsOf<TM, EN, "push">>,
    sessionId?: string | null
  ): Promise<
    PushCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "push">
    >
  >;

  delete<EN extends EntityNameOf<TM>>(
    command: DeleteCommand<EN, EntityExtraParamsOf<TM, EN, "delete">>,
    sessionId?: string | null
  ): Promise<DeleteCommandResult<EntityExtraResultOf<TM, EN, "delete">>>;

  runCustomQuery<QN extends CustomQueryNameOf<TM>>(
    query: CustomQuery<
      QN,
      CustomQueryParamsOf<TM, QN>,
      CustomQueryExtraParamsOf<TM, QN>
    >,
    sessionId?: string | null
  ): Promise<
    CustomQueryResult<
      CustomQueryResultValueOf<TM, QN>,
      CustomQueryExtraResultOf<TM, QN>
    >
  >;

  runCustomCommand<CN extends CustomCommandNameOf<TM>>(
    command: CustomCommand<
      CN,
      CustomCommandParamsOf<TM, CN>,
      CustomCommandExtraParamsOf<TM, CN>
    >,
    sessionId?: string | null
  ): Promise<
    CustomCommandResult<
      CustomCommandResultValueOf<TM, CN>,
      CustomQueryExtraResultOf<TM, CN>
    >
  >;

  login<UN extends UserEntityNameOf<TM>>(
    command: LoginCommand<
      UN,
      AuthCredentialsOf<TM, UN>,
      EntityExtraParamsOf<TM, UN, "login">
    >,
    sessionId?: string | null
  ): Promise<
    LoginCommandResult<
      UN,
      ResponseAuthUserOf<TM, UN>,
      AuthSessionOf<TM, UN>,
      EntityExtraResultOf<TM, UN, "login">
    >
  >;

  logout<UN extends UserEntityNameOf<TM>>(
    command: LogoutCommand<UN, EntityExtraParamsOf<TM, UN, "logout">>,
    sessionId?: string | null
  ): Promise<LogoutCommandResult<EntityExtraResultOf<TM, UN, "logout">>>;
}

/**
 * Options to pass to `handleRequestData(reqData ,options)` method of `DirectRestApiHandler`,
 * This options contains powerful privileges, which cannot be set by clientside code.
 * There are no other ways but `DirectRestApiClient` to pass this option to `DirectRestApiHandler`.
 * Therefore, these options cannot be set via HTTP.
 *
 * `skipAuthorization` option is to skip authorization step in `PhenylRestApi`.
 * It is useful for accessing data in `RestApiDefinition`.
 */
export type DirectRestApiOptions = {
  skipAuthorization?: boolean;
};

/**
 * Client to access `RestApiHandler` directly.
 * This can pass `DirectRestApiOptions`, while a normal `RestApiClient` cannot.
 */
export interface GeneralDirectRestApiClient
  extends BaseRestApiClient<DirectRestApiOptions> {
  handleRequestData(
    reqData: GeneralRequestData,
    options?: DirectRestApiOptions
  ): Promise<GeneralResponseData>;
}

/**
 * Client to access `RestApiHandler` directly.
 * This can pass `DirectRestApiOptions`, while a normal `RestApiClient` cannot.
 */
export interface DirectRestApiClient<TM extends GeneralTypeMap>
  extends RestApiClient<TM, DirectRestApiOptions> {
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>,
    options?: DirectRestApiOptions
  ): Promise<ResponseDataWithTypeMap<TM, MN, N> | ErrorResponseData>;
}
