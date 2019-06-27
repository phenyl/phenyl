import { CustomQuery } from "./query";
import { CustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { GeneralDefinition } from "./entity-definition";
import { Session } from "./session";

export interface CustomQueryDefinition extends GeneralDefinition {
  authorize?: (
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ) => Promise<GeneralCustomQueryRequestData>;

  validate?: (
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ) => Promise<void>;

  execute(query: CustomQuery, session?: Session): Promise<CustomQueryResult>;
}
