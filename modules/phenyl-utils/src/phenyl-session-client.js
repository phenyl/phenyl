// @flow
import {
  randomStringWithTimeStamp
} from './random-string.js'

import type {
  Id,
  EntityClientEssence,
  PreSession,
  Session,
  SessionClient,
} from 'phenyl-interfaces'

/**
 *
 */
export class PhenylSessionClient implements SessionClient {
  essence: EntityClientEssence

  constructor(essence: EntityClientEssence) {
    this.essence = essence
  }

  /**
   *
   */
  async get(id: ?Id): Promise<?Session> {
    if (id == null) {
      return null
    }
    try {
      return this.essence.get({ entityName: '_PhenylSession', id })
    }
    catch (e) {
      // TODO: Check error message.
      return null
    }
  }

  /**
   *
   */
  async create(preSession: PreSession): Promise<Session> {
    let value = preSession
    if (value.id == null) {
      value = Object.assign({}, value, { id: randomStringWithTimeStamp() })
    }
    return this.set(value)
  }

  /**
   *
   */
  async set(value: Session): Promise<Session> {
    return this.essence.insertAndGet({ entityName: '_PhenylSession', value })
  }

  /**
   *
   */
  async delete(id: ?Id): Promise<boolean> {
    if (id == null) {
      return false
    }
    await this.essence.delete({ entityName: '_PhenylSession', id })
    return true
  }
}
