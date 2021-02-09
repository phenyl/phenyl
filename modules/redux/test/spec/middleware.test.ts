import { it, describe, before, after, beforeEach } from "mocha";
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

describe("middlewareHandler", async () => {
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

  const preSession = await sessionClient.create(plainSession);

  const middlewareHandler = new MiddlewareHandler(
    () => store.getState().phenyl,
    httpClient,
    store.dispatch
  );

  let insertedPatient: any;

  before(async () => {
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
  after(() => {
    server.close();
  });
  describe("unreachedCommits", () => {
    beforeEach(() => {
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
  });
});
