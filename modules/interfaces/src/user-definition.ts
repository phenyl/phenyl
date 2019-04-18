import { UserEntityRequestData } from "./request-data";

import { Entity } from "./entity";
import { LoginCommand } from "./command";
import { PreSession } from "./session";
import { Session } from "./session";

import { UserEntityResponseData } from "./response-data";

export type AuthenticationResult<
  EN extends string = string,
  E extends Entity = Entity,
  S extends Object = Object
> = {
  preSession: PreSession<EN, S>;
  user: E | null;
  versionId: string | null;
};

export interface AuthDefinition {
  authenticate(
    loginCommand: LoginCommand,
    session?: Session
  ): Promise<AuthenticationResult>;
}

export interface UserDefinition extends AuthDefinition {
  authorize?: (
    reqData: UserEntityRequestData,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: UserEntityRequestData,
    session?: Session
  ) => Promise<UserEntityRequestData>;

  validate?: (
    reqData: UserEntityRequestData,
    session?: Session
  ) => Promise<void>;

  wrapExecution?: (
    reqData: UserEntityRequestData,
    session: Session,
    executeFn: (
      reqData: UserEntityRequestData,
      session?: Session
    ) => Promise<UserEntityResponseData>
  ) => Promise<UserEntityResponseData>;
}
