// @flow
import {
  normalizeQueryCondition
} from './normalize-query-condition.js'

import type {
  FindOperation,
  QueryCondition,
  SimpleFindOperation,
} from 'mongolike-operations'

export type FindOperationVisitor = {
  simpleFindOperation?: (operation: SimpleFindOperation) => SimpleFindOperation,
  queryCondition?: (condition: QueryCondition) => QueryCondition,
}

/**
 * @public
 * Modify FindOperation by passing visitor functions.
 */
export function visitFindOperation(where: Object, visitor: FindOperationVisitor): FindOperation {
  if (where.$and != null) {
    // $FlowIssue(this-is-not-SimpleFindOperation)
    return { $and: where.$and.map(subWhere => visitFindOperation(subWhere, visitor)) }
  }

  if (where.$nor != null) {
    // $FlowIssue(this-is-not-SimpleFindOperation)
    return { $nor: where.$nor.map(subWhere => visitFindOperation(subWhere, visitor)) }
  }

  if (where.$or != null) {
    // $FlowIssue(this-is-not-SimpleFindOperation)
    return { $or: where.$or.map(subWhere => visitFindOperation(subWhere, visitor)) }
  }
  return visitSimpleFindOperation(where, visitor)
}

/**
 * @private
 */
function visitSimpleFindOperation(_where: SimpleFindOperation, visitor: FindOperationVisitor): SimpleFindOperation {
  const where = visitor.simpleFindOperation ? visitor.simpleFindOperation(_where) : _where
  const queryConditionVisitor = visitor.queryCondition
  if (queryConditionVisitor == null) {
    return where
  }
  const documentPaths = Object.keys(where)
  const modified = {}
  for (const documentPath of documentPaths) {
    // $FlowIssue(queryCondition-is-QueryCondition-or-EqCondition)
    const queryCondition = normalizeQueryCondition(where[documentPath]|| {})
    modified[documentPath] = queryConditionVisitor(queryCondition)

    if (queryCondition.$not) {
      modified[documentPath] = Object.assign({}, modified[documentPath], { $not: queryConditionVisitor(queryCondition.$not) })
    }
  }
  // $FlowIssue(this-is-SimpleFindOperation)
  return Object.assign({}, where, modified)
}
