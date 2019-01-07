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

/**
 * Type of request data handled in servers and clients.
 * This is a union type of all specific RequestData, so parameters cannot be inferred using this type.
 */
export type GeneralRequestData<N extends string = string> =
  | GeneralEntityRequestData<N>
  | GeneralCustomQueryRequestData<N>
  | GeneralCustomCommandRequestData<N>
  | GeneralAuthRequestData<N>;

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

/**
 * RequestData handled by EntityDefinition.
 * Pre-entity values in isnert data are not validated and any objects can be passed.
 */
export type GeneralEntityRequestData<N extends string = string> =
  | FindRequestData<N>
  | FindOneRequestData<N>
  | GetRequestData<N>
  | GetByIdsRequestData<N>
  | PullRequestData<N>
  | InsertOneRequestData<N, ProEntity>
  | InsertMultiRequestData<N, ProEntity>
  | InsertAndGetRequestData<N, ProEntity>
  | InsertAndGetMultiRequestData<N, ProEntity>
  | UpdateOneRequestData<N>
  | UpdateMultiRequestData<N>
  | UpdateAndGetRequestData<N>
  | UpdateAndFetchRequestData<N>
  | PushRequestData<N>
  | DeleteRequestData<N>;

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
export type GeneralAuthRequestData<
  EN extends string = string
> = AuthRequestData<EN, Object>;

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
export type GeneralUserEntityRequestData<EN extends string = string> =
  | GeneralEntityRequestData<EN>
  | GeneralAuthRequestData<EN>;

/**
 * RequestData handled by CustomQueryDefinition.
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type CustomQueryRequestData<
  QN extends string,
  QP extends Object
> = RunCustomQueryRequestData<QN, QP>;

/**
 * RequestData handled by CustomQueryDefinition.
 * Params are not validated and any objects can be passed.
 */
export type GeneralCustomQueryRequestData<
  QN extends string = string
> = CustomQueryRequestData<QN, Object>;

/**
 * RequestData handled by CustomCommandDefinition.
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type CustomCommandRequestData<
  N extends string,
  CP extends Object
> = RunCustomCommandRequestData<N, CP>;

/**
 * RequestData handled by CustomCommandDefinition.
 * Params are not validated and any objects can be passed.
 */
export type GeneralCustomCommandRequestData<
  CN extends string = string
> = CustomCommandRequestData<CN, Object>;

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

export type RunCustomQueryRequestData<N extends string, QP extends Object> = {
  method: "runCustomQuery";
  payload: CustomQuery<N, QP>;
  sessionId?: string | null;
};

export type RunCustomCommandRequestData<N extends string, P extends Object> = {
  method: "runCustomCommand";
  payload: CustomCommand<N, P>;
  sessionId?: string | null;
};

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
