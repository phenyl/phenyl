import { createServer } from "http";
import assert from "assert";
import { after, before, describe, it } from "mocha";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import { createEntityClient } from "@phenyl/memory-db";
import PhenylHttpClient from "../src/index";

const entityClient = createEntityClient();

const restApiHandler = new PhenylRestApi(
  {},
  {
    entityClient,
    sessionClient: entityClient.createSessionClient()
  }
);

const server = new PhenylHttpServer(createServer(), {
  restApiHandler
});

const client = new PhenylHttpClient({
  url: "http://127.0.0.1:8080"
});

describe("constructor", () => {
  it("holds url when created", () => {
    const expected = "http://127.0.0.1:8080";

    assert.deepStrictEqual(client.url, expected);
  });
});

// TODO: implement me!
describe("PhenylHttpClient as http client", () => {
  before(() => {
    server.listen(8080);
  });

  after(() => {
    server.close();
  });
});
