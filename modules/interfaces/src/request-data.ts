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
import { CustomQuery, IdQuery, IdsQuery, PullQuery, WhereQuery } from "./query";
import { Entity, PreEntity, ProEntity } from "./entity";
import { ObjectMap } from "./utils";
import {
  ExtraParamsMethodMap,
  EntityExtraParamsByMethodMap
} from "./entity-rest-info-map";
import { ExtraParams } from "./extra";

/**
 * Type of request data handled in servers and clients.
 * This is a union type of all specific RequestData, so parameters cannot be inferred using this type.
 */
export type GeneralRequestData =
  | GeneralEntityRequestData
  | GeneralCustomQueryRequestData
  | GeneralCustomCommandRequestData
  | GeneralAuthRequestData;

/**
 * Acceptable method name in RequestData.
 */
export type RequestMethodName = GeneralRequestData["method"];

/**
 * RequestData handled by EntityRestApiDefinition.
 */
export type EntityRequestData<
  EN extends string,
  E extends Entity,
  EPMM extends ExtraParamsMethodMap = ExtraParamsMethodMap
> =
  | FindRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "find">>
  | FindOneRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "findOne">>
  | GetRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "get">>
  | GetByIdsRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "getByIds">>
  | PullRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "pull">>
  | InsertOneRequestData<
      EN,
      PreEntity<E>,
      EntityExtraParamsByMethodMap<EPMM, "insertOne">
    >
  | InsertMultiRequestData<
      EN,
      PreEntity<E>,
      EntityExtraParamsByMethodMap<EPMM, "insertMulti">
    >
  | InsertAndGetRequestData<
      EN,
      PreEntity<E>,
      EntityExtraParamsByMethodMap<EPMM, "insertAndGet">
    >
  | InsertAndGetMultiRequestData<
      EN,
      PreEntity<E>,
      EntityExtraParamsByMethodMap<EPMM, "insertAndGetMulti">
    >
  | UpdateOneRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "updateById">>
  | UpdateMultiRequestData<
      EN,
      EntityExtraParamsByMethodMap<EPMM, "updateMulti">
    >
  | UpdateAndGetRequestData<
      EN,
      EntityExtraParamsByMethodMap<EPMM, "updateAndGet">
    >
  | UpdateAndFetchRequestData<
      EN,
      EntityExtraParamsByMethodMap<EPMM, "updateAndFetch">
    >
  | PushRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "push">>
  | DeleteRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "delete">>;

export type EntityRequestMethodName = GeneralEntityRequestData["method"];
/**
 * RequestData handled by EntityRestApiDefinition.
 * Pre-entity values in isnert data are not validated and any objects can be passed.
 */
export type GeneralEntityRequestData =
  | GeneralFindRequestData
  | GeneralFindOneRequestData
  | GeneralGetRequestData
  | GeneralGetByIdsRequestData
  | GeneralPullRequestData
  | GeneralInsertOneRequestData
  | GeneralInsertMultiRequestData
  | GeneralInsertAndGetRequestData
  | GeneralInsertAndGetMultiRequestData
  | GeneralUpdateOneRequestData
  | GeneralUpdateMultiRequestData
  | GeneralUpdateAndGetRequestData
  | GeneralUpdateAndFetchRequestData
  | GeneralPushRequestData
  | GeneralDeleteRequestData;

/**
 * RequestData handled by authentication.
 * By inputting types to the UserRestApiDefinition, the type parameters of this type are inferred in the definition's methods.
 */
export type AuthRequestData<
  EN extends string,
  C extends Object,
  EPMM extends ExtraParamsMethodMap = ExtraParamsMethodMap
> =
  | LoginRequestData<EN, C, EntityExtraParamsByMethodMap<EPMM, "login">>
  | LogoutRequestData<EN, EntityExtraParamsByMethodMap<EPMM, "logout">>;

/**
 * RequestData handled by authentication.
 * Credentials are not validated and any objects can be passed.
 */
export type GeneralAuthRequestData =
  | GeneralLoginRequestData
  | GeneralLogoutRequestData;

export type AuthRequestMethodName = GeneralAuthRequestData["method"];

/**
 * RequestData handled by UserRestApiDefinition (EntityRequestData | AuthRequestData).
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type UserEntityRequestData<
  EN extends string,
  E extends Entity,
  C extends Object,
  EPMM extends ExtraParamsMethodMap = ExtraParamsMethodMap
> = EntityRequestData<EN, E, EPMM> | AuthRequestData<EN, C, EPMM>;

/**
 * RequestData handled by UserRestApiDefinition (GeneralEntityRequestData | GeneralAuthRequestData).
 * Credentials are not validated and any objects can be passed.
 */
export type GeneralUserEntityRequestData =
  | GeneralEntityRequestData
  | GeneralAuthRequestData;

export type FindRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "find";
  payload: WhereQuery<N, EP>;
  sessionId?: string | null;
};

export type FindOneRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "findOne";
  payload: WhereQuery<N, EP>;
  sessionId?: string | null;
};

export type GetRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "get";
  payload: IdQuery<N, EP>;
  sessionId?: string | null;
};

export type GetByIdsRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "getByIds";
  payload: IdsQuery<N, EP>;
  sessionId?: string | null;
};

