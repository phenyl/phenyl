// @flow

import type {
  Restorable,
  WhereConditions,
} from 'phenyl-interfaces'

/**
 *
 */
export default class PowerFilter {
  static find(values: Array<Restorable>, where: WhereConditions): Array<Restorable> {
    // TODO
    return values
  }

  static findOne(values: Array<Restorable>, where: WhereConditions): Restorable {
    // TODO
    return values[0]
  }
}

export function filter(values: Array<Restorable>, where: WhereConditions): Array<Restorable> {
  return PowerFilter.find(values, where)
}
