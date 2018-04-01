# oad-utils [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)

Collection of utility functions for **OAD: Operations As Data**.

## OAD: Operation As Data
**Operations As Data(OAD)** is the concept of handling large JSON data that all the data operations (update/find) should be written as JSON format (≒ plain object).
This `oad-utils` provides utility functions for handling OAD.

## Phenyl Family
`oad-utils` is one of **Phenyl Family**.
[Phenyl](https://github.com/phenyl-js/phenyl) is a JavaScript Server/Client framework for State Synchronization over Environment(SSoE).

## Installation
```sh
npm install oad-utils
```

## Using types with flow
For [Flow](https://flowtype.org) annotations, just use `/jsnext` entrypoint.

```js
import { hasOwnNestedProperty, visitFindOperation } from 'oad-utils/jsnext'
```

All the interfaces are defined in the depending module [mongolike-operations](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations).

# API Documentation
## Overview
- normalizeQueryCondition()
- getNestedValue()
- hasOwnNestedProperty()
- updateOperationToJSON()
- normalizeUpdateOperation()
- mergeUpdateOperations()
- findOperationToJSON()
- visitFindOperation()
- parseDocumentPath()
- convertToDotNotationString()
- createDocumentPath()

## Definitions
### FindOperation
Operation to find values in large JSON.

See [FindOperation(mongolike-operations)](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations#findoperation) for detailed definition.

Example:
```js
const findOperation = {
  $and: [
    { libraryName: 'phenyl' },
    { 'libraryVersion.major': { $gte: 1 } }
  ]
}
```

### QueryCondition
Condition to find values in large JSON, included in `FindOperation`.
Almost compatible with [MongoDB's Query Operators](https://docs.mongodb.com/manual/reference/operator/query/).

See [QueryCondition(mongolike-operations)](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations#querycondition) for detailed definition.

### UpdateOperation
Operations to update values of large JSON.
Almost compatible with **[MongoDB's Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)**.

See README of [power-assign](https://github.com/phenyl-js/phenyl/tree/master/modules/power-assign) for more detailed use.

### Restorable
Restorable is a characteristic of JavaScript class instances which meets the following requirement.

```js
const jsonStr = JSON.stringify(instance)
const plain = JSON.parse(jsonStr)
const newInstance = new TheClass(plain)

assert.deepEqual(newInstance, instance)
```

Roughly, Restorable object is an instance which can re-created by passing its JSON object to the class constructor.

See [is-restorable](https://github.com/phenyl-js/phenyl/tree/master/modules/is-restorable) module for more detail.

### DocumentPath
The same definition as [Amazon DynamoDB's DocumentPath](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.Attributes.html#Expressions.Attributes.NestedElements.DocumentPathExamples).

```js
type DocumentPath = string
```

DocumentPath expresses nested value location.
```js
{ foo: { arr: [ { bar: 'baz' }] }}
```
The string `'baz'` is expressed as `'foo.arr[0].bar'` in DocumentPath format.

This DocumentPath is slightly different from [Dot Notation in MongoDB](https://docs.mongodb.com/manual/core/document/#dot-notation) which expresses `'baz'` as `'foo.arr.0.bar'` (array index expression is different).


## normalizeQueryCondition()
Convert the given object into regular QueryCondition.

```js
import { normalizeQueryCondition } from 'oad-utils'
const cond = { name: 'Shin' }
const normalized = normalizeQueryCondition(cond)
assert.deepEqual(normalized, { $eq: { name: 'Shin' } })
```

## getNestedValue()
Get the value in the object at the DocumentPath.

```js
import { hasOwnNestedProperty } from 'oad-utils'

const obj = {
  foo: {
    bar: [{}, {}, { baz1: false, baz2: null }
    ]
  },
  foo2: undefined
}

assert(getNestedValue(obj, 'foo') === obj.foo)
assert(getNestedValue(obj, 'foo.bar') === obj.foo.bar)
assert(getNestedValue(obj, 'foo.bar[0]') === obj.foo.bar[0])
assert(getNestedValue(obj, 'foo.bar[1]') === obj.foo.bar[1])
assert(getNestedValue(obj, 'foo.bar[2]') === obj.foo.bar[2])
assert(getNestedValue(obj, 'foo.bar[2].baz1') === obj.foo.bar[2].baz1)
assert(getNestedValue(obj, 'foo.bar[2].baz2') === obj.foo.bar[2].baz2)
assert(getNestedValue(obj, 'foo2') === obj.foo2)
```

Behavior toward non-existing values:
```js
assert(getNestedValue(obj, 'a.b.c.d.e') === undefined)

const noNullAccess = true
assert.throws(() => getNestedValue(obj, 'a.b.c.d.e', noNullAccess), /Cannot get value/)
```

Set the 3rd argument `noNullAccess` to true and an error is thrown when property access to null occurs.

## hasOwnNestedProperty()
Check if the object has the DocumentPath.

```js
import { hasOwnNestedProperty } from 'oad-utils'

const obj = {
  foo: {
    bar: [{}, {}, { baz1: false, baz2: null }
    ]
  },
  foo2: undefined
}
assert(hasOwnNestedProperty(obj, 'foo') === true)
assert(hasOwnNestedProperty(obj, 'foo.bar') === true)
assert(hasOwnNestedProperty(obj, 'foo.bar[0]') === true)
assert(hasOwnNestedProperty(obj, 'foo.bar[1]') === true)
assert(hasOwnNestedProperty(obj, 'foo.bar[2]') === true)
assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz1') === true)
assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz2') === true)
assert(hasOwnNestedProperty(obj, 'foo2') === true)

assert(hasOwnNestedProperty(obj, 'bar') === false)
assert(hasOwnNestedProperty(obj, 'foo.baz') === false)
assert(hasOwnNestedProperty(obj, 'foo.bar[3]') === false)
assert(hasOwnNestedProperty(obj, 'foo.bar[2].baz3') === false)
assert(hasOwnNestedProperty(obj, 'foo.bar2') === false)
```

## updateOperationToJSON()
Convert UpdateOperation to Restorable JSON format.

```js
import { updateOperationToJSON } from 'oad-utils'
class Name {
  constructor(params) {
    this.first = params.first
    this.last = params.last
  }
}

const person = { name: new Name({ first: 'Shin', last: 'Suzuki' }) }
const op = { $restore: { name: Name }, $set: { 'name.first': 'Shun' } }
assert.deepEqual(JSON.parse(JSON.stringify(op)).$restore.name, {}) // classes re converted to {} over serialization
assert.deepEqual(JSON.parse(JSON.stringify(updateOperationToJSON(op))).$restore.name, '')
```

## mergeUpdateOperations()
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

## normalizeUpdateOperation()
Convert SetOperator to normalized operation.

```js
import { normalizeOperation } from 'power-assign'
const op = { 'baz.biz': 3 })
assert.deepEqual(normalizeOperation(op), { $set: { 'baz.biz': 3 } })
```

## findOperationToJSON()
Convert FindOperation to Restorable JSON format.

```js
import { findOperationToJSON } from 'oad-utils'
const where = {
  name: { $regex: /^John/ }
}
assert.deepEqual(JSON.parse(JSON.stringify(where)).name.$regex, {}) // regex are converted to {} over serialization
assert.deepEqual(JSON.parse(JSON.stringify(findOperationToJSON(op))).name.$regex, '^John')
```

## visitFindOperation()
Modify FindOperation by passing visitor functions.

Visit with `simpleFindOperation` visitor:
```js
import { visitFindOperation } from 'oad-utils'
const where = {
  $or: [
    { email: 'foo@example.com', password: 'foo-bar' },
    { email: 'bar@example.com', password: 'foo-bar' },
  ]
}
const modifiedWhere = visitFindOperation(where, {
  simpleFindOperation: op => {
    return Object.assign({}, op, { isUser: true })
  }
})
assert.deepEqual(modifiedWhere, {
  $or: [
    { email: 'foo@example.com', password: 'foo-bar', isUser: true },
    { email: 'bar@example.com', password: 'foo-bar', isUser: true },
  ]
})
```

Visit with `queryCondition` visitor:
```js
const where = {
  name: { $regex: /foo/ }
}
const modifiedWhere = visitFindOperation(where, {
  queryCondition: cond => {
    if (cond.$regex) {
      return Object.assign({}, cond, { $options: 'i' })
    }
    return cond
  }
})
assert.deepEqual(modifiedWhere, {
  name: { $regex: /foo/, $options: 'i' }
})
```

## parseDocumentPath()
Parse DocumentPath into an array of property names.

```js
import { parseDocumentPath } from 'oad-utils'
const docPath = 'user.favorites[1].music[30000]'
const attributes = parseDocumentPath(docPath)
assert.deepEqual(attributes, ['user', 'favorites', 1, 'music', 30000])
```

## createDocumentPath()
Create DocumentPath from arguments.

```js
import { createDocumentPath } from 'oad-utils'
const docPath = createDocumentPath('users', 1, 'favorites', 'musics', 24, 'title', '3', 'value')
assert(docPath === 'users[1].favorites.musics[24].title.3.value')
```
## convertToDotNotationString()
Convert DocumentPath to [MongoDB's Dot Notation](https://docs.mongodb.com/manual/core/document/#dot-notation).

```js
import { convertToDotNotationString } from 'oad-utils'
const docPath = 'user.favorites[1].music[30000]'
const dotNotationString = convertToDotNotationString(docPath)
assert(dotNotationString === 'user.favorites.1.music.30000')
```

# LICENSE
Apache License 2.0
