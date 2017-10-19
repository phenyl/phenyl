// @flow

import { describe, it, context } from 'kocha'
import assert from 'assert'

import isRestorable from '../src/index.js'

describe('isRestorable', () => {
  it('returns true the given param is null', () => {
    assert(isRestorable(null))
  })

  it('returns true the given param is undefined', () => {
    assert(isRestorable(undefined))
  })

  it('returns true the given param is string', () => {
    assert(isRestorable('hogehoge'))
  })

  it('returns true the given param is boolean', () => {
    assert(isRestorable(false))
  })

  it('returns true the given param is number', () => {
    assert(isRestorable(3.1415))
  })

  it('returns true the given param is plain object', () => {
    assert(isRestorable({ a: 123, b: { c: 'defgh' } }))
  })

  it('returns true the given param is instance of Date', () => {
    assert(isRestorable(new Date()))
  })

  it('returns false when the given param is instance of class whose constructor takes different props as the class', () => {

    class Foo {
      name: string
      age: number
      constructor(name, age) {
        this.name = name
        this.age = age
      }
    }
    const instance = new Foo('Shin Suzuki', 45)

    assert(isRestorable(instance) === false)
  })

  context('when the given param is instance of class whose constructor takes the same props as the class', () => {

    it('returns true when all of the props are primitive types, plain objects or null', () => {

      class Foo {
        name: string
        age: number
        hasCar: ?boolean
        info: Object
        constructor(params) {
          this.name = params.name
          this.age = params.age
          this.hasCar = params.hasCar || null
          this.info = params.info || {}
        }
      }
      const instance = new Foo({
        name: 'Shin Suzuki',
        age: 55,
        info: {
          foo: 400,
          bar: { baz: 'abcd' },
          abc: null,
        }
      })
      assert(isRestorable(instance))
    })

    it('returns true when some props in plain object are undefined', () => {

      class Foo {
        name: string
        age: number
        hasCar: ?boolean
        info: Object
        constructor(params) {
          this.name = params.name
          this.age = params.age
          this.hasCar = params.hasCar || null
          this.info = params.info || {}
        }
      }
      const instance = new Foo({
        name: 'Shin Suzuki',
        age: 55,
        info: {
          foo: undefined
        }
      })
      assert(isRestorable(instance) === false)
    })


    it('returns true when some the props are instances of class whose constructor takes the same props as the class', () => {

      class Name {
        first: string
        last: string
        constructor(params) {
          this.first = params.first
          this.last = params.last
        }
      }

      class Foo {
        name: Name
        age: number
        constructor(params) {
          this.name = params.name
          this.age = params.age
        }
      }
      const instance = new Foo({ name: new Name({ first: 'Shin', last: 'Suzuki' }), age: 55 })
      assert(isRestorable(instance))
    })

    it('returns false when some the props are instances of class whose constructor takes different props as the class', () => {
      class Name {
        first: string
        last: string
        constructor(first, last) {
          // $FlowIssue(for-test)
          this.first = first
          // $FlowIssue(for-test)
          this.last = last
        }
      }

      class Foo {
        name: Name
        constructor(params) {
          this.name = new Name(params.name)
        }
      }
      const instance = new Foo({ name: new Name('Shin', 'Suzuki') })
      assert(isRestorable(instance) === false)
    })

    it('returns true when some the props are not restorable value but carefully wrapped by constructor', () => {
      class Name {
        first: string
        last: string
        constructor(first, last) {
          this.first = first
          this.last = last
        }
      }

      class Foo {
        name: Name
        constructor(params) {
          this.name = new Name(params.name.first, params.name.last)
        }
      }
      const instance = new Foo({ name: new Name('Shin', 'Suzuki') })
      assert(isRestorable(new Name('Shin', 'Suzuki')) === false)
      assert(isRestorable(instance))
    })

    it('returns true when some props are Date and it\'s constructed in constructor', () => {
      class Foo {
        createdAt: Date
        updatedAt: Date
        removedAt: ?Date
        constructor(params) {
          this.createdAt = new Date(params.createdAt)
          this.updatedAt = new Date(params.updatedAt)
          this.removedAt = params.removedAt == null ? null : new Date(params.removedAt)
        }
      }
      const instance = new Foo({ createdAt: new Date(), updatedAt: new Date() })
      assert(isRestorable(instance))
    })
  })
})
