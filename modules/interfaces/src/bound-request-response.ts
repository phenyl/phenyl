import {
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthSessionOf,
  RequestEntityOf,
  CustomCommandNameOf,
  CustomCommandParamsOf,
  CustomCommandResultValueOf,
  CustomQueryNameOf,
  CustomQueryParamsOf,
  CustomQueryResultValueOf,
  EntityNameOf,
  GeneralTypeMap,
  ResponseAuthUserOf,
  ResponseEntityOf
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
> = { method: MN } & Extract<
  RequestDataWithTypeMap<
    TM,
    N & EntityNameOf<TM>,
    N & CustomQueryNameOf<TM>,
    N & CustomCommandNameOf<TM>,
    N & AuthEntityNameOf<TM>
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
  AN extends AuthEntityNameOf<TM>
> =
  | FindRequestData<EN>
  | FindOneRequestData<EN>
  | GetRequestData<EN>
  | GetByIdsRequestData<EN>
  | PullRequestData<EN>
  | InsertOneRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>
    >
  | InsertAndGetRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>
    >
  | InsertMultiRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>
    >
  | InsertAndGetMultiRequestData<
      EN,
      PreEntity<RequestEntityOf<TM, EN & EntityNameOf<TM>>>
    >
  | UpdateOneRequestData<EN>
  | UpdateAndGetRequestData<EN>
  | UpdateMultiRequestData<EN>
  | UpdateAndFetchRequestData<EN>
  | PushRequestData<EN>
  | DeleteRequestData<EN>
  | RunCustomQueryRequestData<
      QN,
      CustomQueryParamsOf<TM, QN & CustomQueryNameOf<TM>>
    >
  | RunCustomCommandRequestData<
      CN,
      CustomCommandParamsOf<TM, CN & CustomCommandNameOf<TM>>
    >
  | LoginRequestData<AN, AuthCredentialsOf<TM, AN & AuthEntityNameOf<TM>>>
  | LogoutRequestData<AN>;

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
  find: FindResponseData<ResponseEntityOf<TM, EN>>;
  findOne: FindOneResponseData<ResponseEntityOf<TM, EN>>;
  get: GetResponseData<ResponseEntityOf<TM, EN>>;
  getByIds: GetByIdsResponseData<ResponseEntityOf<TM, EN>>;
  pull: PullResponseData<ResponseEntityOf<TM, EN>>;
  insertOne: InsertOneResponseData;
  insertMulti: InsertMultiResponseData;
  insertAndGet: InsertAndGetResponseData<ResponseEntityOf<TM, EN>>;
  insertAndGetMulti: InsertAndGetMultiResponseData<ResponseEntityOf<TM, EN>>;
  updateById: UpdateOneResponseData;
  updateMulti: UpdateMultiResponseData;
  updateAndGet: UpdateAndGetResponseData<ResponseEntityOf<TM, EN>>;
  updateAndFetch: UpdateAndFetchResponseData<ResponseEntityOf<TM, EN>>;
  push: PushResponseData<ResponseEntityOf<TM, EN>>;
  delete: DeleteResponseData;
  runCustomQuery: RunCustomQueryResponseData<CustomQueryResultValueOf<TM, QN>>;
  runCustomCommand: RunCustomCommandResponseData<
    CustomCommandResultValueOf<TM, CN>
  >;
  login: LoginResponseData<AN, ResponseAuthUserOf<TM, AN>, AuthSessionOf<TM, AN>>;
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
