// @flow
import type {
  QueryCondition,
  EqCondition,
} from 'mongolike-operations'

/**
 * QueryCondition | EqCondition => QueryCondition
 */
export function normalizeQueryCondition(condition: QueryCondition | ?EqCondition): QueryCondition {
  if (condition == null) {
    return { $eq: null }
  }
  if (isRegExp(condition)) {
    // $FlowIssue(only-regex-comes-here)
    return { $regex: condition }
  }

  if (typeof condition != 'object' || Array.isArray(condition)) {
    return { $eq: condition }
  }
  const keys = Object.keys(condition)
  // if empty, regarded as QueryCondition
  if (keys[0] == null) {
    return condition
  }
  return keys[0].charAt(0) === '$' ? condition : { $eq: condition }
}

function isRegExp(val: any): boolean {
  return val && val.constructor === RegExp
}
