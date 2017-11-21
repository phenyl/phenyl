// @flow
import {
  PhenylEntityClient,
} from 'phenyl-central-state/jsnext'

import { PhenylMemoryDbClient } from './phenyl-memory-db-client.js'

import type {
  EntityState,
} from 'phenyl-interfaces'

type MemoryClientParams = {
  entityState?: EntityState,
}

export function createEntityClient(params: MemoryClientParams = {}): PhenylMemoryDbEntityClient {
  return new PhenylMemoryDbEntityClient(params)
}

export class PhenylMemoryDbEntityClient extends PhenylEntityClient {

  get entityState(): EntityState {
    // $FlowIssue(dbClient-is-instanceof-PhenylMemoryDbClient)
    return this.dbClient.entityState
  }

  constructor(params: MemoryClientParams = {}) {
    super()
    const entityState = params.entityState ||  { pool: {} }
    this.dbClient = new PhenylMemoryDbClient(entityState)
  }

  toJSON(): { entityState: EntityState } {
    return { entityState: this.entityState }
  }
}
