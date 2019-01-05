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

export type RequestDataWithTypeMap<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = { method: MN } & Extract<
  | FindRequestData<EN>
  | FindOneRequestData<EN>
  | GetRequestData<EN>
  | GetByIdsRequestData<EN>
  | PullRequestData<EN>
  | InsertOneRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>
  | InsertAndGetRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>
  | InsertMultiRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>
  | InsertAndGetMultiRequestData<EN, PreEntity<BroadEntityOf<TM, EN>>>
  | UpdateOneRequestData<EN>
  | UpdateAndGetRequestData<EN>
  | UpdateMultiRequestData<EN>
  | UpdateAndFetchRequestData<EN>
  | PushRequestData<EN>
  | DeleteRequestData<EN>
  | RunCustomQueryRequestData<QN, CustomQueryParamsOf<TM, QN>>
  | RunCustomCommandRequestData<CN, CustomCommandParamsOf<TM, CN>>
  | LoginRequestData<AN, AuthCredentialsOf<TM, AN>>
  | LogoutRequestData<AN>,
  { method: MN }
>;

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

export type ResponseDataWithTypeMap<
  TM extends GeneralTypeMap,
  MN extends RequestMethodName,
  EN extends EntityNameOf<TM>,
  QN extends CustomQueryNameOf<TM>,
  CN extends CustomCommandNameOf<TM>,
  AN extends AuthEntityNameOf<TM>
> = ResponseDataMapWithTypeMap<TM, EN, QN, CN, AN>[MN];
