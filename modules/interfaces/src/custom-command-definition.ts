import { CustomCommand } from "./command";
import { CustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import { Session } from "./session";

export interface CustomCommandDefinition {
  authorize?: (
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ) => Promise<GeneralCustomCommandRequestData>;

  validate?: (
    reqData: GeneralCustomCommandRequestData,
    session?: Session
  ) => Promise<void>;

  execute(
    command: CustomCommand,
    session?: Session
  ): Promise<CustomCommandResult>;
}
