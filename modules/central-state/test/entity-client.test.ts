/* eslint-env mocha */
import { PhenylMemoryDbClient } from "@phenyl/memory-db";
import assert from "assert";
import { PhenylSessionClient } from "../src";
import { PhenylEntityClient } from "../src/entity-client";

type TestEntityMap = {
  user: { id: string; name: string; _PhenylMeta: any };
};

const entityState = {
  pool: {
    user: {
      user1: {
        id: "user1",
        name: "user1",
        _PhenylMeta: {
          versions: [
            {
              id: "version1",
              op: '{"$set":{"name":"user2"}}',
            },
            {
              id: "version2",
              op: '{"$set":{"name":"user3"}}',
            },
          ],
        },
      },
    },
  },
};

const dbClient = new PhenylMemoryDbClient<TestEntityMap>({
  entityState,
});
// @ts-ignore
const entityClient = new PhenylEntityClient(dbClient);

describe("PhenylEntityClient", () => {
  beforeEach(() => {
    dbClient.entityState = entityState;
  });
  describe("find", () => {
    it("returns query result", async () => {
      const result = await entityClient.find({
        entityName: "user",
        where: { name: "user1" },
      });
      assert.deepStrictEqual(result, {
        entities: [{ id: "user1", name: "user1" }],
        versionsById: { user1: "version2" },
      });
    });
  });

  describe("findOne", () => {
    it("returns single query result", async () => {
      const result = await entityClient.findOne({
        entityName: "user",
        where: { name: "user1" },
      });
      assert.deepStrictEqual(result, {
        entity: { id: "user1", name: "user1" },
        versionId: "version2",
      });
    });
  });

  describe("get", () => {
    it("returns single query result", async () => {
      const result = await entityClient.get({
        entityName: "user",
        id: "user1",
      });
      assert.deepStrictEqual(result, {
        entity: { id: "user1", name: "user1" },
        versionId: "version2",
      });
    });
  });

  describe("getByIds", () => {
    it("returns query result", async () => {
      const result = await entityClient.getByIds({
        entityName: "user",
        ids: ["user1"],
      });
      assert.deepStrictEqual(result, {
        entities: [{ id: "user1", name: "user1" }],
        versionsById: { user1: "version2" },
      });
    });
  });

  describe("pull", () => {
    it("returns pull query result", async () => {
      const result = await entityClient.pull({
        entityName: "user",
        id: "user1",
        versionId: "version1",
      });
      assert.deepStrictEqual(result, {
        pulled: 1,
        operations: [{ $set: { name: "user3" } }],
        versionId: "version2",
      });
    });
  });

  describe("insertOne", () => {
    it("returns single insert command result", async () => {
      const result = await entityClient.insertOne({
        entityName: "user",
        value: { id: "user2" },
      });
      assert.strictEqual(result.n, 1);
    });
  });

  describe("insertMulti", () => {
    it("returns multi insert command result", async () => {
      const result = await entityClient.insertMulti({
        entityName: "user",
        values: [{ id: "user3" }, { id: "user4" }],
      });
      assert.strictEqual(result.n, 2);
    });
  });

  describe("insertAndGet", () => {
    it("returns get command result", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { id: "user5" },
      });
      assert.strictEqual(result.n, 1);
      assert.deepStrictEqual(result.entity, { id: "user5" });
    });
  });

  describe("insertAndGetMulti", () => {
    it("returns multi values command result", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { id: "user5" },
      });
      assert.strictEqual(result.n, 1);
      assert.deepStrictEqual(result.entity, { id: "user5" });
    });
  });

  describe("updateById", () => {
    it("returns id update command result", async () => {
      const result = await entityClient.updateById({
        entityName: "user",
        id: "user1",
        operation: { $set: { name: "user2" } },
      });
      assert.strictEqual(result.n, 1);
      assert.strictEqual(result.prevVersionId, "version2");
    });
  });

  describe("updateMulti", () => {
    it("returns multi update command result", async () => {
      const result = await entityClient.updateMulti({
        entityName: "user",
        where: { id: "user1" },
        operation: { $set: { name: "user2" } },
      });
      assert.strictEqual(result.n, 1);
      assert.deepStrictEqual(result.prevVersionsById, { user1: "version2" });
    });
  });

  describe("updateAndGet", () => {
    it("returns id update command result", async () => {
      const result = await entityClient.updateAndGet({
        entityName: "user",
        id: "user1",
        operation: { $set: { name: "user2" } },
      });
      assert.strictEqual(result.n, 1);
      assert.strictEqual(result.prevVersionId, "version2");
    });
  });

  describe("updateAndFetch", () => {
    it("returns multi update command result", async () => {
      const result = await entityClient.updateAndFetch({
        entityName: "user",
        where: { id: "user1" },
        operation: { $set: { name: "user2" } },
      });
      assert.strictEqual(result.n, 1);
      assert.deepStrictEqual(result.prevVersionsById, { user1: "version2" });
    });
  });

  describe("push", () => {
    beforeEach(() => {
      dbClient.insertMulti({
        entityName: "user",
        values: [
          {
            id: "user2",
            name: "user2",
            _PhenylMeta: {
              versions: [
                { id: "version1", op: '{"$set":{"name":"user3"}}' },
                { id: "version2", op: '{"$set":{"name":"user4"}}' },
                { id: "version3", op: '{"$set":{"name":"user5"}}' },
              ],
            },
          },
          {
            id: "user3",
            name: "user3",
            _PhenylMeta: {
              locked: {
                timestamp: "2021-06-03T07:57:46.894Z",
                clientHeadVersionId: "version2",
                ops: [{ id: "version4", op: '{"$set":{"name":"user6"}}' }],
              },
              versions: [
                { id: "version1", op: '{"$set":{"name":"user3"}}' },
                { id: "version2", op: '{"$set":{"name":"user4"}}' },
                { id: "version3", op: '{"$set":{"name":"user5"}}' },
              ],
            },
          },
        ],
      });
    });
    it("returns pull command result", async () => {
      const result = await entityClient.push({
        entityName: "user",
        id: "user1",
        operations: [{ $set: { name: "user2" } }],
        versionId: "version1",
      });
      assert.strictEqual(result.hasEntity, 0);
      assert.strictEqual(result.n, 1);
      // @ts-ignore result has operations property
      assert.deepStrictEqual(result.operations, [{ $set: { name: "user3" } }]);
      assert.deepStrictEqual(result.prevVersionId, "version2");
    });
    it("returns pull command result", async () => {
      const result = await entityClient.push({
        entityName: "user",
        id: "user2",
        operations: [{ $set: { name: "user2" } }, { $unset: { name: "" } }],
        versionId: "version1",
      });
      assert.strictEqual(result.hasEntity, 0);
      assert.strictEqual(result.n, 1);
      // @ts-ignore result has operations property
      assert.deepStrictEqual(result.operations, [
        { $set: { name: "user4" } },
        { $set: { name: "user5" } },
      ]);
    });
    it("throws if acquire lock is failed", async () => {
      try {
        await entityClient.push({
          entityName: "user",
          id: "user3",
          operations: [{ $set: { name: "user2" } }, { $unset: { name: "" } }],
          versionId: "version1",
        });
      } catch (e) {
        assert.strictEqual(
          e.message,
          `Operation timed out. Can not acquire lock.\nentityName: user\nid: user3`
        );
      }
    });
  });

  describe("delete", () => {
    it("returns number of deleted entities", async () => {
      const result = await entityClient.delete({
        entityName: "user",
        where: { id: "user1" },
      });
      assert.deepStrictEqual(result, { n: 1 });
    });
  });

  describe("getDbClient", () => {
    it("returns db client", async () => {
      const client = entityClient.getDbClient();
      assert(client instanceof PhenylMemoryDbClient);
    });
  });
  describe("createSessionClient", () => {
    it("returns session client", () => {
      const client = entityClient.createSessionClient();
      assert(client instanceof PhenylSessionClient);
    });
  });
});
