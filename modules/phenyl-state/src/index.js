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
import EntityPool from './entity-pool'

type PlainPhenylState = {

}

/**
 *
 */
class PhenylState {
  entities: { [name: string]: EntityPool }

  constructor(plain: PlainPhenylState) {
  }

  /**
   *
   */
  find(query: WhereQuery): Array<Restorable> {
    const allEntities = this.entities[query.from].getAll()
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
    return this.entities[query.from].get(query.id)
  }

  /**
   *
   */
  $update(command: UpdateCommand): PhenylState {
    return assign(this, command.operators)
  }

  /**
   *
   */
  $delete(command: DeleteCommand): PhenylState {
    return assign(this, command.operators)
  }

  /**
   *
   */
  $insert(command: InsertCommand): PhenylState {
    return assign(this, command.operators)
  }
}
