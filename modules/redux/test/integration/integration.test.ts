import { GetCommandResult } from "@phenyl/interfaces";
import assert from "assert";
import {
  createHttpClient,
  createPhenylRedux,
  createSessionClient,
  createServer,
  createDbClient,
  PatientResponse,
  PORT,
} from "../helper";

import { LocalStateFinder } from "../../src";

const dbClient = createDbClient();
const httpClient = createHttpClient(PORT);

const { store, actions } = createPhenylRedux(httpClient);
const sessionClient = createSessionClient(dbClient);
const server = createServer(dbClient);

describe("Integration", () => {
  beforeAll(() => {
    server.listen(PORT);
  });

  afterAll(() => {
    server.close();
  });

  let inserted: GetCommandResult<PatientResponse>;
  it("should be inserted", async () => {
    // TODO: need refinement. Should preSession be created by others?
    const preSession = await sessionClient.create({
      entityName: "patient",
      expiredAt: "",
      userId: "shinout@example.com",
      externalId: "",
      ttl: 12345,
    });

    inserted = await httpClient.insertAndGet(
      {
        entityName: "patient",
        value: {
          name: "Shin Suzuki",
          email: "shinout@example.com",
          password: "shin123",
        },
      },
      preSession.id
    );

    assert.strictEqual(inserted.entity.name, "Shin Suzuki");
    assert.strictEqual(inserted.entity.email, "shinout@example.com");
  });

  it("should be follow patient", () => {
    store.dispatch(
      actions.follow("patient", inserted.entity, inserted.versionId)
    );
    const state = store.getState().phenyl;
    const value = LocalStateFinder.getHeadEntity(state, {
      entityName: "patient",
      id: inserted.entity.id,
      // TODO: needs refinement for getHeadEntity response should infer type.
    }) as PatientResponse;
    assert.deepStrictEqual(value, {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      id: inserted.entity.id,
    });
  });

  it("should be success to login", async () => {
    // wait for login command
    await store.dispatch(
      actions.login({
        entityName: "patient",
        credentials: {
          email: "shinout@example.com",
          password: "shin123",
        },
      })
    );
    const { entities } = store.getState().phenyl;
    const loggedInUser = entities.patient[inserted.entity.id].origin;
    assert.deepStrictEqual(loggedInUser, {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      id: inserted.entity.id,
    });
  });

  it.skip("should be valid session", () => {
    // TODO: implement me after refinement session creation
    // const { session } = store.getState().phenyl;
  });

  it("should be use entities", () => {
    // @ts-ignore entityName cannot contain "dummy001" and "dummy002"
    store.dispatch(actions.useEntities(["patient", "dummy001", "dummy002"]));
    const { entities } = store.getState().phenyl;
    assert.strictEqual(Object.keys(entities.patient).length, 1);
    // @ts-ignore entities has dummy
    assert.deepStrictEqual(entities.dummy001, {});
    // @ts-ignore entities has dummy
    assert.deepStrictEqual(entities.dummy002, {});
  });

  it("should be shallow equal when the previous and updated entity are same value", () => {
    store.dispatch(
      actions.follow("patient", inserted.entity, inserted.versionId)
    );
    const prevState = store.getState().phenyl;
    const prevValue = LocalStateFinder.getHeadEntity(prevState, {
      entityName: "patient",
      id: inserted.entity.id,
      // TODO: needs refinement for getHeadEntity response should infer type.
    }) as PatientResponse;
    store.dispatch(
      actions.commitAndPush({
        entityName: "patient",
        id: inserted.entity.id,
        operation: { $set: { name: "Shin Suzuki" } },
      })
    );
    const nextState = store.getState().phenyl;
    const nextValue = LocalStateFinder.getHeadEntity(nextState, {
      entityName: "patient",
      id: inserted.entity.id,
      // TODO: needs refinement for getHeadEntity response should infer type.
    }) as PatientResponse;
    assert.strictEqual(prevValue, nextValue);
  });

  it("should be success logged out and store cleared", async () => {
    const { session } = store.getState().phenyl;
    if (!session) {
      assert.fail("session must be non null");
      return;
    }

    // wait for logout command
    await store.dispatch(
      actions.logout({
        entityName: "patient",
        sessionId: session.id,
        userId: inserted.entity.id,
      })
    );
    const { entities } = store.getState().phenyl;
    assert.deepStrictEqual(entities, {});
  });

  it("should check diff between origin and head in EntityInfo", () => {
    store.dispatch(
      actions.follow("patient", inserted.entity, inserted.versionId)
    );

    // Dispatch same value
    store.dispatch(
      actions.commitAndPush({
        entityName: "patient",
        id: inserted.entity.id,
        operation: { $set: { name: "Shin Suzuki" } },
      })
    );
    const updateState1 = store.getState().phenyl;
    const hasDiff1 = LocalStateFinder.hasDiffBetweenOriginAndHead(
      updateState1,
      {
        entityName: "patient",
        id: inserted.entity.id,
      }
    );
    assert.ok(hasDiff1 === false);

    // Dispatch difference difference value
    store.dispatch(
      actions.commitAndPush({
        entityName: "patient",
        id: inserted.entity.id,
        operation: { $set: { name: "Changed Shin Suzuki" } },
      })
    );
    const updateState2 = store.getState().phenyl;
    const hasDiff2 = LocalStateFinder.hasDiffBetweenOriginAndHead(
      updateState2,
      {
        entityName: "patient",
        id: inserted.entity.id,
      }
    );
    assert.ok(hasDiff2);
  });
});
