import { GeneralCustomQuery } from "./query";
import { GeneralCustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { RestApiDefinition } from "./entity-definition";
import { Session } from "./session";

export interface CustomQueryDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<GeneralCustomQueryRequestData>;

  validate?(
    reqData: GeneralCustomQueryRequestData,
    session?: Session
  ): Promise<void>;

  execute(
    query: GeneralCustomQuery,
    session?: Session
  ): Promise<GeneralCustomQueryResult>;
}

export type GeneralCustomQueryExecuteFn = (
  query: GeneralCustomQuery,
  session?: Session
) => Promise<GeneralCustomQueryResult>;
