import { GeneralCustomQuery } from "./query";
import { GeneralCustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import {
  RestApiDefinition,
  GeneralClientMap
} from "./entity-rest-api-definition";
import { Session } from "./session";

export interface CustomQueryApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<GeneralCustomQueryRequestData>;

  validate?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<void>;

  execute(
    query: GeneralCustomQuery,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<GeneralCustomQueryResult>;
}

// Alias for backward compatibility
export type CustomQueryDefinition = CustomQueryApiDefinition;

export type GeneralCustomQueryExecuteFn = (
  query: GeneralCustomQuery,
  session: Session | undefined,
  clients: GeneralClientMap
) => Promise<GeneralCustomQueryResult>;
