import { describe, it } from "mocha";
import assert from "assert";
import { createEntityClient } from "../src/index";

type TestEntityMap = {
  user: { id: string; name: string };
};
const entityClient = createEntityClient<TestEntityMap>();

// TODO: add test for entityClient every method
describe("PhenylMemoryDb as EntityClient", () => {
  let generatedId: string;
  describe("inserts entity", () => {
    it("insert an entity with insertAndGet", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { name: "Jone" }
      });

      generatedId = result.entity.id;
      assert.strictEqual(result.entity.name, "Jone");
    });

    it("insert an entity with insertOne", async () => {
      await entityClient.insertOne({
        entityName: "user",
        value: { id: "jane", name: "Jane" }
      });

      const user = await entityClient.get({ entityName: "user", id: "jane" });
      assert.strictEqual(user.entity.id, "jane");
      assert.strictEqual(user.entity.name, "Jane");
    });
  });

  describe("gets entity", () => {
    it("by auto generated id", async () => {
      const result = await entityClient.get({
        entityName: "user",
        id: generatedId
      });

      assert(result.entity.name === "Jone");
    });

    it("by set id", async () => {
      const result = await entityClient.get({
        entityName: "user",
        id: "jane"
      });

      assert(result.entity.name === "Jane");
    });
  });
});
