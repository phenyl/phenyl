import { GeneralCustomQuery } from "./query";
import { GeneralCustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import {
  RestApiDefinition,
  GeneralRestApiSettings
} from "./entity-rest-api-definition";
import { Session } from "./session";

export interface CustomQueryApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<GeneralCustomQueryRequestData>;

  validate?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<void>;

  execute(
    query: GeneralCustomQuery,
    session: Session | undefined,
    settings: GeneralRestApiSettings
  ): Promise<GeneralCustomQueryResult>;
}

// Alias for backward compatibility
export type CustomQueryDefinition = CustomQueryApiDefinition;

export type GeneralCustomQueryExecuteFn = (
  query: GeneralCustomQuery,
  session: Session | undefined,
  settings: GeneralRestApiSettings
) => Promise<GeneralCustomQueryResult>;
