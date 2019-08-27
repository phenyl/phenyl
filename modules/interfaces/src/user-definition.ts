import { Entity } from "./entity";
import { GeneralDefinition } from "./entity-definition";
import { LoginCommand } from "./command";
import { PreSession } from "./session";
import { Session } from "./session";
import { UserEntityRequestData } from "./request-data";
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

export interface UserDefinition extends GeneralDefinition {
  authenticate(
    loginCommand: LoginCommand,
    session?: Session
  ): Promise<AuthenticationResult>;

  authorize?(
    reqData: UserEntityRequestData,
    session?: Session
  ): Promise<boolean>;

  normalize?(
    reqData: UserEntityRequestData,
    session?: Session
  ): Promise<UserEntityRequestData>;

  validate?(reqData: UserEntityRequestData, session?: Session): Promise<void>;

  wrapExecution?(
    reqData: UserEntityRequestData,
    session: Session,
    executeFn: (
      reqData: UserEntityRequestData,
      session?: Session
    ) => Promise<UserEntityResponseData>
  ): Promise<UserEntityResponseData>;
}

export type AuthDefinition = Pick<UserDefinition, "authenticate">;
