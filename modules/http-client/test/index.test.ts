import { createServer } from "http";
import assert from "assert";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import { createEntityClient } from "@phenyl/memory-db";
import PhenylHttpClient from "../src/index";

const entityClient = createEntityClient();

class NonUserDefinition {
  constructor() {}
}

const functionalGroup = {
  customQueries: undefined,
  customCommands: undefined,
  users: undefined,
  nonUsers: { nonUser: new NonUserDefinition() },
};

const restApiHandler = new PhenylRestApi(functionalGroup, {
  entityClient,
  sessionClient: entityClient.createSessionClient(),
});

const server = new PhenylHttpServer(createServer(), {
  restApiHandler,
  customRequestHandler: () =>
    Promise.resolve({
      headers: { "Content-Type": "text/plain" },
      body: "body text",
      statusCode: 200,
    }),
});

const url = "http://127.0.0.1:8080";

const client = new PhenylHttpClient({ url });

describe("constructor", () => {
  it("holds url when created", () => {
    const expected = "http://127.0.0.1:8080";

    assert.deepStrictEqual(client.url, expected);
  });
});

describe("PhenylHttpClient as http client", () => {
  beforeAll(() => {
    server.listen(8080);
  });

  it("can handle request data", async () => {
    const { entity } = await client.insertAndGet({
      entityName: "nonUser",
      value: { id: "nonUser1" },
    });

    assert.strictEqual(entity.id, "nonUser1");
  });

  it("can handle request data with qsParams", async () => {
    const { entities } = await client.find({
      entityName: "nonUser",
      where: { id: "nonUser1" },
    });

    assert.strictEqual(entities.length, 1);
    assert.strictEqual(entities[0].id, "nonUser1");
  });

  it("throws error when fetch fails", async () => {
    client.url = "http://127.0.0.1:7000";
    let error;
    try {
      await client.find({
        entityName: "nonUser",
        where: { id: "nonUser1" },
      });
    } catch (e) {
      error = e;
    }
    assert.strictEqual(error.ok, 0);
    client.url = url;
  });

  describe("requestText", () => {
    it("returns text for the specified path", async () => {
      const text = await client.requestText("");
      assert.strictEqual(text, "body text");
    });
  });

  afterAll(() => {
    server.close();
  });
});
