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
 * RequestData handled by EntityDefinition.
 */
export type EntityRequestData<EN extends string, E extends Entity> =
  | FindRequestData<EN>
  | FindOneRequestData<EN>
  | GetRequestData<EN>
  | GetByIdsRequestData<EN>
  | PullRequestData<EN>
  | InsertOneRequestData<EN, PreEntity<E>>
  | InsertMultiRequestData<EN, PreEntity<E>>
  | InsertAndGetRequestData<EN, PreEntity<E>>
  | InsertAndGetMultiRequestData<EN, PreEntity<E>>
  | UpdateOneRequestData<EN>
  | UpdateMultiRequestData<EN>
  | UpdateAndGetRequestData<EN>
  | UpdateAndFetchRequestData<EN>
  | PushRequestData<EN>
  | DeleteRequestData<EN>;

export type EntityRequestMethodName = GeneralEntityRequestData["method"];
/**
 * RequestData handled by EntityDefinition.
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
 * By inputting types to the UserDefinition, the type parameters of this type are inferred in the definition's methods.
 */
export type AuthRequestData<EN extends string, C extends Object> =
  | LoginRequestData<EN, C>
  | LogoutRequestData<EN>;

/**
 * RequestData handled by authentication.
 * Credentials are not validated and any objects can be passed.
 */
export type GeneralAuthRequestData =
  | GeneralLoginRequestData
  | GeneralLogoutRequestData;

export type AuthRequestMethodName = GeneralAuthRequestData["method"];

/**
 * RequestData handled by UserDefinition (EntityRequestData | AuthRequestData).
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type UserEntityRequestData<
  EN extends string,
  E extends Entity,
  C extends Object
> = EntityRequestData<EN, E> | AuthRequestData<EN, C>;

/**
 * RequestData handled by UserDefinition (GeneralEntityRequestData | GeneralAuthRequestData).
 * Credentials are not validated and any objects can be passed.
 */
export type GeneralUserEntityRequestData =
  | GeneralEntityRequestData
  | GeneralAuthRequestData;

export type FindRequestData<N extends string> = {
  method: "find";
  payload: WhereQuery<N>;
  sessionId?: string | null;
};

export type FindOneRequestData<N extends string> = {
  method: "findOne";
  payload: WhereQuery<N>;
  sessionId?: string | null;
};

export type GetRequestData<N extends string> = {
  method: "get";
  payload: IdQuery<N>;
  sessionId?: string | null;
};

export type GetByIdsRequestData<N extends string> = {
  method: "getByIds";
  payload: IdsQuery<N>;
  sessionId?: string | null;
};

export type PullRequestData<N extends string> = {
  method: "pull";
  payload: PullQuery<N>;
  sessionId?: string | null;
};

export type InsertOneRequestData<N extends string, P extends ProEntity> = {
  method: "insertOne";
  payload: SingleInsertCommand<N, P>;
  sessionId?: string | null;
};

export type InsertMultiRequestData<N extends string, P extends ProEntity> = {
  method: "insertMulti";
  payload: MultiInsertCommand<N, P>;
  sessionId?: string | null;
};

export type InsertAndGetRequestData<N extends string, P extends ProEntity> = {
  method: "insertAndGet";
  payload: SingleInsertCommand<N, P>;
  sessionId?: string | null;
};

export type InsertAndGetMultiRequestData<
  N extends string,
  P extends ProEntity
> = {
  method: "insertAndGetMulti";
  payload: MultiInsertCommand<N, P>;
  sessionId?: string | null;
};

export type UpdateOneRequestData<N extends string> = {
  method: "updateById";
  payload: IdUpdateCommand<N>;
  sessionId?: string | null;
};

export type UpdateMultiRequestData<N extends string> = {
  method: "updateMulti";
  payload: MultiUpdateCommand<N>;
  sessionId?: string | null;
};

export type UpdateAndGetRequestData<N extends string> = {
  method: "updateAndGet";
  payload: IdUpdateCommand<N>;
  sessionId?: string | null;
};

export type UpdateAndFetchRequestData<N extends string> = {
  method: "updateAndFetch";
  payload: MultiUpdateCommand<N>;
  sessionId?: string | null;
};

export type PushRequestData<N extends string> = {
  method: "push";
  payload: PushCommand<N>;
  sessionId?: string | null;
};

export type DeleteRequestData<N extends string> = {
  method: "delete";
  payload: DeleteCommand<N>;
  sessionId?: string | null;
};

export type RunCustomQueryRequestData<
  N extends string,
  QP extends ObjectMap
> = {
  method: "runCustomQuery";
  payload: CustomQuery<N, QP>;
  sessionId?: string | null;
};

export type CustomQueryRequestData<
  N extends string,
  QP extends ObjectMap
> = RunCustomQueryRequestData<N, QP>;

export type RunCustomCommandRequestData<
  N extends string,
  CP extends ObjectMap
> = {
  method: "runCustomCommand";
  payload: CustomCommand<N, CP>;
  sessionId?: string | null;
};
export type CustomCommandRequestData<
  N extends string,
  CP extends ObjectMap
> = RunCustomCommandRequestData<N, CP>;

export type LoginRequestData<N extends string, C extends Object> = {
  method: "login";
  payload: LoginCommand<N, C>;
  sessionId?: string | null;
};

export type LogoutRequestData<N extends string> = {
  method: "logout";
  payload: LogoutCommand<N>;
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
