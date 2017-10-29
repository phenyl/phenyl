// @flow
import {
  normalizeQueryCondition
} from './normalize-query-condition.js'

import type {
  AddToSetOperator,
  PullOperator,
  PushOperator,
  RegularAddToSetOperator,
  RegularPullOperator,
  RegularPushOperator,
  RegularUpdateOperation,
  UpdateOperation,
} from 'mongolike-operations'

/**
 * 1. When no operators are found, convert it into $set operator.
 * 2. Normalize $addToSet.
 * 3. Normalize $pull.
 * 4. Normalize $push.
 */
export function normalizeUpdateOperation(_operation: Object): RegularUpdateOperation {
  let operation = toUpdateOperation(_operation)
  if (operation.$addToSet != null) {
    operation = Object.assign({}, operation, { $addToSet: normalizeAddToSetOperator(operation.$addToSet) })
  }
  if (operation.$pull != null) {
    operation = Object.assign({}, operation, { $pull: normalizePullOperator(operation.$pull) })
  }
  if (operation.$push != null) {
    operation = Object.assign({}, operation, { $push: normalizePushOperator(operation.$push) })
  }

  return operation
}

function normalizeAddToSetOperator($addToSet: AddToSetOperator): RegularAddToSetOperator {
  const modified = {}
  Object.keys($addToSet).forEach(docPath => {
    let modifier = $addToSet[docPath]

    // Is type of newVal PushModifier or just the value?
    if (modifier.$each == null) {
      modifier = { $each: [modifier] }
    }
    modified[docPath] = modifier
  })
  return modified
}

function normalizePullOperator($pull: PullOperator): RegularPullOperator {
  const modified = {}
  Object.keys($pull).forEach(docPath => {
    modified[docPath] = normalizeQueryCondition($pull[docPath])
  })
  return modified
}

function normalizePushOperator($push: PushOperator): RegularPushOperator {
  const modified = {}
  Object.keys($push).forEach(docPath => {
    let modifier = $push[docPath]

    // Is type of newVal PushModifier or just the value?
    if (modifier.$each == null) {
      modifier = { $each: [modifier] }
    }
    modified[docPath] = modifier
  })
  return modified
}

/**
 * When no operators are found, convert it into $set operator.
 */
export function toUpdateOperation(operation: Object): UpdateOperation {
  const firstKey = Object.keys(operation)[0]
  if (!firstKey) return operation
  if (firstKey.charAt(0) !== '$') return { $set: operation }
  return operation
}
