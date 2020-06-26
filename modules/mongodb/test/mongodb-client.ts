import { it, describe } from "mocha";
import { ObjectId } from "bson";
import assert from "assert";
import { FindOperation } from "sp2";
import { filterFindOperation, filterInputEntity } from "../src/mongodb-client";

describe("filterFindOperation", () => {
  it("renames id to _id", () => {
    const input: FindOperation = {
      $and: [{ id: "abc" }, { type: "bar" }]
    };
    const expected = {
      $and: [{ _id: { $eq: "abc" } }, { type: { $eq: "bar" } }]
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
        { type: "bar" }
      ]
    };
    const expected = {
      $and: [
        { "values.0": { $eq: "fizz" } },
        { "values.1.test": { $eq: "buzz" } },
        { "values.12.test": { $eq: "fizzBuzz" } },
        { "values.123.test": { $regex: /zz/ } },
        { "values.1234.test": { $in: ["fizz", "buzz"] } },
        { type: { $eq: "bar" } }
      ]
    };
    const actual = filterFindOperation(input);
    assert.deepStrictEqual(actual, expected);
  });

  it("converts matched string to ObjectId", () => {
    // @ts-ignore
    const input: FindOperation = {
      $and: [
        // not match
        { id: null },
        { id: "bar" },
        { id: new ObjectId("222222222222222222222222") },
        { id: "000123456789abcdefABCDEF" },
        // match
        { id: "000123456789abcdefabcdef" },
        { id: { $eq: "000000000011111111112222" } },
        { id: { $not: { $eq: "000000000011111111112222" } } },
        {
          id: { $in: ["000000000011111111112222", "000000000011111111113333"] }
        }
      ]
    };
    const expected = {
      $and: [
        { _id: { $eq: null } },
        { _id: { $eq: "bar" } },
        { _id: { $eq: new ObjectId("222222222222222222222222") } },
        { _id: { $eq: "000123456789abcdefABCDEF" } },
        { _id: { $eq: new ObjectId("000123456789abcdefabcdef") } },
        { _id: { $eq: new ObjectId("000000000011111111112222") } },
        { _id: { $not: { $eq: new ObjectId("000000000011111111112222") } } },
        {
          _id: {
            $in: [
              new ObjectId("000000000011111111112222"),
              new ObjectId("000000000011111111113333")
            ]
          }
        }
      ]
    };
    const actual = filterFindOperation(input);
    assert.deepStrictEqual(actual, expected);
  });
});

describe("filterInputEntity", () => {
  it("renames id to _id", () => {
    const input = {
      id: "123",
      attr: "bar"
    };
    const expected = {
      _id: "123",
      attr: "bar"
    };
    const actual = filterInputEntity(input);
    assert.deepStrictEqual(actual, expected);
  });

  it("converts id to ObjectId", () => {
    const input = {
      id: "000123456789abcdefabcdef",
      attr: "bar"
    };
    const expected = {
      _id: new ObjectId("000123456789abcdefabcdef"),
      attr: "bar"
    };
    const actual = filterInputEntity(input);
    assert.deepStrictEqual(actual, expected);
  });
});
