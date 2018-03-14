# power-assign [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)

Immutable updater of POJO using MongoDB's operator, easier access to nested values.

```js
import { assign } from 'power-assign'

const obj = {
  foo: 1,
  bar: { baz: 'abc' }
}

const newObj = assign(obj, {
  foo: 123,
  'bar.baz': 'xyz'
 })

assert(newObj !== obj) // obj is unchanged.
assert(newObj.foo === 123) // assigned
assert(newObj.bar.baz === 'xyz') // assigned nested value
```

## Installation
```sh
npm install power-assign
```

## Using types with flow
For [Flow](https://flowtype.org) annotations, just use `/jsnext` entrypoint.

```js
import { assign } from 'power-assign/jsnext'
```

All the interfaces are defined in the depending module [mongolike-operations](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations).

# Concept
## OAD: Operations As Data
**Operations As Data(OAD)** is the concept of handling large JSON data that all the data operations (update/find) should be written as JSON format (≒ plain object).
This power-assign handles UpdateOperation as data.

The previous example is also written as below.

```js
const newObj = assign(obj, { $set: { foo: 123, 'bar.baz': 'xyz' } })
// this is UpdateOperation ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

The operation format is almost the same as **[MongoDB's Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)**.

Here is another example using some more operators.

```js
const obj = {
  count: 11,
  arr: ['value1'],
  bar: { baz: 'abc' },
}
const newObj = assign(obj, {
  $inc: { count: 1 }, // $inc: operator to increment number
  $push: { arr: 'value2' }, // $push: operator to push elements to array
  $unset: { 'bar.baz': '' }, // $unset: operator to unset a value
})

assert(newObj.count === 12)
assert(newObj.bar.hasOwnProperty('baz') === false)
assert.deepEqual(obj.arr, ['value1', 'value2'])
```

## Phenyl Family
power-assign is one of **Phenyl Family**.
[Phenyl](https://github.com/phenyl-js/phenyl) is a JavaScript Server/Client framework for State Synchronization over Environment(SSoE).
UpdateOperation is the key to synchronize large JSON over environment. Thus power-assign plays one of the essential roles in Phenyl.

# API Documentation
## Definitions
For all flow type definitions, see [mongolike-operations/update-operation.js.flow](https://github.com/phenyl-js/phenyl/blob/master/modules/mongolike-operations/decls/update-operation.js.flow).

```js
const operation = {
  $set: { 'foo.bar[0].baz': 123 }
}
```
- `operation` value is **UpdateOperation**.
- `$set` is **UpdateOperatorName**.
- `{ 'foo.bar[0].baz': 123 }` is **UpdateOperator**. In the example, it's **SetOperator** as the UpdateOperatorName is $set.
- `foo.bar[0].baz` is **DocumentPath**.
- `123` is **Operand**.

### DocumentPath
The same definition as [Amazon DynamoDB's DocumentPath](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.Attributes.html#Expressions.Attributes.NestedElements.DocumentPathExamples).

DocumentPath expresses nested value location.
```js
{ foo: { arr: [ { bar: 'baz' }] }}
```
The string `'baz'` is expressed as `'foo.arr[0].bar'` in DocumentPath format.

This DocumentPath is slightly different from [Dot Notation in MongoDB](https://docs.mongodb.com/manual/core/document/#dot-notation) which expresses `'baz'` as `'foo.arr.0.bar'` (array index expression is different).

power-assign incidentally **supports Dot Notation** in that an array is also an object.
Still we recommend DocumentPath because Phenyl family prefers the expression.

## assign()
Assign new values to object following the given operation(s).

```js
assign(
  obj: Object,
  ...uOps: Array<SetOperator | UpdateOperation>
): Object
```

### Parameters
#### obj
Object to be copied and assigned new values. Note that **obj is unchanged after the call**.
Unchanged values are shallowly copied to the returned object.

```js
import { assign } from 'power-assign'
const obj = { foo: { bar: 1 }, baz: { biz: 2 } }
const newObj = assign(obj, { 'baz.biz': 3 })
assert(obj.foo === newObj.foo) // unchanged values are shallowly copied
assert(obj.baz !== newObj.baz) // changed values are not copied
```

#### uOps (variable arguments)
**UpdateOperation**, **SetOperator**.
SetOperator is just a key-value pairs object.

All the operations are fulfilled in order.
```js
assign(obj, operation1)
// operations are applied in order: 1, 2, 3...
assign(obj, operation1, operation1, operation2, operation3, ...)
```

## assignToProp()
Assign new values to the property of the obj located at the given documentPath following the given operation.
```js
assignToProp(
  obj: Object,
  docPath: DocumentPath,
  uOp: SetOperator | UpdateOperation
): Object
```
### Parameters
#### obj
Object containing an object to be assigned new values. Note that **obj is unchanged after the call**.

#### uOp
**UpdateOperation** or **SetOperator**.
See assign() API docs.

### Example
```js
import { assignToProp } from 'power-assign'
const obj = { foo: { bar: 1 }, baz: { biz: 2 } }
const newObj = assignToProp(obj, 'baz', { $inc: { biz: 1 } })

assert(newObj.baz.biz === 3)
```

## retargetToProp()
Retarget the given UpdateOperation to the given docPath.

It helps realize loose coupling between parent object and child Object.
Even if a parent-object-handling layer doesn't know its child object's shape,
the layer can create an UpdateOperation to modify its child object using `retargetToProp()`
if only child-object-handling layer offers the child object's UpdateOperation.

```js
retargetToProp(
  docPath: DocumentPath,
  operation: SetOperator | UpdateOperation
): UpdateOperation
```
### Parameters
#### docPath
DocumentPath of the new target object (target itself is not given).

#### operation
**UpdateOperation** or **SetOperator**.
operation to be modified. Note that operation itself is unchanged.
New operation object is returned.

### Example
```js
import { assignToProp } from 'power-assign'
const parent = { child: { foo: { bar: 123 } } }
const childOp = { $mul: { 'foo.bar': 2 } }
const parentOp = retargetToProp(parent, 'child', childOp)

const newParent = assign(parent, parentOp)
assert.deepEqual(parentOp, { $mul: { 'child.foo.bar': 2 } })
assert(newParent.child.foo.bar === 246)
```

## assignWithRestoration()
Assign new values and create a new instance of the original class ( = Restoration).

```js
assignWithRestoration<T: Restorable>(
  obj: T,
  uOp: SetOperator | UpdateOperation | Array<SetOperator | UpdateOperation>
): T
```

obj must be **Restorable**.

### What is "Restorable"?
Restorable is a characteristic of JavaScript class instances which meets the following requirement.

```js
const jsonStr = JSON.stringify(instance)
const plain = JSON.parse(jsonStr)
const newInstance = new TheClass(plain)

assert.deepEqual(newInstance, instance)
```

Roughly, Restorable object is an instance which can re-created by passing its JSON object to the class constructor.

See [is-restorable](https://github.com/phenyl-js/phenyl/tree/master/modules/is-restorable) module for more detail.

### Parameters
#### obj
A **Restorable** instance.

#### uOp
**UpdateOperation** or **SetOperator**.
See assign() API docs.

### Example
```js
class Name {
  constructor(params) {
    this.first = params.first
    this.last = params.last
  }
}

class Person {
  constructor(params) {
    this.name = new Name(params.name)
    this.age = params.age
  }
}
const person = new Person({
  name: { first: 'Shin', last: 'Suzuki' },
  age: 21,
})

const personWithRealAge = assignWithRestoration(person, { $inc: { age: 10 } })
assert(personWithRealAge instanceof Person)
assert(personWithRealAge.name instanceof Name)
assert(personWithRealAge.age === 31)
```

## assignToPropWithRestoration()
The same arguments as `assignToProp()` but it also restores the original object.

## retargetToPropWithRestoration()
The same arguments as `retargetToProp()` but it also restores the original object.

## toJSON()
Convert UpdateOperation to Restorable JSON format.

```js
import { toJSON } from 'power-assign'
class Name {
  constructor(params) {
    this.first = params.first
    this.last = params.last
  }
}

const person = { name: new Name({ first: 'Shin', last: 'Suzuki' }) }
const op = { $restore: { name: Name }, $set: { 'name.first': 'Shun' } }
assert.deepEqual(JSON.parse(JSON.stringify(op)).$restore.name, {}) // classes re converted to {} over serialization
assert.deepEqual(JSON.parse(JSON.stringify(toJSON(op))).$restore.name, '')
```

## mergeOperations()
**[Experimental]** Merge UpdateOperations into one UpdateOperation.

```js
import { mergeOperations } from 'power-assign'
const merged = mergeOperations(
  { $set: { foo: 123 } },
  { $inc: { count: 1 } }
)
assert.deepEqual(merged, {
  $set: { foo: 123 },
  $inc: { count: 1 }
})
```

## normalizeOperation()
Convert SetOperator to normalized operation.

```js
import { normalizeOperation } from 'power-assign'
const op = { 'baz.biz': 3 })
assert.deepEqual(normalizeOperation(op), { $set: { 'baz.biz': 3 } })
```

## Update Operators
Almost the same as **[MongoDB's Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)**.

### $inc
An operator to increment number values.

```js
const value = assign({ a: 10, b: 100 } , { $inc: { a: 2, b: -3 } })
assert(value.a === 12)
assert(value.b === 97)
```

### $set
An operator to set values.

```js
const value = assign({ a: 'foo', b: 100 } , { $set: { a: 'bar', b: 101 } })
assert(value.a === 'bar')
assert(value.b === 101)
```

$set operator can be omitted when the whole operation is $set.
```js
const value = assign({ a: 'foo', b: 100 } , { a: 'bar', b: 101 })
```

### $min
An operator to compare the existing value with the given operand and set smaller one.

```js
const value = assign({ a: 10, b: 100 } , { $min: { a: 8, b: 101 } })
assert(value.a === 8)
assert(value.b === 100)
```

### $max
An operator to compare the existing value with the given operand and set greater one.

```js
const value = assign({ a: 10, b: 100 } , { $max: { a: 8, b: 101 } })
assert(value.a === 10)
assert(value.b === 101)
```

### $mul
An operator to multiply number values.

```js
const value = assign({ a: 10, b: 100 } , { $mul: { a: 2, b: 0 } })
assert(value.a === 20)
assert(value.b === 0)
```

### $addToSet
An operator to add element(s) to array values when the same value(s) doesn't exist.

```js
const value = assign({ arr: [{ a: 1 }, { a: 88 }] } , { $addToSet: { arr: { a: 3 } } })
assert.deepEqual(value.arr, [{ a: 1 }, { a: 88 }, { a: 3 }])
```

`$each` modifier can be available like MongoDB.

```js
const value = assign({ arr: [{ a: 1 }, { a: 88 }] } , { $addToSet: { arr: { $each: [{ a : 1}, { a: 3 }, { a: 5 } ]} } })
assert.deepEqual(value.arr, [{ a: 1 }, { a: 88 }, { a: 3 }, { a: 5 }])
```

### $pop
An operator to pop/shift an element from array values.

Pop:
```js
const obj = { categories: ['fashion', 'news', 'cooking-recipes'] }
const newObj = assign(obj, { $pop: { categories: 1 }})
assert.deepEqual(newObj.categories, ['fashion', 'news'])
```

Shift:
```js
const obj = { categories: ['fashion', 'news', 'cooking-recipes'] }
const newObj = assign(obj, { $pop: { categories: -1 }})
assert.deepEqual(newObj.categories, ['news', 'cooking-recipes'])
```

### $pull
An operator to remove elements in array matching the given condition.
For all condition definitions, see [mongolike-operations/find-operation.js.flow](https://github.com/phenyl-js/phenyl/blob/master/modules/mongolike-operations/decls/query-condition.js.flow).

They are almost compatible with [MongoDB's Query Operators](https://docs.mongodb.com/manual/reference/operator/query/).

```js
type PullOperator = { [field: DocumentPath]: QueryCondition | EqCondition }
// type QueryCondition => See the link above.
type EqCondition = Object | Array<Basic> | string | number | boolean
```

```js
const obj = { categories: ['fashion', 'news', 'cooking-recipes'] }
const newObj = assign(obj, { $pull: { categories: { $regex: /fash/ } } })
assert.deepEqual(newObj.categories, ['news', 'cooking-recipes'])
```

### $push
An operator to add/sort/slice/splice element(s) to array values.

Add a value:
```js
const obj = { users: [
  { id: 'user1' }, { id: 'user2' }, { id: 'user3' }
]}

