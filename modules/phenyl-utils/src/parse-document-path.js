// @flow

import type {
  DocumentPath,
} from 'phenyl-interfaces'

export function parseDocumentPath(docPath: DocumentPath): Array<string | number> {
  return docPath.split(/[.\[]/).map(
      attribute => attribute.charAt(attribute.length - 1) === ']' ? parseInt(attribute.slice(0, -1)) : attribute
  )
}
