// @flow
import type {
  QueryCondition,
  DotNotationString,
  QueryExpression,
} from 'phenyl-interfaces'

/**
 *
 */
export default class QueryOpeation {
  /**
   *
   */
  static findInArrayByQuery(arr: Array<any>, q: any | QueryCondition) {
    const query = this.normalizeQuery(q)

    const operatorNames = Object.keys(query)

    for (const operatorName of operatorNames) {
      switch (operatorName) {
        case '$eq':
      }
    }

    return arr // To Be implemented
  }

  /**
   *
   */
  static normalizeQuery(q: any | QueryCondition): QueryCondition {
    if (q == null || typeof q !== 'object') {
      return {}
    }
    if (Object.keys(q)[0].charAt(0) !== '$') {
      return { $eq: q }
    }
    return q
  }
}
