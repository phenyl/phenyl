import { CustomCommand } from "./command";
import { CustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import { Nullable } from "./utils";
import { Session } from "./session";

export interface CustomCommandDefinition<
  CN extends string = string,
  CP extends Object = Object,
  CR extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> {
  authorize?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Nullable<SS>
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Nullable<SS>
  ) => Promise<GeneralCustomCommandRequestData<CN>>;

  validate?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Nullable<SS>
  ) => Promise<void>;

  execute(
    command: CustomCommand<CN, CP>,
    session?: Nullable<SS>
  ): Promise<CustomCommandResult<CR>>;
}
