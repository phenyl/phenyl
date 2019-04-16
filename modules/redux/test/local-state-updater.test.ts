/* eslint-env mocha */
import assert from "assert";
import { LocalStateUpdater } from "../src/local-state-updater";
import { PhenylReduxModule } from "../src/phenyl-redux-module";

describe("LocalStateUpdater", () => {
  describe("addUnreachedCommits", () => {
    it("appends to unreachedCommits", () => {
      const unreachedCommits = {
        id: "hoge",
        entityName: "foo",
        commitCount: 1
      };
      const state = PhenylReduxModule.createInitialState();
      assert.deepEqual(
        LocalStateUpdater.addUnreachedCommits(state, unreachedCommits),
        { $push: { unreachedCommits } }
      );
    });
    it("calculates the commitCount correctly", () => {
      const unreachedCommits = {
        entityName: "foo",
        id: "hoge",
        commitCount: 5
      };
      const state = PhenylReduxModule.createInitialState();
      state.unreachedCommits = [
        { entityName: "foo", id: "hoge", commitCount: 2 }
      ];

      assert.deepEqual(
        LocalStateUpdater.addUnreachedCommits(state, unreachedCommits),
        {
          $push: {
            unreachedCommits: {
              entityName: "foo",
              id: "hoge",
              commitCount: 3
            }
          }
        }
      );
    });
    it("should not Object.assign new commit when the difference between commitCounts is equal to 0", () => {
      const unreachedCommit = {
        entityName: "foo",
        id: "hoge",
        commitCount: 3
      };
      const state = PhenylReduxModule.createInitialState();
      state.unreachedCommits = [
        { entityName: "foo", id: "hoge", commitCount: 1 },
        { entityName: "foo", id: "hoge", commitCount: 2 }
      ];
      const newState = Object.assign(
        state,
        LocalStateUpdater.addUnreachedCommits(state, unreachedCommit)
      );

      assert.deepStrictEqual(newState.unreachedCommits, state.unreachedCommits);
    });
    it("should not Object.assign new commit when the difference between commitCounts is invalid", () => {
      const unreachedCommit = {
        entityName: "foo",
        id: "hoge",
        commitCount: 2
      };
      const state = PhenylReduxModule.createInitialState();
      state.unreachedCommits = [
        { entityName: "foo", id: "hoge", commitCount: 1 },
        { entityName: "foo", id: "hoge", commitCount: 2 }
      ];
      const newState = Object.assign(
        state,
        LocalStateUpdater.addUnreachedCommits(state, unreachedCommit)
      );

      assert.deepStrictEqual(newState.unreachedCommits, state.unreachedCommits);
    });
  });
  describe("removeUnreachedCommits", () => {
    it("removes a commit from unreachedCommits", () => {
      const unreachedCommits = {
        id: "hoge",
        entityName: "foo",
        commitCount: 1
      };
      const initialState = PhenylReduxModule.createInitialState();
      const state = Object.assign(
        initialState,
        LocalStateUpdater.addUnreachedCommits(initialState, unreachedCommits)
      );

      assert.deepEqual(
        LocalStateUpdater.addUnreachedCommits(initialState, unreachedCommits),
        { $push: { unreachedCommits } }
      );
      assert.deepEqual(
        LocalStateUpdater.removeUnreachedCommits(state, unreachedCommits),
        {
          $pull: {
            unreachedCommits: {
              $in: [
                {
                  commitCount: 1,
                  entityName: "foo",
                  id: "hoge"
                }
              ]
            }
          }
        }
      );
    });
  });
  describe("resolveError", () => {
    it("unsets an error", () => {
      const state = PhenylReduxModule.createInitialState();
      state.error = {
        type: "NetworkFailed",
        at: "server",
        message: "An error occured",
        actionTag: "xxx"
      };
      assert.deepEqual(LocalStateUpdater.resolveError(), {
        $unset: { error: "" }
      });
    });
  });
});
