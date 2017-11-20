// @flow
import {
  AbstractEntityClient,
} from 'phenyl-utils/jsnext'

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

export class PhenylMemoryDbEntityClient extends AbstractEntityClient {

  get entityState(): EntityState {
    // $FlowIssue(essence-is-instanceof-PhenylMemoryClientEssence)
    return this.essence.entityState
  }

  constructor(params: MemoryClientParams = {}) {
    super()
    const entityState = params.entityState ||  { pool: {} }
    this.essence = new PhenylMemoryDbClient(entityState)
  }

  toJSON(): { entityState: EntityState } {
    return { entityState: this.entityState }
  }
}
