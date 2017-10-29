// @flow
import deepMerge from 'deepmerge'
import { normalizeUpdateOperation } from './normalize-update-operation.js'
import type {
  UpdateOperation,
} from 'mongolike-operations'

/**
 * Merge update operations.
 * TODO: Currently there are some cases are not merged well (See test cases.)
 */
export function mergeUpdateOperations(...operationList: Array<Object>): UpdateOperation {
  return deepMerge.all(operationList.map(normalizeUpdateOperation))
}
