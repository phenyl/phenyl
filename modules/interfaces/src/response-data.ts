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
import {
  CustomQueryResultObject,
  CustomCommandResultObject,
  ExtraResult
} from "./extra";
import {
  ExtraResultMethodMap,
  EntityExtraResultByMethodMap
} from "./entity-rest-info-map";

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
 * ResponseData handled by EntityRestApiDefinition.
 */
export type EntityResponseData<
  E extends Entity,
  ERMM extends ExtraResultMethodMap = ExtraResultMethodMap
> =
  | FindResponseData<E, EntityExtraResultByMethodMap<ERMM, "find">>
  | FindOneResponseData<E, EntityExtraResultByMethodMap<ERMM, "findOne">>
  | GetResponseData<E, EntityExtraResultByMethodMap<ERMM, "get">>
  | GetByIdsResponseData<E, EntityExtraResultByMethodMap<ERMM, "getByIds">>
  | PullResponseData<E, EntityExtraResultByMethodMap<ERMM, "pull">>
  | InsertOneResponseData<EntityExtraResultByMethodMap<ERMM, "insertOne">>
  | InsertMultiResponseData<EntityExtraResultByMethodMap<ERMM, "insertMulti">>
  | InsertAndGetResponseData<
      E,
      EntityExtraResultByMethodMap<ERMM, "insertAndGet">
    >
  | InsertAndGetMultiResponseData<
      E,
      EntityExtraResultByMethodMap<ERMM, "insertAndGetMulti">
    >
  | UpdateOneResponseData<EntityExtraResultByMethodMap<ERMM, "updateById">>
  | UpdateMultiResponseData<EntityExtraResultByMethodMap<ERMM, "updateMulti">>
  | UpdateAndGetResponseData<
      E,
      EntityExtraResultByMethodMap<ERMM, "updateAndGet">
    >
  | UpdateAndFetchResponseData<
      E,
      EntityExtraResultByMethodMap<ERMM, "updateAndFetch">
    >
  | PushResponseData<E, EntityExtraResultByMethodMap<ERMM, "push">>
  | DeleteResponseData<EntityExtraResultByMethodMap<ERMM, "delete">>
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
  S extends Object,
  ERMM extends ExtraResultMethodMap = ExtraResultMethodMap
> =
  | LoginResponseData<EN, E, S, EntityExtraResultByMethodMap<ERMM, "login">>
  | LogoutResponseData<EntityExtraResultByMethodMap<ERMM, "logout">>
  | ErrorResponseData;

export type GeneralAuthResponseData =
  | GeneralLoginResponseData
  | GeneralLogoutResponseData
  | ErrorResponseData;

/**
 * ResponseData handled by UserDefinition (EntityResponseData | AuthResponseData).
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type UserEntityResponseData<
  EN extends string,
  E extends Entity,
  S extends Object,
  ERMM extends ExtraResultMethodMap = ExtraResultMethodMap
> = EntityResponseData<E, ERMM> | AuthResponseData<EN, E, S, ERMM>;

export type GeneralUserEntityResponseData =
  | GeneralEntityResponseData
  | GeneralAuthResponseData;

/**
 * ResponseData handled by CustomQueryDefinition.
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type CustomQueryResponseData<
  QR extends CustomQueryResultObject,
  ER extends ExtraResult = ExtraResult
> = RunCustomQueryResponseData<QR, ER>;

/**
 * ResponseData handled by CustomCommandDefinition.
 * By inputting types to the definition, the type parameters of this type are inferred in the definition's methods.
 */
export type CustomCommandResponseData<
  CR extends CustomCommandResultObject,
  ER extends ExtraResult = ExtraResult
> = RunCustomCommandResponseData<CR, ER>;

export type FindResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "find";
  payload: QueryResult<E, ER>;
};

export type FindOneResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "findOne";
  payload: SingleQueryResult<E, ER>;
};

export type GetResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "get";
  payload: SingleQueryResult<E, ER>;
};

export type GetByIdsResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "getByIds";
  payload: QueryResult<E, ER>;
};

export type PullResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "pull";
  payload: PullQueryResult<E, ER>;
};

export type InsertOneResponseData<ER extends ExtraResult = ExtraResult> = {
  type: "insertOne";
  payload: SingleInsertCommandResult<ER>;
};

export type InsertMultiResponseData<ER extends ExtraResult = ExtraResult> = {
  type: "insertMulti";
  payload: MultiInsertCommandResult<ER>;
};

export type InsertAndGetResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "insertAndGet";
  payload: GetCommandResult<E, ER>;
};

export type InsertAndGetMultiResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "insertAndGetMulti";
  payload: MultiValuesCommandResult<E, ER>;
};

export type UpdateOneResponseData<ER extends ExtraResult = ExtraResult> = {
  type: "updateById";
  payload: IdUpdateCommandResult<ER>;
};

export type UpdateMultiResponseData<ER extends ExtraResult = ExtraResult> = {
  type: "updateMulti";
  payload: MultiUpdateCommandResult<ER>;
};

export type UpdateAndGetResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "updateAndGet";
  payload: GetCommandResult<E, ER>;
};

export type UpdateAndFetchResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "updateAndFetch";
  payload: MultiValuesCommandResult<E, ER>;
};

export type PushResponseData<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  type: "push";
  payload: PushCommandResult<E, ER>;
};

export type DeleteResponseData<ER extends ExtraResult = ExtraResult> = {
  type: "delete";
  payload: DeleteCommandResult<ER>;
};

export type RunCustomQueryResponseData<
  QR extends CustomQueryResultObject,
  ER extends ExtraResult = ExtraResult
> = {
  type: "runCustomQuery";
  payload: CustomQueryResult<QR, ER>;
};

export type RunCustomCommandResponseData<
  CR extends CustomCommandResultObject,
  ER extends ExtraResult = ExtraResult
> = {
  type: "runCustomCommand";
  payload: CustomCommandResult<CR, ER>;
};

export type LoginResponseData<
  EN extends string,
  E extends Entity,
  S extends Object,
  ER extends ExtraResult = ExtraResult
> = {
  type: "login";
  payload: LoginCommandResult<EN, E, S, ER>;
};

export type LogoutResponseData<ER extends ExtraResult = ExtraResult> = {
  type: "logout";
  payload: LogoutCommandResult<ER>;
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
  CustomQueryResultObject
>;
export type GeneralCustomQueryResponseData = GeneralRunCustomQueryResponseData;
export type GeneralCustomCommandResponseData = GeneralRunCustomCommandResponseData;
export type GeneralRunCustomCommandResponseData = RunCustomCommandResponseData<
  CustomCommandResultObject
>;
export type GeneralLoginResponseData = LoginResponseData<
  string,
  Entity,
  Object
>;
export type GeneralLogoutResponseData = LogoutResponseData;
