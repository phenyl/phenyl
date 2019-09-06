import {
  DeleteRequestData,
  FindOneRequestData,
  FindRequestData,
  GetByIdsRequestData,
  GetRequestData,
  InsertAndGetMultiRequestData,
  InsertAndGetRequestData,
  InsertMultiRequestData,
  InsertOneRequestData,
  LoginRequestData,
  LogoutRequestData,
  PullRequestData,
  PushRequestData,
  RequestMethodName,
  RunCustomCommandRequestData,
  RunCustomQueryRequestData,
  UpdateAndFetchRequestData,
  UpdateAndGetRequestData,
  UpdateMultiRequestData,
  UpdateOneRequestData
} from "./request-data";
import {
  DeleteResponseData,
  FindOneResponseData,
  FindResponseData,
  GetByIdsResponseData,
  GetResponseData,
  InsertAndGetMultiResponseData,
  InsertAndGetResponseData,
  InsertMultiResponseData,
  InsertOneResponseData,
  LoginResponseData,
  LogoutResponseData,
  PullResponseData,
  PushResponseData,
  RunCustomCommandResponseData,
  RunCustomQueryResponseData,
  UpdateAndFetchResponseData,
  UpdateAndGetResponseData,
  UpdateMultiResponseData,
  UpdateOneResponseData
} from "./response-data";

import { PreEntity } from "./entity";
import { GeneralTypeMap } from "./type-map";
import {
  EntityNameOf,
  RequestEntityOf,
  ResponseEntityOf,
  EntityExtraParamsOf,
  EntityExtraResultOf
} from "./entity-rest-info-map";
import {
  CustomQueryNameOf,
  CustomCommandNameOf,
  CustomQueryParamsOf,
  CustomCommandParamsOf,
  CustomQueryResultValueOf,
  CustomCommandResultValueOf,
  CustomQueryExtraParamsOf,
  CustomCommandExtraParamsOf,
  CustomQueryExtraResultOf,
  CustomCommandExtraResultOf
} from "./custom-map";
import {
  UserEntityNameOf,
  AuthCredentialsOf,
  ResponseAuthUserOf,
  AuthSessionOf
} from "./auth-command-map";

/**
 * All possible `RequestData` from the given `TypeMap`.
 * `method` property is inferred to specify `ResponseData`'s type.
 *
 * ### Notice
 * TypeScript cannot infer adequete method name from this type
 * when `reqData.method` is used in `switch` or `if` condition when `reqData` is function argument.
 * Use `ResponseDataWithTypeMap` instead.
 *
 *     const concreteReqData: ResponseDataWithTypeMap<TM, N> = reqData; // RequestDataWithTypeMapForResponse<TM, MN, N>
 *     switch (concreteReqData.method) {
 *     // This will go well
 *     }
 */
export type RequestDataWithTypeMapForResponse<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  N extends EveryNameOf<TM, MN>
> = { method: MN } & Extract<
  RequestDataWithTypeMap<
    TM,
    N & EntityNameOf<TM>,
    N & CustomQueryNameOf<TM>,
    N & CustomCommandNameOf<TM>,
    N & UserEntityNameOf<TM>
  >,
  { method: MN }
>;

/**
 * All possible `RequestData` from the given `TypeMap`.
 * The difference from `RequestDataWithTypeMapForResponse` is that this type doesn't have type parameter of method name.
 * Thus, `reqData.method` used in `switch` or `if` condition will be statically inferred when `reqData` is function argument.
 * However, this type cannot specify corresponding `ResponseData`.
 * To do so, use `RequestDataWithTypeMapForResponse`.
 */
export type RequestDataWithTypeMap<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  UN extends UserEntityNameOf<TM>
> =
  | FindRequestData<EN, EntityExtraParamsOf<TM, EN, "find">>
  | FindOneRequestData<EN, EntityExtraParamsOf<TM, EN, "findOne">>
  | GetRequestData<EN, EntityExtraParamsOf<TM, EN, "get">>
  | GetByIdsRequestData<EN, EntityExtraParamsOf<TM, EN, "getByIds">>
  | PullRequestData<EN, EntityExtraParamsOf<TM, EN, "pull">>
  | InsertOneRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>,
      EntityExtraParamsOf<TM, EN, "insertOne">
    >
  | InsertAndGetRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>,
      EntityExtraParamsOf<TM, EN, "insertAndGet">
    >
  | InsertMultiRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>,
      EntityExtraParamsOf<TM, EN, "insertMulti">
    >
  | InsertAndGetMultiRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>,
      EntityExtraParamsOf<TM, EN, "insertAndGetMulti">
    >
  | UpdateOneRequestData<EN, EntityExtraParamsOf<TM, EN, "updateById">>
  | UpdateAndGetRequestData<EN, EntityExtraParamsOf<TM, EN, "updateAndGet">>
  | UpdateMultiRequestData<EN, EntityExtraParamsOf<TM, EN, "updateMulti">>
  | UpdateAndFetchRequestData<EN, EntityExtraParamsOf<TM, EN, "updateAndFetch">>
  | PushRequestData<EN, EntityExtraParamsOf<TM, EN, "push">>
  | DeleteRequestData<EN, EntityExtraParamsOf<TM, EN, "delete">>
  | RunCustomQueryRequestData<
      QN,
      CustomQueryParamsOf<TM, QN & CustomQueryNameOf<TM>>,
      CustomQueryExtraParamsOf<TM, QN>
    >
  | RunCustomCommandRequestData<
      CN,
      CustomCommandParamsOf<TM, CN & CustomCommandNameOf<TM>>,
      CustomCommandExtraParamsOf<TM, CN>
    >
  | LoginRequestData<
      UN,
      AuthCredentialsOf<TM, UN & UserEntityNameOf<TM>>,
      EntityExtraParamsOf<TM, EN, "login">
    >
  | LogoutRequestData<UN, EntityExtraParamsOf<TM, EN, "logout">>;

