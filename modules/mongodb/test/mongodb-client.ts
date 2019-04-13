import { it, describe } from "mocha";
import bson from "bson";
import assert from "assert";
import { FindOperation } from "sp2";
import { filterFindOperation, filterInputEntity } from "../src/mongodb-client";

describe("filterFindOperation", () => {
  it("renames id to _id", () => {
    const input: FindOperation = {
      $and: [{ id: "abc" }, { type: "bar" }]
    };
    const expected = {
      $and: [{ _id: "abc" }, { type: "bar" }]
    };
    const actual = filterFindOperation(input);
    assert.deepEqual(actual, expected);
  });

  it("converts document path to dot notation", () => {
    // $FlowIssue(this-is-and-find-operation)
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
        { "values.0": "fizz" },
        { "values.1.test": "buzz" },
        { "values.12.test": { $eq: "fizzBuzz" } },
        { "values.123.test": { $regex: /zz/ } },
        { "values.1234.test": { $in: ["fizz", "buzz"] } },
        { type: "bar" }
      ]
    };
    const actual = filterFindOperation(input);
    assert.deepEqual(actual, expected);
  });

  it("converts matched string to ObjectId", () => {
    // $FlowIssue(this-is-and-find-operation)
    const input: FindOperation = {
      $and: [
        // not match
        { id: null },
        { id: "bar" },
        // @ts-ignore
        { id: bson.ObjectID("222222222222222222222222") },
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
        { _id: null },
        { _id: "bar" },
        // @ts-ignore
        { _id: bson.ObjectID("222222222222222222222222") },
        { _id: "000123456789abcdefABCDEF" },
        // @ts-ignore
        { _id: bson.ObjectID("000123456789abcdefabcdef") },
        // @ts-ignore
        { _id: { $eq: bson.ObjectID("000000000011111111112222") } },
        // @ts-ignore
        { _id: { $not: { $eq: bson.ObjectID("000000000011111111112222") } } },
        {
          _id: {
            $in: [
              // @ts-ignore
              bson.ObjectID("000000000011111111112222"),
              // @ts-ignore
              bson.ObjectID("000000000011111111113333")
            ]
          }
        }
      ]
    };
    const actual = filterFindOperation(input);
    assert.deepEqual(actual, expected);
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
    assert.deepEqual(actual, expected);
  });

  it("converts id to ObjectId", () => {
    const input = {
      id: "000123456789abcdefabcdef",
      attr: "bar"
    };
    const expected = {
      // @ts-ignore
      _id: bson.ObjectID("000123456789abcdefabcdef"),
      attr: "bar"
    };
    const actual = filterInputEntity(input);
    assert.deepEqual(actual, expected);
  });
});
