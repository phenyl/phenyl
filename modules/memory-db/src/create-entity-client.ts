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
  get entityState(): EntityState<M> {
    // $FlowIssue(dbClient-is-instanceof-PhenylMemoryDbClient)
    return this.dbClient.entityState;
  }

  constructor(options: MemoryClientOptions<M> = {}) {
    const entityState = options.entityState || {
      pool: {}
    };
    const dbClient = new PhenylMemoryDbClient(entityState);
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
