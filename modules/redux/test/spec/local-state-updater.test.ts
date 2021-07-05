import assert from "assert";
import { LocalStateUpdater } from "../../src/local-state-updater";
import { createInitialState } from "../../src/reducer";

const initialState = createInitialState();
const state = {
  ...initialState,
  entities: {
    user: {
      user1: {
        id: "user1",
        name: "user1",
        origin: { id: "user1", name: "userOrigin1" },
        versionId: "1",
        commits: [{ $set: { name: "userHead1" } }],
        head: { id: "user1", name: "userHead1" },
      },
    },
  },
};

describe("LocalStateUpdater", () => {
  describe("initialize", () => {
    const operation = LocalStateUpdater.initialize(initialState, "user");

    assert.deepStrictEqual(operation, {
      $set: { "entities.user": {} },
    });
  });
  describe("commit", () => {
    it("throws error if no entity is registered", () => {
      let error;
      try {
        LocalStateUpdater.commit(initialState, {
          entityName: "user",
          id: "",
          operation: {},
        });
      } catch (e) {
        error = e;
      }
      assert.strictEqual(
        error.message,
        'LocalStateUpdater.commit(). No entity found. entityName: "user", id: "".'
      );
    });

    it("commits the operation of entity to LocalState", () => {
      const operation = LocalStateUpdater.commit(state, {
        entityName: "user",
        id: "user1",
        operation: { $set: { name: "user2" } },
      });

      assert.deepStrictEqual(operation, {
        $push: {
          "entities.user.user1.commits": {
            $set: {
              name: "user2",
            },
          },
        },
        $set: {
          "entities.user.user1.head": {
            id: "user1",
            name: "user2",
          },
        },
      });
    });
  });
  describe("revert", () => {
    it("throws error if no entity is registered", () => {
      let error;
      try {
        LocalStateUpdater.revert(initialState, {
          entityName: "user",
          id: "",
          operations: [],
        });
      } catch (e) {
        error = e;
      }
      assert.strictEqual(
        error.message,
        'LocalStateUpdater.revert(). No entity found. entityName: "user", id: "".'
      );
    });
    it("reverts the already applied commit", () => {
      const operation = LocalStateUpdater.revert(state, {
        entityName: "user",
        id: "user1",
        operations: [{ $set: { name: "user2" } }],
      });

      assert.deepStrictEqual(operation, {
        $set: {
          "entities.user.user1.commits": [{ $set: { name: "userHead1" } }],
          "entities.user.user1.head": {
            id: "user1",
            name: "userHead1",
          },
        },
      });
    });
  });
  describe("follow", () => {
    it("registers the entity info into LocalState", () => {
      const operation = LocalStateUpdater.follow(
        state,
        "user",
        { id: "user1" },
        undefined
      );
      assert.deepStrictEqual(operation, {
        $set: {
          "entities.user.user1": {
            origin: { id: "user1" },
            versionId: undefined,
            commits: [],
            head: null,
          },
        },
      });
    });
  });
  describe("removes the entity info from LocalState", () => {
    it("", () => {
      const operation = LocalStateUpdater.unfollow(state, "user", "user1");
      assert.deepStrictEqual(operation, {
        $unset: { "entities.user.user1": "" },
      });
    });
  });
  describe("addUnreachedCommits", () => {
    it("appends to unreachedCommits", () => {
      const unreachedCommits = {
        id: "hoge",
        entityName: "foo",
        commitCount: 1,
      };
      const state = createInitialState();
      assert.deepStrictEqual(
        LocalStateUpdater.addUnreachedCommits(state, unreachedCommits),
        { $push: { unreachedCommits } }
      );
    });
    it("calculates the commitCount correctly", () => {
      const unreachedCommits = {
        entityName: "foo",
        id: "hoge",
        commitCount: 5,
      };
      const state = createInitialState();
      state.unreachedCommits = [
        { entityName: "foo", id: "hoge", commitCount: 2 },
      ];

      assert.deepStrictEqual(
        LocalStateUpdater.addUnreachedCommits(state, unreachedCommits),
        {
          $push: {
            unreachedCommits: {
              entityName: "foo",
              id: "hoge",
              commitCount: 3,
            },
          },
        }
      );
    });
    it("should not Object.assign new commit when the difference between commitCounts is equal to 0", () => {
      const unreachedCommit = {
        entityName: "foo",
        id: "hoge",
        commitCount: 3,
      };
      const state = {
        ...initialState,
        unreachedCommits: [
          { entityName: "foo", id: "hoge", commitCount: 1 },
          { entityName: "foo", id: "hoge", commitCount: 2 },
        ],
      };
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
        commitCount: 2,
      };
      const state = createInitialState();
      state.unreachedCommits = [
        { entityName: "foo", id: "hoge", commitCount: 1 },
        { entityName: "foo", id: "hoge", commitCount: 2 },
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
        commitCount: 1,
      };
      const initialState = createInitialState();
      const state = Object.assign(
        initialState,
        LocalStateUpdater.addUnreachedCommits(initialState, unreachedCommits)
      );

      assert.deepStrictEqual(
        LocalStateUpdater.addUnreachedCommits(initialState, unreachedCommits),
        { $push: { unreachedCommits } }
      );
      assert.deepStrictEqual(
        LocalStateUpdater.removeUnreachedCommits(state, unreachedCommits),
        {
          $pull: {
            unreachedCommits: {
              $in: [
                {
                  commitCount: 1,
                  entityName: "foo",
                  id: "hoge",
                },
              ],
            },
          },
        }
      );
    });
  });
  describe("clearUnreachedCommitsByEntityInfo", () => {
    it("clears unreached commits by entityName and entityId", () => {
      const operation = LocalStateUpdater.clearUnreachedCommitsByEntityInfo(
        state,
        "user",
        "user1"
      );

      assert.deepStrictEqual(operation, {
        $pull: { unreachedCommits: { entityName: "user", id: "user1" } },
      });
    });
  });
  describe("networkRequest", () => {
    it("pushes network request promise", () => {
      const operation = LocalStateUpdater.networkRequest(state, "tag");
      assert.deepStrictEqual(operation, {
        $push: { "network.requests": "tag" },
      });
    });
  });
  describe("removeNetworkRequest", () => {
    it("removes network request promise from the request queue", () => {
      const operation = LocalStateUpdater.removeNetworkRequest(state, "tag");
      assert.deepStrictEqual(operation, {
        $set: { "network.requests": [] },
      });
    });
  });
  describe("patch", () => {
    it("does not return operations if the diff's prevVersionId isn't equal to registered versionId ", () => {
      const operation = LocalStateUpdater.patch(state, {
        entityName: "user",
        id: "user1",
        prevVersionId: "",
        versionId: "",
      });
      assert.deepStrictEqual(operation, {});
    });
    it("applies the given VersionDiff as a patch", () => {
      const operation = LocalStateUpdater.patch(state, {
        entityName: "user",
        id: "user1",
        prevVersionId: "1",
        versionId: "2",
      });
      assert.deepStrictEqual(operation, {
        $set: {
          "entities.user.user1.head": {
            id: "user1",
            name: "userHead1",
          },
          "entities.user.user1.origin": {
            id: "user1",
            name: "userOrigin1",
          },
          "entities.user.user1.versionId": "2",
        },
      });
    });
  });
  describe("rebase", () => {
    it("applies the master commits", () => {
      const operation = LocalStateUpdater.rebase(state, {
        entityName: "user",
        id: "user1",
        operations: [{ $set: { name: "user3" } }],
        versionId: "3",
      });
      assert.deepStrictEqual(operation, {
        $set: {
          "entities.user.user1.origin": {
            id: "user1",
            name: "user3",
          },
          "entities.user.user1.versionId": "3",
          "entities.user.user1.head": {
            id: "user1",
            name: "userHead1",
          },
        },
      });
    });
  });
  describe("synchronize", () => {
    it("applies the master commits, then applies the given local commits", () => {
      const operation = LocalStateUpdater.synchronize(
        state,
        {
          entityName: "user",
          id: "user1",
          operations: [{ $set: { name: "user3" } }],
          versionId: "3",
        },
        [
          {
            $set: { name: "user4" },
          },
        ]
      );

      assert.deepStrictEqual(operation, {
        $set: {
          "entities.user.user1": {
            origin: { id: "user1", name: "user4" },
            versionId: "3",
            commits: [],
            head: null,
          },
        },
      });
    });
  });
  describe("followAll", () => {
    it("registers all the entities into LocalState", () => {
      const operation = LocalStateUpdater.followAll(
        state,
        "user",
        [
          {
            id: "user2",
          },
        ],
        { user2: "version1" }
      );
      assert.deepStrictEqual(operation, {
        $set: {
          "entities.user.user2": {
            origin: { id: "user2" },
            versionId: "version1",
            commits: [],
            head: null,
          },
        },
      });
    });
  });
  describe("setSession", () => {
    it("sets session", () => {
      const operation = LocalStateUpdater.setSession(
        state,
        {
          id: "session1",
          expiredAt: "xxx",
          entityName: "user",
          userId: "user1",
        },
        { id: "user1" },
        "1"
      );
      assert.deepStrictEqual(operation, {
        $set: {
          session: {
            id: "session1",
            expiredAt: "xxx",
            entityName: "user",
            userId: "user1",
          },
          "entities.user.user1": {
            origin: { id: "user1" },
            versionId: "1",
            commits: [],
            head: null,
          },
        },
      });
    });

    it("does not set entity data if user and versionId are not given", () => {
      const operation = LocalStateUpdater.setSession(
        state,
        {
          id: "session1",
          expiredAt: "xxx",
          entityName: "user",
          userId: "user1",
        },
        null
      );
      assert.deepStrictEqual(operation, {
        $set: {
          session: {
            id: "session1",
            expiredAt: "xxx",
            entityName: "user",
            userId: "user1",
          },
        },
      });
    });
  });
  describe("unsetSession", () => {
    const operation = LocalStateUpdater.unsetSession();
    assert.deepStrictEqual(operation, {
      $unset: { session: "" },
    });
  });
  describe("error", () => {
    const operation = LocalStateUpdater.error(
      {
        ok: 0,
        at: "local",
        type: "NetworkFailed",
        message: "error",
        detail: {},
      },
      "tag"
    );
    assert.deepStrictEqual(operation, {
      $set: {
        error: {
          type: "NetworkFailed",
          at: "local",
          message: "error",
          actionTag: "tag",
        },
      },
    });
  });
  describe("online", () => {
    it("sets network state Online", () => {
      const operation = LocalStateUpdater.online();
      assert.deepStrictEqual(operation, {
        $set: { "network.isOnline": true },
      });
    });
  });
  describe("offline", () => {
    it("sets network state Offline", () => {
      const operation = LocalStateUpdater.offline();
      assert.deepStrictEqual(operation, {
        $set: { "network.isOnline": false },
      });
    });
  });
  describe("resolveError", () => {
    it("unsets an error", () => {
      const state = createInitialState();
      state.error = {
        type: "NetworkFailed",
        at: "local",
        message: "An error occured",
        ok: 0,
      };
      assert.deepStrictEqual(LocalStateUpdater.resolveError(), {
        $unset: { error: "" },
      });
    });
  });
});
