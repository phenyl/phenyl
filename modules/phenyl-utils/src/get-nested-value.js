// @flow

import { parseDocumentPath } from './document-path.js'

import type {
  DocumentPath,
  Restorable,
} from 'phenyl-interfaces'

export function getNestedValue(obj: Restorable, docPath: DocumentPath): any {
  return parseDocumentPath(docPath).reduce((currentObj, key) => currentObj[key], obj)
}
