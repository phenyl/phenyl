import { Broad, ReqRes, Narrow } from "./type-map";
import {
  GeneralUserEntityRequestData,
  UserEntityRequestData
} from "./request-data";

import { Entity } from "./entity";
import { LoginCommand } from "./command";
import { Nullable } from "./utils";
import { PreSession } from "./session";
import { Session } from "./session";
import { TypeProp } from "./entity-definition";
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
  Ebroader extends ReqRes<Entity> = ReqRes<Entity>,
  C extends Object = Object,
  S extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> {
  authenticate(
    loginCommand: LoginCommand<EN, C>,
    session?: Nullable<SS>
  ): Promise<AuthenticationResult<EN, Narrow<Ebroader>, S>>;
}

export interface UserDefinition<
  EN extends string = string,
  Ebroader extends ReqRes<Entity> = ReqRes<Entity>,
  C extends Object = Object,
  S extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> extends AuthDefinition<EN, Ebroader, C, S, SS> {
  entityName: TypeProp<EN>;
  entity: TypeProp<Ebroader>;
  authorize?: (
    reqData: GeneralUserEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<boolean>;

  normalize?: (
    reqData: UserEntityRequestData<EN, Broad<Ebroader>, C>,
    session?: Nullable<SS>
  ) => Promise<UserEntityRequestData<EN, Narrow<Ebroader>, C>>;

  validate?: (
    reqData: GeneralUserEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<void>;

  wrapExecution?: (
    reqData: UserEntityRequestData<EN, Narrow<Ebroader>, C>,
    session: Nullable<SS>,
    executeFn: (
      reqData: UserEntityRequestData<EN, Narrow<Ebroader>, C>,
      session?: Nullable<SS>
    ) => Promise<UserEntityResponseData<EN, Narrow<Ebroader>, S>>
  ) => Promise<UserEntityResponseData<EN, Narrow<Ebroader>, S>>;
}
