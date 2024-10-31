import { ObjectId } from "bson";
import assert from "assert";
import { FindOperation } from "sp2";
import { MongoClient } from "mongodb";
import {
  filterFindOperation,
  filterInputEntity,
  PhenylMongoDbClient,
} from "../src/mongodb-client";
import { connect, MongoDbConnection } from "../src/connection";

describe("filterFindOperation", () => {
  it("renames id to _id", () => {
    const input: FindOperation = {
      $and: [{ id: "abc" }, { type: "bar" }],
    };
    const expected = {
      $and: [{ _id: { $eq: "abc" } }, { type: { $eq: "bar" } }],
    };
    const actual = filterFindOperation(input);
    assert.deepStrictEqual(actual, expected);
  });

  it("converts document path to dot notation", () => {
    const input: FindOperation = {
      $and: [
        { "values[0]": "fizz" },
        { "values[1].test": "buzz" },
        { "values[12].test": { $eq: "fizzBuzz" } },
        { "values[123].test": { $regex: /zz/ } },
        { "values[1234].test": { $in: ["fizz", "buzz"] } },
        { type: "bar" },
      ],
    };
    const expected = {
      $and: [
        { "values.0": { $eq: "fizz" } },
        { "values.1.test": { $eq: "buzz" } },
        { "values.12.test": { $eq: "fizzBuzz" } },
        { "values.123.test": { $regex: /zz/ } },
        { "values.1234.test": { $in: ["fizz", "buzz"] } },
        { type: { $eq: "bar" } },
      ],
    };
    const actual = filterFindOperation(input);
    assert.deepStrictEqual(actual, expected);
  });

  it("converts matched string to ObjectId", () => {
    const input: FindOperation = {
      $and: [
        // not match
        // @ts-ignore passing null for id for testing
        { id: null },
        { id: "bar" },
        // @ts-ignore passing ObjectId for id for testing
        { id: new ObjectId("222222222222222222222222") },
        { id: "000123456789abcdefABCDEF" },
        // match
        { id: "000123456789abcdefabcdef" },
        { id: { $eq: "000000000011111111112222" } },
        { id: { $not: { $eq: "000000000011111111112222" } } },
        {
          id: { $in: ["000000000011111111112222", "000000000011111111113333"] },
        },
      ],
    };
    const expected = {
      $and: [
        { _id: { $eq: null } },
        { _id: { $eq: "bar" } },
        { _id: new ObjectId("222222222222222222222222") },
        { _id: { $eq: "000123456789abcdefABCDEF" } },
        { _id: new ObjectId("000123456789abcdefabcdef") },
        { _id: { $eq: new ObjectId("000000000011111111112222") } },
        { _id: { $not: { $eq: new ObjectId("000000000011111111112222") } } },
        {
          _id: {
            $in: [
              new ObjectId("000000000011111111112222"),
              new ObjectId("000000000011111111113333"),
            ],
          },
        },
      ],
    };
    const actual = filterFindOperation(input);
    assert.deepStrictEqual(actual, expected);
  });
});

describe("filterInputEntity", () => {
  it("renames id to _id", () => {
    const input = {
      id: "123",
      attr: "bar",
    };
    const expected = {
      _id: "123",
      attr: "bar",
    };
    const actual = filterInputEntity(input);
    assert.deepStrictEqual(actual, expected);
  });

  it("converts id to ObjectId", () => {
    const input = {
      id: "000123456789abcdefabcdef",
      attr: "bar",
    };
    const expected = {
      _id: new ObjectId("000123456789abcdefabcdef"),
      attr: "bar",
    };
    const actual = filterInputEntity(input);
    assert.deepStrictEqual(actual, expected);
  });
});

describe("MongodbClient", () => {
  const url = "mongodb://localhost:27017";
  const dbName = "phenyl-mongodb-test";
  const entityName = "user";
  let phenylMongodbClient: PhenylMongoDbClient<{
    user: { id: string; name: string; hobbies: string[]; age: number };
  }>;
  let mongoClient: MongoClient;
  let conn: MongoDbConnection;
  beforeAll(async () => {
    conn = await connect(url, dbName);
    phenylMongodbClient = new PhenylMongoDbClient(conn);
    mongoClient = new MongoClient(url);
    await mongoClient.connect();
  });

  afterAll(async () => {
    await phenylMongodbClient.delete({ entityName: "user", where: {} });
    conn.close();
    mongoClient.close();
  });

  describe("replceOne", () => {
    it("sould replace id to _id if entity has id property", async () => {
      await phenylMongodbClient.insertAndGet({
        entityName,
        value: {
          id: "foo",
          name: "Jone",
          hobbies: ["play baseball"],
          age: 30,
        },
      });
      await phenylMongodbClient.replaceOne({
        id: "foo",
        entityName,
        entity: {
          id: "foo",
          name: "Abraham",
          hobbies: ["play soccer"],
          age: 20,
        },
      });
      const result = await mongoClient
        .db(dbName)
        .collection(entityName)
        .findOne({ _id: "foo" });
      expect(result).not.toBeNull();
      if (result) {
        assert.deepStrictEqual(result._id, "foo");
        assert.deepStrictEqual(result.id, undefined);
        assert.deepStrictEqual(result.name, "Abraham");
        assert.deepStrictEqual(result.hobbies, ["play soccer"]);
        assert.deepStrictEqual(result.age, 20);
      }
    });
  });

  describe("updateAndFetch", () => {
    it("should update and fetch", async () => {
      await phenylMongodbClient.updateAndFetch({
        entityName,
        where: {},
        operation: {
          $set: { name: "Bobby" },
          $inc: { age: 1 },
          $push: { hobbies: "create music" },
        },
      });
      const result = await mongoClient
        .db(dbName)
        .collection(entityName)
        .findOne({ _id: "foo" });
      expect(result).not.toBeNull();
      if (result) {
        assert.deepStrictEqual(result._id, "foo");
        assert.deepStrictEqual(result.id, undefined);
        assert.deepStrictEqual(result.name, "Bobby");
        assert.deepStrictEqual(result.hobbies, ["play soccer", "create music"]);
        assert.deepStrictEqual(result.age, 21);
      }
    });
  });

  describe("mongoClientOptions", () => {
    it("should pass mongoClientOptions to mongo client at connect", async () => {
      const _conn = await connect(url, dbName, {
        connectTimeoutMS: 8000,
        retryWrites: true,
        maxPoolSize: 10,
      });

      // @ts-expect-error
      expect(_conn.dbClient.s.options).toMatchObject({
        connectTimeoutMS: 8000,
        retryWrites: true,
        maxPoolSize: 10,
      });
      _conn.close();
    });
  });
});