export type PullRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "pull";
  payload: PullQuery<N, EP>;
  sessionId?: string | null;
};

export type InsertOneRequestData<
  N extends string,
  P extends ProEntity,
  EP extends ExtraParams = ExtraParams
> = {
  method: "insertOne";
  payload: SingleInsertCommand<N, P, EP>;
  sessionId?: string | null;
};

export type InsertMultiRequestData<
  N extends string,
  P extends ProEntity,
  EP extends ExtraParams = ExtraParams
> = {
  method: "insertMulti";
  payload: MultiInsertCommand<N, P, EP>;
  sessionId?: string | null;
};

export type InsertAndGetRequestData<
  N extends string,
  P extends ProEntity,
  EP extends ExtraParams = ExtraParams
> = {
  method: "insertAndGet";
  payload: SingleInsertCommand<N, P, EP>;
  sessionId?: string | null;
};

export type InsertAndGetMultiRequestData<
  N extends string,
  P extends ProEntity,
  EP extends ExtraParams = ExtraParams
> = {
  method: "insertAndGetMulti";
  payload: MultiInsertCommand<N, P, EP>;
  sessionId?: string | null;
};

export type UpdateOneRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "updateById";
  payload: IdUpdateCommand<N, EP>;
  sessionId?: string | null;
};

export type UpdateMultiRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "updateMulti";
  payload: MultiUpdateCommand<N, EP>;
  sessionId?: string | null;
};

export type UpdateAndGetRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "updateAndGet";
  payload: IdUpdateCommand<N, EP>;
  sessionId?: string | null;
};

export type UpdateAndFetchRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "updateAndFetch";
  payload: MultiUpdateCommand<N, EP>;
  sessionId?: string | null;
};

export type PushRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "push";
  payload: PushCommand<N, EP>;
  sessionId?: string | null;
};

export type DeleteRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "delete";
  payload: DeleteCommand<N, EP>;
  sessionId?: string | null;
};

export type RunCustomQueryRequestData<
  N extends string,
  QP extends ObjectMap,
  EP extends ExtraParams = ExtraParams
> = {
  method: "runCustomQuery";
  payload: CustomQuery<N, QP, EP>;
  sessionId?: string | null;
};

export type CustomQueryRequestData<
  N extends string,
  QP extends ObjectMap,
  EP extends ExtraParams = ExtraParams
> = RunCustomQueryRequestData<N, QP, EP>;

export type RunCustomCommandRequestData<
  N extends string,
  CP extends ObjectMap,
  EP extends ExtraParams = ExtraParams
> = {
  method: "runCustomCommand";
  payload: CustomCommand<N, CP, EP>;
  sessionId?: string | null;
};
export type CustomCommandRequestData<
  N extends string,
  CP extends ObjectMap,
  EP extends ExtraParams = ExtraParams
> = RunCustomCommandRequestData<N, CP, EP>;

export type LoginRequestData<
  N extends string,
  C extends Object,
  EP extends ExtraParams = ExtraParams
> = {
  method: "login";
  payload: LoginCommand<N, C, EP>;
  sessionId?: string | null;
};

export type LogoutRequestData<
  N extends string,
  EP extends ExtraParams = ExtraParams
> = {
  method: "logout";
  payload: LogoutCommand<N, EP>;
  sessionId?: string | null;
};

export type GeneralFindRequestData = FindRequestData<string>;

export type GeneralFindOneRequestData = FindOneRequestData<string>;

export type GeneralGetRequestData = GetRequestData<string>;

export type GeneralGetByIdsRequestData = GetByIdsRequestData<string>;

export type GeneralPullRequestData = PullRequestData<string>;

export type GeneralInsertOneRequestData = InsertOneRequestData<
  string,
  ProEntity
>;

export type GeneralInsertMultiRequestData = InsertMultiRequestData<
  string,
  ProEntity
>;

export type GeneralInsertAndGetRequestData = InsertAndGetRequestData<
  string,
  ProEntity
>;

export type GeneralInsertAndGetMultiRequestData = InsertAndGetMultiRequestData<
  string,
  ProEntity
>;

export type GeneralUpdateOneRequestData = UpdateOneRequestData<string>;

export type GeneralUpdateMultiRequestData = UpdateMultiRequestData<string>;

export type GeneralUpdateAndGetRequestData = UpdateAndGetRequestData<string>;

export type GeneralUpdateAndFetchRequestData = UpdateAndFetchRequestData<
  string
>;

export type GeneralPushRequestData = PushRequestData<string>;

export type GeneralDeleteRequestData = DeleteRequestData<string>;

export type GeneralRunCustomQueryRequestData = RunCustomQueryRequestData<
  string,
  ObjectMap
>;
// Alias
export type GeneralCustomQueryRequestData = GeneralRunCustomQueryRequestData;

export type GeneralRunCustomCommandRequestData = RunCustomCommandRequestData<
  string,
  ObjectMap
>;

// Alias
export type GeneralCustomCommandRequestData = GeneralRunCustomCommandRequestData;

export type GeneralLoginRequestData = LoginRequestData<string, Object>;

export type GeneralLogoutRequestData = LogoutRequestData<string>;
