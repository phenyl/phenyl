// @flow

import { describe, it } from 'kocha'
import assert from 'assert'
import { parseDocumentPath } from '../src/parse-document-path'

describe('parseDocumentPath', function () {
  it ('parses documentPath', function () {
    const docPath = 'user.favorites[1].music[30000]'
    const attributes = parseDocumentPath(docPath)
    assert.deepEqual(attributes, ['user', 'favorites', 1, 'music', 30000])
  })
})