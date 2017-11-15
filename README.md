# Phenyl - State Synchronization over Environments [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)
**WORK IN PROGRESS**

Phenyl is a **series of JavaScript libraries** for both client-side and server-side, focusing on **State Synchronization over Environments(SSoE)**.

ServerSide Phenyl provides an API server like MBaaS(Mobile Backend as a server).
ClientSide Phenyl provides [Redux](https://redux.js.org) module system.
These two environments, State are Synchronized by various ways.

# State Synchronization over Environments (SSoE)
TBD

## State is one big JSON
TBD

## OAD: Operations As Data
TBD

## MongoDB-like operations
TBD

## Git-like synchronization
TBD

# Phenyl Family
## ServerSide Libraries
- [phenyl-http-server](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-http-server): HTTP Server.
- [phenyl-rest-api](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-rest-api):
- [phenyl-websocket-server](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-websocket-server):
- [phenyl-mongodb-client](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-mongodb-client):
- [phenyl-dynamodb-client](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-dynamodb-client):
- [phenyl-lambda-adapter](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-lambda-adapter):
- [phenyl-memory-client](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-memory-client):

## ClientSide Libraries
- [phenyl-http-client](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-http-client):
- [phenyl-redux](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-redux):
- [phenyl-websocket-client](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-websocket-client):

## Common Libraries
- [phenyl-interfaces](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-interfaces):
- [phenyl-utils](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-utils):
- [phenyl-state](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-state):
- [phenyl-standards](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-standards):
- [phenyl-http-rules](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-):
- [power-crypt](https://github.com/phenyl-js/phenyl/tree/master/modules/power-crypt):

### OAD Libraries
- [power-assign](https://github.com/phenyl-js/phenyl/tree/master/modules/power-assign): Empowered Object.assign().
- [power-filter](https://github.com/phenyl-js/phenyl/tree/master/modules/power-filter): Filter objects in array by MongoDB-like FindOperation.
- [oad-utils](https://github.com/phenyl-js/phenyl/tree/master/modules/oad-utils): Collection of utility functions for OAD.
- [mongolike-operations](https://github.com/phenyl-js/phenyl/tree/master/modules/mongolike-operations): Define [Flow](https://flowtype.org) interfaces of MongoDB-like operations.
- [is-restorable](https://github.com/phenyl-js/phenyl/tree/master/modules/is-restorable): Checking instance's restorablity.

# Usage
## ServerSide
```js
// @flow
import PhenylHttpServer from 'phenyl-http-server/jsnext'
import PhenylRestApi from 'phenyl-rest-api/jsnext'
import { PhenylMongoDbClient, MongoDbSessionClient } from 'phenyl-mongodb-client/jsnext'

const client = new PhenylMongoDbClient('mongodb://localhost:12345')
const phenylRestApi = new PhenylRestApi({ client })
const server = new PhenylHttpServer(http.createServer(), { restApiHandler: phenylRestApi })
server.listen(8080)
```

## ClientSide
TBD

# License
Apache License 2.0
