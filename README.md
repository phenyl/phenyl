# Phenyl - State Synchronization over Environments [![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)
**WORK IN PROGRESS**

Phenyl is a **series of JavaScript libraries** for both client-side and server-side, which focuses on **State Synchronization over Environments(SSoE)**.

ServerSide Phenyl provides an API server like MBaaS(Mobile Backend as a server).
ClientSide Phenyl provides [Redux](https://redux.js.org) module system.
Within these two environments, States are Synchronized in various ways.

# State Synchronization over Environments (SSoE)
State Synchronization over Environments is the main concept of modern applications.

For example, if you use RESTful API, you can synchronize server and client state through following HTTP methods:
- Acquire server state of user by GET `/user` and provide user profile view by acquired user entity.
- User updates user name at profile view, app update user entity in the client side and app POST or PATCH `/user`.
- User delete account, app clear the client state and app execute DELETE `/user`

It's popular method of SSoE. So, many people create RDB, write API server to transform Data to Entity and communicate with client, write fetch code in client, client transform Entity to data for view, client update entity and notify to server, server save updated entity to DB and so on. Additionally error handlings are neccessary in practice.

Phenyl provides simpler solution to handle SSoE based on the following 4 concepts:

 - State as one big JSON
 - OAD: Operations as Data
 - MongoDB-like operations
 - Git-like synchronization

## State as one big JSON
JSON is very useful format for JavaScript. It has some basic types like string or boolean and it's easy to serialize and deserialize.
We represent the entire app state as one big JSON.

## OAD: Operations As Data
Phenyl handles all CRUD operations on data, such as creating an entity, reading the data in an entity, updating a property in an entity, and deleting an entity as data. 
The history of all operations is also saved as in the state.
This concept allows us to easily reproduce and debug any situations we want.

## MongoDB-like operations
Phenyl provides MongoDB-like operations.

In a mongoDB shell, CRUD operations are performed as following:

```shell
> db.testUser.insertOne({_id: "test1", name: "Test1"})
{ "acknowledged" : true, "insertedId" : "test1" }

> db.testUser.findOne({_id: "test1"})
{ "_id" : "test1", "name" : "Test1" }

> db.testUser.updateOne({name: "Test1"}, {$set: {favoriteFood: "banana"}})
{ "acknowledged" : true, "matchedCount" : 1, "modifiedCount" : 1 } 

> db.testUser.findOne({_id: "test1"})
{ "_id" : "test1", "name" : "Test1" , "favoriteFood": "banana" }

> db.testUser.deleteOne({"_id": "test1"})
{ "acknowledged" : true, "deletedCount" : 1 } 

> db.testUser.findOne({_id: "test1"})
null
```

In Phenyl client, the operations are performed as following. (This code is simplified.)
```ts
// omission prepare httpClient and preSession
const inserted = await phenylClient.insertAndGet(
    {
        entityName: "testUser",
        value: {
            id: "test1",
            name: "Test1",
        }
    },
    preSession.id
);

console.log(inserted.entity) 
// -> { id: "test1", name: "Test1" }

const updated = await phenylClient.updateAndGet(
    {
        entityName: "testUser",
        id: "test1",
        operation: { 
            $set: { favoriteFood: "banana" } 
        }
    },
    preSession.id
);

console.log(updated.entity) 
// -> { id: "test1", name: "Test1" , faboriteFood: "banana" }

await phenylClient.delete({ entityName: "testUser", id: "test1" })
```

If you have used mongodb, you will soon get to be friendly with the API of Phenyl😎.

## Git-like synchronization
Phenyl synchronizes between server and client by using git-like command.
You can acquire server side entity by `pull` and update by `push`.
This allows us to handle offline oepration easily.

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

# sp2

Phenyl is powered by [sp2](https://github.com/phenyl-js/sp2), a set of JavaScript modules used for state operations. 

# Usage

Phenyl needs you to implement 2 features, one is **GeneralTypeMap** and the other is **functionalGroup**.
**GeneralTypeMap** is type definition that describes shape of request and response of each entity and auth information.
**functionalGroup** is implementation to notify Phenyl about the domain that we want to use. 
If you want to know more details, see [example](./modules/standards/test/standard-definition-authentication.test).

# License
Apache License 2.0
