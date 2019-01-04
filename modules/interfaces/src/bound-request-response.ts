import {
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthOptionsOf,
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

export type RequestDataWithTypeMap<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = {
  method: MN;
  payload: MN extends "find"
    ? FindRequestData<EN>["payload"]
    : MN extends "findOne"
    ? FindOneRequestData<EN>["payload"]
    : MN extends "get"
    ? GetRequestData<EN>["payload"]
    : MN extends "getByIds"
    ? GetByIdsRequestData<EN>["payload"]
    : MN extends "pull"
    ? PullRequestData<EN>["payload"]
    : MN extends "insertOne"
    ? InsertOneRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>["payload"]
    : MN extends "insertAndGet"
    ? InsertAndGetRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>["payload"]
    : MN extends "insertMulti"
    ? InsertMultiRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>["payload"]
    : MN extends "insertAndGetMulti"
    ? InsertAndGetMultiRequestData<
        EN,
        PreEntity<BroadEntityOf<TM, EN>>
      >["payload"]
    : MN extends "updateById"
    ? UpdateOneRequestData<EN>["payload"]
    : MN extends "updateAndGet"
    ? UpdateAndGetRequestData<EN>["payload"]
    : MN extends "updateMulti"
    ? UpdateMultiRequestData<EN>["payload"]
    : MN extends "updateAndFetch"
    ? UpdateAndFetchRequestData<EN>["payload"]
    : MN extends "push"
    ? PushRequestData<EN>["payload"]
    : MN extends "delete"
    ? DeleteRequestData<EN>["payload"]
    : MN extends "runCustomQuery"
    ? RunCustomQueryRequestData<QN, CustomQueryParamsOf<TM, QN>>["payload"]
    : MN extends "runCustomCommand"
    ? RunCustomCommandRequestData<CN, CustomCommandParamsOf<TM, CN>>["payload"]
    : MN extends "login"
    ? LoginRequestData<
        AN,
        AuthCredentialsOf<TM, AN>,
        AuthOptionsOf<TM, AN>
      >["payload"]
    : MN extends "logout"
    ? LogoutRequestData<AN>["payload"]
    : never;
  sessionId?: string | null | undefined;
};

type ResponseDataMapWithTypeMap<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = {
  find: {
    type: "find";
    payload: FindResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  findOne: {
    type: "findOne";
    payload: FindOneResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  get: {
    type: "get";
    payload: GetResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  getByIds: {
    type: "getByIds";
    payload: GetByIdsResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  pull: {
    type: "pull";
    payload: PullResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  insertOne: {
    type: "insertOne";
    payload: InsertOneResponseData["payload"];
  };
  insertMulti: {
    type: "insertMulti";
    payload: InsertMultiResponseData["payload"];
  };
  insertAndGet: {
    type: "insertAndGet";
    payload: InsertAndGetResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  insertAndGetMulti: {
    type: "insertAndGetMulti";
    payload: InsertAndGetMultiResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  updateById: {
    type: "updateById";
    payload: UpdateOneResponseData["payload"];
  };
  updateMulti: {
    type: "updateMulti";
    payload: UpdateMultiResponseData["payload"];
  };
  updateAndGet: {
    type: "updateAndGet";
    payload: UpdateAndGetResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  updateAndFetch: {
    type: "updateAndFetch";
    payload: UpdateAndFetchResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  push: {
    type: "push";
    payload: PushResponseData<NarrowEntityOf<TM, EN>>["payload"];
  };
  delete: { type: "delete"; payload: DeleteResponseData["payload"] };
  runCustomQuery: {
    type: "runCustomQuery";
    payload: RunCustomQueryResponseData<
      CustomQueryResultValueOf<TM, QN>
    >["payload"];
  };
  runCustomCommand: {
    type: "runCustomCommand";
    payload: RunCustomCommandResponseData<
      CustomCommandResultValueOf<TM, CN>
    >["payload"];
  };
  login: {
    type: "login";
    payload: LoginResponseData<NarrowAuthUserOf<TM, AN>>["payload"];
  };
  logout: { type: "logout"; payload: LogoutResponseData["payload"] };
};

export type ResponseDataWithTypeMap<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = ResponseDataMapWithTypeMap<TM, EN, QN, CN, AN>[MN];
