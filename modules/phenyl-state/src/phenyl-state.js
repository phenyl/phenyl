// @flow
import type {
  DeleteCommand,
  EntityPool,
  EntityState,
  EntityStateFinder,
  EntityStateUpdater,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  IdDeleteCommand,
  MultiUpdateCommand,
  MultiDeleteCommand,
  Entity,
  UpdateCommand,
  UpdateOperators,
  WhereQuery,
} from 'phenyl-interfaces'

import PhenylStateFinder from './phenyl-state-finder.js'
import PhenylStateUpdater from './phenyl-state-updater.js'

export type PhenylStateParams = {
  pool?: EntityPool
}

/**
 *
 */
export default class PhenylState implements EntityState, EntityStateFinder, EntityStateUpdater {
  pool: EntityPool

  constructor(plain: PhenylStateParams = {}) {
    this.pool = plain.pool || {}
  }

  /**
   *
   */
  find(query: WhereQuery): Array<Entity> {
    return PhenylStateFinder.find(this, query)
  }

  /**
   *
   */
  findOne(query: WhereQuery): ?Entity {
    return PhenylStateFinder.findOne(this, query)
  }

  /**
   *
   */
  get(query: IdQuery): Entity {
    return PhenylStateFinder.get(this, query)
  }

  /**
   *
   */
  getByIds(query: IdsQuery): Array<Entity> {
    return PhenylStateFinder.getByIds(this, query)
  }

  /**
   *
   */
  getAll(entityName: string): Array<Entity> {
    return PhenylStateFinder.getAll(this, entityName)
  }

  /**
   *
   */
  $update(command: UpdateCommand): UpdateOperators {
    return PhenylStateUpdater.$update(this, command)
  }

  /**
   *
   */
  $register(entityName: string, ...pool: Array<Entity>): UpdateOperators {
    return PhenylStateUpdater.$register(this, entityName, ...pool)
  }

  /**
   *
   */
  $delete(command: DeleteCommand): UpdateOperators {
    return PhenylStateUpdater.$delete(this, command)
  }
}
