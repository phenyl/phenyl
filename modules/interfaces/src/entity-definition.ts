import { GeneralEntityRequestData, GeneralRequestData } from "./request-data";
import {
  GeneralEntityResponseData,
  GeneralResponseData
} from "./response-data";

import { Session } from "./session";

export interface GeneralDefinition {
  authorize?: (
    reqData: GeneralRequestData,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralRequestData,
    session?: Session
  ) => Promise<GeneralRequestData>;

  validate?: (reqData: GeneralRequestData, session?: Session) => Promise<void>;

  wrapExecution?: (
    reqData: GeneralRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralRequestData,
      session?: Session
    ) => Promise<GeneralResponseData>
  ) => Promise<GeneralResponseData>;
}

export interface EntityDefinition extends GeneralDefinition {
  authorize?: (
    reqData: GeneralEntityRequestData,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralEntityRequestData,
    session?: Session
  ) => Promise<GeneralEntityRequestData>;

  validate?: (reqData: GeneralRequestData, session?: Session) => Promise<void>;

  wrapExecution?: (
    reqData: GeneralEntityRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralEntityRequestData,
      session?: Session
    ) => Promise<GeneralEntityResponseData>
  ) => Promise<GeneralEntityResponseData>;
}
