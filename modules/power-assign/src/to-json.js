// @flow
import type {
  UpdateOperation,
} from 'mongolike-operations'

export function toJSON(operation: Object): UpdateOperation {
  if (operation.$restore == null) {
    return operation
  }
  const $restore = {}
  Object.keys(operation.$restore).forEach(docPath => $restore[docPath] = '')
  return Object.assign({}, operation, { $restore })
}
