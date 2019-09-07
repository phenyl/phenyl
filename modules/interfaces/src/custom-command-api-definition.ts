import { GeneralCustomCommand } from "./command";
import { GeneralCustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import {
  RestApiDefinition,
  GeneralRestApiSettings
} from "./entity-rest-api-definition";
import { Session } from "./session";

export interface CustomCommandApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralCustomCommandRequestData,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomCommandRequestData,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<GeneralCustomCommandRequestData>;

  validate?(
    reqData: GeneralCustomCommandRequestData,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<void>;

  execute(
    command: GeneralCustomCommand,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<GeneralCustomCommandResult>;
}

// Alias for backward compatibility
export type CustomCommandDefinition = CustomCommandApiDefinition;

export type GeneralCustomCommandExecuteFn = (
  query: GeneralCustomCommand,
  session: Session | undefined,
  settings: GeneralRestApiSettings
) => Promise<GeneralCustomCommandResult>;
