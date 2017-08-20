// @flow

import type {
  Restorable,
  WhereQuery,
} from 'phenyl-interfaces'

/**
 *
 */
export default class PowerFilter {
  static find(values: Array<Restorable>, q: WhereQuery): Array<Restorable> {
    // TODO
    return values
  }

  static findOne(values: Array<Restorable>, q: WhereQuery): Restorable {
    // TODO
    return values[0]
  }
}

export function filter(values: Array<Restorable>, q: WhereQuery): Array<Restorable> {
  return PowerFilter.find(values, q)
}

