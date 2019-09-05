import { GeneralEntityRequestData, GeneralRequestData } from "./request-data";
import {
  GeneralEntityResponseData,
  GeneralResponseData
} from "./response-data";

import { Session } from "./session";

export interface RestApiDefinition {
  authorize?(reqData: GeneralRequestData, session?: Session): Promise<boolean>;

  normalize?(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<GeneralRequestData>;

  validate?(reqData: GeneralRequestData, session?: Session): Promise<void>;

  wrapExecution?(
    reqData: GeneralRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralRequestData,
      session?: Session
    ) => Promise<GeneralResponseData>
  ): Promise<GeneralResponseData>;
}

export type GeneralExecuteFn = (
  reqData: GeneralRequestData,
  session?: Session
) => Promise<GeneralResponseData>;

export interface EntityRestApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralEntityRequestData,
    session?: Session
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralEntityRequestData,
    session?: Session
  ): Promise<GeneralEntityRequestData>;

  validate?(reqData: GeneralRequestData, session?: Session): Promise<void>;

  wrapExecution?(
    reqData: GeneralEntityRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralEntityRequestData,
      session?: Session
    ) => Promise<GeneralEntityResponseData>
  ): Promise<GeneralEntityResponseData>;
}

// Alias for backward compatibility.
export type EntityDefinition = EntityRestApiDefinition;

export type GeneralEntityExecuteFn = (
  reqData: GeneralEntityRequestData,
  session?: Session
) => Promise<GeneralEntityResponseData>;
