import { GeneralEntityRequestData, GeneralRequestData } from "./request-data";
import {
  GeneralEntityResponseData,
  GeneralResponseData
} from "./response-data";

import { Session } from "./session";

export interface EntityDefinition {
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
    reqData: GeneralRequestData,
    session: Session,
    executeFn: (
      reqData: GeneralRequestData,
      session?: Session
    ) => Promise<GeneralResponseData>
  ) => Promise<GeneralEntityResponseData>;
}
