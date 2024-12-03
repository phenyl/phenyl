import assert from "assert";
import * as sinon from "sinon";

import {
  createHttpClient,
  createPhenylRedux,
  createSessionClient,
  createServer,
  createDbClient,
  PORT,
} from "../helper";
import { MiddlewareHandler } from "../../src/middleware";

const dbClient = createDbClient();
const httpClient = createHttpClient(PORT);

const { store, actions } = createPhenylRedux(httpClient);
const sessionClient = createSessionClient(dbClient);
const server = createServer(dbClient);

describe("middlewareHandler", () => {
  const plainSession = {
    entityName: "patient" as const,
    expiredAt: "",
    userId: "shinout@example.com",
    externalId: "",
    ttl: 12345,
  };

  const plainPatient = {
    name: "Shin Suzuki",
    email: "shinout@example.com",
    password: "shin123",
  };

  let preSession: any;
  let middlewareHandler: any;
  let insertedPatient: any;

  beforeAll(async () => {
    preSession = await sessionClient.create(plainSession);

    middlewareHandler = new MiddlewareHandler(
      () => store.getState().phenyl,
      httpClient,
      store.dispatch
    );
    server.listen(PORT);
    insertedPatient = await httpClient.insertAndGet(
      {
        entityName: "patient",
        value: plainPatient,
      },
      preSession.id
    );
    store.dispatch(
      actions.follow(
        "patient",
        insertedPatient.entity,
        insertedPatient.versionId
      )
    );
  });
  afterAll(() => {
    server.close();
  });

  describe("all methods", () => {
    beforeEach(() => {
      store.dispatch(
        actions.follow(
          "patient",
          insertedPatient.entity,
          insertedPatient.versionId
        )
      );
    });
    describe("assignToState", () => {
      it("assigns operations in payload to state", async () => {
        const { type, payload } = await middlewareHandler.assignToState({
          $set: { "patient.name": "a" },
        });
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [
          {
            $set: { "patient.name": "a" },
          },
        ]);
      });
    });

    describe("resetState", () => {
      it("resets state", async () => {
        const { type } = await middlewareHandler.resetState();

        assert.strictEqual(type, "phenyl/reset");
      });
    });

    describe("useEntities", () => {
      it("initializes entity fields", async () => {
        await middlewareHandler.resetState();
        const action = {
          type: "phenyl/useEntities" as const,
          payload: ["patient" as const],
          tag: "",
        };
        const { type, payload } = await middlewareHandler.useEntities(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [
          {
            $set: { "entities.patient": {} },
          },
        ]);
      });
    });

    describe("repush", () => {
      beforeEach(async () => {
        await httpClient.updateById({
          entityName: "patient",
          id: insertedPatient.entity.id,
          operation: { $set: plainPatient },
        });
        await middlewareHandler.resetState();
        store.dispatch(
          actions.follow(
            "patient",
            insertedPatient.entity,
            insertedPatient.versionId
          )
        );
        await middlewareHandler.commit({
          type: "phenyl/commit" as const,
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {
              $set: { name: "Shingo Suzuki" },
            },
          },
          tag: "",
        });
        store.dispatch(
          actions.assign([
            {
              $set: {
                unreachedCommits: [
                  {
                    entityName: "patient" as const,
                    id: insertedPatient.entity.id,
                    commitCount: 1,
                  },
                ],
              },
            },
          ])
        );
      });
      it("updates origin", async () => {
        const action = {
          type: "phenyl/repush" as const,
          tag: "",
        };
        await middlewareHandler.repush(action);
        const originPatient = await httpClient.get({
          entityName: "patient",
          id: insertedPatient.entity.id,
        });

        const afterState = middlewareHandler.state;
        assert.strictEqual(originPatient.entity.name, "Shingo Suzuki");
        const { origin, commits } = afterState.entities.patient[
          insertedPatient.entity.id
        ];
        assert.strictEqual(afterState.unreachedCommits.length, 0);
        assert.strictEqual(origin.name, "Shingo Suzuki");
        assert.strictEqual(commits.length, 0);
      });
      it("does not update origin if client.push failed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));

        const action = {
          type: "phenyl/repush" as const,
          tag: "",
        };
        await middlewareHandler.repush(action);
        const originPatient = await httpClient.get({
          entityName: "patient",
          id: insertedPatient.entity.id,
        });

        const afterState = middlewareHandler.state;
        assert.strictEqual(originPatient.entity.name, "Shin Suzuki");
        const { origin, commits } = afterState.entities.patient[
          insertedPatient.entity.id
        ];
        assert.strictEqual(afterState.unreachedCommits.length, 1);
        assert.strictEqual(origin.name, "Shin Suzuki");
        assert.strictEqual(commits.length, 1);
        stub.restore();
      });
    });

    describe("delete", () => {
      let patient: any;
      beforeEach(async () => {
        patient = await httpClient.insertAndGet(
          {
            entityName: "patient",
            value: plainPatient,
          },
          preSession.id
        );
        store.dispatch(
          actions.follow("patient", patient.entity, patient.versionId)
        );
      });
      it("delete the entity in the central state, then unfollow the entity in local state", async () => {
        const action = {
          type: "phenyl/delete" as const,
          payload: {
            entityName: "patient" as const,
            id: patient.entity.id,
          },
          tag: "",
        };
        await middlewareHandler.delete(action);

        const { entities } = await httpClient.find({
          entityName: "patient",
          where: {},
        });
        assert.deepStrictEqual(
          entities.filter(({ id }) => id === patient.entity.id),
          []
        );

        const afterState = middlewareHandler.state;
        assert.deepStrictEqual(
          Object.keys(afterState.entities.patient).filter(
            (id) => id === patient.entity.id
          ),
          []
        );
      });

      it("does not delete the entity if client.delete failed", async () => {
        const stub = sinon.stub(httpClient, "delete");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));

        const action = {
          type: "phenyl/delete" as const,
          payload: {
            entityName: "patient" as const,
            id: patient.entity.id,
          },
          tag: "",
        };
        await middlewareHandler.delete(action);

        const { entities } = await httpClient.find({
          entityName: "patient",
          where: {},
        });
        assert.strictEqual(
          entities.filter(({ id }) => id === patient.entity.id).length,
          1
        );

        const afterState = middlewareHandler.state;
        assert.strictEqual(
          Object.keys(afterState.entities.patient).filter(
            (id) => id === patient.entity.id
          ).length,
          1
        );
        stub.restore();
      });
    });

    describe("follow", () => {
      let patient: any;
      beforeEach(async () => {
        patient = await httpClient.insertAndGet(
          {
            entityName: "patient",
            value: plainPatient,
          },
          preSession.id
        );
      });
      afterEach(async () => {
        await httpClient.delete({
          entityName: "patient",
          id: patient.entity.id,
        });
      });
      it("registers the given entity", async () => {
        const action = {
          type: "phenyl/follow" as const,
          payload: {
            entityName: "patient" as const,
            entity: patient.entity,
            versionId: patient.versionId,
          },
          tag: "",
        };
        const { type, payload } = await middlewareHandler.follow(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(
          payload[0]["$set"]![`entities.patient.${patient.entity.id}`].origin,
          {
            name: "Shin Suzuki",
            email: "shinout@example.com",
            id: patient.entity.id,
          }
        );
      });
    });

    describe("followAll", () => {
      let entities: any;
      let versionsById: any;
      beforeEach(async () => {
        const insertAndGetMultiResult = await httpClient.insertAndGetMulti(
          {
            entityName: "patient",
            values: [plainPatient, plainPatient],
          },
          preSession.id
        );
        entities = insertAndGetMultiResult.entities;
        versionsById = insertAndGetMultiResult.versionsById;
      });
      afterEach(async () => {
        for (let i = 0; i++; i < entities.length) {
          const { id } = entities[i];
          await httpClient.delete({
            entityName: "patient",
            id,
          });
        }
      });
      it("registers all the given entities", async () => {
        const actions = {
          type: "phenyl/followAll" as const,
          payload: {
            entityName: "patient" as const,
            entities,
            versionsById,
          },
          tag: "",
        };

        // @ts-ignore The action of the return value of followAll has payload
        const { type, payload } = await middlewareHandler.followAll(actions);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(
          payload[0]["$set"]![`entities.patient.${entities[0].id}`].origin,
          {
            email: "shinout@example.com",
            name: "Shin Suzuki",
            id: entities[0].id,
          }
        );
        assert.deepStrictEqual(
          payload[0]["$set"]![`entities.patient.${entities[1].id}`].origin,
          {
            email: "shinout@example.com",
            name: "Shin Suzuki",
            id: entities[1].id,
          }
        );
      });
    });

    describe("login", () => {
      const action = {
        type: "phenyl/login" as const,
        payload: {
          entityName: "patient" as const,
          credentials: {
            email: "shinout@example.com",
            password: "shin123",
          },
        },
        tag: "",
      };

      it("logins with credentials, then register the user", async () => {
        const { type, payload } = await middlewareHandler.login(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(
          payload[0]["$set"]!.session.userId,
          insertedPatient.entity.id
        );
      });
      it("sets error message if client.login failed", async () => {
        const stub = sinon.stub(httpClient, "login");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));
        const { type, payload } = await middlewareHandler.login(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.strictEqual(payload[0]["$set"]!.error.type, "NetworkFailed");

        stub.restore();
      });
    });

    describe("logout", () => {
      it("removes the session in CentralState and reset the LocalState", async () => {
        const action = {
          type: "phenyl/logout" as const,
          payload: {
            entityName: "patient" as const,
            sessionId: preSession.id,
            userId: insertedPatient.entity.id,
          },
          tag: "",
        };
        const { type } = await middlewareHandler.logout(action);
        assert.strictEqual(type, "phenyl/reset");
      });
    });

    describe("resolveError", () => {
      it("unsets error", async () => {
        const action = {
          type: "phenyl/resolveError" as const,
        };
        const { type, payload } = await middlewareHandler.resolveError(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [{ $unset: { error: "" } }]);
      });
    });

    describe("pull", () => {
      afterEach(async () => {
        await httpClient.updateById({
          entityName: "patient",
          id: insertedPatient.entity.id,
          operation: { $set: plainPatient },
        });
      });
      it("pulls the differences from CentralState, then rebase the diffs", async () => {
        const action = {
          type: "phenyl/pull" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
          },
          tag: "",
        };

        await httpClient.updateById({
          entityName: "patient",
          id: insertedPatient.entity.id,
          operation: {
            $set: { name: "Shingo Suzuki" },
          },
        });

        const beforeState = middlewareHandler.state;
        const { type, payload } = await middlewareHandler.pull(action);
        assert.strictEqual(
          beforeState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );
        assert.strictEqual(type, "phenyl/assign");
        assert.strictEqual(
          payload[0]["$set"]![
            `entities.patient.${insertedPatient.entity.id}.origin`
          ].name,
          "Shingo Suzuki"
        );
      });
      it("follows LocalState if there is no differences from CentralState", async () => {
        const action = {
          type: "phenyl/pull" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
          },
          tag: "",
        };

        const { type, payload } = await middlewareHandler.pull(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.strictEqual(
          payload[0]["$set"]![
            `entities.patient.${insertedPatient.entity.id}.origin`
          ].name,
          "Shin Suzuki"
        );
      });
    });

    describe("setSession", () => {
      it("sets session info and registers user if exists", async () => {
        const action = {
          type: "phenyl/setSession" as const,
          payload: {
            session: {
              id: preSession.id,
              expiredAt: "2021-05-26T07:43:41.641Z",
              entityName: "patient" as const,
              userId: insertedPatient.entity.id,
              externalId: "",
              ttl: 123456,
            },
          },
          tag: "",
        };
        const { type, payload } = await middlewareHandler.setSession(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [{ $set: action.payload }]);
      });
    });

    describe("unfollow", () => {
      it("unregisters the entity", async () => {
        const action = {
          type: "phenyl/unfollow" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
          },
          tag: "",
        };
        const { type, payload } = await middlewareHandler.unfollow(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [
          {
            $unset: { [`entities.patient.${insertedPatient.entity.id}`]: "" },
          },
        ]);
      });
    });

    describe("unsetSession", () => {
      it("unsets session info", async () => {
        const { type, payload } = await middlewareHandler.unsetSession();
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [{ $unset: { session: "" } }]);
      });
    });

    describe("online", () => {
      it("marks as online", async () => {
        const { type, payload } = await middlewareHandler.online();
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [
          { $set: { "network.isOnline": true } },
        ]);
      });
    });

    describe("offline", () => {
      it("marks as offline", async () => {
        const { type, payload } = await middlewareHandler.offline();
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [
          { $set: { "network.isOnline": false } },
        ]);
      });
    });

    describe("commitAndPush", () => {
      afterEach(async () => {
        await httpClient.updateById({
          entityName: "patient",
          id: insertedPatient.entity.id,
          operation: { $set: plainPatient },
        });
        store.dispatch(
          actions.follow(
            "patient",
            insertedPatient.entity,
            insertedPatient.versionId
          )
        );
      });
      it("commits to LocalState and then pushes to the CentralState", async () => {
        const action = {
          type: "phenyl/commitAndPush" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
            operation: {
              $set: { name: "Shingo Suzuki" },
            },
          },
          tag: "",
        };
        const beforeState = middlewareHandler.state;
        const { type, payload } = await middlewareHandler.commitAndPush(action);
        const afterState = middlewareHandler.state;
        const originPatient = await httpClient.get({
          entityName: "patient",
          id: insertedPatient.entity.id,
        });

        assert.strictEqual(
          beforeState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );
        assert.strictEqual(
          afterState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shingo Suzuki"
        );

        assert.strictEqual(originPatient.entity.name, "Shingo Suzuki");
        assert.strictEqual(type, "phenyl/assign");

        assert.deepStrictEqual(payload[0], {
          $pull: {
            unreachedCommits: {
              entityName: "patient",
              id: insertedPatient.entity.id,
            },
          },
        });
        assert.deepStrictEqual(payload[1], {
          $set: {
            [`entities.patient.${insertedPatient.entity.id}`]: {
              origin: {
                name: "Shingo Suzuki",
                email: "shinout@example.com",
                id: insertedPatient.entity.id,
                password: "5S/eKy9JFkAgOfJUjmLfZmhQBLAPQtxuJX4Oc2urTdM=",
              },
              versionId: originPatient.versionId,
              commits: [],
              head: null,
            },
          },
        });
        assert.deepStrictEqual(payload[2], {
          $set: { "network.requests": [] },
        });
      });
      it("increases the number of unreached commits if push failed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));
        const action = {
          type: "phenyl/commitAndPush" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
            operation: {
              $set: { name: "Shingo Suzuki" },
            },
          },
          tag: "",
        };
        const beforeState = middlewareHandler.state;
        const { type, payload } = await middlewareHandler.commitAndPush(action);
        const afterState = middlewareHandler.state;
        const originPatient = await httpClient.get({
          entityName: "patient",
          id: insertedPatient.entity.id,
        });

        assert.strictEqual(
          beforeState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );
        assert.strictEqual(
          afterState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );
        assert.deepStrictEqual(afterState.unreachedCommits, [
          {
            entityName: "patient",
            id: insertedPatient.entity.id,
            commitCount: 1,
          },
        ]);

        assert.strictEqual(originPatient.entity.name, "Shin Suzuki");
        assert.strictEqual(type, "phenyl/assign");

        assert.deepStrictEqual(payload[0], {
          $set: {
            error: {
              type: "NetworkFailed",
              at: "local",
              message: "",
              actionTag: "",
            },
          },
        });
        assert.deepStrictEqual(payload[1], {
          $push: {
            unreachedCommits: {
              entityName: "patient",
              id: insertedPatient.entity.id,
              commitCount: 1,
            },
          },
        });
        assert.deepStrictEqual(payload[2], {
          $set: { "network.isOnline": false },
        });
        assert.deepStrictEqual(payload[3], {
          $set: { "network.requests": [] },
        });
        stub.restore();
      });
    });

    describe("patch", () => {
      it("applies the VersionDiff", async () => {
        const action = {
          type: "phenyl/patch" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
            prevVersionId: insertedPatient.versionId,
            versionId: "new versionId",
          },
          tag: "",
        };
        const { type, payload } = await middlewareHandler.patch(action);
        assert.strictEqual(type, "phenyl/assign");
        assert.deepStrictEqual(payload, [
          {
            $set: {
              [`entities.patient.${insertedPatient.entity.id}.origin`]: {
                name: "Shin Suzuki",
                email: "shinout@example.com",
                id: insertedPatient.entity.id,
              },
              [`entities.patient.${insertedPatient.entity.id}.versionId`]: "new versionId",
              [`entities.patient.${insertedPatient.entity.id}.head`]: {
                name: "Shin Suzuki",
                email: "shinout@example.com",
                id: insertedPatient.entity.id,
              },
            },
          },
        ]);
      });
    });

    describe("pushAndCommit", () => {
      afterEach(async () => {
        await httpClient.updateById({
          entityName: "patient",
          id: insertedPatient.entity.id,
          operation: { $set: plainPatient },
        });
        store.dispatch(
          actions.follow(
            "patient",
            insertedPatient.entity,
            insertedPatient.versionId
          )
        );
      });
      it("pushes to the CentralState, then commits to LocalState", async () => {
        const action = {
          type: "phenyl/pushAndCommit" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
            operation: { $set: { name: "Shingo Suzuki" } },
          },
          tag: "",
        };
        const beforeState = middlewareHandler.state;
        const { type, payload } = await middlewareHandler.pushAndCommit(action);
        const afterState = middlewareHandler.state;
        const originPatient = await httpClient.get({
          entityName: "patient",
          id: insertedPatient.entity.id,
        });

        assert.strictEqual(
          beforeState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );
        assert.strictEqual(
          afterState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shingo Suzuki"
        );

        assert.strictEqual(originPatient.entity.name, "Shingo Suzuki");
        assert.strictEqual(type, "phenyl/assign");

        assert.deepStrictEqual(payload[0], {
          $pull: {
            unreachedCommits: {
              entityName: "patient",
              id: insertedPatient.entity.id,
            },
          },
        });
        assert.deepStrictEqual(payload[1], {
          $set: {
            [`entities.patient.${insertedPatient.entity.id}`]: {
              origin: {
                name: "Shingo Suzuki",
                email: "shinout@example.com",
                id: insertedPatient.entity.id,
                password: "5S/eKy9JFkAgOfJUjmLfZmhQBLAPQtxuJX4Oc2urTdM=",
              },
              versionId: originPatient.versionId,
              commits: [],
              head: null,
            },
          },
        });
        assert.deepStrictEqual(payload[2], {
          $set: { "network.requests": [] },
        });
      });
      it("does not apply commits if push failed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));
        const action = {
          type: "phenyl/pushAndCommit" as const,
          payload: {
            entityName: "patient" as const,
            id: insertedPatient.entity.id,
            operation: {
              $set: { name: "Shingo Suzuki" },
            },
          },
          tag: "",
        };
        const beforeState = middlewareHandler.state;
        const { type, payload } = await middlewareHandler.pushAndCommit(action);
        const afterState = middlewareHandler.state;
        const originPatient = await httpClient.get({
          entityName: "patient",
          id: insertedPatient.entity.id,
        });

        assert.strictEqual(
          beforeState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );
        assert.strictEqual(
          afterState.entities.patient[insertedPatient.entity.id].origin.name,
          "Shin Suzuki"
        );

        assert.strictEqual(originPatient.entity.name, "Shin Suzuki");
        assert.strictEqual(type, "phenyl/assign");

        assert.deepStrictEqual(payload[0], {
          $set: {
            error: {
              type: "NetworkFailed",
              at: "local",
              message: "",
              actionTag: "",
            },
          },
        });
        assert.deepStrictEqual(payload[1], {
          $set: { "network.requests": [] },
        });
        stub.restore();
      });
    });
  });

  describe("unreachedCommits", () => {
    beforeEach(async () => {
      store.dispatch(
        actions.assign([
          {
            $set: {
              unreachedCommits: [
                {
                  entityName: "patient" as const,
                  id: insertedPatient.entity.id,
                  commitCount: 2,
                },
                {
                  entityName: "patient" as const,
                  id: insertedPatient.entity.id,
                  commitCount: 1,
                },
                {
                  entityName: "patient" as const,
                  id: insertedPatient.entity.id,
                  commitCount: 1,
                },
                {
                  entityName: "staff" as const,
                  id: "",
                  commitCount: 2,
                },
              ],
            },
          },
        ])
      );
    });

    describe("commitAndPush", () => {
      it("clear unreached commits if commits are pushed successfully", async () => {
        const operations = await middlewareHandler.commitAndPush({
          type: "phenyl/commitAndPush",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {},
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(unreachedCommits.length, 1);
        assert.strictEqual(
          unreachedCommits.every(({ id }) => id !== insertedPatient.entity.id),
          true
        );
      });
      it("doesn't clear unreached commits if commits are not pushed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));

        const operations = await middlewareHandler.commitAndPush({
          type: "phenyl/commitAndPush",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {},
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(
          unreachedCommits.filter(({ id }) => id === insertedPatient.entity.id)
            .length,
          3
        );
        stub.restore();
      });
    });
    describe("pushAndCommit", () => {
      it("clear unreached commits if commits are pushed successfully", async () => {
        const operations = await middlewareHandler.pushAndCommit({
          type: "phenyl/pushAndCommit",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {},
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(unreachedCommits.length, 1);
        assert(
          unreachedCommits.every(({ id }) => id !== insertedPatient.entity.id)
        );
      });
      it("doesn't clear unreached commits if commits are not pushed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));

        const operations = await middlewareHandler.pushAndCommit({
          type: "phenyl/pushAndCommit",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {},
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(
          unreachedCommits.filter(({ id }) => id === insertedPatient.entity.id)
            .length,
          3
        );
        stub.restore();
      });
    });

    describe("commitAndPush", () => {
      it("clear unreached commits if commits are pushed successfully", async () => {
        const operations = await middlewareHandler.commitAndPush({
          type: "phenyl/commitAndPush",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {},
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(unreachedCommits.length, 1);
        assert.strictEqual(
          unreachedCommits.every(({ id }) => id !== insertedPatient.entity.id),
          true
        );
      });
      it("doesn't clear unreached commits if commits are not pushed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));

        const operations = await middlewareHandler.commitAndPush({
          type: "phenyl/commitAndPush",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: {},
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(
          unreachedCommits.filter(({ id }) => id === insertedPatient.entity.id)
            .length,
          3
        );
        stub.restore();
      });
    });

    describe("push", () => {
      it("clear unreached commits if all local commits are pushed successfully", async () => {
        const operations = await middlewareHandler.push({
          type: "phenyl/push",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            until: -1,
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(unreachedCommits.length, 1);
        assert(
          unreachedCommits.every(({ id }) => id !== insertedPatient.entity.id)
        );
      });
      it("doesn't clear unreached commits if all local commits are not pushed", async () => {
        const operations = await middlewareHandler.push({
          type: "phenyl/push",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            until: 2,
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(unreachedCommits.length, 4);
        assert.strictEqual(
          unreachedCommits.filter(({ id }) => id === insertedPatient.entity.id)
            .length,
          3
        );
      });
      it("doesn't clear unreached commits if commits are not pushed", async () => {
        const stub = sinon.stub(httpClient, "push");
        stub.throws(() => ({
          type: "NetworkFailed",
        }));

        const operations = await middlewareHandler.push({
          type: "phenyl/push",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            until: -1,
          },
          tag: "",
        });

        store.dispatch(operations);
        const { unreachedCommits } = store.getState().phenyl;

        assert.strictEqual(
          unreachedCommits.filter(({ id }) => id === insertedPatient.entity.id)
            .length,
          3
        );
        stub.restore();
      });
      it("doesn't clear all commits when 'until' is less than commit count", async () => {
        await middlewareHandler.commit({
          type: "phenyl/commit",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: { $set: { name: "First Change" } },
          },
          tag: "",
        });

        await middlewareHandler.commit({
          type: "phenyl/commit",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            operation: { $set: { name: "Second Change" } },
          },
          tag: "",
        });

        const operations = await middlewareHandler.push({
          type: "phenyl/push",
          payload: {
            entityName: "patient",
            id: insertedPatient.entity.id,
            until: 1,
          },
          tag: "",
        });

        store.dispatch(operations);
        const { entities } = store.getState().phenyl;
        const entityInfo = entities.patient[insertedPatient.entity.id];

        assert.strictEqual(entityInfo.commits.length, 1);
        assert.deepStrictEqual(entityInfo.commits[0], {
          $set: { name: "Second Change" },
        });
      });
    });
  });
});
