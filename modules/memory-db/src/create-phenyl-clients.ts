import { PhenylSessionClient } from "@phenyl/central-state";
import {
  GeneralTypeMap,
  ResponseEntityMapOf,
  AuthCommandMapOf,
  PhenylClients
} from "@phenyl/interfaces";
import {
  MemoryClientOptions,
  createEntityClient
} from "./create-entity-client";

export function createPhenylClients<TM extends GeneralTypeMap = GeneralTypeMap>(
  params: MemoryClientOptions<ResponseEntityMapOf<TM>> = {}
): PhenylClients<TM> {
  const entityClient = createEntityClient<ResponseEntityMapOf<TM>>(params);
  const sessionClient = new PhenylSessionClient<AuthCommandMapOf<TM>>(
    entityClient.getDbClient()
  );
  return {
    entityClient,
    sessionClient
  };
}
