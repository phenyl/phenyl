import { CustomCommand } from "./command";
import { CustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import { Session } from "./session";

export interface CustomCommandDefinition<
  CN extends string = string,
  CP extends Object = Object,
  CR extends Object = Object
> {
  authorize?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Session
  ) => Promise<GeneralCustomCommandRequestData<CN>>;

  validate?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Session
  ) => Promise<void>;

  execute(
    command: CustomCommand<CN, CP>,
    session?: Session
  ): Promise<CustomCommandResult<CR>>;
}
