// @flow
import type {
  DeleteCommand,
  EntityState,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  IdDeleteCommand,
  MultiUpdateCommand,
  MultiDeleteCommand,
  RestorableEntity,
  UpdateCommand,
  UpdateOperators,
  WhereQuery,
} from 'phenyl-interfaces'

import { sortByNotation } from 'phenyl-utils/jsnext'
import { filter } from 'power-filter/jsnext'
import { assignToProp, retargetToProp, unassignProp, mergeOperators } from 'power-assign/jsnext'

export type PhenylStateParams = {
  entities?: { [name: string]: { [key: string]: RestorableEntity } }
}

/**
 *
 */
export default class PhenylState implements EntityState {
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
  $update(command: UpdateCommand): UpdateOperators {
    if (command.where) {
      return this.$updateByWhereCondition(command)
    }
    return this.$updateById(command)
  }

  /**
   *
   */
  $updateById(command: IdUpdateCommand): UpdateOperators {
    const { id, entityName, operators } = command
    const thisPropName = ['entities', entityName, id].join('.')
    return retargetToProp(thisPropName, operators)
  }

  /**
   *
   */
  $updateByWhereCondition(command: MultiUpdateCommand): UpdateOperators {
    const { where, entityName, operators } = command
    const targetEntities = this.find({ entityName, where })
    const operatorsList = targetEntities.map(targetEntity => {
      const thisPropName = ['entities', entityName, targetEntity.id].join('.')
      return retargetToProp(thisPropName, operators)
    })
    return mergeOperators(...operatorsList)
  }

  /**
   * Register entities.
   * As RestorablePreEntities in InsertCommand does not have "id",
   * PhenylState cannot handle InsertCommand.
   * Instead, it receives in entities created in server.
   */
  $register(entityName: string, ...entities: Array<RestorableEntity>): UpdateOperators {
    const operatorsList = entities.map(entity => {
      const docPath = ['entities', entityName, entity.id].join('.')
      return retargetToProp(docPath, { $set: entity })
    })
    return mergeOperators(...operatorsList)
  }

  /**
   *
   */
  $delete(command: DeleteCommand): UpdateOperators {
    if (command.where) {
      return this.$deleteByWhereConditions(command)
    }
    return this.$deleteById(command)
  }

  /**
   *
   */
  $deleteById(command: IdDeleteCommand): UpdateOperators {
    const { id, entityName } = command
    return unassignProp(this, ['entities', entityName, id].join('.'))
  }

  /**
   *
   */
  $deleteByWhereConditions(command: MultiDeleteCommand): UpdateOperators {
    const { where, entityName } = command
    const targetEntities = this.find({ entityName, where })
    const operatorsList = targetEntities.map(targetEntity => {
      const docPath = ['entities', entityName, targetEntity.id].join('.')
      return { $unset: { [docPath]: ''} }
    })
    return mergeOperators(...operatorsList)
  }
}
