/* eslint-disable no-console */
import * as http from "http";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import { createEntityClient } from "@phenyl/memory-db";
import { UserDefinition, ThisTypeMap } from "./definitions";

const entityClient = createEntityClient();
const sessionClient = entityClient.createSessionClient();

const functionalGroup = {
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

/**
 * Example of authentication.
 *
 * 1. Setup a server and http client.
 * 2. Insert user data to the server.
 * 3. Check if the user can log in.
 * 4. Check if the user can update own data.
 */
async function main() {
  // 1. Setup a server and http client.
  const server = new PhenylHttpServer(http.createServer(), { restApiHandler });
  server.listen(8080);

  const client = new PhenylHttpClient<ThisTypeMap>({
    url: "http://localhost:8080",
  });

  // 2. Insert user data to the server.
  const inserted = await client.insertAndGet({
    entityName: "user",
    value: {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      password: "shin123",
    },
  });
  console.log(inserted);

  // 3. Check if the user can log in.
  const logined = await client.login({
    entityName: "user",
    credentials: {
      email: "shinout@example.com",
      password: "shin123",
    },
  });
  console.log(logined);

  // 4. Check if the user can update own data.
  const updated = await client.updateAndGet(
    {
      entityName: "user",
      id: inserted.entity.id,
      operation: { $set: { password: "shin1234" } },
    },
    logined.session.id
  );
  console.log(updated);

  process.exit();
}

main().catch((e) => {
  console.log(e);
  process.exit();
});
