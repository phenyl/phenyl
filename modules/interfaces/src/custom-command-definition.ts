import {
  CustomCommandParams,
  CustomCommandResultValue,
  GeneralCustomCommandMap
} from "./type-map";

import { CustomCommand } from "./command";
import { CustomCommandResult } from "./command-result";
import { GeneralCustomCommandRequestData } from "./request-data";
import { Key } from "./key";
import { Session } from "./session";

export interface CustomCommandDefinition<
  CN extends string = string,
  CP extends Object = Object,
  CR extends Object = Object
> {
  authorization?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Session
  ) => Promise<boolean>;

  normalization?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Session
  ) => Promise<GeneralCustomCommandRequestData<CN>>;

  validation?: (
    reqData: GeneralCustomCommandRequestData<CN>,
    session?: Session
  ) => Promise<void>;

  execution(
    command: CustomCommand<CN, CP>,
    session?: Session
  ): Promise<CustomCommandResult<CR>>;
}

export type CustomCommandDefinitions<CM extends GeneralCustomCommandMap> = {
  [CN in Key<CM>]: CustomCommandDefinition<
    CN,
    CustomCommandParams<CM, CN>,
    CustomCommandResultValue<CM, CN>
  >
};
