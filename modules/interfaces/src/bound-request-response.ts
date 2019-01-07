import {
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthSessionOf,
  BroadEntityOf,
  CustomCommandNameOf,
  CustomCommandParamsOf,
  CustomCommandResultValueOf,
  CustomQueryNameOf,
  CustomQueryParamsOf,
  CustomQueryResultValueOf,
  EntityNameOf,
  GeneralTypeMap,
  NarrowAuthUserOf,
  NarrowEntityOf
} from "./type-map";
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
> = { method: MN } & Extract<RequestDataWithTypeMap<TM, N>, { method: MN }>;

/**
 * All possible `RequestData` from the given `TypeMap`.
 * The difference from `RequestDataWithTypeMapForResponse` is that this type doesn't have type parameter of method name.
 * Thus, `reqData.method` used in `switch` or `if` condition will be statically inferred when `reqData` is function argument.
 * However, this type cannot specify corresponding `ResponseData`.
 * To do so, use `RequestDataWithTypeMapForResponse`.
 */
export type RequestDataWithTypeMap<
  TM extends GeneralTypeMap,
  N extends EveryNameOf<TM, RequestMethodName>
> =
  | FindRequestData<N>
  | FindOneRequestData<N>
  | GetRequestData<N>
  | GetByIdsRequestData<N>
  | PullRequestData<N>
  | InsertOneRequestData<N, PreEntity<BroadEntityOf<TM, N & EntityNameOf<TM>>>>
  | InsertAndGetRequestData<
      N,
      PreEntity<BroadEntityOf<TM, N & EntityNameOf<TM>>>
    >
  | InsertMultiRequestData<
      N,
      PreEntity<BroadEntityOf<TM, N & EntityNameOf<TM>>>
    >
  | InsertAndGetMultiRequestData<
      N,
      PreEntity<BroadEntityOf<TM, N & EntityNameOf<TM>>>
    >
  | UpdateOneRequestData<N>
  | UpdateAndGetRequestData<N>
  | UpdateMultiRequestData<N>
  | UpdateAndFetchRequestData<N>
  | PushRequestData<N>
  | DeleteRequestData<N>
  | RunCustomQueryRequestData<
      N,
      CustomQueryParamsOf<TM, N & CustomQueryNameOf<TM>>
    >
  | RunCustomCommandRequestData<
      N,
      CustomCommandParamsOf<TM, N & CustomCommandNameOf<TM>>
    >
  | LoginRequestData<N, AuthCredentialsOf<TM, N & AuthEntityNameOf<TM>>>
  | LogoutRequestData<N>;

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
  N & AuthEntityNameOf<TM>
>[MN];

type ResponseDataMapWithTypeMap<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = {
  find: FindResponseData<NarrowEntityOf<TM, EN>>;
  findOne: FindOneResponseData<NarrowEntityOf<TM, EN>>;
  get: GetResponseData<NarrowEntityOf<TM, EN>>;
  getByIds: GetByIdsResponseData<NarrowEntityOf<TM, EN>>;
  pull: PullResponseData<NarrowEntityOf<TM, EN>>;
  insertOne: InsertOneResponseData;
  insertMulti: InsertMultiResponseData;
  insertAndGet: InsertAndGetResponseData<NarrowEntityOf<TM, EN>>;
  insertAndGetMulti: InsertAndGetMultiResponseData<NarrowEntityOf<TM, EN>>;
  updateById: UpdateOneResponseData;
  updateMulti: UpdateMultiResponseData;
  updateAndGet: UpdateAndGetResponseData<NarrowEntityOf<TM, EN>>;
  updateAndFetch: UpdateAndFetchResponseData<NarrowEntityOf<TM, EN>>;
  push: PushResponseData<NarrowEntityOf<TM, EN>>;
  delete: DeleteResponseData;
  runCustomQuery: RunCustomQueryResponseData<CustomQueryResultValueOf<TM, QN>>;
  runCustomCommand: RunCustomCommandResponseData<
    CustomCommandResultValueOf<TM, CN>
  >;
  login: LoginResponseData<AN, NarrowAuthUserOf<TM, AN>, AuthSessionOf<TM, AN>>;
  logout: LogoutResponseData;
};

/**
 * Every name of given TypeMap including:
 * - EntityName
 * - CustomQueryName
 * - CustomCommandName
 * - AuthEntityName
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
  ? AuthEntityNameOf<TM>
  : string;
