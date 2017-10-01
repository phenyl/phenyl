// @flow

import { describe, it } from 'kocha'
import assert from 'assert'
import { convertToDotNotationString } from '../src/convert-to-dot-notation-string'

describe('convertToDotNoation', function () {
  it ('converts docPath to dotNotationString', function () {
    const docPath = 'user.favorites[1].music[30000]'
    const dotnotationString = convertToDotNotationString(docPath)
    assert(dotnotationString === 'user.favorites.1.music.30000')
  })
})