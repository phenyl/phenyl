// @flow

import { describe, it } from 'mocha'
import assert from 'power-assert'
import { filter } from '../src/index.js'
import type { QueryCondition } from 'mongolike-operations'

describe('filter', () => {
  it('$regex operation can be passed string', () => {
    const objs = ['John', 'Mark', 'Mary'].map(name => ({ name }))
    const filtered = filter(objs, { name: { $regex: '[jy]', $options: 'i' } })
    assert.deepEqual(filtered, [
      { name: 'John' },
      { name: 'Mary' },
    ])
  })

  describe('items', () => {
    const data = [
      { item: 'journal', tag: 'red', dim_cm: 14 },
      { item: 'notebook', tag: 'red', dim_cm: 21 },
      { item: 'paper', tag: 'plain', dim_cm:  14 },
      { item: 'planner', tag: 'red', dim_cm: 30 },
      { item: 'postcard', tag: 'blue', dim_cm: 10 }
    ]

    describe('$eq', () => {
      it('find equal items', () => {
        const query: QueryCondition = {tag: {$eq: 'red'}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'planner'])
      })
    })

    describe('$ne', () => {
      it('find not equal items', () => {
        const query: QueryCondition = {tag: {$ne: 'red'}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['paper', 'postcard'])
      })
    })

    describe('$gt', () => {
      it('find items greater than condition', () => {
        const query: QueryCondition = {dim_cm: {$gt: 21}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['planner'])
      })
    })

    describe('$gte', () => {
      it('find items greater than or equal condition', () => {
        const query: QueryCondition = {dim_cm: {$gte: 21}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['notebook', 'planner'])
      })
    })

    describe('$lt', () => {
      it('find items less than condition', () => {
        const query: QueryCondition = {dim_cm: {$lt: 14}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })
    })

    describe('$lte', () => {
      it('find items less than or equal condition', () => {
        const query: QueryCondition = {dim_cm: {$lte: 14}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'paper', 'postcard'])
      })
    })

    describe('$in', () => {
      it('find items in condition', () => {
        const query: QueryCondition = {dim_cm: {$in: [10, 30]}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['planner', 'postcard'])
      })
    })

    describe('$nin', () => {
      it('find items not in condition', () => {
        const query: QueryCondition = {dim_cm: {$nin: [10, 30]}}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper'])
      })
    })
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
        const query: QueryCondition = { tags: { $eq: ['red', 'blank'] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['notebook'])
      })

      it('find if the array field contains at least one element', () => {
        const query: QueryCondition = { tags: { $eq: 'red' }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'planner'])
      })
    })

    describe('$ne', () => {
      it('find if the array field does not contain any element', () => {
        const query: QueryCondition = { tags: { $ne: 'red' }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })
    })

    describe('$gt', () => {
      it('find if the array field contains at least one element', () => {
        const query: QueryCondition = { dim_cm: { $gt: 21 }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['planner'])
      })
    })

    describe('$gte', () => {
      it('find if the array field contains at least one element', () => {
        const query: QueryCondition = { dim_cm: { $gte: 21 }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'planner'])
      })
    })

    describe('$lt', () => {
      it('find if the array field contains at least one element', () => {
        const query: QueryCondition = { dim_cm: { $lt: 14 }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })
    })

    describe('$lte', () => {
      it('find if the array field contains at least one element', () => {
        const query: QueryCondition = { dim_cm: { $lte: 14 }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'postcard'])
      })
    })

    describe('$in', () => {
      it('find if the array field contains at least one element', () => {
        const query: QueryCondition = { tags: { $in: ['red'] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'notebook', 'paper', 'planner'])
      })

      it('find array by arry in array', () => {
        const query: QueryCondition = { tags: { $in: [['blank', 'red']] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'planner'])
      })

      it('find array by arry and element', () => {
        const query: QueryCondition = { tags: { $in: [['blank', 'red'], 'blue'] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['journal', 'planner', 'postcard'])
      })

      it('find nothing if $in is []', () => {
        const query: QueryCondition = { tags: { $in: [] }}
        const filtered = filter(data, query)
        assert(filtered.length === 0)
      })
    })

    describe('$nin', () => {
      it('find if the array field does not contain any element', () => {
        const query: QueryCondition = { tags: { $nin: ['red'] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['postcard'])
      })

      it('find array by arry in array', () => {
        const query: QueryCondition = { tags: { $nin: [['blank', 'red']] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['notebook', 'paper', 'postcard'])
      })

      it('find array by arry and element', () => {
        const query: QueryCondition = { tags: { $nin: [['blank', 'red'], 'blue'] }}
        const filtered = filter(data, query)
        const items = filtered.map(f => f.item)
        assert.deepEqual(items, ['notebook', 'paper'])
      })

      it('find all if $nin is []', () => {
        const query: QueryCondition = { tags: { $nin: [] } }
        const filtered = filter(data, query)
        assert(filtered.length === data.length)
      })
    })
  })
})
