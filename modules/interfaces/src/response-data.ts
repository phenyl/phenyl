import {
  CustomCommandResult,
  DeleteCommandResult,
  GetCommandResult,
  IdUpdateCommandResult,
  LoginCommandResult,
  LogoutCommandResult,
  MultiInsertCommandResult,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  PushCommandResult,
  SingleInsertCommandResult
} from "./command-result";
import {
  CustomQueryResult,
  PullQueryResult,
  QueryResult,
  SingleQueryResult
} from "./query-result";

import { Entity } from "./entity";
import { ServerError } from "./error";

/**
 * Type of response data handled in servers and clients.
 * This is a union type of all specific ResponseData, so parameters cannot be inferred using this type.
 */
export type GeneralResponseData =
  | GeneralFindResponseData
  | GeneralFindOneResponseData
  | GeneralGetResponseData
  | GeneralGetByIdsResponseData
  | GeneralPullResponseData
  | GeneralInsertOneResponseData
  | GeneralInsertMultiResponseData
  | GeneralInsertAndGetResponseData
  | GeneralInsertAndGetMultiResponseData
  | GeneralUpdateOneResponseData
  | GeneralUpdateMultiResponseData
  | GeneralUpdateAndGetResponseData
  | GeneralUpdateAndFetchResponseData
  | GeneralPushResponseData
  | GeneralDeleteResponseData
  | GeneralRunCustomQueryResponseData
  | GeneralRunCustomCommandResponseData
  | GeneralLoginResponseData
  | GeneralLogoutResponseData
  | ErrorResponseData;

/**
 * ResponseData handled by EntityDefinition.
 */
export type EntityResponseData<E extends Entity> =
  | FindResponseData<E>
  | FindOneResponseData<E>
  | GetResponseData<E>
  | GetByIdsResponseData<E>
  | PullResponseData<E>
  | InsertOneResponseData
  | InsertMultiResponseData
  | InsertAndGetResponseData<E>
  | InsertAndGetMultiResponseData<E>
  | UpdateOneResponseData
  | UpdateMultiResponseData
  | UpdateAndGetResponseData<E>
  | UpdateAndFetchResponseData<E>
  | PushResponseData<E>
  | DeleteResponseData
  | ErrorResponseData;

export type GeneralEntityResponseData =
  | GeneralFindResponseData
  | GeneralFindOneResponseData
  | GeneralGetResponseData
  | GeneralGetByIdsResponseData
  | GeneralPullResponseData
  | GeneralInsertOneResponseData
  | GeneralInsertMultiResponseData
  | GeneralInsertAndGetResponseData
  | GeneralInsertAndGetMultiResponseData
  | GeneralUpdateOneResponseData
  | GeneralUpdateMultiResponseData
  | GeneralUpdateAndGetResponseData
  | GeneralUpdateAndFetchResponseData
  | GeneralPushResponseData
  | GeneralDeleteResponseData
  | ErrorResponseData;

/**
 * ResponseData handled by authentication.
 * By inputting types to the UserDefinition, the type parameters of this type are inferred in the definition's methods.
 */
export type AuthResponseData<
  EN extends string,
  E extends Entity,
  S extends Object
> = LoginResponseData<EN, E, S> | LogoutResponseData | ErrorResponseData;

export type GeneralAuthResponseData =
  | GeneralLoginResponseData
  | GeneralLogoutResponseData
  | ErrorResponseData;

