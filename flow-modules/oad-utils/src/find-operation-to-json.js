// @flow
import type {
  FindOperation,
  QueryCondition,
} from 'mongolike-operations'

import {
  visitFindOperation
} from './visit-find-operation.js'

/**
 *
 */
export function findOperationToJSON(where: Object): FindOperation {
  return visitFindOperation(where, {
    queryCondition(condition: QueryCondition) {
      return queryConditionToJSON(condition)
    }
  })
}

/**
 *
 */
export function queryConditionToJSON(queryCondition: QueryCondition): $Supertype<QueryCondition> {
  if (queryCondition.$regex == null || typeof queryCondition.$regex === 'string') {
    return queryCondition
  }

  const { pattern, flags } = regexToJSON(queryCondition.$regex)
  const newCondition = flags
    ? { $regex: pattern, $options: flags }
    : { $regex: pattern }
  return Object.assign({}, queryCondition, newCondition)
}

function regexToJSON(regex: RegExp): { pattern: string, flags: ?RegExp$flags } {
  const matched = regex.toString().match(/\/(.*?)\/([gimy]*)?$/)
  // $FlowIssue(stringified-regex-always-match-the-pattern)
  return { pattern: matched[1], flags: matched[2] }
}
