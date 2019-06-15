import assert from "assert";
import {
  PhenylMemoryDbEntityClient,
  createEntityClient
} from "../src/create-entity-client";
import { after, before, describe, it } from "mocha";

describe("MongoDBEntityClient", () => {
  let entityClient: PhenylMemoryDbEntityClient<{
    user: { id: string; name: string; hobbies: string[] };
  }>;

  let generatedId: string;
  let versionId: string;

  before(async () => {
    entityClient = createEntityClient({
      validatePushCommand: () => true
    });
  });

  after(async () => {
    await entityClient.delete({ entityName: "user", where: {} });
  });

  describe("update operation", () => {
    it("should succeed when only one operation", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "Jone",
          hobbies: ["play baseball"]
        }
      });
      generatedId = result.entity.id;
      versionId = result.versionId;
      const ope = {
        $push: {
          hobbies: "JavaScript"
        }
      };
      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: [ope],
        versionId
      });

      const updatedResult = await entityClient.get({
        entityName: "user",
        id: generatedId
      });

      assert.deepStrictEqual(updatedResult.entity.hobbies, [
        "play baseball",
        "JavaScript"
      ]);
    });

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

    it("should succeed when the clientHeadVersionId behind from DB client versionId", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "Jone",
          hobbies: ["play baseball"]
        }
      });
      generatedId = result.entity.id;
      versionId = result.versionId;

      // update version
      const ops = [{ $push: { hobbies: "JavaScript" } }];
      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: ops,
        versionId
      });

      // update by 1 commit behind from DB HEAD
      const ops2 = [{ $push: { hobbies: "TypeScript" } }];
      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: ops2,
        versionId
      });

      const update2Result = await entityClient.get({
        entityName: "user",
        id: generatedId
      });

      assert.deepStrictEqual(update2Result.entity.hobbies, [
        "play baseball",
        "JavaScript",
        "TypeScript"
      ]);
    });
  });
});
