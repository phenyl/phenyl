import { QueryCondition, EqCondition } from 'phenyl-interfaces'
/**
 * QueryCondition | EqCondition => QueryCondition
 */

export function normalizeQueryCondition(condition: QueryCondition | EqCondition): QueryCondition {
  if (typeof condition != 'object' || Array.isArray(condition)) {
    return {
      $eq: condition,
    }
  }

  const keys = Object.keys(condition) // if empty, regarded as QueryCondition

  if (keys[0] == null) {
    return condition
  }

  return keys[0].charAt(0) === '$'
    ? condition
    : {
        $eq: condition,
      }
}
