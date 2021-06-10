# @phenyl/rest-api

REST API logic. Core part of Phenyl.

## example

Define a functionalGroup to create a PhenylRestApi instance.
FunctionalGroup is implementation to notify Phenyl about the domain that we want to use.
See [here](../http-server/README.md) for how to set up an http server using PhenylRestApi instance.
See [here](../standards/README.md) for how to create userDefinition and nonUserDefinition.

```js
import {
  createEntityClient as createMongoDBClient,
  connect,
} from "@phenyl/mongodb";
import PhenylRestApi from "@phenyl/rest-api";

const connection = await connect({
  url: "mongodb://localhost:27017",
  dbname: "mydb",
});

const entityClient = createEntityClient(connection);
const sessionClient = entityClient.createSessionClient();

class NonUserDefinition {
  constructor() {}
}

const functionalGroup = {
  nonUsers: { nonUser: new NonUserDefinition() },
  users: undefined,
  customQueries: undefined,
  customCommands: undefined,
};

const restApiHandler = new PhenylRestApi(functionalGroup, {
  entityClient,
  sessionClient,
});
```