import mocha, { after, before, describe } from "mocha";

import PhenylHttpClient from "../src/index";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import assert from "power-assert";
// import { assertEntityClient } from "@phenyl/interfaces";
import { createEntityClient } from "@phenyl/memory-db";
import { createServer } from "http";

const entityClient = createEntityClient();
const restApiHandler = new PhenylRestApi(
  {},
  {
    client: entityClient,
    sessionClient: entityClient.createSessionClient()
  }
);
const server = new PhenylHttpServer(createServer(), {
  restApiHandler
});
const client = new PhenylHttpClient({
  url: "http://localhost:8080"
});
describe("PhenylHttpClient as EntityClient", () => {
  before(() => {
    server.listen(8080);
  });
  // TODO call the following function
  // assertEntityClient(client, mocha, assert);
  client;
  after(() => {
    server.close();
  });
});
