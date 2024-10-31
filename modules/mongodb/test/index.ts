/* eslint-disable no-console */
import {
  createEntityClient,
  PhenylMongoDbEntityClient,
} from "../src/create-entity-client";
import assert from "assert";
import { ObjectId } from "bson";
// import { assertEntityClient } from '@phenyl/interfaces'
import { MongoDbConnection, connect } from "../src/connection";

const url = "mongodb://localhost:27017";

// @TODO: should we implement assertEntityClient in @phenyl/interfaces
// describe('MongoDBEntityClient as EntityClient', async () => {
//   const conn = await connect(url, 'phenyl-mongodb-test')
//   const client = createEntityClient(conn)

//   assertEntityClient(client, mocha, assert)

//   afterAll(() => {
//     conn.close()
//   })
// })

describe("MongoDBEntityClient", () => {
  let conn: MongoDbConnection;
  let entityClient: PhenylMongoDbEntityClient<{
    user: { id: string; name: string };
  }>;

  const HEX_24_ID = "000000000123456789abcdef";
  let generatedId: string;

  beforeAll(async () => {
    conn = await connect(url, "phenyl-mongodb-test");
    entityClient = createEntityClient(conn);
  });

  afterAll(async () => {
    await entityClient.delete({ entityName: "user", where: {} });
    conn.close();
  });

  describe("inserts entity", () => {
    it("without id and generates { _id: ObjectId(xxx) } ", async () => {
      const result = await entityClient.insertAndGet({
        entityName: "user",
        value: { name: "Jone" },
      });

      assert(result.entity.id);

      const users = await conn.collection("user").find().toArray();
      const objectID = new ObjectId(result.entity.id);
      assert(objectID.equals(users[0]._id));

      generatedId = result.entity.id;
    });

    describe("with _id after coverts from id", () => {
      it("to _id", async () => {
        await entityClient.insertOne({
          entityName: "user",
          value: { id: "jane", name: "Jane" },
        });

        const users = await conn
          .collection("user")
          .find({ _id: "jane" })
          .toArray();
        assert(users[0]._id.toString() === "jane");
      });

      it("to { _id: ObjectId(xxx) } if id is 24-byte hex lower string", async () => {
        const result = await entityClient.insertAndGet({
          entityName: "user",
          value: { id: HEX_24_ID, name: "Jesse" },
        });

        assert(result.entity.id === HEX_24_ID);

        const users = await conn
          .collection("user")
          .find({ name: "Jesse" })
          .toArray();
        const objectID = new ObjectId(HEX_24_ID);
        assert(objectID.equals(users[0]._id));
      });
    });
  });

  describe("gets entity", () => {
    it("by auto generated id", async () => {
      const result = await entityClient.get({
        entityName: "user",
        id: generatedId,
      });

      assert(result.entity.name === "Jone");
    });

    it("by set id", async () => {
      const result = await entityClient.get({
        entityName: "user",
        id: "jane",
      });

      assert(result.entity.name === "Jane");
    });

    it("by set 24-byte hex string id", async () => {
      const result = await entityClient.get({
        entityName: "user",
        id: HEX_24_ID,
      });

      assert(result.entity.name === "Jesse");
    });

    it("should rollback the entity and run push operation if previous push caused too many diffs error", async () => {
      const insertedUser = await entityClient.insertAndGet({
        entityName: "user",
        value: {
          name: "John",
        },
      });
      const generatedUserId = insertedUser.entity.id;
      const generatedVersionId = insertedUser.versionId;
      const ope1 = {
        $set: {
          name: "Jonny",
        },
      };
      const willConfclictOperation = entityClient.push({
        entityName: "user",
        id: generatedUserId,
        operations: [ope1],
        versionId: "Invalid Version Id",
      });
      await assert.rejects(
        willConfclictOperation,
        Error(
          "Cannot apply push operations: Too many diffs from master (over 100)."
        )
      );
      await entityClient.push({
        entityName: "user",
        id: generatedUserId,
        operations: [ope1],
        versionId: generatedVersionId,
      });
      const updatedResult = await entityClient.get({
        entityName: "user",
        id: generatedUserId,
      });
      assert.deepStrictEqual(updatedResult.entity.name, "Jonny");
    });

    it("updates and gets entity", async () => {
      const result = await entityClient.updateAndGet({
        entityName: "user",
        id: HEX_24_ID,
        operation: {
          $set: {
            name: "Cindy",
          },
        },
      });

      assert.deepStrictEqual(result.entity.name, "Cindy");
    });

    it("updates and fetches entities", async () => {
      const result = await entityClient.updateAndFetch({
        entityName: "user",
        where: {
          name: "Cindy",
        },
        operation: {
          $set: {
            name: "Bob",
          },
        },
      });
      assert.deepStrictEqual(result.entities[0].name, "Bob");
      assert.deepStrictEqual(result.n, 1);
    });
  });

  // @TODO: uncomment this test after the mongodb client library stable
  // describe('[Unstable because of the mongodb client library] ChangeStream', () => {
  //   it('next', (done) => {
  //     const stream = entityClient.dbClient.watch('user')
  //     stream.next((err: Error, evt: any) => {
  //       if (evt.operationType === 'update') {
  //         assert(evt.updateDescription.removedFields.length === 1)
  //         assert(evt.updateDescription.updatedFields['shin.a123'] === 'out')
  //         stream.close()
  //         done()
  //       }
  //       else {
  //         stream.close()
  //         done(`Operation type is invalid. ${evt.operationType} is given.`)
  //       }
  //     })

  //     entityClient.updateAndGet({
  //       entityName: 'user',
  //       id: HEX_24_ID,
  //       operation: { $set: { 'shin.a123': 'out' }, $unset: { name: '' } }
  //     })
  //   })
  // })
});
