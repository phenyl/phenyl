# power-persist [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)

**Persist large JSON efficiently**. Designed for [React Native](https://facebook.io/react-native), but available in any JavaScript environment.

# Usage

```js
import PowerPersist from 'power-persist'

const largeObj = {
  foo: {
    bar: {
      baz: [1, 10, 100]
    }
  },
}

(async () => {
  const persisted = new PowerPersist(AsyncStorage)
  await persisted.register(largeObj)
  await persisted.update({ 'foo.bar.baz[0]': 3 } }) // This doesn't do JSON.parse() / JSON.stringify() of largeObj.
  const restored = await persisted.restore()

  assert.deepEqual(restored, {
    foo: {
      bar: {
        baz: [3, 10, 100]
      }
    },
  })
})()
```

# Using types with flow
For [Flow](https://flowtype.org) annotations, just use `/jsnext` entrypoint.

```js
import { assign } from 'power-persist/jsnext'
```
All the interfaces are defined in the depending module [mongolike-operations](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations).


# Concept
## OAD: Operation As Data
**Operations As Data(OAD)** is the concept of handling large JSON data that all the data operations (update/find) should be written as JSON format (≒ plain object).
This `power-persist` provides utility functions for handling OAD.

## Phenyl Family
`power-persist` is one of **Phenyl Family**.
[Phenyl](https://github.com/phenyl-js/phenyl) is a JavaScript Server/Client framework for State Synchronization over Environment(SSoE).

# Installation

```sh
npm install power-persist
```

# API Documentation
## Overview
- register(largeObj, maxDepth)
- update(updateOperation)
- clear()
- restore()

## Constructor

Create the instance of `PowerPersist`.
```js
import PowerPersist from 'power-persist'
const persisted = new PowerPersist(storage)
```

### Parameters

#### storage: StringStorage
The second argument `storage` should have the same interface as [React Native's AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html).

Required interface:
```flow
interface StringStorage {
  getItem(key: string): Promise<?string>,
  setItem(key: string, value: string): Promise<void>,
  removeItem(key: string): Promise<void>,
  getAllKeys(): Promise<Array<string>>,
  multiSet(keyValuePairs: Array<Array<string>>): Promise<void>,
  multiRemove(keys: Array<string>): Promise<void>,
  multiGet(keys: Array<string>): Promise<?Array<Array<string>>>,
}
```

## register(largeObj, maxDepth)

```js
import PowerPersist from 'power-persist'
const persisted = new PowerPersist(storage)

const largeObj = { foo: { bar: { baz: [1, 10, 100] } } }

(async () => {
  await persisted.register(largeObj, 3)
})()
```
### Parameters
#### lergeObj: Object
Object to be persisted.

#### maxDepth
Depth until `JSON.stringify()`.


## update(operation: UpdateOperation)
Update the registered object with the given UpdateOperation.

```js
import PowerPersist from 'power-persist'

const largeObj = {
  foo: {
    bar: {
      baz: [1, 10, 100]
    }
  },
}

(async () => {
  const persisted = new PowerPersist(AsyncStorage)
  await persisted.register(largeObj)
  await persisted.update({ 'foo.bar.baz[0]': 3 } })
  const restored = await persisted.restore()

  assert.deepEqual(restored, {
    foo: {
      bar: {
        baz: [3, 10, 100]
      }
    },
  })
})()
```

### UpdateOperation

Operations to update values of large JSON.
Almost compatible with **[MongoDB's Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)**.

`update()` method takes UpdateOperation like this:
```js
await persisted.update({ 'foo.bar.baz[0]': 3 })
                    // ^^^^^^^^^^^^^^^^^^^^^^^
                    // This is UpdateOperation
```

More examples:
```js
await persisted.update({ $set: { 'foo.bar.baz[0]': 3 } }) // The example above is also written like this.
await persisted.update({ $push: { 'foo.bar.baz': 1000 } }) // $push operator example.
await persisted.update({
  $set: { name: 'John', age: 19 }, // Set multiple values.
  $inc: { 'foo.bar.baz[1]': 5 }, // Increment +5.
}) // $push operator example.
```

See README of [power-assign](https://github.com/phenyl-js/phenyl/tree/master/modules/power-assign) for more detailed definition.

### DocumentPath
DocumentPath expresses nested value location. `'foo.bar.baz[0]'` in the example.

The same definition as [Amazon DynamoDB's DocumentPath](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.Attributes.html#Expressions.Attributes.NestedElements.DocumentPathExamples).

```js
type DocumentPath = string
```
```js
{ foo: { arr: [ { bar: 'baz' }] }}
```
The string `'baz'` is expressed as `'foo.arr[0].bar'` in DocumentPath format.

This DocumentPath is slightly different from [Dot Notation in MongoDB](https://docs.mongodb.com/manual/core/document/#dot-notation) which expresses `'baz'` as `'foo.arr.0.bar'` (array index expression is different).


## clear()
Clear all the registered objects.

```js
import PowerPersist from 'power-persist'

const largeObj = {
  foo: {
    bar: {
      baz: [1, 10, 100]
    }
  },
}

(async () => {
  const persisted = new PowerPersist(AsyncStorage)
  await persisted.register(largeObj)
  await persisted.clear()
  const restored = await persisted.restore()

  assert(restored == null)
})()
```

## restore()
Restore whole the stored object from the storage.

```js
import PowerPersist from 'power-persist'

const largeObj = {
  foo: {
    bar: {
      baz: [1, 10, 100]
    }
  },
}

(async () => {
  const persisted = new PowerPersist(AsyncStorage)
  await persisted.register(largeObj)
  const restored = await persisted.restore()

  assert.deepEqual(restored, largeObj)
})()
```
