// @flow
import type {
  DeleteCommand,
  EntityMap,
  EntityPool,
  EntityState,
  EntityStateFinder,
  EntityStateUpdater,
  IdQuery,
  IdUpdateCommand,
  IdsQuery,
  MultiUpdateCommand,
  UpdateOperation,
  WhereQuery,
} from 'phenyl-interfaces'

import PhenylStateFinder from './phenyl-state-finder.js'
import PhenylStateUpdater from './phenyl-state-updater.js'

export type PhenylStateParams<M: EntityMap> = {
  pool?: EntityPool<M>
}

/**
 *
 */
export default class PhenylState<M: EntityMap> implements EntityState<M>, EntityStateFinder<M>, EntityStateUpdater<M> {
  pool: EntityPool<M>

  constructor(plain: PhenylStateParams<$Shape<M>> = {}) {
    this.pool = plain.pool || {}
  }

  /**
   *
   */
  find<N: $Keys<M>>(query: WhereQuery<N>): Array<$ElementType<M, N>> {
    return PhenylStateFinder.find(this, query)
  }

  /**
   *
   */
  findOne<N: $Keys<M>>(query: WhereQuery<N>): ?$ElementType<M, N> {
    return PhenylStateFinder.findOne(this, query)
  }

  /**
   *
   */
  get<N: $Keys<M>>(query: IdQuery<N>): $ElementType<M, N> {
    return PhenylStateFinder.get(this, query)
  }

  /**
   *
   */
  getByIds<N: $Keys<M>>(query: IdsQuery<N>): Array<$ElementType<M, N>> {
    return PhenylStateFinder.getByIds(this, query)
  }

  /**
   *
   */
  getAll<N: $Keys<M>>(entityName: N): Array<$ElementType<M, N>> {
    return PhenylStateFinder.getAll(this, entityName)
  }

  /**
   *
   */
  updateById<N: $Keys<M>>(command: IdUpdateCommand<N>): UpdateOperation {
    return PhenylStateUpdater.updateById(this, command)
  }

  /**
   *
   */
  updateMulti<N: $Keys<M>>(command: MultiUpdateCommand<N>): UpdateOperation {
    return PhenylStateUpdater.updateMulti(this, command)
  }

  /**
   *
   */
  register<N: $Keys<M>>(entityName: N, ...pool: Array<$ElementType<M, N>>): UpdateOperation {
    return PhenylStateUpdater.register(this, entityName, ...pool)
  }

  /**
   *
   */
  delete<N: $Keys<M>>(command: DeleteCommand<N>): UpdateOperation {
    return PhenylStateUpdater.delete(this, command)
  }

  /**
   *
   */
  has<N: $Keys<M>>(query: IdQuery<N>): boolean {
    return PhenylStateFinder.has(this, query)
  }
}
