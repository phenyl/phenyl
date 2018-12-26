// @flow

import type {
  DocumentPath,
  Restorable,
} from 'mongolike-operations'
import { parseDocumentPath } from 'oad-utils/jsnext'

export function getObjectsToBeAssigned(obj: Restorable, docPath: DocumentPath): Array<Restorable> {
  const ret = [obj]
  const keys = parseDocumentPath(docPath)
  keys.pop()
  let currentObj = obj
  for (const key of keys) {
    currentObj = currentObj[key] || {}
    ret.push(currentObj)
  }
  return ret
}