const newObj = assign(obj, { $push: { users: { id: 'user4'} }})

assert.deepEqual(newObj, { users: [
  { id: 'user1' }, { id: 'user2' }, { id: 'user3'}, { id: 'user4' }
]})
```

Add values:
```js
const obj = { users: [
  { id: 'user1' }, { id: 'user2' }, { id: 'user3' }
]}
const newObj = assign(obj, { $push: { users:
  { $each: [{ id: 'user4' }, { id: 'user5' }, { id: 'user6' }]}
}})

assert.deepEqual(newObj, { users: [
  { id: 'user1' }, { id: 'user2' }, { id: 'user3'},
  { id: 'user4' }, { id: 'user5' }, { id: 'user6' }
]})
```

Add values to the specific position:
```js
const obj = { users: [
  { id: 'user1' }, { id: 'user2' }, { id: 'user3' }
]}
const newObj = assign(obj, { $push: { users:
  { $each: [{ id: 'user4' }, { id: 'user5' }, { id: 'user6' }],
    $position: 1,
  }
}})
assert.deepEqual(newObj, { users: [
  { id: 'user1' },
  { id: 'user4' }, { id: 'user5'}, { id: 'user6' },
  { id: 'user2' }, { id: 'user3' }
]})
```

Sort values:
```js
const obj = { users: [
  { id: 'user2', age: 31 },
  { id: 'user4', age: 35 },
  { id: 'user6', age: 24 }
]}

