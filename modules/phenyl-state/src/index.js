// @flow
import type {
  DeleteCommand,
  EntitiesState,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  IdDeleteCommand,
  MultiUpdateCommand,
  MultiDeleteCommand,
  RestorableEntity,
  UpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

import { sortByNotation } from 'phenyl-utils/jsnext'
import { filter } from 'power-filter/jsnext'
import { assignToProp, unassignProp } from 'power-assign/jsnext'

export type PhenylStateParams = {
  entities?: { [name: string]: { [key: string]: RestorableEntity } }
}

/**
 *
 */
export default class PhenylState implements EntitiesState {
  entities: { [entityName: string]: { [id: string]: RestorableEntity } }

  constructor(plain: PhenylStateParams = {}) {
    this.entities = plain.entities || {}
  }

  getAll(entityName: string): Array<RestorableEntity> {
    const entities = this.entities[entityName]
    if (entities == null) {
      throw new Error(`entityName: "${entityName}" is not found.`)
    }
    return Object.keys(entities).map(key => entities[key])
  }

  /**
   *
   */
  find(query: WhereQuery): Array<RestorableEntity> {
    const {
      entityName,
      where,
      sort,
      skip,
      limit,
    } = query
    let filtered = filter(this.getAll(entityName), where)
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
  findOne(query: WhereQuery): ?RestorableEntity {
    return this.find(query)[0]
  }

  /**
   *
   */
  get(query: IdQuery): RestorableEntity {
    const entity = this.entities[query.entityName][query.id]
    if (entity == null) throw new Error('NoId')
    return entity
  }

  /**
   *
   */
  getByIds(query: IdsQuery): Array<RestorableEntity> {
    const { ids, entityName } = query
    // TODO: handle error
    return ids.map(id => this.get({ entityName, id }))
  }

  /**
   *
   */
  $update(command: UpdateCommand): PhenylState {
    if (command.where) {
      return this.$updateByWhereCondition(command)
    }
    return this.$updateById(command)
  }

  /**
   *
   */
  $updateById(command: IdUpdateCommand): PhenylState {
    const { id, entityName, operators } = command
    const thisPropName = ['entities', entityName, id].join('.')
    return assignToProp(this, thisPropName, operators)
  }

  /**
   *
   */
  $updateByWhereCondition(command: MultiUpdateCommand): PhenylState {
    const { where, entityName, operators } = command
    const targetEntities = this.find({ entityName, where })
    return targetEntities.reduce((self, targetEntity) => {
      const thisPropName = ['entities', entityName, targetEntity.id].join('.')
      return assignToProp(self, thisPropName, operators)
    }, this)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  $register(entityName: string, ...entities: Array<RestorableEntity>): PhenylState {
    return entities.reduce((self, entity) => {
      const thisPropName = ['entities', entityName, entity.id].join('.')
      return assignToProp(self, thisPropName, { $set: entity })
    }, this)
  }

  /**
   *
   */
  $delete(command: DeleteCommand): PhenylState {
    if (command.where) {
      return this.$deleteByWhereConditions(command)
    }
    return this.$deleteById(command)
  }

  /**
   *
   */
  $deleteById(command: IdDeleteCommand): PhenylState {
    const { id, entityName } = command
    return unassignProp(this, ['entities', entityName, id].join('.'))
  }

  /**
   *
   */
  $deleteByWhereConditions(command: MultiDeleteCommand): PhenylState {
    const { where, entityName } = command
    const targetEntities = this.find({ entityName, where })
    return targetEntities.reduce((self, targetEntity) => {
      const thisPropName = ['entities', entityName, targetEntity.id].join('.')
      return unassignProp(self, thisPropName)
    }, this)
  }
}
