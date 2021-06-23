import assert from "assert";
import { createVersionDiff } from "../src/create-version-diff";

describe("createVersionDiff", () => {
  it("returns empty array if type of response data is error", () => {
    const reqData = {
      method: "find" as const,
      payload: {
        entityName: "",
        where: {},
      },
    };
    const resData = {
      type: "error" as const,
      payload: {
        ok: 0 as const,
        at: "server" as const,
        type: "BadRequest" as const,
        message: "",
      },
    };
    const versionDiff = createVersionDiff(reqData, resData);

    assert.deepStrictEqual(versionDiff, []);
  });
  describe("method of reqData is updateById", () => {
    it("returns versionDiff", () => {
      const reqData = {
        method: "updateById" as const,
        payload: {
          entityName: "",
          id: "",
          operation: {},
        },
      };
      const resData = {
        type: "updateById" as const,
        payload: {
          n: 1,
          versionId: "versionId",
          prevVersionId: "prevVersionId",
        },
      };
      const versionDiff = createVersionDiff(reqData, resData);

      assert.deepStrictEqual(versionDiff, [
        {
          entityName: "",
          id: "",
          versionId: "versionId",
          prevVersionId: "prevVersionId",
        },
      ]);
    });
  });

  describe("method of reqData is updateMulti", () => {
    it("returns versionDiff", () => {
      const reqData = {
        method: "updateMulti" as const,
        payload: {
          entityName: "",
          where: {},
          operation: {},
        },
      };
      const resData = {
        type: "updateMulti" as const,
        payload: {
          n: 1,
          versionsById: { user1: "versionId" },
          prevVersionsById: { user1: "prevVersionId" },
        },
      };
      const versionDiff = createVersionDiff(reqData, resData);

      assert.deepStrictEqual(versionDiff, [
        {
          entityName: "",
          id: "user1",
          operation: {},
          versionId: "versionId",
          prevVersionId: "prevVersionId",
        },
      ]);
    });
  });

  describe("method of reqData is updateAndGet", () => {
    it("returns versionDiff", () => {
      const reqData = {
        method: "updateAndGet" as const,
        payload: {
          entityName: "",
          id: "",
          operation: {},
        },
      };
      const resData = {
        type: "updateAndGet" as const,
        payload: {
          n: 1,
          entity: {
            id: "",
          },
          versionId: "versionId",
          prevVersionId: "prevVersionId",
        },
      };
      const versionDiff = createVersionDiff(reqData, resData);

      assert.deepStrictEqual(versionDiff, [
        {
          entityName: "",
          id: "",
          versionId: "versionId",
          prevVersionId: "prevVersionId",
        },
      ]);
    });
  });

  describe("method of reqData is updateAndFetch", () => {
    it("returns versionDiff", () => {
      const reqData = {
        method: "updateAndFetch" as const,
        payload: {
          entityName: "",
          operation: {},
          where: {},
        },
      };
      const resData = {
        type: "updateAndFetch" as const,
        payload: {
          n: 1,
          versionsById: { user1: "versionId" },
          prevVersionsById: { user1: "prevVersionId" },
          entities: [{ id: "user1" }],
        },
      };
      const versionDiff = createVersionDiff(reqData, resData);

      assert.deepStrictEqual(versionDiff, [
        {
          entityName: "",
          id: "user1",
          versionId: "versionId",
          prevVersionId: "prevVersionId",
          operation: {},
        },
      ]);
    });
  });

  describe("method of reqData is push", () => {
    it("returns versionDiff", () => {
      const reqData = {
        method: "push" as const,
        payload: {
          entityName: "",
          id: "user1",
          operations: [{}],
          versionId: "",
        },
      };
      const resData = {
        type: "push" as const,
        payload: {
          n: 1,
          versionId: "versionId",
          prevVersionId: "prevVersionId",
          hasEntity: 1 as const,
          entity: { id: "user1" },
        },
      };
      const versionDiff = createVersionDiff(reqData, resData);

      assert.deepStrictEqual(versionDiff, [
        {
          entityName: "",
          id: "user1",
          versionId: "versionId",
          prevVersionId: "prevVersionId",
        },
      ]);
    });
  });
});
