// @flow

import type {
  UpdateOperation,
} from 'mongolike-operations'

/**
 *
 */
export function normalizeOperation(ops: Object): UpdateOperation {
  const firstKey = Object.keys(ops)[0]
  if (!firstKey) return ops
  if (firstKey.charAt(0) !== '$') return { $set: ops }
  return ops
}
