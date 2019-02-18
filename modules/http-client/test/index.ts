import mocha, { describe, before, after } from "mocha";
import assert from "power-assert";
import PhenylHttpClient from "../src/index";
import { assertEntityClient } from "@phenyl/interfaces";
import PhenylHttpServer from "phenyl-http-server";
import { createServer } from "http";
import PhenylRestApi from "phenyl-rest-api";
import { createEntityClient } from "phenyl-memory-db";
const entityClient = createEntityClient();
const restApiHandler = new PhenylRestApi({
  client: entityClient
});
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
  assertEntityClient(client, mocha, assert);
  after(() => {
    server.close();
  });
});
