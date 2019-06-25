import { MongoDbConnection, connect } from "../src/connection";
import {
  PhenylMongoDbEntityClient,
  createEntityClient
} from "../src/create-entity-client";
import { after, before, describe, it } from "mocha";

import assert from "assert";

const url = "mongodb://localhost:27017";

describe("MongoDBEntityClient", () => {
  let conn: MongoDbConnection;
  let entityClient: PhenylMongoDbEntityClient<{
    user: { id: string; name: string; hobbies: string[] };
  }>;

  before(async () => {
    conn = await connect(
      url,
      "phenyl-mongodb-test"
    );
    entityClient = createEntityClient(conn, {
      validatePushCommand: () => true
    });
    await entityClient.insertMulti({
      entityName: "user",
      values: [
        { name: "Smith", hobbies: [] },
        { name: "Shin", hobbies: [] },
        { name: "John", hobbies: [] },
        { name: "Mary", hobbies: [] }
      ]
    });
  });

  after(async () => {
    await entityClient.delete({ entityName: "user", where: {} });
    conn.close();
  });

  describe("Sort results of find()", () => {
    it("should find entities order by ASC when SortNotation is given", async () => {
      const result = await entityClient.find({
        entityName: "user",
        where: {
          name: { $exists: true }
        },
        sort: { name: 1 }
      });
      assert.deepStrictEqual(result.entities.map(v => v.name), [
        "John",
        "Mary",
        "Shin",
        "Smith"
      ]);
    });

    it("should find entities order by DESC when SortNotation is given", async () => {
      const result = await entityClient.find({
        entityName: "user",
        where: {
          name: { $exists: true }
        },
        sort: { name: -1 }
      });
      assert.deepStrictEqual(result.entities.map(v => v.name), [
        "Smith",
        "Shin",
        "Mary",
        "John"
      ]);
    });
  });
});
