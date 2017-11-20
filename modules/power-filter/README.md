# power-filter [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)

Filter objects in array by MongoDB-like FindOperation.

```js
import { filter } from 'power-filter'

const objs = [
  { name: 'John' },
  { name: 'Naomi' },
  { name: 'Shin' },
]

const filteredObjs = filter(obj, { name: { $regex: /n$/ } })
assert.deepEqual(filteredObjs, [
  { name: 'John' },
  { name: 'Shin' },
])
```

## Installation
```sh
npm install power-filter
```

## Using types with flow
For [Flow](https://flowtype.org) annotations, just use `/jsnext` entrypoint.

```js
import { filter } from 'power-filter/jsnext'
```

All the interfaces are defined in the depending module [mongolike-operations](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations).

# Concept
## OAD: Operations As Data
**Operations As Data(OAD)** is the concept of handling large JSON data that all the data operations (update/find) should be written as JSON format (≒ plain object).
This power-filter handles **FindOperation** as data.

In the previous example, `{ name: { $regex: /n$/ } }` is the **FindOperation**.

The operation format is almost the same as **[MongoDB's Query Operators](https://docs.mongodb.com/manual/reference/operator/query/)**.

Here is another example using some more operators.

```js
const filtered = filter(objs, {
  $or: [
    { age: { $gte: 20 } }, // $gte operator: age greater than or equal to 20
    { sex : { $eq: 'female' } }, // $eq operator: check equality
    { name : 'Naomi' }, // no operator stands for "$eq"
  ]
})
```

## Phenyl Family
power-filter is one of **Phenyl Family**.
[Phenyl](https://github.com/phenyl-js/phenyl) is a JavaScript Server/Client framework for State Synchronization over Environment(SSoE).
FindOperation is used to fetch entities from the large JSON. In Phenyl framework `power-filter` is used for searching entities in local state and in mock server ([phenyl-memory-db](https://github.com/phenyl-js/phenyl/tree/master/phenyl-memory-db)).

# API Documentation
## Definitions

```js
const where = {
  { 'foo.bar[0].baz': { $eq: 123 } }
}
```
- `where` value is **FindOperation**.
- `foo.bar[0].baz` is **DocumentPath**.
- `{ $eq: 123 }` is **QueryCondition**.
- `$eq` is **QueryOperatorName**.
- `123` is **Operand**.

### FindOperation
Operation to find values.

```js
type FindOperation =
  SimpleFindOperation |
  {| $and: Array<FindOperation> |} |
  {| $nor: Array<FindOperation> |} |
  {| $or: Array<FindOperation> |}

type SimpleFindOperation = {
  [fieldName: DocumentPath]: QueryCondition | EqCondition,
}

type EqCondition = Object | Array<Basic> | string | number | boolean
// QueryCondition: See below section

```
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
Condition to find values, included in `FindOperation`.
Almost compatible with [MongoDB's Query Operators](https://docs.mongodb.com/manual/reference/operator/query/).

```js
interface QueryCondition {
  // comparison
  $eq?: any,
  $gt?: any,
  $gte?: any,
  $in?: Array<any>,
  $lt?: any,
  $lte?: any,
  $ne?: any,
  $nin?: Array<any>,
  // logical
  $not?: QueryCondition,
  // element
  $exists?: boolean,
  $type?: BSONTypeNumber | BSONTypeString,
  // evaluation
  $mod?: [number, number],
  $regex?: RegExp | string,
  $options?: RegExp$flags,
  $text?: TextQueryCondition,
  $where?: Function, // To Be Implemented
  // geospatial
  $geoIntersects?: Object, // To Be Implemented
  $geoWithin?: Object, // To Be Implemented
  $near?: Object, // To Be Implemented
  $nearSphere?: Object, // To Be Implemented
  // array
  $all?: Array<any>,
  $elemMatch?: QueryCondition,
  $size?: number,
  // bitwise
  $bitsAllClear?: number, // Currently, only number is allowed
  $bitsAllSet?: number, // Currently, only number is allowed
  $bitsAnyClear?: number, // Currently, only number is allowed
  $bitsAnySet?: number, // Currently, only number is allowed
  // comments
  // $comment: // No implementation
}
```

### DocumentPath
The same definition as [Amazon DynamoDB's DocumentPath](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.Attributes.html#Expressions.Attributes.NestedElements.DocumentPathExamples).

DocumentPath expresses nested value location.
```js
{ foo: { arr: [ { bar: 'baz' }] }}
```
The string `'baz'` is expressed as `'foo.arr[0].bar'` in DocumentPath format.

This DocumentPath is slightly different from [Dot Notation in MongoDB](https://docs.mongodb.com/manual/core/document/#dot-notation) which expresses `'baz'` as `'foo.arr.0.bar'` (array index expression is different).


## filter()
Filter values matching the given FindOperation.

```js
filter(
  objs: Array<Object>,
  where: FindOperation
): Array<Object>

```

### Parameters
#### objs
Array of objects to be searched.

```js
import { filter } from 'power-filter'
const objs = [
  { foo: 1, bar: 1 }, { foo: 2, bar: 1 }, { foo: 3, bar: 1 }
]
const filtered = assign(objs, { foo: 3 })
assert.deepEqual(filtered, [{ foo: 3, bar: 1 }])
assert(objs[2] === filtered[0]) // Filtered value are references, not copy.
```

#### where
**FindOperation**. See its definition above.


## Query Operators
Almost the same as **[MongoDB's Query Operators](https://docs.mongodb.com/manual/reference/operator/query/)**.

### $eq
Matches values that are equal to a specified value.

```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: { $eq: 100 } }), [{ a: 100, b: 200 }])
```

$eq operator can be omitted.
```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: 100 }), [{ a: 100, b: 200 }])
```


### $gt
Matches values that are greater than a specified value.

```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: { $gt: 1 } }), [{ a: 100, b: 200 }])
```

### $gte
Matches values that are greater than or equal to a specified value.

```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: { $gte: 1 } }), [{ a: 1, b: 2 }, { a: 100, b: 200 }])
```

### $in
Matches any of the values specified in an array.

```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: { $in: [1, 2, 3] } }), [{ a: 1, b: 2 }])
```

### $lt
Matches values that are less than a specified value.

```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: { $lt: 1 } }), [])
```

### $lte
Matches values that are less than or equal to a specified value.

```js
const objs = [ { a: 1, b: 2 }, { a: 100, b: 200 }]
assert.deepEqual(filter(objs, { a: { $lte: 1 } }), [{ a: 1, b: 2 }])
```

### $ne
Matches all values that are not equal to a specified value.

### $nin
Matches none of the values specified in an array.

### $not
Joins query clauses with a logical AND returns all objects that match the conditions of both clauses.

### $exists
Matches objects that have the specified field.

### $type
Selects objects if a field is of the specified type.

### $mod
Performs a modulo operation on the value of a field and selects objects with a specified result.

### $regex
Selects objects where values match a specified regular expression.

#### $options

### $text
Performs text search.

### $where
Matches objects that satisfy a JavaScript matcher function.

### $all
Matches arrays that contain all elements specified in the query.

### $elemMatch
Selects objects if element in the array field matches all the specified $elemMatch conditions.

### $size
Selects documents if the array field is a specified size.

# LICENSE
Apache License 2.0
