import { GeneralEntityRequestData, GeneralRequestData } from "./request-data";
import {
  GeneralEntityResponseData,
  GeneralResponseData
} from "./response-data";

import { Session } from "./session";
import {
  GeneralDirectRestApiClient,
  DirectRestApiClient
} from "./rest-api-client";
import {
  GeneralEntityClient,
  GeneralSessionClient,
  EntityClient,
  SessionClient
} from "./entity-client";
import { GeneralTypeMap } from "./type-map";
import { ResponseEntityMapOf } from "./entity-rest-info-map";
import { AuthCommandMapOf } from "./auth-command-map";
import { GeneralDbClient, DbClient } from "./db-client";

export interface GeneralClientMap {
  entityClient: GeneralEntityClient;
  sessionClient: GeneralSessionClient;
  directClient: GeneralDirectRestApiClient;
  dbClient: GeneralDbClient;
}

export interface ClientMap<TM extends GeneralTypeMap> extends GeneralClientMap {
  entityClient: EntityClient<ResponseEntityMapOf<TM>>;
  sessionClient: SessionClient<AuthCommandMapOf<TM>>;
  directClient: DirectRestApiClient<TM>;
  dbClient: DbClient<ResponseEntityMapOf<TM>>;
}

export interface RestApiDefinition {
  authorize?(
    reqData: GeneralRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<GeneralRequestData>;

  validate?(
    reqData: GeneralRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<void>;

  wrapExecution?(
    reqData: GeneralRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralRequestData,
      session?: Session
    ) => Promise<GeneralResponseData>,
    clients: GeneralClientMap
  ): Promise<GeneralResponseData>;
}

export type GeneralExecuteFn = (
  reqData: GeneralRequestData,
  session?: Session
) => Promise<GeneralResponseData>;

export interface EntityRestApiDefinition extends RestApiDefinition {
  authorize?(
    reqData: GeneralEntityRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<boolean>;

  normalize?(
    reqData: GeneralEntityRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<GeneralEntityRequestData>;

  validate?(
    reqData: GeneralRequestData,
    session: Session | undefined,
    clients: GeneralClientMap
  ): Promise<void>;

  wrapExecution?(
    reqData: GeneralEntityRequestData,
    session: Session | undefined,
    executeFn: (
      reqData: GeneralEntityRequestData,
      session?: Session
    ) => Promise<GeneralEntityResponseData>,
    clients: GeneralClientMap
  ): Promise<GeneralEntityResponseData>;
}

// Alias for backward compatibility.
export type EntityDefinition = EntityRestApiDefinition;

export type GeneralEntityExecuteFn = (
  reqData: GeneralEntityRequestData,
  session?: Session
) => Promise<GeneralEntityResponseData>;
