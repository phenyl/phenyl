import assert from "assert";
import { Versioning } from "../src/versioning";

const phenylMeta = {
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
};
const invalidPhenylMeta = {
  versions: [
    {
      id: "version1",
      op: '$set :{ name: "user2" }}',
    },
    {
      id: "version2",
      op: '$set :{ name: "user2" }}',
    },
  ],
};
const entity = {
  id: "user1",
  _PhenylMeta: phenylMeta,
};
const entities = [entity];
const entityWithoutOperation = {
  id: "user1",
  _PhenylMeta: { versions: [] },
};
const entityWithInvalidMetaInfo = {
  id: "user1",
  _PhenylMeta: invalidPhenylMeta,
};

describe("Versioning", () => {
  describe("createQueryResult", () => {
    it("returns QueryResult with version info from entities", () => {
      const result = Versioning.createQueryResult(entities);
      assert.deepStrictEqual(result, {
        entities: [{ id: "user1" }],
        versionsById: { user1: "version2" },
      });
    });
  });
  describe("createSingleQueryResult", () => {
    it("returns SingleQueryResult with version info from a entity", () => {
      const result = Versioning.createSingleQueryResult(entity);
      assert.deepStrictEqual(result, {
        entity: { id: "user1" },
        versionId: "version2",
      });
    });
  });
  describe("createPullQueryResult", () => {
    it("returns PullQueryResult with diff operations", () => {
      const versionId = "version1";
      const result = Versioning.createPullQueryResult(entity, versionId);
      assert.deepStrictEqual(result, {
        versionId: "version2",
        operations: [{ $set: { name: "user3" } }],
        pulled: 1,
      });
    });
    it("returns result without diff operations if operation is not given ", () => {
      const versionId = "version1";
      const result = Versioning.createPullQueryResult(
        entityWithoutOperation,
        versionId
      );
      assert.deepStrictEqual(result, {
        entity: { id: "user1" },
        versionId: null,
      });
    });
  });
  describe("createGetCommandResult", () => {
    it("returns GetCommandResult from entity", () => {
      const result = Versioning.createGetCommandResult(entity);
      assert.deepStrictEqual(result, {
        entity: { id: "user1" },
        n: 1,
        prevVersionId: "version1",
        versionId: "version2",
      });
    });
    it("throws error if versionId is null", () => {
      assert.throws(() =>
        Versioning.createGetCommandResult(entityWithoutOperation)
      );
    });
  });
  describe("createMultiValuesCommandResult", () => {
    it("returns MultiValuesCommandResult from entity", () => {
      const result = Versioning.createMultiValuesCommandResult(entities);
      assert.deepStrictEqual(result, {
        entities: [{ id: "user1" }],
        n: 1,
        prevVersionsById: { user1: "version1" },
        versionsById: { user1: "version2" },
      });
    });
  });
  describe("createPushCommandResult", () => {
    it("returns PushCommandResult from entity, updated entity and local versionId", () => {
      const versionId = "version3";
      const result = Versioning.createPushCommandResult({
        entity,
        updatedEntity: entity,
        versionId,
      });
      assert.deepStrictEqual(result, {
        hasEntity: 1,
        entity,
        n: 1,
        prevVersionId: "version1",
        versionId: "version2",
      });
    });
    it("returns result that hasEntity is 0", () => {
      const versionId = "version1";
      const result = Versioning.createPushCommandResult({
        entity,
        updatedEntity: entity,
        versionId,
      });
      assert.deepStrictEqual(result, {
        hasEntity: 0,
        operations: [
          {
            $set: {
              name: "user3",
            },
          },
        ],
        n: 1,
        prevVersionId: "version1",
        versionId: "version2",
      });
    });
    it("throws error if latest version id is not existed", () => {
      const versionId = "version1";
      assert.throws(() =>
        Versioning.createPushCommandResult({
          entity: entityWithoutOperation,
          updatedEntity: entityWithoutOperation,
          versionId,
        })
      );
    });
  });

  describe("mergeUpdateOperations", () => {
    it("merges operations into one operation and attach metaInfo", () => {
      const operations = [
        { $set: { name: "user1" } },
        { $unset: { name: "" } },
      ];
      const result = Versioning.mergeUpdateOperations(...operations);
      assert.deepStrictEqual(result["$set"], { name: "user1" });
      assert.deepStrictEqual(result["$unset"], { name: "" });
      assert.strictEqual(
        result["$push"]!["_PhenylMeta.versions"]["$each"][0].op,
        '{"$set":{"name":"user1"},"$unset":{"name":""}}'
      );
    });
  });

  describe("attachMetaInfoToNewEntity", () => {
    it("attaches meta info ('_PhenylMeta' property) to the given entity", () => {
      const result = Versioning.attachMetaInfoToNewEntity({ id: "user1" });
      assert.deepStrictEqual(result._PhenylMeta.versions[0].op, "");
    });
  });

  describe("attachMetaInfoToUpdateCommand", () => {
    it("attaches meta info to the given update command", () => {
      const result = Versioning.attachMetaInfoToUpdateCommand({
        operation: { $set: { name: "user1" } },
      });
      assert.deepStrictEqual(result.operation["$set"], { name: "user1" });
      assert.strictEqual(
        // @ts-ignore operation has $push property
        result.operation["$push"]["_PhenylMeta.versions"]["$each"][0].op,
        '{"$set":{"name":"user1"}}'
      );
    });
  });

  describe("createStartTransactionOperation", () => {
    it("creates meta info of starting transaction", () => {
      const result = Versioning.createStartTransactionOperation(
        "headVersionId",
        [{ $set: { name: "user1" } }]
      );

      assert.strictEqual(
        result["$set"]!["_PhenylMeta.locked"].clientHeadVersionId,
        "headVersionId"
      );
      assert.deepStrictEqual(result["$set"]!["_PhenylMeta.locked"].ops, [
        '{"$set":{"name":"user1"}}',
      ]);
    });
  });

  describe("createEndTransactionOperation", () => {
    it("clears meta info of transaction", () => {
      const result = Versioning.createEndTransactionOperation();
      assert.deepStrictEqual(result, {
        $unset: {
          "_PhenylMeta.locked": "",
        },
      });
    });
  });

  describe("getOperationDiffsByVersion", () => {
    it("returns operation diffs by the given versionId", () => {
      const result = Versioning.getOperationDiffsByVersion(entity, "version1");
      assert.deepStrictEqual(result, [{ $set: { name: "user3" } }]);
    });
    it("returns null if versionId is null", () => {
      const result = Versioning.getOperationDiffsByVersion(entity, null);
      assert.deepStrictEqual(result, null);
    });
    it("returns null if operation diffs is not found", () => {
      const result = Versioning.getOperationDiffsByVersion(entity, "version3");
      assert.deepStrictEqual(result, null);
    });
    it("returns null if parsing metaInfo is failed", () => {
      const result = Versioning.getOperationDiffsByVersion(
        entityWithInvalidMetaInfo,
        "version1"
      );
      assert.deepStrictEqual(result, null);
    });
    it("returns null if entity doesn't have _PhenylMeta property", () => {
      const entityWithoutMetaInfo = { id: "user1" };
      const result = Versioning.getOperationDiffsByVersion(
        // @ts-ignore specify entity without _PhenylMeta property for testing
        entityWithoutMetaInfo,
        "versionId"
      );
      assert.deepStrictEqual(result, null);
    });
  });

  describe("stripMeta", () => {
    it("Strip meta info ('_PhenylMeta' property) from the given entity", () => {
      const result = Versioning.stripMeta(entity);
      assert.deepStrictEqual(result, { id: "user1" });
    });
    it("returns given entity if entity doesn't have _PhenylMeta property", () => {
      const entityWithoutMetaInfo = { id: "user1" };
      // @ts-ignore specify entity without _PhenylMeta property for testing
      const result = Versioning.stripMeta(entityWithoutMetaInfo);
      assert.deepStrictEqual(result, entityWithoutMetaInfo);
    });
  });
});
