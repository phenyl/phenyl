// @flow
import {
  AbstractEntityClient,
} from 'phenyl-utils/jsnext'

import PhenylMemoryClientEssence from './phenyl-memory-client-essence.js'

import type {
  EntityState,
} from 'phenyl-interfaces'

type MemoryClientParams = {
  entityState?: EntityState,
}

export default class PhenylMemoryClient extends AbstractEntityClient {

  get entityState(): EntityState {
    // $FlowIssue(essence-is-instanceof-PhenylMemoryClientEssence)
    return this.essence.entityState
  }

  constructor(params: MemoryClientParams = {}) {
    super()
    const entityState = params.entityState ||  { pool: {} }
    this.essence = new PhenylMemoryClientEssence(entityState)
  }

  toJSON(): { entityState: EntityState } {
    return { entityState: this.entityState }
  }
}
