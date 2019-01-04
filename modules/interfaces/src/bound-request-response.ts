import {
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthOptionsOf,
  BroadEntityOf,
  BroaderAuthUserOf,
  CustomCommandNameOf,
  CustomCommandParamsOf,
  CustomCommandResultValueOf,
  CustomQueryNameOf,
  CustomQueryParamsOf,
  CustomQueryResultValueOf,
  EntityNameOf,
  GeneralTypeMap,
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

export type ResponseDataWithTypeMap<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = {
  type: MN;
  payload: MN extends "find"
    ? FindResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "findOne"
    ? FindOneResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "get"
    ? GetResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "getByIds"
    ? GetByIdsResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "pull"
    ? PullResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "insertOne"
    ? InsertOneResponseData["payload"]
    : MN extends "insertMulti"
    ? InsertMultiResponseData["payload"]
    : MN extends "insertAndGet"
    ? InsertAndGetResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "insertAndGetMulti"
    ? InsertAndGetMultiResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "updateById"
    ? UpdateOneResponseData["payload"]
    : MN extends "updateMulti"
    ? UpdateMultiResponseData["payload"]
    : MN extends "updateAndGet"
    ? UpdateAndGetResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "updateAndFetch"
    ? UpdateAndFetchResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends "push"
    ? PushResponseData<NarrowEntityOf<TM, EN>>["payload"]
    : MN extends ("delete")
    ? DeleteResponseData["payload"]
    : MN extends ("runCustomQuery")
    ? RunCustomQueryResponseData<CustomQueryResultValueOf<TM, QN>>["payload"]
    : MN extends ("runCustomCommand")
    ? RunCustomCommandResponseData<
        CustomCommandResultValueOf<TM, CN>
      >["payload"]
    : MN extends ("login")
    ? LoginResponseData<BroaderAuthUserOf<TM, AN>>["payload"]
    : MN extends ("logout")
    ? LogoutResponseData["payload"]
    : never;
};
