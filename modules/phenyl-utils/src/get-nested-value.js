// @flow

import { parseDocumentPath } from './document-path.js'

import type {
  DocumentPath,
  Restorable,
} from 'phenyl-interfaces'

export function getNestedValue(obj: Restorable, docPath: DocumentPath): any {
  return parseDocumentPath(docPath).reduce((currentObj, key) => {
    try {
      return currentObj[key]
    }
    catch (e) {
      throw new Error(`Cannot get value by the document path: "${docPath}". The property "${key}" is not found in the upper undefined object.`)
    }
  }, obj)
}
