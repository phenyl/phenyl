// @flow

import { describe, it } from 'kocha'
import assert from 'power-assert'
import { filter } from '../src/index.js'

describe('filter', () => {
  it('$regex operation can be passed string', () => {
    const objs = ['John', 'Mark', 'Mary'].map(name => ({ name }))
    const filtered = filter(objs, { name: { $regex: '[jy]', $options: 'i' } })
    assert.deepEqual(filtered, [
      { name: 'John' },
      { name: 'Mary' },
    ])
  })
})
