// @flow
import {
  queryConditionToJSON
} from './find-operation-to-json.js'
import {
  normalizeQueryCondition
} from './normalize-query-condition.js'

import type {
  UpdateOperation,
} from 'mongolike-operations'

export function updateOperationToJSON(_operation: Object): UpdateOperation {
  let operation = _operation
  if (operation.$restore != null) {
    const $restore = {}
    Object.keys(operation.$restore).forEach(docPath => $restore[docPath] = '')
    operation = Object.assign({}, operation, { $restore })
  }

  if (operation.$pull != null) {
    const queryCondition = queryConditionToJSON(normalizeQueryCondition(operation.$pull))
    operation = Object.assign({}, operation, { $pull: queryCondition })
  }
  return operation
}
