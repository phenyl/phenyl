// @flow

import deepEqual from 'fast-deep-equal'

import type {
  BSONTypeNumber,
  BSONTypeString,
  FindOperation,
  QueryCondition,
  ComparisonQueryOperatorName,
} from 'mongolike-operations'

import {
  normalizeQueryCondition,
  getNestedValue,
} from 'oad-utils/jsnext'

type Classified = {
  ok: Array<Object>,
  ng: Array<Object>,
}
/**
 *
 */
export default class PowerFilter {
  static filter(values: Array<Object>, where: FindOperation): Array<Object> {
    return this.classify(values, where).ok
  }

  /**
   * @private
   * Classify values into match or unmatch groups
   */
  static classify(values: Array<Object>, where: FindOperation): Classified {
    if (where.$and != null) {
      // TODO: confirm spec when $and is []
      return where.$and.reduce((vals, conds) => {
        const { ok, ng } = this.classify(vals.ok, conds)
        return { ok, ng: vals.ng.concat(ng) }
      }, { ok: values, ng: [] })
    }

    if (where.$nor != null) {
      // TODO: confirm spec when $nor is []
      return where.$nor.reduce((vals, conds) => {
        const { ok, ng } = this.classify(vals.ok, conds)
        return { ok: ng, ng: vals.ng.concat(ok) }
      }, { ok: values, ng: [] })
    }

    if (where.$or != null) {
      // TODO: confirm spec when $or is []
      return where.$or.reduce((vals, conds) => {
        const { ok, ng } = this.classify(vals.ng, conds)
        return { ok: vals.ok.concat(ok), ng }
      }, { ok: [], ng: values })
    }

    // SimpleFindOperation
    const documentPaths = Object.keys(where)
    return values.reduce((classified, value) => {
      const isOk = documentPaths.every(documentPath => {
        // $FlowIssue(queryCondition-is-QueryCondition-or-EqCondition)
        const queryCondition = where[documentPath]
        const nestedValue = getNestedValue(value, documentPath)
        return this.checkCondition(nestedValue, normalizeQueryCondition(queryCondition))
      })
      classified[isOk ? 'ok': 'ng'].push(value)
      return classified
    }, { ok: [], ng: [] })
  }

  /**
   * Check if leftOperand matches the condition
   */
  static checkCondition(leftOperand: any, condition: QueryCondition): boolean {
    const operators = Object.keys(condition)
    return operators.every(operator => {
      switch (operator) {
        case '$eq':
        case '$gt':
        case '$gte':
        case '$lt':
        case '$lte':
        case '$ne':
          // $FlowIssue(condition-has-operator-key)
          return this.compare(operator, leftOperand, condition[operator])

        case '$in':
        case '$nin':
          // $FlowIssue(condition-has-operator-key)
          return this.compareIn(operator, leftOperand, condition[operator])

        case '$not':
          if (condition.$not == null) throw new Error('$not is not found') // for flow
          return this.checkCondition(leftOperand, condition.$not) === false

        case '$exists':
          return (leftOperand != null) === condition.$exists

        case '$type':
          return (typeof condition.$type === 'number')
            ? getBSONTypeNumber(leftOperand) === condition.$type
            : getBSONTypeString(leftOperand) === condition.$type

        case '$mod':
          if (condition.$mod == null) throw new Error('$mod is not found') // for flow
          const [divisor, remainder] = condition.$mod
          return leftOperand % divisor === remainder

        case '$regex':
          if (condition.$regex == null) throw new Error('$regex is not found') // for flow
          const regex = (typeof condition.$regex === 'string')
            ? new RegExp(condition.$regex, condition.$options || undefined) // "null" is not allowed but undefined.
            : condition.$regex
          return regex.test(leftOperand)

        case '$text':
        case '$where':
        case '$geoIntersects':
        case '$geoWithin':
        case '$near':
        case '$nearSphere':
          throw new Error(`Operator "${operator}" is currently unimplemented in power-filter.`)
        case '$all':
          if (condition.$all == null) throw new Error('$all is not found') // for flow
          if (!Array.isArray(leftOperand)) return false
          return condition.$all.every(val =>
            leftOperand.some(elem => deepEqual(elem, val))
          )

        case '$elemMatch':
          if (condition.$elemMatch == null) throw new Error('$elemMatch is not found') // for flow
          if (!Array.isArray(leftOperand)) return false
          return leftOperand.every(elem =>
            // $FlowIssue(condition-$elemMatch-is-not-null)
            this.checkCondition(elem, condition.$elemMatch)
          )

        case '$size':
          if (!Array.isArray(leftOperand)) return false
          return leftOperand.length === condition.$size

        case '$bitsAllClear':
        case '$bitsAllSet':
        case '$bitsAnyClear':
        case '$bitsAnySet':
          throw new Error(`Operator "${operator}" is currently unimplemented in power-filter.`)

        // co-operator of $regex
        case '$options':
          return true

        default:
          throw new Error(`Unknown operator: "${operator}".`)
      }
    })
  }

