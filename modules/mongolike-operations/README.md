# mongolike-operations [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)
Define [Flow](https://flowtype.org) interfaces of MongoDB-like operations used in [Phenyl](https://github.com/phenyl-js/phenyl) modules.

## OAD: Operations As Data
**Operations As Data(OAD)** is the concept of handling large JSON data that all the data operations (update/find) should be written as JSON format (≒ plain object).
This `mongolike-operations` defines these Operation type.


## Phenyl Family
`mongolike-operation` is one of **Phenyl Family**.
[Phenyl](https://github.com/phenyl-js/phenyl) is a JavaScript Server/Client framework for State Synchronization over Environment(SSoE).

# Types

## FindOperation
Operation to find values in large JSON.

Type:
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

## QueryCondition
Condition to find values in large JSON, included in `FindOperation`.
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

## UpdateOperation
Operations to update values of large JSON.
Almost compatible with **[MongoDB's Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)**.

See README of [power-assign](https://github.com/phenyl-js/phenyl/tree/master/modules/power-assign) for more detailed use.

## Restorable
Restorable is a characteristic of JavaScript class instances which meets the following requirement.

```js
const jsonStr = JSON.stringify(instance)
const plain = JSON.parse(jsonStr)
const newInstance = new TheClass(plain)

assert.deepEqual(newInstance, instance)
```

Roughly, Restorable object is an instance which can re-created by passing its JSON object to the class constructor.

See [is-restorable](https://github.com/phenyl-js/phenyl/tree/master/modules/is-restorable) module for more detail.

## DocumentPath
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

# LICENSE
Apache License 2.0
