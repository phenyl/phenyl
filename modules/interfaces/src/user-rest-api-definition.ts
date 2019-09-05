import { Entity } from "./entity";
import { RestApiDefinition } from "./entity-rest-api-definition";
import { GeneralLoginCommand } from "./command";
import { PreSession } from "./session";
import { Session } from "./session";
import { GeneralUserEntityRequestData } from "./request-data";
import { GeneralUserEntityResponseData } from "./response-data";

export type AuthenticationResult<
  EN extends string,
  E extends Entity,
  S extends Object
> = {
  preSession: PreSession<EN, S>;
  user: E | null;
  versionId: string | null;
};

export type GeneralAuthenticationResult = AuthenticationResult<
  string,
  Entity,
  Object
>;

export interface UserRestApiDefinition extends RestApiDefinition {
  authenticate(
    loginCommand: GeneralLoginCommand,
    session?: Session
  ): Promise<GeneralAuthenticationResult>;

  authorize?(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<GeneralUserEntityRequestData>;

  validate?(
    reqData: GeneralUserEntityRequestData,
    session?: Session
  ): Promise<void>;

  wrapExecution?(
    reqData: GeneralUserEntityRequestData,
    session: Session,
    executeFn: (
      reqData: GeneralUserEntityRequestData,
      session?: Session
    ) => Promise<GeneralUserEntityResponseData>
  ): Promise<GeneralUserEntityResponseData>;
}

// alias
export type UserEntityRestApiDefinition = UserRestApiDefinition;
export type UserDefinition = UserRestApiDefinition;

export type AuthDefinition = Pick<UserRestApiDefinition, "authenticate">;

export type GeneralUserEntityExecuteFn = (
  reqData: GeneralUserEntityRequestData,
  session?: Session
) => Promise<GeneralUserEntityResponseData>;
