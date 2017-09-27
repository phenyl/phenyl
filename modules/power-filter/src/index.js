// @flow

import type {
  RestorableEntity,
  WhereConditions,
} from 'phenyl-interfaces'

/**
 *
 */
export default class PowerFilter {
  static find(values: Array<RestorableEntity>, where: WhereConditions): Array<RestorableEntity> {
    return values
  }

  static findOne(values: Array<RestorableEntity>, where: WhereConditions): RestorableEntity {
    const filteredValues = this.find(values, where)
    return filteredValues[0]
  }
}

export function filter(values: Array<RestorableEntity>, where: WhereConditions): Array<RestorableEntity> {
  return PowerFilter.find(values, where)
}
