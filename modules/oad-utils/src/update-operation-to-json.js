// @flow
import type {
  UpdateOperation,
} from 'mongolike-operations'

export function updateOperationToJSON(operation: Object): UpdateOperation {
  if (operation.$restore == null) {
    return operation
  }
  const $restore = {}
  Object.keys(operation.$restore).forEach(docPath => $restore[docPath] = '')
  return Object.assign({}, operation, { $restore })
}
