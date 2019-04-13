// @flow

import { describe, it } from "mocha";
import assert from "assert";
import { PhenylState } from "../src/index.js";
import { assignWithRestoration } from "power-assign/jsnext";

describe("find", () => {
  it("", () => {
    const user1 = { id: "1", name: "kery" };
    const user2 = { id: "2", name: "kory" };
    const user3 = { id: "3", name: "kiry" };
    const state = new PhenylState({
      pool: {
        user: {
          "1": user1,
          "2": user2,
          "3": user3
        }
      }
    });
    const usersFoundByQuery = state.find({
      entityName: "user",
      where: { name: "kery" }
    });
    assert.deepEqual(usersFoundByQuery, [user1]);
  });
});

describe("findOne", () => {
  it("", () => {
    const user = { id: "1", name: "kery" };
    const state = new PhenylState({
      pool: { user: { "1": user } }
    });
    const userFromState = state.findOne({
      entityName: "user",
      where: { name: "kery" },
      id: "1"
    });
    assert.deepEqual(userFromState, user);
  });
});

describe("get", () => {
  it("", () => {
    const user = { id: "1", name: "kery" };
    const state = new PhenylState({
      pool: { user: { "1": user } }
    });
    const userFromState = state.get({
      entityName: "user",
      id: "1"
    });
    assert.deepEqual(userFromState, user);
  });
});

describe("$update", () => {
  it("returns modified GeneralUpdateOperation", () => {
    class User {
      id: string;
      name: string;
      constructor({ id, name }: { id: string, name: string }) {
        this.id = id;
        this.name = name;
      }
    }
    const state = new PhenylState({
      pool: { user: { "1": new User({ id: "1", name: "Shin" }) } }
    });

    const operation = state.updateById({
      entityName: "user",
      id: "1",
      operation: { $set: { name: "Shinji" } }
    });

    const expected = {
      $set: {
        "pool.user.1.name": "Shinji"
      }
    };
    const newState = assignWithRestoration(state, operation);
    const expectedNewState = new PhenylState({
      pool: { user: { "1": new User({ id: "1", name: "Shinji" }) } }
    });
    assert.deepEqual(expected, operation);
    assert.deepEqual(expectedNewState, newState);
  });
});

describe("delete", () => {
  it("returns GeneralUpdateOperation to delete pool", () => {
    const state = new PhenylState({
      pool: {
        user: {
          "1": { id: "1", name: "Shin" },
          "2": { id: "2", name: "Tom" },
          "3": { id: "3", name: "Jenkins" }
        }
      }
    });
    const operation = state.delete({
      entityName: "user",
      where: { name: { $regex: /in/ } }
    });
    const expected = {
      $unset: {
        "pool.user.1": "",
        "pool.user.3": ""
      }
    };

    const newState = assignWithRestoration(state, operation);
    const expectedNewState = new PhenylState({
      pool: {
        user: {
          "2": { id: "2", name: "Tom" }
        }
      }
    });
    assert.deepEqual(expected, operation);
    assert.deepEqual(expectedNewState, newState);
  });
});

describe("register", () => {
  it("returns GeneralUpdateOperation to register pool", () => {
    const state = new PhenylState({
      pool: {
        user: { "1": { id: "1", name: "Shin" } }
      }
    });
    const operation = state.register("book", { id: "book01", title: "ABC-Z" });
    const expected = {
      $set: {
        "pool.book.book01": {
          id: "book01",
          title: "ABC-Z"
        }
      }
    };
    const newState = assignWithRestoration(state, operation);

    const expectedNewState = new PhenylState({
      pool: {
        user: { "1": { id: "1", name: "Shin" } },
        book: { book01: { id: "book01", title: "ABC-Z" } }
      }
    });

    assert.deepEqual(expected, operation);
    assert.deepEqual(expectedNewState, newState);
  });
});
