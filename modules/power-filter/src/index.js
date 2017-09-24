// @flow

import type {
  RestorableEntity,
  DotNotationString,
  WhereConditions,
  QueryCondition,
} from 'phenyl-interfaces'

import {
  normalizeQueryCondition,
} from 'phenyl-utils/jsnext'

/**
 *
 */
export default class PowerFilter {
  static find(values: Array<RestorableEntity>, where: WhereConditions): Array<RestorableEntity> {
    const dotNotations = Object.keys(where)
    return values.filter(value =>
      dotNotations.every(dotNotation =>

        this.checkCondition(value, dotNotation, where[dotNotation])
      )
    )
  }

  static checkCondition(value: RestorableEntity, dotNotation: DotNotationString, condition: QueryCondition): boolean {
    const operators = Object.keys(condition)
    return operators.every(operator => {
      switch (operator) {
        case '$eq':
        case '$gt':
        case '$gte':
        case '$in':
        case '$lt':
        case '$lte':
        case '$ne':
        case '$nin':
        case '$and':
        case '$not':
        case '$nor':
        case '$or':
        case '$exists':
        case '$type':
        case '$mod':
        case '$regex':
        case '$text':
        case '$where':
        case '$geoIntersects':
        case '$geoWithin':
        case '$near':
        case '$nearSphere':
        case '$all':
        case '$elemMatch':
        case '$size':
        case '$bitsAllClear':
        case '$bitsAllSet':
        case '$bitsAnyClear':
        case '$bitsAnySet':
        default:
          return true // TODO
      }
    })
  }

  static findOne(values: Array<RestorableEntity>, where: WhereConditions): RestorableEntity {
    const filteredValues = this.find(values, where)
    return filteredValues[0]
  }
}

export function filter(values: Array<RestorableEntity>, where: WhereConditions): Array<RestorableEntity> {
  return PowerFilter.find(values, where)
}
