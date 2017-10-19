// @flow

import { describe, it, context } from 'kocha'
import assert from 'power-assert'
import { assign, assignWithRestoration } from '../src/index.js'

describe('assign', () => {
  it('set a value', () => {
    const obj = { name: 'korisu' }
    const newObj = assign(obj, { $set: { name: 'kerisu' }})
    assert.deepEqual(newObj, { name: 'kerisu' })
  })

  it('set a value with implicit $set operator', () => {
    const obj = { name: 'korisu' }
    const newObj = assign(obj, { name: 'kerisu' })
    assert.deepEqual(newObj, { name: 'kerisu' })
  })

  it('set multiple values', () => {
    const obj = { id: 'user1', name: 'korisu' }
    const newObj = assign(obj, { $set: { id: 'user001', name: 'kerisu' }})
    assert.deepEqual(newObj, { id: 'user001', name: 'kerisu' })
  })

  it('set values', () => {
    const obj = { name: { first: 'naomi' } }
    const newObj = assign(obj, { $set: { 'name.first': 'nao' }})
    assert.deepEqual(newObj, { name: { first: 'nao' } })
  })

  it('set values', () => {
    const obj = { colors: ['yellow', 'red'] }
    const newObj = assign(obj, { $set: { 'colors.1': 'blue' }})
    assert.deepEqual(newObj, { colors: ['yellow', 'blue'] })
  })

  it('set values', () => {
    const obj = { users: [{ id: 'user1' }, { id: 'user2' }]}
    const newObj = assign(obj, { $set: { 'users.1.id': 'user123' }})
    assert.deepEqual(newObj, { users: [{ id: 'user1' }, { id: 'user123' }]})
  })

  it('push a value to an array', () => {
    const obj = { users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }]}
    const newObj = assign(obj, { $push: { users: { id: 'user4'} }})
    assert.deepEqual(newObj, { users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3'}, { id: 'user4' }]})
  })

  it('push multiple values to an array', () => {
    const obj = { users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }]}
    const newObj = assign(obj, { $push: { users:
      { $each: [{ id: 'user4' }, { id: 'user5' }, { id: 'user6' }]}
    }})
    assert.deepEqual(newObj, { users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3'}, { id: 'user4' }, { id: 'user5' }, { id: 'user6' }]})
  })

  it('add multiple values to an array with the specific position', () => {
    const obj = { users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }]}
    const newObj = assign(obj, { $push: { users:
      { $each: [{ id: 'user4' }, { id: 'user5' }, { id: 'user6' }],
        $position: 1,
      }
    }})
    assert.deepEqual(newObj, { users: [{ id: 'user1' }, { id: 'user4' }, { id: 'user5'}, { id: 'user6' }, { id: 'user2' }, { id: 'user3' }]})
  })

  it('sort pushed result', () => {
    const obj = { users: [{ id: 'user2' }, { id: 'user4' }, { id: 'user6' }]}
    const newObj = assign(obj, { $push: { users:
      { $each: [{ id: 'user1' }, { id: 'user3' }, { id: 'user5' }],
        $sort: { id: 1 /* ascending */ },
      }
    }})
    assert.deepEqual(newObj, { users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3'}, { id: 'user4' }, { id: 'user5' }, { id: 'user6' }]})
  })

  it('sort by multiple keys', () => {
    const obj = { users: [{ id: 'user2', age: 31 }, { id: 'user4', age: 35 }, { id: 'user6', age: 24 }]}
    const newObj = assign(obj, { $push: { users:
      { $each: [{ id: 'user1', age: 36 }, { id: 'user3', age: 31 }, { id: 'user5', age: 37 }],
        $sort: { age: -1, id: 1 },
      }
    }})
    assert.deepEqual(newObj, { users: [
      { id: 'user5', age: 37 }, { id: 'user1', age: 36 },
      { id: 'user4', age: 35 }, { id: 'user2', age: 31 },
      { id: 'user3', age: 31 }, { id: 'user6', age: 24 },
    ]})
  })

  it('slice the pushed result', () => {
    const obj = { users: [{ id: 'user2' }, { id: 'user4' }, { id: 'user6' }]}
    const newObj = assign(obj, { $push: { users:
      { $each: [{ id: 'user1' }, { id: 'user3' }, { id: 'user5' }],
        $slice: 3,
        $sort: { id: -1 },
      }
    }})
    assert.deepEqual(newObj, { users: [{ id: 'user6' }, { id: 'user5' }, { id: 'user4'}]})
  })

  it('slice the pushed result after sort', () => {
    const obj = { users: [{ id: 'user2' }, { id: 'user4' }, { id: 'user6' }]}
    const newObj = assign(obj, { $push: { users:
      { $each: [{ id: 'user1' }, { id: 'user3' }, { id: 'user5' }],
        $position: 1,
        $slice: 3,
      }
    }})
    assert.deepEqual(newObj, { users: [{ id: 'user2' }, { id: 'user1' }, { id: 'user3'}]})
  })

  it('add currentDate', () => {
    const obj = { user: { updatedAt: 0 }}
    const newObj = assign(obj, { $currentDate: { 'user.updatedAt': { $type: 'timestamp' } }})
    assert.notDeepEqual(obj, newObj)

    const now = new Date()
    const updatedAt = new Date(newObj.user.updatedAt)

    assert(now.getFullYear() === updatedAt.getFullYear())
    assert(now.getMonth() === updatedAt.getMonth())
    assert(now.getDate() === updatedAt.getDate())
  })

  it('sets the result of bit request', () => {
    const obj = { flags: parseInt('1010', 10) }
    const newObj = assign(obj, { $bit: { flags: { and: parseInt('0101', 10) }}})
    assert(newObj.flags.toString(2) === '1100000')
  })

  it('sets the result of multiply', () => {
    const obj = { price: 20.89 }
    const newObj = assign(obj, { $mul: { price: 10.99 }})
    assert(newObj.price === 229.58110000000002 )
  })

  it('addToSet', () => {
    const obj = { categories: ['fashion', 'news', 'cooking-recipies'] }
    const newObj = assign(obj, { $addToSet: { categories: { $each: ['news', 'sports'] }}})
    assert.deepEqual(newObj.categories, ['fashion', 'news', 'cooking-recipies', 'sports'])
  })

  it('pop with 1', () => {
    const obj = { categories: ['fashion', 'news', 'cooking-recipies'] }
    const newObj = assign(obj, { $pop: { categories: 1 }})
    assert.deepEqual(newObj.categories, ['fashion', 'news'])
  })

  it('pop with -1', () => {
    const obj = { categories: ['fashion', 'news', 'cooking-recipies'] }
    const newObj = assign(obj, { $pop: { categories: -1 }})
    assert.deepEqual(newObj.categories, ['news', 'cooking-recipies'])
  })

  it('remove props by $unset operator', () => {
    const obj = {
      categories: ['fashion', 'news', 'cooking-recipies'],
      name: { first: 'Shin', last: 'Suzuki' }
    }
    const newObj = assign(obj, { $unset: { 'categories[1]': '', 'name.last': '' } })
    assert.deepEqual(newObj, {
      categories: ['fashion', null, 'cooking-recipies'],
      name: { first: 'Shin' }
    })
  })

  it('rename props by $rename operator', () => {
    const obj = {
      ttle: 'October',
      names: [
        { first: 'Shin', lsat: 'Suzuki' }
      ],
    }
    const newObj = assign(obj, { $rename: {
      'ttle': 'title',
      'names[0].lsat': 'last',
      'names[0].nonExistingField': 'abc',
    } })
    assert.deepEqual(newObj, {
      title: 'October',
      names: [
        { first: 'Shin', last: 'Suzuki' }
      ],
    })
  })

  it('cannot rename array props by $rename operator', () => {
    const obj = {
      categories: ['fashion', 'news', 'cooking-recipies'],
      name: { first: 'Shin', last: 'Suzuki' }
    }
    assert.throws(() =>
      assign(obj, { $rename: { 'categories[1]': '3' } })
    , /cannot be applied to array field/)
  })

  context('with class instance', () => {
    class Name {
      first: string
      last: string
      constructor(plain) {
        this.first = plain.first
        this.last = plain.last
      }
    }
    class Age {
      value: number
      constructor(plain) {
        this.value = plain.value
      }
    }
    class User {
      id: string
      name: Name
      age: Age
      constructor(plain) {
        this.id = plain.id
        this.name = new Name(plain.name)
        this.age = new Age(plain.age)
      }
    }

    it('applies operation to class instances using assignWithRestoration()', () => {
      const user = new User({
        id: 'user1',
        name: { first: 'Shin', last: 'Suzuki' },
        age: { value: 31 },
      })
      const newUser = assignWithRestoration(user, { $inc: { 'age.value': 1 }, $set: { id: 'user001', 'name.first': 'Shinji' } })
      const expectedNewUser = new User({
        id: 'user001',
        name: { first: 'Shinji', last: 'Suzuki' },
        age: { value: 32 },
      })
      assert(newUser instanceof User)
      assert(newUser.name instanceof Name)
      assert(newUser.age instanceof Age)
      assert.deepEqual(expectedNewUser, newUser)
    })

    it('convert affected class instances into plain objects when using assign()', () => {
      const user = new User({
        id: 'user1',
        name: { first: 'Shin', last: 'Suzuki' },
        age: { value: 31 },
      })
      const newUser = assign(user, {
        $inc: { 'age.value': 1 },
        $set: { id: 'user001', 'name.first': 'Shinji', name2: { first: 'Shinzo', last: 'Sasaki' }, },
      })

      const expectedNewUser = {
        id: 'user001',
        name: { first: 'Shinji', last: 'Suzuki' },
        name2: { first: 'Shinzo', last: 'Sasaki' },
        age: { value: 32 },
      }
      assert(!(newUser instanceof User))
      assert(!(newUser.name instanceof Name))
      assert(!(newUser.age instanceof Age))
      assert.deepEqual(expectedNewUser, newUser)
    })

    it('restores class instances by using $restore operator', () => {
      const user = new User({
        id: 'user1',
        name: { first: 'Shin', last: 'Suzuki' },
        age: { value: 31 },
      })
      const newUser = assign(user, {
        $inc: { 'age.value': 1 },
        $set: { id: 'user001', 'name.first': 'Shinji', name2: { first: 'Shinzo', last: 'Sasaki' }, },
        $restore: { name: '', name2: Name, age: Age },
      })

      const expectedNewUser = {
        id: 'user001',
        name: new Name({ first: 'Shinji', last: 'Suzuki' }),
        name2: new Name({ first: 'Shinzo', last: 'Sasaki' }),
        age: new Age({ value: 32 }),
      }
      assert(newUser.name instanceof Name)
      assert(newUser.name2 instanceof Name)
      assert(newUser.age instanceof Age)
      assert.deepEqual(expectedNewUser, newUser)
    })

    it('$restore operator is evaluated at the last time even if located before other operation', () => {
      const user = new User({
        id: 'user1',
        name: { first: 'Shin', last: 'Suzuki' },
        age: { value: 31 },
      })
      const newUser = assign(user, {
        $restore: { name: '', name2: Name, age: Age },
        $inc: { 'age.value': 1 },
        $set: { id: 'user001', 'name.first': 'Shinji', name2: { first: 'Shinzo', last: 'Sasaki' }, },
      })

      const expectedNewUser = {
        id: 'user001',
        name: new Name({ first: 'Shinji', last: 'Suzuki' }),
        name2: new Name({ first: 'Shinzo', last: 'Sasaki' }),
        age: new Age({ value: 32 }),
      }
      assert(newUser.name instanceof Name)
      assert(newUser.name2 instanceof Name)
      assert(newUser.age instanceof Age)
      assert.deepEqual(expectedNewUser, newUser)
    })
  })
})