/**
 * ResponseData handled by UserDefinition (EntityResponseData | AuthResponseData).
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type UserEntityResponseData<
  EN extends string = string,
  E extends Entity = Entity,
  S extends Object = Object
> = EntityResponseData<E> | AuthResponseData<EN, E, S>;

export type GeneralUserEntityResponseData =
  | GeneralEntityResponseData
  | GeneralAuthResponseData;

/**
 * ResponseData handled by CustomQueryDefinition.
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type CustomQueryResponseData<
  QR extends Object
> = RunCustomQueryResponseData<QR>;

/**
 * ResponseData handled by CustomCommandDefinition.
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type CustomCommandResponseData<
  CR extends Object
> = RunCustomCommandResponseData<CR>;

export type FindResponseData<E extends Entity> = {
  type: "find";
  payload: QueryResult<E>;
};

export type FindOneResponseData<E extends Entity> = {
  type: "findOne";
  payload: SingleQueryResult<E>;
};

export type GetResponseData<E extends Entity> = {
  type: "get";
  payload: SingleQueryResult<E>;
};

export type GetByIdsResponseData<E extends Entity> = {
  type: "getByIds";
  payload: QueryResult<E>;
};

export type PullResponseData<E extends Entity> = {
  type: "pull";
  payload: PullQueryResult<E>;
};

export type InsertOneResponseData = {
  type: "insertOne";
  payload: SingleInsertCommandResult;
};

export type InsertMultiResponseData = {
  type: "insertMulti";
  payload: MultiInsertCommandResult;
};

export type InsertAndGetResponseData<E extends Entity> = {
  type: "insertAndGet";
  payload: GetCommandResult<E>;
};

export type InsertAndGetMultiResponseData<E extends Entity> = {
  type: "insertAndGetMulti";
  payload: MultiValuesCommandResult<E>;
};

export type UpdateOneResponseData = {
  type: "updateById";
  payload: IdUpdateCommandResult;
};

export type UpdateMultiResponseData = {
  type: "updateMulti";
  payload: MultiUpdateCommandResult;
};

export type UpdateAndGetResponseData<E extends Entity> = {
  type: "updateAndGet";
  payload: GetCommandResult<E>;
};

export type UpdateAndFetchResponseData<E extends Entity> = {
  type: "updateAndFetch";
  payload: MultiValuesCommandResult<E>;
};

export type PushResponseData<E extends Entity> = {
  type: "push";
  payload: PushCommandResult<E>;
};

export type DeleteResponseData = {
  type: "delete";
  payload: DeleteCommandResult;
};

export type RunCustomQueryResponseData<QR extends Object> = {
  type: "runCustomQuery";
  payload: CustomQueryResult<QR>;
};

export type RunCustomCommandResponseData<CR extends Object> = {
  type: "runCustomCommand";
  payload: CustomCommandResult<CR>;
};

export type LoginResponseData<
  EN extends string,
  E extends Entity,
  S extends Object
> = {
  type: "login";
  payload: LoginCommandResult<EN, E, S>;
};

export type LogoutResponseData = {
  type: "logout";
  payload: LogoutCommandResult;
};

export type ErrorResponseData = {
  type: "error";
  payload: ServerError;
};

export type GeneralFindResponseData = FindResponseData<Entity>;
export type GeneralFindOneResponseData = FindOneResponseData<Entity>;
export type GeneralGetResponseData = GetResponseData<Entity>;
export type GeneralGetByIdsResponseData = GetByIdsResponseData<Entity>;
export type GeneralPullResponseData = PullResponseData<Entity>;
export type GeneralInsertOneResponseData = InsertOneResponseData;
export type GeneralInsertMultiResponseData = InsertMultiResponseData;
export type GeneralInsertAndGetResponseData = InsertAndGetResponseData<Entity>;
export type GeneralInsertAndGetMultiResponseData = InsertAndGetMultiResponseData<
  Entity
>;
export type GeneralUpdateOneResponseData = UpdateOneResponseData;
export type GeneralUpdateMultiResponseData = UpdateMultiResponseData;
export type GeneralUpdateAndGetResponseData = UpdateAndGetResponseData<Entity>;
export type GeneralUpdateAndFetchResponseData = UpdateAndFetchResponseData<
  Entity
>;
export type GeneralPushResponseData = PushResponseData<Entity>;
export type GeneralDeleteResponseData = DeleteResponseData;
export type GeneralRunCustomQueryResponseData = RunCustomQueryResponseData<
  Object
>;
export type GeneralCustomQueryResponseData = GeneralRunCustomQueryResponseData;
export type GeneralCustomCommandResponseData = GeneralRunCustomCommandResponseData;
export type GeneralRunCustomCommandResponseData = RunCustomCommandResponseData<
  Object
>;
export type GeneralLoginResponseData = LoginResponseData<
  string,
  Entity,
  Object
>;
export type GeneralLogoutResponseData = LogoutResponseData;
