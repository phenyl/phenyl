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

  describe('an Array for an Element', () => {

    const data = [
      { item: 'journal', tags: ['blank', 'red'], dim_cm: [ 14, 21 ] },
      { item: 'notebook', tags: ['red', 'blank'], dim_cm: [ 14, 21 ] },
      { item: 'paper', tags: ['red', 'blank', 'plain'], dim_cm: [ 14, 21 ] },
      { item: 'planner', tags: ['blank', 'red'], dim_cm: [ 22.85, 30 ] },
      { item: 'postcard', tags: ['blue'], dim_cm: [ 10, 15.25 ] }
    ]

    describe('$eq', () => {
      it('find same array', () => {
        const filtered = filter(data, { tags: ['red', 'blank'] })
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['notebook'])
      })

      it('find if the array field contains at least one element', () => {
        const filtered = filter(data, { tags: 'red' })
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'planner'])
      })
    })

    describe('$ne', () => {
      it('find if the array field does not contain any element', () => {
        const filtered = filter(data, { tags: { '$ne': 'red' }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })
    })

    describe('$gt', () => {
      it('find if the array field contains at least one element', () => {
        const filtered = filter(data, { dim_cm: { '$gt': 21 }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['planner'])
      })
    })

    describe('$gte', () => {
      it('find if the array field contains at least one element', () => {
        const filtered = filter(data, { dim_cm: { '$gte': 21 }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'planner'])
      })
    })

    describe('$lt', () => {
      it('find if the array field contains at least one element', () => {
        const filtered = filter(data, { dim_cm: { '$lt': 14 }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })
    })

    describe('$lte', () => {
      it('find if the array field contains at least one element', () => {
        const filtered = filter(data, { dim_cm: { '$lte': 14 }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'postcard'])
      })
    })

    describe('$in', () => {
      it('find if the array field contains at least one element', () => {
        const filtered = filter(data, { tags: { '$in': ['red'] }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'planner'])
      })

      it('find nothing if $in is []', () => {
        const filtered = filter(data, { tags: { '$in': [] }})
        assert(filtered.length === 0)
      })
    })

    describe('$nin', () => {
      it('find if the array field does not contain any element', () => {
        const filtered = filter(data, { tags: { '$nin': ['red'] }})
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })

      it('find all if $nin is []', () => {
        const filtered = filter(data, { tags: { '$nin': [] }})
        assert(filtered.length === data.length)
      })
    })
  })
})
