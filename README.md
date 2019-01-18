# Phenyl - State Synchronization over Environments [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)
**WORK IN PROGRESS**

Phenyl is a **series of JavaScript libraries** for both client-side and server-side, which focusus on **State Synchronization over Environments(SSoE)**.

ServerSide Phenyl provides an API server like MBaaS(Mobile Backend as a server).
ClientSide Phenyl provides [Redux](https://redux.js.org) module system.
Within these two environments, State are Synchronized in various ways.

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
- [@phenyl/rest-api](https://github.com/phenyl-js/phenyl/tree/master/modules/rest-api): REST API logic. Core part of Phenyl.
- [@phenyl/http-server](https://github.com/phenyl-js/phenyl/tree/master/modules/http-server): Simple HTTP Server to host PhenylRestApi.
- [@phenyl/express](https://github.com/phenyl-js/phenyl/tree/master/modules/express): Express middleware to run PhenylRestApi on it.
- [@phenyl/websocket-server](https://github.com/phenyl-js/phenyl/tree/master/modules/websocket-server): WebSocket server to emit update operations of entities.
- [@phenyl/mongodb](https://github.com/phenyl-js/phenyl/tree/master/modules/mongodb): MongoDB client.
- [@phenyl/lambda-adapter](https://github.com/phenyl-js/phenyl/tree/master/modules/lambda-adapter): Helper to run PhenylRestApi on AWS Lambda.
- [@phenyl/memory-db](https://github.com/phenyl-js/phenyl/tree/master/modules/memory-db): volatile memory DB for local mocking.

## ClientSide Libraries
- [@phenyl/http-client](https://github.com/phenyl-js/phenyl/tree/master/modules/http-client): Client to PhenylRestApi.
- [@phenyl/redux](https://github.com/phenyl-js/phenyl/tree/master/modules/redux): State synchronization among Phenyl CentralState(server) and LocalState(client) using Redux.
- [@phenyl/websocket-client](https://github.com/phenyl-js/phenyl/tree/master/modules/websocket-client): WebSocket client to listen to entities's update.

## Common Libraries
- [@phenyl/interfaces](https://github.com/phenyl-js/phenyl/tree/master/modules/interfaces): All types of Phenyl family are defined here.
- [@phenyl/standards](https://github.com/phenyl-js/phenyl/tree/master/modules/standards): Provides advanced features.
- [@phenyl/utils](https://github.com/phenyl-js/phenyl/tree/master/modules/utils): (Almost internal) Utility functions in Phenyl family.
- [@phenyl/state](https://github.com/phenyl-js/phenyl/tree/master/modules/state): (Almost internal) Entity state Reader/Writer.
- [@phenyl/http-rules](https://github.com/phenyl-js/phenyl/tree/master/modules/http-rules): (Almost internal) Set of rules that translates HTTP Request/Response into Phenyl RequestData/ResponseData.
- [power-crypt](https://github.com/phenyl-js/phenyl/tree/master/modules/power-crypt): (Almost internal) A module for string encryption.

# sp2

Phenyl is powered by [sp2](https://github.com/phenyl-js/sp2), a set of JavaScript modules used for state operations. 

# Usage
## ServerSide
```js
// @flow
import PhenylHttpServer from '@phenyl/http-server'
import PhenylRestApi from '@phenyl/rest-api'
import { connect, createEntityClient } from '@phenyl/mongodb'

const connection = await connect('mongodb://localhost:12345')

const client = createEntityClient(connection)
const phenylRestApi = new PhenylRestApi({ client })
const server = new PhenylHttpServer(http.createServer(), { restApiHandler: phenylRestApi })
server.listen(8080)
```

## ClientSide
TBD

# License
Apache License 2.0
