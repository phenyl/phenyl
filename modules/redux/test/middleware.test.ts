/* eslint-env mocha */
import assert from "assert";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { createDocumentPath } from "sp2";
import { createServerError, createLocalError } from "@phenyl/utils";
import { createMiddleware } from "../src/middleware";
import reducer, { actions } from "../src/phenyl-redux-module";

describe("MiddlewareCreator", () => {
  describe("create", () => {
    // @ts-ignore
    const createActionsLogMiddleware = log => () => next => action => {
      log.push(action);
      return next(action);
    };
    // @ts-ignore
    const storeCreator = (initialState, ...middlewares) =>
      createStore(
        // @ts-ignore
        combineReducers({ phenyl: reducer }),
        { phenyl: initialState },
        applyMiddleware(...middlewares)
      );

    describe("Action phenyl/online", () => {
      // @ts-ignore
      const middleware = createMiddleware({ storeKey: "phenyl", client: null });
      it("dispatches an action that sets isOnline to true", async () => {
        const expected = {
          type: "phenyl/assign",
          payload: [{ $set: { "network.isOnline": true } }]
        };

        // @ts-ignore
        const mockStore = { getState: () => ({}) };
        // @ts-ignore
        const next = ({ type, payload }) =>
          assert.deepStrictEqual(expected, { type, payload });
        // @ts-ignore
        await middleware(mockStore)(next)(actions.online());
      });
    });
    describe("Action phenyl/offline", () => {
      // @ts-ignore
      const middleware = createMiddleware({ storeKey: "phenyl", client: null });
      it("dispatches an action that sets isOnline to false", async () => {
        const expected = {
          type: "phenyl/assign",
          payload: [{ $set: { "network.isOnline": false } }]
        };

        const mockStore = { getState: () => ({}) };
        // @ts-ignore
        const next = ({ type, payload }) =>
          assert.deepStrictEqual(expected, { type, payload });
        // @ts-ignore
        await middleware(mockStore)(next)(actions.offline());
      });
    });
    describe("Action phenyl/push", () => {
      const entityName = "users";
      const id = "some-id";
      const operation = {
        $set: {
          [createDocumentPath("nickname")]: "John"
        }
      };
      const initialState = {
        network: {
          requests: []
        },
        unreachedCommits: [],
        entities: {
          [entityName]: {
            [id]: {
              origin: {
                nickname: "Taro"
              },
              head: null,
              commits: []
            }
          }
        }
      };

      it("does nothing when commits are empty", async () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          // @ts-ignore
          client: null
        });
        const store = storeCreator(initialState, middleware);
        // @ts-ignore
        const pushAction = actions.push({ entityName, id });
        // @ts-ignore
        const next = action => assert.deepStrictEqual(action, pushAction);
        // @ts-ignore
        await middleware(store)(next)(pushAction);
      });
      it("dispatches an action that appends tag to pending requests", async () => {
        // @ts-ignore
        const dispatchedActions = [];
        const middleware = createMiddleware({
          storeKey: "phenyl",
          client: {
            // @ts-ignore
            push: async () => ({
              hasEntity: false,
              operations: [],
              versionId: "zzz"
            })
          }
        });
        const store = storeCreator(
          initialState,
          middleware,
          // @ts-ignore
          createActionsLogMiddleware(dispatchedActions)
        );
        // @ts-ignore
        const action = actions.push({ entityName, id });

        await store.dispatch(actions.commit({ entityName, id, operation }));
        await store.dispatch(action);

        // @ts-ignore
        assert.deepStrictEqual(dispatchedActions[1].payload, [
          {
            $push: {
              "network.requests": action.tag
            }
          }
        ]);
      });

      describe("Response contains entity", () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          client: {
            // @ts-ignore
            push: async () => ({
              hasEntity: true,
              entity: {
                id,
                nickname: "Jack"
              },
              versionId: "zzz"
            })
          }
        });
        it("dispatches an action that removes a tag from pending requests when a request resolves", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);

          // @ts-ignore
          assert.deepStrictEqual(store.getState().phenyl.network.requests, []);
        });
        it("dispatches an action that syncs local state with entity", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);

          // @ts-ignore
          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.entities[entityName][id].origin,
            { id, nickname: "Jack" }
          );
          // @ts-ignore
          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.entities[entityName][id].head,
            null
          );
        });
      });
      describe("Response contains operations", () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          client: {
            // @ts-ignore
            push: async () => ({
              hasEntity: false,
              operations: [
                {
                  $set: {
                    age: 35
                  }
                }
              ],
              versionId: "xxx"
            })
          }
        });
        it("dispatches an action that assigns an operation to local state", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);
          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.entities[entityName][id].origin,
            { nickname: "John", age: 35 }
          );
          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.entities[entityName][id].head,
            null
          );
        });
      });
      describe("Request rejected with NetworkFailed", () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          // @ts-ignore
          client: {
            // @ts-ignore
            push: () =>
              Promise.reject(
                createLocalError("Invalid value.", "NetworkFailed")
              )
          }
        });
        it("dispatches an action that appends to unreached commit", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const pushAction = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(pushAction);

          // @ts-ignore
          assert.deepStrictEqual(store.getState().phenyl.unreachedCommits, [
            { entityName, id, commitCount: 1 }
          ]);
        });
        it("dispatches an action that appends to unreached commits", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const pushAction = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(pushAction);
          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(pushAction);

          // @ts-ignore
          assert.deepStrictEqual(store.getState().phenyl.unreachedCommits, [
            { entityName, id, commitCount: 2 },
            { entityName, id, commitCount: 1 }
          ]);
        });
        it("dispatches an action that appends to unreached commits up to specified index", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const pushAction = actions.push({ entityName, id, until: 1 });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(
            actions.commit({ entityName, id, operation: { $set: { age: 20 } } })
          );
          await store.dispatch(pushAction);

          // @ts-ignore
          assert.deepStrictEqual(store.getState().phenyl.unreachedCommits, [
            { entityName, id, commitCount: 1 }
          ]);
        });
        it("dispatches an action that sets isOnline to false", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);

          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.network.isOnline,
            false
          );
        });
        it("dispatches an action that removes a tag from pending requests when a request rejected", async () => {
          // @ts-ignore
          const dispatchedActions = [];
          const store = storeCreator(
            initialState,
            middleware,
            // @ts-ignore
            createActionsLogMiddleware(dispatchedActions)
          );
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);

          // @ts-ignore
          assert.deepStrictEqual(dispatchedActions[1].payload, [
            {
              $push: {
                "network.requests": action.tag
              }
            }
          ]);
        });
      });
      describe("Request rejected with unexpected error", () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          // @ts-ignore
          client: {
            push: () => Promise.reject(createServerError("Unexpected"))
          }
        });
        it("dispatches an action that sets error", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);

          // @ts-ignore
          assert.deepStrictEqual(store.getState().phenyl.error, {
            actionTag: action.tag,
            at: "server",
            message: "Unexpected",
            type: "BadRequest"
          });
        });
        it("dispatches an action that removes a tag from pending requests when a request rejected", async () => {
          const store = storeCreator(initialState, middleware);
          // @ts-ignore
          const action = actions.push({ entityName, id });

          await store.dispatch(actions.commit({ entityName, id, operation }));
          await store.dispatch(action);

          // @ts-ignore
          assert.deepStrictEqual(store.getState().phenyl.network.requests, []);
        });
      });
    });
    describe("Action phenyl/commit", () => {
      const entityName = "users";
      const id = "some-id";
      const operation = {
        $set: {
          [createDocumentPath("nickname")]: "John"
        }
      };
      const initialState = {
        entities: {
          [entityName]: {
            [id]: {
              origin: {
                nickname: "Taro"
              },
              head: null,
              commits: []
            }
          }
        }
      };
      // @ts-ignore
      const middleware = createMiddleware({ storeKey: "phenyl", client: null });

      it("dispatches an action that creates commit", async () => {
        const store = storeCreator(initialState, middleware);
        // @ts-ignore
        const next = ({ type, payload }) => {
          assert.strictEqual(type, "phenyl/assign");
          assert.deepStrictEqual(payload, [
            {
              $push: {
                "entities.users.some-id.commits": {
                  $set: { nickname: "John" }
                }
              },
              $set: { "entities.users.some-id.head": { nickname: "John" } }
            }
          ]);
        };
        // @ts-ignore
        await middleware(store)(next)(
          actions.commit({
            entityName,
            id,
            operation
          })
        );
      });
      it("dispatches an action that updates head state", async () => {
        const store = storeCreator(initialState, middleware);
        // @ts-ignore
        const next = ({ type, payload }) => {
          assert.strictEqual(type, "phenyl/assign");
          assert.deepStrictEqual(payload, [
            {
              $push: {
                "entities.users.some-id.commits": {
                  $set: { nickname: "John" }
                }
              },
              $set: { "entities.users.some-id.head": { nickname: "John" } }
            }
          ]);
        };
        // @ts-ignore
        await middleware(store)(next)(
          actions.commit({
            entityName,
            id,
            operation
          })
        );
      });
      it("dispatches an action that doesn't update origin state", async () => {
        const store = storeCreator(initialState, middleware);
        // @ts-ignore
        const next = ({ type, payload }) => {
          const { phenyl: state } = store.getState();
          const newState = Object.assign(state, ...payload);
          assert.strictEqual(
            // @ts-ignore
            state.entities[entityName][id].origin,
            newState.entities[entityName][id].origin
          );
        };
        // @ts-ignore
        await middleware(store)(next)(
          actions.commit({
            entityName,
            id,
            operation
          })
        );
      });
    });

    describe("Action phenyl/repush", () => {
      const entityName = "users";
      const id = "some-id";
      const initialState = {
        network: { requests: [] },
        unreachedCommits: [
          // @ts-ignore
          actions.commit({ entityName, id, commitCount: 1 }).payload
        ],
        entities: {
          [entityName]: {
            [id]: {
              origin: {
                nickname: "Taro"
              },
              head: null,
              commits: [{ $set: { nickname: "Tom" } }]
            }
          }
        }
      };

      describe("When the Network is rejected", () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          // @ts-ignore
          client: {
            push: () =>
              Promise.reject(
                createLocalError("Invalid value.", "NetworkFailed")
              )
          }
        });
        it("should keep unreachedCommits", async () => {
          const store = storeCreator(initialState, middleware);

          const oldState = store.getState();
          await store.dispatch(actions.repush());

          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.unreachedCommits,
            // @ts-ignore
            oldState.phenyl.unreachedCommits
          );
        });
      });
      describe("When the Network is recovered", () => {
        const middleware = createMiddleware({
          storeKey: "phenyl",
          client: {
            // @ts-ignore
            push: async () => ({
              hasEntity: false,
              operations: [],
              versionId: "zzz"
            })
          }
        });
        it("should remove unreachedCommits", async () => {
          const store = storeCreator(initialState, middleware);

          await store.dispatch(actions.repush());

          assert.deepStrictEqual(
            // @ts-ignore
            store.getState().phenyl.unreachedCommits,
            []
          );
        });
        describe("With local commits", () => {
          const initialState = {
            network: { requests: [] },
            unreachedCommits: [
              // @ts-ignore
              actions.commit({ entityName, id, commitCount: 1 }).payload,
              // @ts-ignore
              actions.commit({ entityName, id, commitCount: 2 }).payload
            ],
            entities: {
              [entityName]: {
                [id]: {
                  origin: {
                    nickname: "Taro"
                  },
                  head: null,
                  commits: [
                    { $set: { age: 25 } },
                    { $set: { nickname: "Tom" } },
                    { $set: { age: 32 } },
                    { $set: { nickname: "Jack" } }
                  ]
                }
              }
            }
          };
          it("should remove pushed local commits and keep unpushed local commits", async () => {
            const store = storeCreator(initialState, middleware);

            await store.dispatch(actions.repush());

            assert.deepStrictEqual(
              // @ts-ignore
              store.getState().phenyl.entities[entityName][id].origin,
              { nickname: "Tom", age: 32 }
            );
            assert.deepStrictEqual(
              // @ts-ignore
              store.getState().phenyl.entities[entityName][id].head,
              { nickname: "Jack", age: 32 }
            );
            assert.deepStrictEqual(
              // @ts-ignore
              store.getState().phenyl.entities[entityName][id].commits,
              [{ $set: { nickname: "Jack" } }]
            );
          });
        });
      });
    });
  });
});
