// @flow

import { parseDocumentPath } from './document-path.js'

import type {
  DocumentPath,
} from 'mongolike-operations'

/**
 * @public
 * Get the value in the object at the DocumentPath.
 */
export function getNestedValue(obj: Object, docPath: DocumentPath, noNullAccess?: boolean): any {
  const keys = parseDocumentPath(docPath)
  let currentObj = obj
  for (const key of keys) {
    try {
      currentObj = currentObj[key]
    }
    catch (e) {
      if (noNullAccess) {
        throw new Error(`Cannot get value by the document path: "${docPath}". The property "${key}" is not found in the upper undefined object.`)
      }
      return undefined
    }
  }
  return currentObj
}

/**
 * @public
 * Check if the object has the DocumentPath.
 */
export function hasOwnNestedProperty(obj: Object, docPath: DocumentPath): boolean {
  let currentObj = obj
  for (const key of parseDocumentPath(docPath)) {
    if (!currentObj || !currentObj.hasOwnProperty(key)) {
      return false
    }
    currentObj = currentObj[key]
  }
  return true
}
