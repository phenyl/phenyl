// @flow
import {
  PhenylEntityClient,
} from 'phenyl-central-state/jsnext'

import { PhenylMemoryDbClient } from './phenyl-memory-db-client.js'

import type {
  EntityMap,
  EntityState,
} from 'phenyl-interfaces'

import type { PhenylEntityClientOptions } from 'phenyl-central-state/jsnext'

export type MemoryClientOptions<M: EntityMap> = {
  entityState?: EntityState<M>,
} & PhenylEntityClientOptions<M>

export function createEntityClient<M: EntityMap>(params: MemoryClientOptions<M> = {}): PhenylMemoryDbEntityClient<M> {
  return new PhenylMemoryDbEntityClient(params)
}

export class PhenylMemoryDbEntityClient<M: EntityMap> extends PhenylEntityClient<M> {

  get entityState(): EntityState<M> {
    // $FlowIssue(dbClient-is-instanceof-PhenylMemoryDbClient)
    return this.dbClient.entityState
  }

  constructor(options: MemoryClientOptions<M> = {}) {
    const entityState = options.entityState ||  { pool: {} }
    const dbClient = new PhenylMemoryDbClient(entityState)
    super(dbClient, options)
  }

  toJSON(): { entityState: EntityState<M> } {
    return { entityState: this.entityState }
  }
}
