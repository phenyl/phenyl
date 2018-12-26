// @flow
import { sortByNotation } from 'oad-utils/jsnext'
import { filter } from 'power-filter/jsnext'

import type {
  EntityMap,
  EntityState,
  EntityStateFinder,
  IdQuery,
  IdsQuery,
  WhereQuery,
} from 'phenyl-interfaces'


/**
 *
 */
export default class PhenylStateFinder<M: EntityMap> implements EntityStateFinder<M> {

  state: EntityState<M>

  constructor(state: EntityState<M>) {
    this.state = state
  }

  /**
   *
   */
  find<N: $Keys<M>>(query: WhereQuery<N>): Array<$ElementType<M, N>> {
    return this.constructor.find(this.state, query)
  }

  /**
   *
   */
  findOne<N: $Keys<M>>(query: WhereQuery<N>): ?$ElementType<M, N> {
    return this.constructor.findOne(this.state, query)
  }

  /**
   *
   */
  get<N: $Keys<M>>(query: IdQuery<N>): $ElementType<M, N> {
    return this.constructor.get(this.state, query)
  }

  /**
   *
   */
  getByIds<N: $Keys<M>>(query: IdsQuery<N>): Array<$ElementType<M, N>> {
    return this.constructor.getByIds(this.state, query)
  }

  /**
   *
   */
  getAll<N: $Keys<M>>(entityName: N): Array<$ElementType<M, N>> {
    return this.constructor.getAll(this.state, entityName)
  }

  /**
   *
   */
  has<N: $Keys<M>>(query: IdQuery<N>): boolean {
    return this.constructor.has(this.state, query)
  }


  /**
   *
   */
  static getAll<N: $Keys<M>>(state: EntityState<M>, entityName: N): Array<$ElementType<M, N>> {
    const pool = state.pool[entityName]
    if (pool == null) {
      throw new Error(`entityName: "${entityName}" is not found.`)
    }
    return Object.keys(pool).map(key => pool[key])
  }

  /**
   *
   */
  static find<N: $Keys<M>>(state: EntityState<M>, query: WhereQuery<N>): Array<$ElementType<M, N>> {
    const {
      entityName,
      where,
      sort,
      skip,
      limit,
    } = query
    let filtered = filter(this.getAll(state, entityName), where)
    if (sort != null) {
      filtered = sortByNotation(filtered, sort)
    }
    const skipVal = skip || 0
    const limitVal = limit != null ? limit + skipVal : filtered.length
    return filtered.slice(skipVal, limitVal)
  }

  /**
   *
   */
  static findOne<N: $Keys<M>>(state: EntityState<M>, query: WhereQuery<N>): ?$ElementType<M, N> {
    return this.find(state, query)[0]
  }

  /**
   *
   */
  static get<N: $Keys<M>>(state: EntityState<M>, query: IdQuery<N>): $ElementType<M, N> {
    const entitiesById = state.pool[query.entityName]
    if (entitiesById == null) throw new Error('NoEntityRegistered')
    const entity = entitiesById[query.id]
    if (entity == null) throw new Error('NoId')
    return entity
  }

  /**
   *
   */
  static getByIds<N: $Keys<M>>(state: EntityState<M>, query: IdsQuery<N>): Array<$ElementType<M, N>> {
    const { ids, entityName } = query
    // TODO: handle error
    return ids.map(id => this.get(state, { entityName, id }))
  }

  /**
   *
   */
  static has<N: $Keys<M>>(state: EntityState<M>, query: IdQuery<N>): boolean {
    try {
      PhenylStateFinder.get(state, query)
    } catch (error) {
      return false
    }
    return true
  }
}
