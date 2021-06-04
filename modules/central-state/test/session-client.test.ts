/* eslint-env mocha */
import { PhenylMemoryDbClient } from "@phenyl/memory-db";
import assert from "assert";
import { PhenylSessionClient } from "../src/session-client";
import * as sinon from "sinon";

const expiredSession = {
  id: "expiredSession",
  userId: "expiredUser",
  entityName: "user",
  expiredAt: new Date(new Date().getTime() - 1000).toISOString(),
};

const notExpiredSession = {
  id: "notExpiredSession",
  userId: "notExpiredUser",
  entityName: "user",
  expiredAt: new Date(new Date().getTime() + 1000).toISOString(),
};
const entityState = {
  pool: {
    _PhenylSession: {
      notExpiredSession,
      expiredSession,
    },
  },
};

const dbClient = new PhenylMemoryDbClient({
  entityState,
});

// @ts-ignore
const sessionClient = new PhenylSessionClient(dbClient);

describe("PhenylSessionClient", () => {
  describe("get", () => {
    it("returns null if id is not given", async () => {
      const session = await sessionClient.get();
      assert.deepStrictEqual(session, undefined);
    });
    it("returns null if session of given id is expired", async () => {
      const session = await sessionClient.get("expiredSession");
      assert.deepStrictEqual(session, undefined);
    });
    it("returns null if dbClient.get is failed", async () => {
      const stub = sinon.stub(dbClient, "get");
      stub.throws(() => ({
        type: "NetworkFailed",
      }));
      const session = await sessionClient.get("notExpiredSession");
      assert.deepStrictEqual(session, undefined);

      stub.restore();
    });
    it("returns session", async () => {
      const session = await sessionClient.get("notExpiredSession");
      assert.strictEqual(session!.id, "notExpiredSession");
      assert.strictEqual(session!.userId, "notExpiredUser");
    });
  });

  describe("create", () => {
    it("creates session", async () => {
      const preSession = {
        id: "newSession",
        entityName: "user",
        userId: "user3",
        expiredAt: new Date().toISOString(),
      };
      const session = await sessionClient.create(preSession);
      assert.deepStrictEqual(session, preSession);
    });

    it("creates session with id if given session doesn't have id", async () => {
      const preSession = {
        entityName: "user",
        userId: "user3",
        expiredAt: new Date().toISOString(),
      };
      const session = await sessionClient.create(preSession);
      assert.strictEqual(session.hasOwnProperty("id"), true);
    });
  });

  describe("set", () => {
    it("sets given session", async () => {
      const preSession = {
        id: "newSession",
        entityName: "user",
        userId: "user3",
        expiredAt: new Date().toISOString(),
      };
      await sessionClient.create(preSession);
      const sessionInDbClient = await dbClient.get({
        entityName: "_PhenylSession",
        id: preSession.id,
      });
      assert.deepStrictEqual(sessionInDbClient, preSession);
    });
  });

  describe("delete", () => {
    it("returns false if id is not given", async () => {
      const deleted = await sessionClient.delete(null);
      assert.strictEqual(deleted, false);
    });
    it("returns true if session of given id is deleted", async () => {
      const deleted = await sessionClient.delete("notExpiredSession");
      assert.strictEqual(deleted, true);
    });
  });
});
