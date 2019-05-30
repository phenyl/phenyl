/* eslint-disable no-console */
import { after, before, describe, it } from "mocha";
import {
  createEntityClient,
  PhenylMongoDbEntityClient
} from "../src/create-entity-client";
import { MongoDbConnection, connect } from "../src/connection";

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
    it("operations with set and push", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { name: "Jone", hobbies: ["play baseball"] }
      });
      generatedId = result.entity.id;
      versionId = result.versionId;

      const pushedResult = await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: [
          { $set: { name: "Alpha", hobbies: ["TypeScript"] } },
          { $push: { hobbies: "JavaScript" } }
        ],
        versionId
      });
    });
  });
});
