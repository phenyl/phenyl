/* eslint-disable no-console */
import * as express from "express";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import { createEntityClient } from "@phenyl/memory-db";
import {
  createPhenylApiMiddleware,
  createPhenylMiddleware,
} from "@phenyl/express";
import { UserDefinition, ThisTypeMap } from "./definitions";
import { FunctionalGroup } from "@phenyl/interfaces";

const entityClient = createEntityClient();
const sessionClient = entityClient.createSessionClient();

const functionalGroup: FunctionalGroup<ThisTypeMap> = {
  customQueries: {},
  customCommands: {},
  users: {
    user: new UserDefinition(entityClient),
  },
  nonUsers: {},
};

const restApiHandler = new PhenylRestApi(functionalGroup, {
  entityClient,
  sessionClient,
});

const client = new PhenylHttpClient({ url: "http://localhost:3333" });

/**
 * Sample to set up an express server and send some requests to the server.
 *
 * 1. Set up a PhenylRestApi server.
 * 2. Insert user data into the server and make sure it can be logged in and out.
 * 3. Check if the text is returned when accessing the path specified in express.
 *
 * 1. Set up a PhenylRestApi server with custom request handler.
 * 2. Insert user data into the server and make sure it can be logged in and out.
 * 3. Check if the text is returned when accessing the path specified in express.
 * 4. Check if the text is returned when accessing the path specified in custom request handler.
 */
async function main() {
  const expressWithRestApi = await setupExpressWithRestApi();

  await checkCRUDOfUserData(client);

  // Text1 returned by Express
  const text1 = await client.requestText("/abc/def/ghi");
  console.log(text1);

  expressWithRestApi.close();

  const expressWithCustomRequestHandler = await setupExpressWithCustomRequestHandler();

  await checkCRUDOfUserData(client);

  // Text2 returned by Express
  const text2 = await client.requestText("/abc/def/ghi");
  console.log(text2);

  // Text3 returned by Phenyl Custom Request Handler
  const text3 = await client.requestText("/explorer");
  console.log(text3);
  expressWithCustomRequestHandler.close();
}

async function setupExpressWithRestApi() {
  const app = express();
  app.use(createPhenylApiMiddleware(restApiHandler));
  app.get("/abc/def/ghi", (req, res) => {
    res.send("Hello, Express!");
  });

  const server = app.listen(3333, () =>
    console.log("Express is listening on port 3333")
  );
  return server;
}

async function setupExpressWithCustomRequestHandler() {
  const app = express();
  const customRequestHandler = async () => {
    return {
      statusCode: 200,
      body: "Explorer",
      headers: { "Content-Type": "text/plain" },
    };
  };
  app.use(createPhenylMiddleware({ restApiHandler, customRequestHandler }));

  app.get("/abc/def/ghi", (req, res) => {
    res.send("Hello, Express!");
  });

  const server = app.listen(3333, () =>
    console.log("Express is listening on port 3333")
  );
  return server;
}

async function checkCRUDOfUserData(client) {
  const inserted = await client.insertAndGet({
    entityName: "user",
    value: {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      password: "shin123",
    },
  });
  console.log(inserted);

  const logined = await client.login({
    entityName: "user",
    credentials: {
      email: "shinout@example.com",
      password: "shin123",
    },
  });
  console.log(logined);

  const updated = await client.updateAndGet(
    {
      entityName: "user",
      id: inserted.entity.id,
      operation: { $set: { password: "shin1234" } },
    },
    logined.session.id
  );
  console.log(updated);
}

main();
