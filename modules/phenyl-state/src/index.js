// @flow
import type {
  DeleteCommand,
  IdQuery,
  IdsQuery,
  InsertCommand,
  Restorable,
  UpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

import { filter } from 'power-filter/jsnext'
import { assign } from 'power-assign/jsnext'

type PlainPhenylState = {
  entities: {}
}

/**
 *
 */
export default class PhenylState {
  entities: { [name: string]: { [key: string]: {} } }

  constructor(plain: PlainPhenylState) {
    this.entities = plain.entities
  }

  /**
   *
   */
  find(query: WhereQuery): Array<Restorable> {
    const entities = this.entities[query.from]
    const allEntities = Object.keys(entities).map(key => entities[key])
    return filter(allEntities, query.where)
  }

  /**
   *
   */
  findOne(query: WhereQuery): Restorable {
    return this.find(query)[0]
  }

  /**
   *
   */
  get(query: IdQuery): Restorable {
    const entity = this.entities[query.from][query.id]
    if (entity == null) throw new Error('NoId')
    return entity
  }

  /**
   *
   */
  $update(command: UpdateCommand): PhenylState {
    return assign(this, { $set: {} })
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
    const modelName = command.from
    //$FlowIssue(union-type)
    const values = command.values ? command.values : [command.value]
    const operators = {}

    //$FlowIssue(values is array)
    values.forEach(value => {
      const key = Object.keys(value)[0]
      operators[`entities.${modelName}.${key}`] = value[key]
    })

    return assign(this, { $set: operators })
  }

  /**
   *
   */
  $unregister(command: InsertCommand): PhenylState {
    const modelName = command.from
    //$FlowIssue(union-type)
    const values = command.values ? command.values : [command.value]
    const operators = {}

    //$FlowIssue(values is array)
    values.forEach(value => {
      const key = Object.keys(value)[0]
      operators[`entities.${modelName}.${key}`] = value[key]
    })

    return assign(this, { $set: operators })
  }
}
