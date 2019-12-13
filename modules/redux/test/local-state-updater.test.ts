/* eslint-env mocha */
import assert from "assert";
import { LocalStateUpdater } from "../src/local-state-updater";
import { createInitialState } from "../src/reducer";

describe("LocalStateUpdater", () => {
  describe("addUnreachedCommits", () => {
    it("appends to unreachedCommits", () => {
      const unreachedCommits = {
        id: "hoge",
        entityName: "foo",
        commitCount: 1
      };
      const state = createInitialState();
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
      const state = createInitialState();
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
      const state = createInitialState();
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
      const state = createInitialState();
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
      const initialState = createInitialState();
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
      const state = createInitialState();
      state.error = {
        type: "NetworkFailed",
        at: "local",
        message: "An error occured",
        ok: 0
      };
      assert.deepEqual(LocalStateUpdater.resolveError(), {
        $unset: { error: "" }
      });
    });
  });
});
