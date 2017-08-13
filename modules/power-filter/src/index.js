// @flow

import type {
  Restorable,
  Query,
  WhereQuery,
} from 'phenyl-interfaces'

/**
 *
 */
class PowerFilter {
  static find(values: Array<Restorable>, q: Query): Array<Restorable> {
    let whereQuery: WhereQuery
    if (q.id) {
      whereQuery = Object.assign({}, q)
      query.where = { $eq: { id: query.id }}
      delete query.id
    }

    // TODO
    return values
  }

  static findOne(values: Array<Restorable>, q: Query): Restorable {
    // TODO
    return values[0]
  }
}
