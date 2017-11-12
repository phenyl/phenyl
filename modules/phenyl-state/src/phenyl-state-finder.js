// @flow
import { sortByNotation } from 'oad-utils/jsnext'
import { filter } from 'power-filter/jsnext'

import type {
  Entity,
  EntityState,
  EntityStateFinder,
  IdQuery,
  IdsQuery,
  WhereQuery,
} from 'phenyl-interfaces'


/**
 *
 */
export default class PhenylStateFinder implements EntityStateFinder {

  state: EntityState

  constructor(state: EntityState) {
    this.state = state
  }

  /**
   *
   */
  find(query: WhereQuery): Array<Entity> {
    return this.constructor.find(this.state, query)
  }

  /**
   *
   */
  findOne(query: WhereQuery): ?Entity {
    return this.constructor.findOne(this.state, query)
  }

  /**
   *
   */
  get(query: IdQuery): Entity {
    return this.constructor.get(this.state, query)
  }

  /**
   *
   */
  getByIds(query: IdsQuery): Array<Entity> {
    return this.constructor.getByIds(this.state, query)
  }

  /**
   *
   */
  getAll(entityName: string): Array<Entity> {
    return this.constructor.getAll(this.state, entityName)
  }

  /**
   *
   */
  has(query: idQuery): boolean {
    return this.constructor.has(this.state, query)
  }


  /**
   *
   */
  static getAll(state: EntityState, entityName: string): Array<Entity> {
    const pool = state.pool[entityName]
    if (pool == null) {
      throw new Error(`entityName: "${entityName}" is not found.`)
    }
    return Object.keys(pool).map(key => pool[key])
  }

  /**
   *
   */
  static find(state: EntityState, query: WhereQuery): Array<Entity> {
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
  static findOne(state: EntityState, query: WhereQuery): ?Entity {
    return this.find(state, query)[0]
  }

  /**
   *
   */
  static get(state: EntityState, query: IdQuery): Entity {
    const entitiesById = state.pool[query.entityName]
    if (entitiesById == null) throw new Error('NoEntityRegistered')
    const entity = entitiesById[query.id]
    if (entity == null) throw new Error('NoId')
    return entity
  }

  /**
   *
   */
  static getByIds(state: EntityState, query: IdsQuery): Array<Entity> {
    const { ids, entityName } = query
    // TODO: handle error
    return ids.map(id => this.get(state, { entityName, id }))
  }

  /**
   *
   */
  static has(state: EntityState, query: IdQuery): boolean {
    try {
      PhenylStateFinder.get(state, query)
    } catch (error) {
      return false
    }
    return true
  }
}
