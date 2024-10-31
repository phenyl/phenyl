import { createPhenylClients } from "../src/create-phenyl-clients";
import assert from "assert";
import { PhenylMongoDbConnection } from "../src/connection";
import { MongoClient } from "mongodb";
import { PhenylMongoDbEntityClient } from "../src/create-entity-client";
import { PhenylSessionClient } from "@phenyl/central-state";
import PhenylRestApi from "@phenyl/rest-api";

let dbClient: MongoClient;
beforeAll(async () => {
  dbClient = await MongoClient.connect("mongodb://localhost:27017");
});
describe("createPhenylClients", () => {
  const conn = new PhenylMongoDbConnection({ dbClient, dbName: "hoge" });
  const clients = createPhenylClients(conn, {});
  it("should create entityClient and sessionClient", () => {
    const { entityClient, sessionClient } = clients;
    assert.strictEqual(entityClient instanceof PhenylMongoDbEntityClient, true);
    assert.strictEqual(sessionClient instanceof PhenylSessionClient, true);
  });

  it("should create phenylRestApi correctly", () => {
    const phenylRestApi = new PhenylRestApi({}, clients);
    assert.strictEqual(phenylRestApi instanceof PhenylRestApi, true);
  });
});

afterAll(async () => {
  dbClient.close();
});
