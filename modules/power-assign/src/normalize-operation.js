// @flow

import type {
  UpdateOperation,
} from 'mongolike-operations'

/**
 *
 */
export function normalizeOperation(operation: Object): UpdateOperation {
  const firstKey = Object.keys(operation)[0]
  if (!firstKey) return operation
  if (firstKey.charAt(0) !== '$') return { $set: operation }
  return operation
}