/**
 * All possible `ResponseData` from the given `TypeMap`, `RequestMethodName` and `EveryNameOf<TM, MN>`.
 */
export type ResponseDataWithTypeMap<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  N extends EveryNameOf<TM, MN>
> = ResponseDataMapWithTypeMap<
  TM,
  N & EntityNameOf<TM>,
  N & CustomQueryNameOf<TM>,
  N & CustomCommandNameOf<TM>,
  N & UserEntityNameOf<TM>
>[MN];

type ResponseDataMapWithTypeMap<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  UN extends UserEntityNameOf<TM>
> = {
  find: FindResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "find">
  >;
  findOne: FindOneResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "findOne">
  >;
  get: GetResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "get">
  >;
  getByIds: GetByIdsResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "getByIds">
  >;
  pull: PullResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "pull">
  >;
  insertOne: InsertOneResponseData<EntityExtraResultOf<TM, EN, "insertOne">>;
  insertMulti: InsertMultiResponseData<
    EntityExtraResultOf<TM, EN, "insertMulti">
  >;
  insertAndGet: InsertAndGetResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "insertAndGet">
  >;
  insertAndGetMulti: InsertAndGetMultiResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "insertAndGetMulti">
  >;
  updateById: UpdateOneResponseData<EntityExtraResultOf<TM, EN, "updateById">>;
  updateMulti: UpdateMultiResponseData<
    EntityExtraResultOf<TM, EN, "updateMulti">
  >;
  updateAndGet: UpdateAndGetResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "updateAndGet">
  >;
  updateAndFetch: UpdateAndFetchResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "updateAndFetch">
  >;
  push: PushResponseData<
    ResponseEntityOf<TM, EN>,
    EntityExtraResultOf<TM, EN, "push">
  >;
  delete: DeleteResponseData<EntityExtraResultOf<TM, EN, "delete">>;
  runCustomQuery: RunCustomQueryResponseData<
    CustomQueryResultValueOf<TM, QN>,
    CustomQueryExtraResultOf<TM, QN>
  >;
  runCustomCommand: RunCustomCommandResponseData<
    CustomCommandResultValueOf<TM, CN>,
    CustomCommandExtraResultOf<TM, CN>
  >;
  login: LoginResponseData<
    UN,
    ResponseAuthUserOf<TM, UN>,
    AuthSessionOf<TM, UN>,
    EntityExtraResultOf<TM, EN, "login">
  >;
  logout: LogoutResponseData<EntityExtraResultOf<TM, EN, "logout">>;
};

/**
 * Every name of given TypeMap including:
 * - EntityName
 * - CustomQueryName
 * - CustomCommandName
 * - UserEntityName
 *
 * 2nd type parameter `MN` is `RequestMethodName`.
 * Only the names compatible with given method name are allowed.
 *
 * ### Example:
 *
 *    type MyTypeMap = {
 *      users: { member: ... },
 *      nonUsers: { message: ... },
 *      customQueries: { countMessagesByMember: ... },
 *      customCommands: { register: ... },
 *    }
 *
 *    type N1 = EveryNameOf<MyTypeMap, "find"> // "member" | "message"
 *    type N2 = EveryNameOf<MyTypeMap, "push"> // "member" | "message"
 *    type N3 = EveryNameOf<MyTypeMap, "runCustomQuery"> // "countMessagesByMember"
 *    type N4 = EveryNameOf<MyTypeMap, "runCustomCommand"> // "register"
 *    type N5 = EveryNameOf<MyTypeMap, "login"> // "member"
 *
 *
 */
export type EveryNameOf<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName
> = MN extends (
  | "find"
  | "findOne"
  | "get"
  | "getByIds"
  | "pull"
  | "insertOne"
  | "insertMulti"
  | "insertAndGet"
  | "insertAndGetMulti"
  | "updateOne"
  | "updateMulti"
  | "updateAndGet"
  | "updateAndFetch"
  | "push"
  | "delete")
  ? EntityNameOf<TM>
  : MN extends "runCustomQuery"
  ? CustomQueryNameOf<TM>
  : MN extends "runCustomCommand"
  ? CustomCommandNameOf<TM>
  : MN extends ("login" | "logout")
  ? UserEntityNameOf<TM>
  : string;