  /**
   * Compare values
   * when to query an array for an element
   * return true if the array field contains at least one matched element
   * @see https://docs.mongodb.com/manual/tutorial/query-arrays/#query-an-array-for-an-element
   */
  static compareIn(operator: '$in' | '$nin', target: any, condValues: any): boolean {
    if (!Array.isArray(condValues)) throw new Error(`${operator} needs an array`)
    if (!Array.isArray(target)) {
      return COMPARE_FUNC[operator](target, condValues)
    }

    const isIn = condValues.some(condValue => this.compare('$eq', target, condValue))
    return operator === '$in' ? isIn : !isIn
  }

  static compare(operator: '$eq' | '$gt' | '$gte' | '$lt' | '$lte' | '$ne', target: any, condValue: any): boolean {
    let compareFunc = COMPARE_FUNC[operator]
    const isQueryArrayForAnElement = Array.isArray(target) && !Array.isArray(condValue)

    if (isQueryArrayForAnElement) {
      if (operator === '$ne') {
        compareFunc = COMPARE_FUNC['$eq']
        return !target.some(val => compareFunc(val, condValue))
      }
      return target.some(val => compareFunc(val, condValue))
    }

    return compareFunc(target, condValue)
  }
}

const COMPARE_FUNC: { [key: ComparisonQueryOperatorName]: (any, any) => boolean } = {
  $eq : deepEqual,
  $gt : (t, c) => t > c,
  $gte : (t, c) => t >= c,
  $in : (t, c) => c.some(v => deepEqual(t, v)),
  $lt : (t, c) => t < c,
  $lte : (t, c) => t <= c,
  $ne : (t, c) => !deepEqual(t, c),
  $nin : (t, c) => !c.some(v => deepEqual(t, v)),
}

/**
 * Filter the given values
 */
export function filter(values: Array<Object>, where: FindOperation): Array<Object> {
  return PowerFilter.filter(values, where)
}

/**
 * Check if the givne value matches the condition
 */
export function checkCondition(value: any, condition: QueryCondition): boolean {
  return PowerFilter.checkCondition(value, condition)
}

/**
 * get BSON Type of the given value as a string
 * @see https://docs.mongodb.com/manual/reference/operator/query/type/
 */
function getBSONTypeString(val: any): BSONTypeString {
  switch (typeof val) {
    case 'number':
      return (parseInt(val, 10) === val) ? 'int' : 'double'

    case 'string':
      return 'string'

    case 'boolean':
      return 'bool'

    case 'undefined':
      return 'undefined'

    case 'function':
      return 'javascript'

    case 'object':
    default:
      if (val instanceof Date) return 'date'
      if (val instanceof RegExp) return 'regex'
      if (Array.isArray(val)) return 'array'
      return val ? 'object' : 'null'

    // TODO: confirm spec
  }
}

/**
 * get BSON Type of the given value as a number
 * @see https://docs.mongodb.com/manual/reference/operator/query/type/
 */
function getBSONTypeNumber(val: any): BSONTypeNumber {
  const map = {
    double: 1,
    string: 2,
    object: 3,
    array: 4,
    binData: 5,
    undefined: 6,
    objectId: 7,
    bool: 8,
    date: 9,
    null: 10,
    regex: 11,
    dbPointer: 12,
    javascript: 13,
    symbol: 14,
    javascriptWithScope: 15,
    int: 16,
    timestamp: 17,
    long: 18,
    decimal: 19,
    minKey: -1,
    maxKey: 127,
  }
  return map[getBSONTypeString(val)]
}
