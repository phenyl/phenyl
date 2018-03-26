// @flow

import type { Session } from './session.js.flow'
import type {
  CustomCommand,
} from './command.js.flow'
import type {
  CustomCommandResult,
} from './command-result.js.flow'
import type {
  CustomParams,
  CustomResult,
  CustomSetting,
  CustomCommandMap,
} from './type-map.js.flow'

export interface CustomCommandDefinition<N: string, P: Object, R: Object> {
  authorization(command: CustomCommand<N, P>, session: ?Session): Promise<boolean>,
  +normalization?: (command: CustomCommand<N, P>, session: ?Session) => Promise<CustomCommand<N, P>>,
  validation(command: CustomCommand<N, P>, session: ?Session): Promise<void>,
  execution(command: CustomCommand<N, P>, session: ?Session): Promise<CustomCommandResult<R>>,
}

export type CustomCommandDefinitions<CM: CustomCommandMap = CustomCommandMap> =
  $ObjMap<CM, <T, N: $Keys<CM>>(T: CustomSetting) => CustomCommandDefinition<N, CustomParams<CM, T>, CustomResult<CM, T>>>
