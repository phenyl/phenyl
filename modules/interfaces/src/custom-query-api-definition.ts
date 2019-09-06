import { GeneralCustomQuery } from "./query";
import { GeneralCustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { RestApiDefinition } from "./entity-rest-api-definition";
import { Session } from "./session";
import { GeneralDirectRestApiClient } from "./rest-api-client";

export interface CustomQueryApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<GeneralCustomQueryRequestData>;

  validate?(
    reqData: GeneralCustomQueryRequestData,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<void>;

  execute(
    query: GeneralCustomQuery,
    session: Session | undefined,
    directClient: GeneralDirectRestApiClient
  ): Promise<GeneralCustomQueryResult>;
}

// Alias for backward compatibility
export type CustomQueryDefinition = CustomQueryApiDefinition;

export type GeneralCustomQueryExecuteFn = (
  query: GeneralCustomQuery,
  session: Session | undefined,
  directClient: GeneralDirectRestApiClient
) => Promise<GeneralCustomQueryResult>;
