import { GeneralCustomCommand } from "./command";
import { GeneralCustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import { GeneralDefinition } from "./entity-definition";
import { Session } from "./session";

export interface CustomCommandDefinition extends GeneralDefinition {
  authorize?(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<GeneralCustomCommandRequestData>;

  validate?(
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ): Promise<void>;

  execute(
    command: GeneralCustomCommand,
    session?: Session
  ): Promise<GeneralCustomCommandResult>;
}

export type GeneralCustomCommandExecuteFn = (
  query: GeneralCustomCommand,
  session?: Session
) => Promise<GeneralCustomCommandResult>;
