import { GeneralTypeMap } from "./type-map";
import {
  EntityNameOf,
  ResponseEntityOf,
  EntityExtraResultOf
} from "./entity-rest-info-map";
import {
  QueryResult,
  SingleQueryResult,
  PullQueryResult,
  CustomQueryResult
} from "./query-result";
import {
  SingleInsertCommandResult,
  MultiInsertCommandResult,
  GetCommandResult,
  MultiValuesCommandResult,
  IdUpdateCommandResult,
  MultiUpdateCommandResult,
  PushCommandResult,
  DeleteCommandResult,
  CustomCommandResult,
  LoginCommandResult,
  LogoutCommandResult
} from "./command-result";
import {
  CustomQueryNameOf,
  CustomQueryResultValueOf,
  CustomQueryExtraResultOf,
  CustomCommandResultValueOf,
  CustomCommandExtraResultOf
} from "./custom-map";
import { UserEntityNameOf, AuthSessionOf } from "./auth-command-map";

export type QueryResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "find" | "getByIds"
> = QueryResult<ResponseEntityOf<TM, EN>, EntityExtraResultOf<TM, EN, MN>>;

export type SingleQueryResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "findOne" | "get"
> = SingleQueryResult<
  ResponseEntityOf<TM, EN>,
  EntityExtraResultOf<TM, EN, MN>
>;

export type PullQueryResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PullQueryResult<
  ResponseEntityOf<TM, EN>,
  EntityExtraResultOf<TM, EN, "pull">
>;

export type CustomQueryResultOf<
  TM extends GeneralTypeMap,
  QN extends CustomQueryNameOf<TM>
> = CustomQueryResult<
  CustomQueryResultValueOf<TM, QN>,
  CustomQueryExtraResultOf<TM, QN>
>;

export type SingleInsertCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = SingleInsertCommandResult<EntityExtraResultOf<TM, EN, "insertOne">>;

export type MultiInsertCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = MultiInsertCommandResult<EntityExtraResultOf<TM, EN, "insertMulti">>;

export type GetCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "insertAndGet" | "updateAndGet"
> = GetCommandResult<ResponseEntityOf<TM, EN>, EntityExtraResultOf<TM, EN, MN>>;

export type MultiValuesCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "insertAndGetMulti" | "updateAndFetch"
> = MultiValuesCommandResult<
  ResponseEntityOf<TM, EN>,
  EntityExtraResultOf<TM, EN, MN>
>;

export type IdUpdateCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = IdUpdateCommandResult<EntityExtraResultOf<TM, EN, "updateById">>;

export type MultiUpdateCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = MultiUpdateCommandResult<EntityExtraResultOf<TM, EN, "updateMulti">>;

export type PushCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PushCommandResult<
  ResponseEntityOf<TM, EN>,
  EntityExtraResultOf<TM, EN, "push">
>;

export type DeleteCommandResultOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = DeleteCommandResult<EntityExtraResultOf<TM, EN, "delete">>;

export type CustomCommandResultOf<
  TM extends GeneralTypeMap,
  CN extends CustomQueryNameOf<TM>
> = CustomCommandResult<
  CustomCommandResultValueOf<TM, CN>,
  CustomCommandExtraResultOf<TM, CN>
>;

export type LoginCommandResultOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = LoginCommandResult<
  UN,
  ResponseEntityOf<TM, UN>,
  AuthSessionOf<TM, UN>,
  EntityExtraResultOf<TM, UN, "login">
>;

export type LogoutCommandResultOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = LogoutCommandResult<EntityExtraResultOf<TM, UN, "logout">>;
