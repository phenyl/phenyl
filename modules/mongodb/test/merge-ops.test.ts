import { MongoDbConnection, connect } from "../src/connection";
import assert from "assert";
import {
  PhenylMongoDbEntityClient,
  createEntityClient
} from "../src/create-entity-client";
/* eslint-disable no-console */
import { after, before, describe, it } from "mocha";

const url = "mongodb://localhost:27017";

describe("MongoDBEntityClient", () => {
  let conn: MongoDbConnection;
  let entityClient: PhenylMongoDbEntityClient<{
    user: { id: string; name: string; hobbies: string[] };
  }>;

  let generatedId: string;
  let versionId: string;

  before(async () => {
    conn = await connect(
      url,
      "phenyl-mongodb-test"
    );
    entityClient = createEntityClient(conn);
  });

  after(async () => {
    await entityClient.delete({ entityName: "user", where: {} });
    conn.close();
  });

  describe("merge operation", () => {
    it("should succeed when conflicted operations with set and push", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { name: "Jone", hobbies: ["play baseball"] }
      });
      generatedId = result.entity.id;
      versionId = result.versionId;

      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: [
          { $set: { name: "Alpha", hobbies: ["TypeScript"] } },
          { $push: { hobbies: "JavaScript" } }
        ],
        versionId
      });

      const updatedEntity = await entityClient.findOne({
        entityName: "user",
        where: {
          id: generatedId
        }
      });

      assert.strictEqual(updatedEntity.entity.id, generatedId);
      assert.strictEqual(updatedEntity.entity.name, "Alpha");
      assert.deepStrictEqual(updatedEntity.entity.hobbies, [
        "TypeScript",
        "JavaScript"
      ]);
    });

    // TODO
    it.skip("should throw error because of too long locked entity", () => {});
    // TODO
    it.skip("should succeed when only one operation", () => {});
  });
});
