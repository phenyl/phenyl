// @flow

import { describe, it } from 'mocha'
import assert from 'power-assert'
import {
  parseDocumentPath,
  convertToDotNotationString,
  createDocumentPath,
} from '../src/document-path.js'

describe('parseDocumentPath', function () {
  it ('parses documentPath', function () {
    const docPath = 'user.favorites[1].music[30000]'
    const attributes = parseDocumentPath(docPath)
    assert.deepEqual(attributes, ['user', 'favorites', 1, 'music', 30000])
  })
})

describe('convertToDotNotation', function () {
  it ('converts docPath to dotNotationString', function () {
    const docPath = 'user.favorites[1].music[30000]'
    const dotnotationString = convertToDotNotationString(docPath)
    assert(dotnotationString === 'user.favorites.1.music.30000')
  })
})

describe('createDocumentPath', function () {
  it ('converts attributes list to DocumentPath', function () {
    const attrs = ['users', 1, 'favorites', 'musics', 24, 'title', '3', 'value']
    const docPath = createDocumentPath(...attrs)
    assert(docPath === 'users[1].favorites.musics[24].title.3.value')
  })
  it ('returns empty string when no attribute list is given', function () {
    assert(createDocumentPath() === '')
  })
})
