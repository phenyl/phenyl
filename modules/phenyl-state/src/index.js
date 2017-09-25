// @flow
import type {
  DeleteCommand,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  InsertCommand,
  MultiUpdateCommand,
  RestorableEntity,
  UpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

import { sortByNotation } from 'phenyl-utils/jsnext'
import { filter } from 'power-filter/jsnext'
import { assign } from 'power-assign/jsnext'

type PlainPhenylState = {
  entities: { [name: string]: { [key: string]: RestorableEntity } }
}

/**
 *
 */
export default class PhenylState {
  entities: { [name: string]: { [key: string]: RestorableEntity } }

  constructor(plain: PlainPhenylState) {
    this.entities = plain.entities
  }

  getAll(entityName: string): Array<RestorableEntity> {
    const entities = this.entities[entityName]
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
    return filtered.slice(skip || 0, limit != null ? limit : filtered.length)
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
  $update(command: UpdateCommand): PhenylState {
    if (command.where) {
      return this.$updateByWhereCondition(command)
    }
    return this.$updateById(command)
  }

  $updateById(command: IdUpdateCommand): PhenylState {
    // TODO
    return this
  }

  $updateByWhereCondition(command: MultiUpdateCommand): PhenylState {
    // TODO
    return this
  }

  /**
   *
   */
  $delete(command: DeleteCommand): PhenylState {
    return assign(this, { $set: {} })
  }

  /**
   * TODO rename insert register
   */
  $insert(command: InsertCommand): PhenylState {
    const { entityName } = command
    //$FlowIssue(union-type)
    const values = command.values ? command.values : [command.value]
    const operators = {}

    //$FlowIssue(values is array)
    values.forEach(value => {
      const key = Object.keys(value)[0]
      operators[`entities.${entityName}.${key}`] = value[key]
    })

    return assign(this, { $set: operators })
  }

  /**
   *
   */
  $unregister(command: InsertCommand): PhenylState {
    const { entityName } = command
    //$FlowIssue(union-type)
    const values = command.values ? command.values : [command.value]
    const operators = {}

    //$FlowIssue(values is array)
    values.forEach(value => {
      const key = Object.keys(value)[0]
      operators[`entities.${entityName}.${key}`] = value[key]
    })

    return assign(this, { $set: operators })
  }
}
