// @flow
import { PhenylEntityClient } from 'phenyl-central-state/jsnext'

import { PhenylMemoryDbClient } from './phenyl-memory-db-client.js'

import type { EntityState } from 'phenyl-interfaces'

import type { PhenylEntityClientOptions } from 'phenyl-central-state/jsnext'

export type MemoryClientOptions = {
  entityState?: EntityState,
} & PhenylEntityClientOptions

export function createEntityClient(
  params: MemoryClientOptions = {}
): PhenylMemoryDbEntityClient {
  return new PhenylMemoryDbEntityClient(params)
}

export class PhenylMemoryDbEntityClient extends PhenylEntityClient {
  get entityState(): EntityState {
    // $FlowIssue(dbClient-is-instanceof-PhenylMemoryDbClient)
    return this.dbClient.entityState
  }

  constructor(options: MemoryClientOptions = {}) {
    const entityState = options.entityState || { pool: {} }
    const dbClient = new PhenylMemoryDbClient(entityState)
    super(dbClient, options)
  }

  toJSON(): { entityState: EntityState } {
    return { entityState: this.entityState }
  }
}
