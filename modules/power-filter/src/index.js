// @flow

import type {
  Restorable,
  WhereQuery,
} from 'phenyl-interfaces'

/**
 *
 */
class PowerFilter {
  static find(values: Array<Restorable>, q: WhereQuery): Array<Restorable> {
    // TODO
    return values
  }

  static findOne(values: Array<Restorable>, q: WhereQuery): Restorable {
    // TODO
    return values[0]
  }
}
