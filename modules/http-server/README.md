# @phenyl/http-server

Simple HTTP Server to host PhenylRestApi

## example

To create a PhenylHttpServer instance, you need to create a PhenylRestApi instance.

```js
import { createServer } from "http";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import { createEntityClient } from "@phenyl/memory-db";

const entityClient = createEntityClient();

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
  sessionClient: entityClient.createSessionClient(),
});

const server = new PhenylHttpServer(createServer(), { restApiHandler });

server.listen(8080)
```