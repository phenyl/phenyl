import assert from "assert";
import { PhenylState } from "../src";
import { updateAndRestore } from "sp2";

type UserEntity = {
  id: string;
  name: string;
};

type BookEntity = {
  id: string;
  title: string;
};

type EntityMap = {
  user: UserEntity;
};

type UpdatedEntityMap = {
  user: UserEntity;
  book: BookEntity;
};

describe("constructor", () => {
  it("creates enpty state when no parameter is given", () => {
    const state = new PhenylState();
    const expected = { pool: {} };
    assert.deepEqual(state, expected);
  });
});

describe("find", () => {
  it("can successfully perform find function", () => {
    const user1 = { id: "1", name: "kery" };
    const user2 = { id: "2", name: "kory" };
    const user3 = { id: "3", name: "kiry" };

    const state = new PhenylState<EntityMap>({
      pool: {
        user: {
          "1": user1,
          "2": user2,
          "3": user3,
        },
      },
    });
    const usersFoundByQuery = state.find({
      entityName: "user",
      where: { name: "kery" },
    });
    const expected = [user1];
    assert.deepStrictEqual(usersFoundByQuery, expected);
  });
});

describe("findOne", () => {
  it("can successfully perform find function", () => {
    const user = { id: "1", name: "kery" };

    const state = new PhenylState<EntityMap>({
      pool: { user: { "1": user } },
    });
    const userFromState = state.findOne({
      entityName: "user",
      where: { name: "kery" },
    });
    const expected = user;
    assert.deepStrictEqual(userFromState, expected);
  });
});

describe("get", () => {
  it("can successfully get information from given entityName and id", () => {
    const user = { id: "1", name: "kery" };

    const state = new PhenylState<EntityMap>({
      pool: { user: { "1": user } },
    });
    const userFromState = state.get({
      entityName: "user",
      id: "1",
    });
    const expected = user;
    assert.deepStrictEqual(userFromState, expected);
  });
});

describe("getByIds", () => {
  it("can successfully get multiple information from given entityName and ids", () => {
    const user1 = { id: "1", name: "kery" };
    const user2 = { id: "2", name: "kory" };
    const state = new PhenylState<EntityMap>({
      pool: { user: { "1": user1, "2": user2 } },
    });
    const userFromState = state.getByIds({
      entityName: "user",
      ids: ["1", "2"],
    });
    const expected = [user1, user2];
    assert.deepStrictEqual(userFromState, expected);
  });
});

describe("getAll", () => {
  it("can successfully get all information from given entityName", () => {
    const user1 = { id: "1", name: "kery" };
    const user2 = { id: "2", name: "kory" };
    const user3 = { id: "3", name: "kiry" };
    const state = new PhenylState<EntityMap>({
      pool: { user: { "1": user1, "2": user2, "3": user3 } },
    });
    const userFromState = state.getAll("user");
    const expected = [user1, user2, user3];
    assert.deepStrictEqual(userFromState, expected);
  });
});

describe("$update", () => {
  it("returns modified GeneralUpdateOperation", () => {
    class User {
      id: string;
      name: string;
      constructor({ id, name }: { id: string; name: string }) {
        this.id = id;
        this.name = name;
      }
    }
    const state = new PhenylState<EntityMap>({
      pool: { user: { "1": new User({ id: "1", name: "Shin" }) } },
    });

    const operation = state.updateById({
      entityName: "user",
      id: "1",
      operation: { $set: { name: "Shinji" } },
    });

    const expected = {
      $set: {
        "pool.user.1.name": "Shinji",
      },
    };
    const newState = updateAndRestore(state, operation);
    const expectedNewState = new PhenylState<EntityMap>({
      pool: { user: { "1": new User({ id: "1", name: "Shinji" }) } },
    });
    assert.deepEqual(operation, expected);
    assert.deepEqual(newState, expectedNewState);
  });
});

describe("$updateMulti", () => {
  it("returns modified GeneralUpdateOperation to update multiple data", () => {
    class User {
      id: string;
      name: string;
      constructor({ id, name }: { id: string; name: string }) {
        this.id = id;
        this.name = name;
      }
    }
    const state = new PhenylState<EntityMap>({
      pool: {
        user: {
          "1": new User({ id: "1", name: "Shin" }),
          "2": new User({ id: "2", name: "Tom" }),
          "3": new User({ id: "3", name: "Jenkins" }),
        },
      },
    });

    const operation = state.updateMulti({
      entityName: "user",
      where: { name: { $regex: /in/ } },
      operation: { $set: { name: "Shinji" } },
    });

    const expected = {
      $set: {
        "pool.user.1.name": "Shinji",
        "pool.user.3.name": "Shinji",
      },
    };
    const newState = updateAndRestore(state, operation);
    const expectedNewState = new PhenylState<EntityMap>({
      pool: {
        user: {
          "1": new User({ id: "1", name: "Shinji" }),
          "2": new User({ id: "2", name: "Tom" }),
          "3": new User({ id: "3", name: "Shinji" }),
        },
      },
    });
    assert.deepEqual(operation, expected);
    assert.deepEqual(newState, expectedNewState);
  });
});

describe("delete", () => {
  it("returns GeneralUpdateOperation to delete pool", () => {
    const state = new PhenylState<EntityMap>({
      pool: {
        user: {
          "1": { id: "1", name: "Shin" },
          "2": { id: "2", name: "Tom" },
          "3": { id: "3", name: "Jenkins" },
        },
      },
    });
    const operation = state.delete({
      entityName: "user",
      where: { name: { $regex: /in/ } },
    });
    const expected = {
      $unset: {
        "pool.user.1": "",
        "pool.user.3": "",
      },
    };

    const newState = updateAndRestore(state, operation);
    const expectedNewState = new PhenylState<EntityMap>({
      pool: {
        user: {
          "2": { id: "2", name: "Tom" },
        },
      },
    });
    assert.deepStrictEqual(operation, expected);
    assert.deepStrictEqual(newState, expectedNewState);
  });
});

describe("register", () => {
  it("returns GeneralUpdateOperation to register pool", () => {
    const state = new PhenylState<EntityMap>({
      pool: {
        user: { "1": { id: "1", name: "Shin" } },
      },
    });
    // @ts-ignore how do I add new Entity to existing EntityMap?
    const operation = state.register("book", { id: "book01", title: "ABC-Z" });
    const expected = {
      $set: {
        "pool.book.book01": {
          id: "book01",
          title: "ABC-Z",
        },
      },
    };
    const newState = updateAndRestore(state, operation);

    const expectedNewState = new PhenylState<UpdatedEntityMap>({
      pool: {
        user: { "1": { id: "1", name: "Shin" } },
        book: { book01: { id: "book01", title: "ABC-Z" } },
      },
    });

    assert.deepStrictEqual(operation, expected);
    assert.deepStrictEqual(newState, expectedNewState);
  });
});

describe("has", () => {
  it("returns true when state contains the searched item", () => {
    const state = new PhenylState<EntityMap>({
      pool: {
        user: { "1": { id: "1", name: "Shin" } },
      },
    });
    const queryResult = state.has({ entityName: "user", id: "1" });
    const expected = true;
    assert.equal(queryResult, expected);
  });
  it("returns false when state does not contain the searched item", () => {
    const state = new PhenylState<EntityMap>({
      pool: {
        user: { "1": { id: "1", name: "Shin" } },
      },
    });
    const queryResult = state.has({ entityName: "user", id: "2" });
    const expected = false;
    assert.equal(queryResult, expected);
  });
});
