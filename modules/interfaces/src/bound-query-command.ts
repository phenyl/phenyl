import { GeneralTypeMap } from "./type-map";
import {
  EntityNameOf,
  EntityExtraParamsOf,
  RequestEntityOf
} from "./entity-rest-info-map";
import { WhereQuery, IdQuery, IdsQuery, PullQuery, CustomQuery } from "./query";
import {
  CustomQueryNameOf,
  CustomQueryExtraParamsOf,
  CustomQueryParamsOf,
  CustomCommandNameOf,
  CustomCommandParamsOf,
  CustomCommandExtraParamsOf
} from "./custom-map";
import {
  SingleInsertCommand,
  MultiInsertCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  PushCommand,
  DeleteCommand,
  CustomCommand,
  LoginCommand,
  LogoutCommand
} from "./command";
import { PreEntity } from "./entity";
import { UserEntityNameOf, AuthCredentialsOf } from "./auth-command-map";

export type WhereQueryOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "find" | "findOne"
> = WhereQuery<EN, EntityExtraParamsOf<TM, EN, MN>>;

export type IdQueryOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = IdQuery<EN, EntityExtraParamsOf<TM, EN, "get">>;

export type IdsQueryOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = IdsQuery<EN, EntityExtraParamsOf<TM, EN, "getByIds">>;

export type PullQueryOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PullQuery<EN, EntityExtraParamsOf<TM, EN, "pull">>;

export type CustomQueryOf<
  TM extends GeneralTypeMap,
  QN extends CustomQueryNameOf<TM>
> = CustomQuery<
  QN,
  CustomQueryParamsOf<TM, QN>,
  CustomQueryExtraParamsOf<TM, QN>
>;

export type SingleInsertCommandOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "insertOne" | "insertAndGet"
> = SingleInsertCommand<
  EN,
  PreEntity<RequestEntityOf<TM, EN>>,
  EntityExtraParamsOf<TM, EN, MN>
>;

export type MultiInsertCommandOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "insertMulti" | "insertAndGetMulti"
> = MultiInsertCommand<
  EN,
  PreEntity<RequestEntityOf<TM, EN>>,
  EntityExtraParamsOf<TM, EN, MN>
>;

export type IdUpdateCommandOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "updateById" | "updateAndGet"
> = IdUpdateCommand<EN, EntityExtraParamsOf<TM, EN, MN>>;

export type MultiUpdateCommandOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  MN extends "updateMulti" | "updateAndFetch"
> = MultiUpdateCommand<EN, EntityExtraParamsOf<TM, EN, MN>>;

export type PushCommandOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PushCommand<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type DeleteCommandOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = DeleteCommand<EN, EntityExtraParamsOf<TM, EN, "delete">>;

export type CustomCommandOf<
  TM extends GeneralTypeMap,
  CN extends CustomCommandNameOf<TM>
> = CustomCommand<
  CN,
  CustomCommandParamsOf<TM, CN>,
  CustomCommandExtraParamsOf<TM, CN>
>;

export type LoginCommandOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = LoginCommand<
  UN,
  AuthCredentialsOf<TM, UN>,
  EntityExtraParamsOf<TM, UN, "login">
>;

export type LogoutCommandOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = LogoutCommand<UN, EntityExtraParamsOf<TM, UN, "logout">>;
