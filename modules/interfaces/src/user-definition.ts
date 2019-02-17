import { ReqRes } from "./type-map";
import {
  GeneralUserEntityRequestData,
  UserEntityRequestData
} from "./request-data";

import { Entity } from "./entity";
import { LoginCommand } from "./command";
import { Nullable } from "./utils";
import { PreSession } from "./session";
import { Session } from "./session";
import { TypeOnly } from "./type-only";
import { UserEntityResponseData } from "./response-data";

export type AuthenticationResult<
  EN extends string,
  E extends Entity,
  S extends Object = Object
> = {
  preSession: PreSession<EN, S>;
  user: E | null;
  versionId: string | null;
};

export interface AuthDefinition<
  EN extends string = string,
  Ereqres extends ReqRes<Entity> = ReqRes<Entity>,
  C extends Object = Object,
  S extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> {
  authenticate(
    loginCommand: LoginCommand<EN, C>,
    session?: Nullable<SS>
  ): Promise<AuthenticationResult<EN, Ereqres['response'], S>>;
}

export interface UserDefinition<
  EN extends string = string,
  Ereqres extends ReqRes<Entity> = ReqRes<Entity>,
  C extends Object = Object,
  S extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> extends AuthDefinition<EN, Ereqres, C, S, SS> {
  entityName: TypeOnly<EN>;
  entity: TypeOnly<Ereqres>;
  authorize?: (
    reqData: GeneralUserEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<boolean>;

  normalize?: (
    reqData: UserEntityRequestData<EN, Ereqres['request'], C>,
    session?: Nullable<SS>
  ) => Promise<UserEntityRequestData<EN, Ereqres['response'], C>>;

  validate?: (
    reqData: GeneralUserEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<void>;

  wrapExecution?: (
    reqData: UserEntityRequestData<EN, Ereqres['response'], C>,
    session: Nullable<SS>,
    executeFn: (
      reqData: UserEntityRequestData<EN, Ereqres['response'], C>,
      session?: Nullable<SS>
    ) => Promise<UserEntityResponseData<EN, Ereqres['response'], S>>
  ) => Promise<UserEntityResponseData<EN, Ereqres['response'], S>>;
}
