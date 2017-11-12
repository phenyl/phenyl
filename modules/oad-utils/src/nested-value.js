// @flow

import { parseDocumentPath } from './document-path.js'

import type {
  DocumentPath,
} from 'mongolike-operations'

/**
 *
 */
export function getNestedValue(obj: Object, docPath: DocumentPath): any {
  return parseDocumentPath(docPath).reduce((currentObj, key) => {
    try {
      return currentObj[key]
    }
    catch (e) {
      throw new Error(`Cannot get value by the document path: "${docPath}". The property "${key}" is not found in the upper undefined object.`)
    }
  }, obj)
}

/**
 *
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
