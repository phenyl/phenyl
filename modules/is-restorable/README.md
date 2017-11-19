# is-restorable [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)
Checking instance's restorablity. Designed for testing.

# What is "Restorable"
Restorable is a characteristic of JavaScript classes whose instance meets the following requirement.

```js
const jsonStr = JSON.stringify(instance)
const plain = JSON.parse(jsonStr)
const newInstance = new TheClass(plain)

assert.deepEqual(newInstance, instance)
```

Roughly, Restorable object is an instance which can re-created by passing its JSON object to the class constructor.

# Restorable === shareable over environments

Class instances are subject to become JSON when they are passed over environments.
```
Class instance => JSON => Network server

Class instance => JSON => File, storage

Class instance => JSON => Redux store

Class instance => JSON => Web worker, another process
```

Restorable objects are easily restored from JSON in the passed environments.

# Installation
```sh
npm install is-restorable
```

# Usage
```js
import isRestorable from 'is-restorable'

class Foo {
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
```

# Phenyl Family
`is-restorable` is one of **Phenyl Family**.
[Phenyl](https://github.com/phenyl-js/phenyl) is a JavaScript Server/Client framework for State Synchronization over Environment(SSoE).
Restorable instances are essential for state synchronization.

# LICENSE
Apache License 2.0
