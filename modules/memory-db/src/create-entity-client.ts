import { EntityState, GeneralEntityMap } from "@phenyl/interfaces";
import {
  PhenylEntityClient,
  PhenylEntityClientOptions
} from "@phenyl/central-state";

import { PhenylMemoryDbClient } from "./phenyl-memory-db-client";

export type MemoryClientOptions<M extends GeneralEntityMap> = {
  entityState?: EntityState<M>;
} & PhenylEntityClientOptions<M>;

export function createEntityClient<M extends GeneralEntityMap>(
  params: MemoryClientOptions<M> = {}
): PhenylMemoryDbEntityClient<M> {
  return new PhenylMemoryDbEntityClient(params);
}

export class PhenylMemoryDbEntityClient<
  M extends GeneralEntityMap
> extends PhenylEntityClient<M> {
  // @ts-ignore TODO WithMetaInfo
  dbClient: PhenylMemoryDbClient<M>;

  get entityState(): EntityState<M> {
    return this.dbClient.entityState;
  }

  constructor(options: MemoryClientOptions<M> = {}) {
    const entityState =
      options.entityState ||
      ({
        pool: {}
      } as EntityState<M>);
    const dbClient = new PhenylMemoryDbClient({ entityState });
    // @ts-ignore TODO WithMetaInfo
    super(dbClient, options);
  }

  toJSON(): {
    entityState: EntityState<M>;
  } {
    return {
      entityState: this.entityState
    };
  }
}
