import { GeneralCustomCommand } from "./command";
import { GeneralCustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import { RestApiDefinition } from "./entity-rest-api-definition";
import { Session } from "./session";
import { GeneralDirectRestApiClient } from "./rest-api-client";

export interface CustomCommandApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralCustomCommandRequestData,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomCommandRequestData,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<GeneralCustomCommandRequestData>;

  validate?(
    reqData: GeneralCustomCommandRequestData,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<void>;

  execute(
    command: GeneralCustomCommand,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<GeneralCustomCommandResult>;
}

// Alias for backward compatibility
export type CustomCommandDefinition = CustomCommandApiDefinition;

export type GeneralCustomCommandExecuteFn = (
  query: GeneralCustomCommand,
  session: Session | undefined,
  directClient: GeneralDirectRestApiClient
) => Promise<GeneralCustomCommandResult>;
