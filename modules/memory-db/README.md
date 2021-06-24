# @phenyl/memory-db

volatile memory DB for local mocking

## usage

```js
import { createEntityClient } from '@phenyl/memory-db'

const entityClient = createEntityClient()

const user1 = {
        id: 'user1',
        name: 'user1'
    }

entityClient.insertOne({
    entityName: 'user',
    value: user1
})

const { entity: user } = entityClient.get({
    entityName: 'user',
    id: 'user1'
})
```

## Installation
```sh
npm install @phenyl/memory-db
```