const newObj = assign(obj, { $push: { users:
  { $each: [
      { id: 'user1', age: 36 },
      { id: 'user3', age: 31 },
      { id: 'user5', age: 37 }],
    $sort: { age: -1, id: 1 },
  }
}})
assert.deepEqual(newObj, { users: [
  { id: 'user5', age: 37 }, { id: 'user1', age: 36 },
  { id: 'user4', age: 35 }, { id: 'user2', age: 31 },
  { id: 'user3', age: 31 }, { id: 'user6', age: 24 },
]})
```

Slice values:
```js
const obj = { users: [
  { id: 'user2' }, { id: 'user4' }, { id: 'user6' }
]}
const newObj = assign(obj, { $push: { users:
  { $each: [{ id: 'user1' }, { id: 'user3' }, { id: 'user5' }],
    $slice: 3,
    $sort: { id: -1 },
  }
}})

assert.deepEqual(newObj, { users: [
  { id: 'user6' }, { id: 'user5' }, { id: 'user4'}
]})
```

Slice with negative number:

```js
const obj = { users: [
  { id: 'user2' }, { id: 'user4' }, { id: 'user6' }
]}
const newObj = assign(obj, { $push: { users:
  { $each: [{ id: 'user1' }, { id: 'user3' }, { id: 'user5' }],
    $slice: -4,
  }
}})
assert.deepEqual(newObj, { users: [
  { id: 'user6' }, { id: 'user1' }, { id: 'user3'}, { id: 'user5'}
]})
```

### $bit
An operator to execute bitwise operations.

```js
const obj = { flags: parseInt('1010', 10) }
const newObj = assign(obj, { $bit: { flags: { and: parseInt('0101', 10) }}})
assert(newObj.flags.toString(2) === '1100000')
```

### $unset
An operator to remove values.

```js
const obj = {
  categories: ['fashion', 'news', 'cooking-recipes'],
  name: { first: 'Shin', last: 'Suzuki' }
}
const newObj = assign(obj, { $unset: { 'categories[1]': '', 'name.last': '' } })
assert.deepEqual(newObj, {
  categories: ['fashion', null, 'cooking-recipes'],
  name: { first: 'Shin' }
})
```

### $rename
An operator to rename field names.

```js
const obj = {
  ttle: 'October',
  names: [
    { first: 'Shin', lsat: 'Suzuki' }
  ],
}
const newObj = assign(obj, { $rename: {
  'ttle': 'title',
  'names[0].lsat': 'last',
  'names[0].nonExistingField': 'abc', // no effect with non-existing field
} })
assert.deepEqual(newObj, {
  title: 'October',
  names: [
    { first: 'Shin', last: 'Suzuki' }
  ],
})
```

Note that this operator is a bit different from [MongoDB's $rename operator]( https://docs.mongodb.com/manual/reference/operator/update/rename/).

The operands are not 'Dot Notation' but field names.
The following sample object in MongoDB
```js
{ $rename: { "name.first": "name.fname" } }
```

will be the following object in power-assign.
```js
{ $rename: { "name.first": "fname" } }
```

See that the value doesn't contain `"name"`.

### $restore
An operator to construct instance of the given path.
New operator, **Not defined at MongoDB**.

```js
type RestoreOperator = {
  [field: DocumentPath]: '' | Class<Restorable>
}
```

Example:
```js
const user = new User({
  id: 'user1',
  name: { first: 'Shin', last: 'Suzuki' },
  age: { value: 31 },
})
const newUser = assign(user, {
  $inc: { 'age.value': 1 },
  $set: { id: 'user001', 'name.first': 'Shinji', name2: { first: 'Shinzo', last: 'Sasaki' } },
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
assert.deepEqual(newUser, expectedNewUser)
```

Once `RestoreOperator` is JSON.stringify-ed, the fields with `Class<Restorable>` will be removed.
To avoid this, you can choose two alternatives.

1) Implement static method `toJSON()` to classes.
  ```js
  class Foo {
    static toJSON() { return '' }
  }
  ```

2) Use `updateOperationToJSON()` function from `oad-utils`
  ```js
   import { updateOperationToJSON } from 'oad-utils'
   const operation = { $restore: { foo: Foo } }
   JSON.stringify(updateOperationToJSON(operation)) // {"$restore":{"foo":""}}
  ```

[oad-utils](https://github.com/phenyl-js/phenyl/blob/master/modules/oad-utils) is also one of Phenyl family offering OAD-related utility functions.

# LICENSE
Apache License 2.0
