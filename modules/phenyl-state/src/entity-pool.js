// @flow

import type {
  RestorableEntity,
  Id,
} from "phenyl-interfaces"
export type PlainEntityPool<T> = {
  values: { [key: Id]: T };
}

/**
 * Container to pool restorable entities
 */
export default class EntityPool<T: RestorableEntity> {
  values: { [key: Id]: T }

  constructor(pool: PlainEntityPool<T> = { values: {} }) {
    this.values = pool.values
    Object.freeze(this)
  }

  /**
   * The number of registered entities.
   */
  get length(): number {
    return Object.keys(this.values).length
  }

  /**
   * Return a new instance which is newly set given entities.
   */
  $set(...models: Array<T>): EntityPool<T> {
    const values = { ...this.values }
    for (const model of models) {
      values[model.id] = model
    }
    return new EntityPool({ values })
  }

  /**
   * Return a new instance which is newly removed entities of given id.
   */
  $remove(id: Id): EntityPool<T> {
    const values = { ...this.values }
    delete values[id]
    return new EntityPool({ values })
  }

  /**
   * Return an entity with the given id.
   * Throw an error if not exists.
   */
  get(id: Id): T {
    const entity = this.values[id]
    if (entity == null) throw new Error('NoId')
    return entity
  }

  /**
   * Return all registered entities.
   */
  getAll(): Array<T> {
    return Object.keys(this.values).map(key => this.values[key])
  }

  /**
   * Returns if the entity of given id exists.
   */
  has(id: Id): boolean {
    const entity = this.values[id]
    return entity != null
  }
}

