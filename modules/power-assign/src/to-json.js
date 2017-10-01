// @flow
import type {
  UpdateOperators,
} from 'phenyl-interfaces'

export function toJSON(ops: Object): UpdateOperators {
  if (ops.$restore == null) {
    return ops
  }
  const $restore = {}
  Object.keys(ops.$restore).forEach(docPath => $restore[docPath] = '')
  return Object.assign({}, ops, { $restore })
}
