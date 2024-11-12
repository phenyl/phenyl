import { MongoDbConnection, connect } from "../src/connection";
import { Db, MongoClient } from "mongodb";
import assert from "assert";
import {
  PhenylMongoDbEntityClient,
  createEntityClient,
} from "../src/create-entity-client";

const url = "mongodb://localhost:27017";
const dbName = "phenyl-mongodb-test";

describe("Merge Operations", () => {
  let conn: MongoDbConnection;
  let entityClient: PhenylMongoDbEntityClient<{
    user: { id: string; name: string; hobbies: string[] };
  }>;

  let generatedId: string;
  let versionId: string;

  beforeAll(async () => {
    conn = await connect(url, dbName);
    entityClient = createEntityClient(conn, {
      validatePushCommand: () => true,
    });
  });

  afterAll(async () => {
    await entityClient.delete({ entityName: "user", where: {} });
    conn.close();
  });

  describe("update operation", () => {
    it("should succeed when only one operation", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "Jone",
          hobbies: ["play baseball"],
        },
      });
      generatedId = result.entity.id;
      versionId = result.versionId;
      const ope = {
        $push: {
          hobbies: "JavaScript",
        },
      };
      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: [ope],
        versionId,
      });

      const updatedResult = await entityClient.get({
        entityName: "user",
        id: generatedId,
      });

      assert.deepStrictEqual(updatedResult.entity.hobbies, [
        "play baseball",
        "JavaScript",
      ]);
    });

    it("should succeed when conflicted operations with set and push", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { name: "Jone", hobbies: ["play baseball"] },
      });
      generatedId = result.entity.id.toString();
      versionId = result.versionId;

      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: [
          { $set: { name: "Alpha", hobbies: ["TypeScript"] } },
          { $push: { hobbies: "JavaScript" } },
        ],
        versionId,
      });

      const updatedEntity = await entityClient.findOne({
        entityName: "user",
        where: {
          id: generatedId,
        },
      });

      assert.strictEqual(updatedEntity.entity.id.toString(), generatedId);
      assert.strictEqual(updatedEntity.entity.name, "Alpha");
      assert.deepStrictEqual(updatedEntity.entity.hobbies, [
        "TypeScript",
        "JavaScript",
      ]);
    });

    it("should throw error because of too long locked entity", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "Jone",
          hobbies: ["play baseball"],
        },
      });
      generatedId = result.entity.id;
      versionId = result.versionId;

      const manyOpesA = new Array(10000).fill(0).map((_, index) => {
        return {
          $push: {
            hobbies: "A" + index,
          },
        };
      });
      const manyOpesB = new Array(10000).fill(0).map((_, index) => {
        return {
          $push: {
            hobbies: "B" + index,
          },
        };
      });

      // lock entity by many operations
      const pushA = entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: manyOpesA,
        versionId,
      });

      const pushB = entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: manyOpesB,
        versionId,
      });

      try {
        await Promise.all([pushA, pushB]);
      } catch (e) {
        assert.strictEqual(
          e.message,
          `Operation timed out. Cannot acquire lock.\nentityName: user\nid: ${generatedId}`
        );
      }
    });
    it("should rollback", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "Jone",
          hobbies: ["play baseball"],
        },
      });
      generatedId = result.entity.id;
      versionId = result.versionId;
      const ops = [
        { $push: { hobbies: "JavaScript" } }, // -> should clear because of rollback
        {
          $set: { name: "Alpha", hobbies: ["TypeScript"] },
          $push: { hobbies: [] },
        }, // -> same key operation at once is invalid
      ];

      const error = await entityClient
        .push({
          entityName: "user",
          id: generatedId,
          operations: ops,
          versionId,
        })
        .catch((e) => e);

      // throw error
      assert.strictEqual(error.name, "MongoServerError");
      assert.strictEqual(
        error.errmsg,
        "Updating the path 'hobbies' would create a conflict at 'hobbies'"
      );

      const rollbackedResult = await entityClient.get({
        entityName: "user",
        id: generatedId,
      });

      // Rollback to initial inserted entity
      assert.deepStrictEqual(rollbackedResult.entity.hobbies, [
        "play baseball",
      ]);
    });
    it("should succeed when the clientHeadVersionId behind from DB client versionId", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "Jone",
          hobbies: ["play baseball"],
        },
      });
      generatedId = result.entity.id;
      versionId = result.versionId;

      // update version
      const ops = [{ $push: { hobbies: "JavaScript" } }];
      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: ops,
        versionId,
      });

      // update by 1 commit behind from DB HEAD
      const ops2 = [{ $push: { hobbies: "TypeScript" } }];
      await entityClient.push({
        entityName: "user",
        id: generatedId,
        operations: ops2,
        versionId,
      });

      const update2Result = await entityClient.get({
        entityName: "user",
        id: generatedId,
      });

      assert.deepStrictEqual(update2Result.entity.hobbies, [
        "play baseball",
        "JavaScript",
        "TypeScript",
      ]);
    });
    describe("mongodb document validation", () => {
      let client: MongoClient;
      let db: Db;
      const collectionName = "user";
      beforeAll(async () => {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
        const collections = await db.collections();
        const collectionNames = collections.map((col) => col.collectionName);

        if (!collectionNames.includes(collectionName)) {
          await db.createCollection(collectionName);
        }
        await db.command({
          collMod: collectionName,
          validator: {
            $jsonSchema: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                hobbies: { type: "array", items: { type: "string" } },
                _PhenylMeta: { type: "object", additionalProperties: true },
              },
              required: ["name"],
              additionalProperties: false,
            },
          },
        });
      });
      afterAll(async () => {
        await db.dropCollection(collectionName);
        await db.createCollection(collectionName);
        await client.close();
      });
      it("should rollback successfully when push failed with document validation", async () => {
        const result = await entityClient.insertAndGet({
          entityName: "user",
          value: {
            id: "foo",
            name: "John",
            hobbies: ["play baseball"],
          },
        });
        generatedId = result.entity.id;
        versionId = result.versionId;

        const ops = [
          // Valid operation
          { $set: { name: "Foo" } },
          // Invalid operation
          { $set: { hobbies: [1] } },
        ];
        const error = await entityClient
          .push({
            entityName: "user",
            id: generatedId,
            operations: ops,
            versionId,
          })
          .catch((e) => e);
        assert.deepStrictEqual(error.name, "MongoServerError");
        assert.deepStrictEqual(error.errmsg, "Document failed validation");

        const rollbackedResult = await client
          .db(dbName)
          .collection("user")
          .findOne({ _id: generatedId });
        expect(rollbackedResult).not.toBeNull();
        if (rollbackedResult) {
          assert.deepStrictEqual(rollbackedResult.name, "John");
          assert.deepStrictEqual(
            rollbackedResult._PhenylMeta.locked,
            undefined
          );
        }
      });
    });
  });
});
