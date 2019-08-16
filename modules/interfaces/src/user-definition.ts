import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
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

export interface UserDefinition extends EntityDefinition {
  authenticate(
    loginCommand: LoginCommand,
    session?: Session
  ): Promise<AuthenticationResult>;

  authorize?(
    reqData: UserEntityRequestData,
    session?: Session
  ): Promise<boolean>;

  normalize?<T extends UserEntityRequestData>(
    reqData: T,
    session?: Session
  ): Promise<T>;

  validate?(reqData: UserEntityRequestData, session?: Session): Promise<void>;

  wrapExecution?<
    T extends UserEntityRequestData,
    S extends UserEntityResponseData
  >(
    reqData: T,
    session: Session,
    executeFn: (reqData: T, session?: Session) => Promise<S>
  ): Promise<S>;
}

export type AuthDefinition = Pick<UserDefinition, "authenticate">;
