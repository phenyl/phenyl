# @phenyl/central-state
central-state is handling entity and abstraction layer from DB. It's independent from DB like mongo or memory.

```js
import { MongoClient } from 'mongodb'
import { PhenylMongoDbClient } from '@phenyl/mongo-db'

const dbClient = new MongoClient('mongodb://localhost:27017')
await dbClient.connect()
const connection = new PhenylMongoDbConnection({
    dbClient,
    dbName: user
})
const dbClient = new PhenylMongoDbClient(connection)
const entityClient = new PhenylEntityClient(dbClient)

await entityClient.insertOne({ entityName: 'user', value: { id: 'user' } })

const user = await entityClient.get({ entityName: 'user', id: 'user' }) // { id: 'user' }
```


## Installation

```sh
npm install @phenyl/central-state
```
