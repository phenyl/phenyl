// @flow

import type {
  DotNotationString,
  DocumentPath,
} from 'phenyl-interfaces'

export function convertToDotNotationString(docPath: DocumentPath): DotNotationString {
  return docPath.replace(/\[(\d{1,})\]/g, '.$1')
}
