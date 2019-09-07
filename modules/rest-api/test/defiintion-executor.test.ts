import {
  GeneralAuthenticationResult,
  CustomCommandApiDefinition,
  CustomQueryApiDefinition,
  EntityRestApiDefinition,
  GeneralCustomCommandRequestData,
  GeneralCustomQueryRequestData,
  GeneralRequestData,
  GeneralResponseData,
  GeneralQueryResult,
  UserRestApiDefinition,
  Entity,
  GeneralDirectRestApiClient,
  GeneralEntityClient,
  GeneralSessionClient,
  GeneralDbClient
} from "@phenyl/interfaces";
/* eslint-env mocha */
import {
  CustomCommandApiDefinitionExecutor,
  CustomQueryApiDefinitionExecutor,
  EntityRestApiDefinitionExecutor,
  UserRestApiDefinitionExecutor
} from "../src/definition-executor";

import assert from "assert";

// @ts-ignore mocking EntityClient
const entityClientMock: GeneralEntityClient = { find: async () => queryResult };
// @ts-ignore mocking DirectRestApiClient
const directClientMock: GeneralDirectRestApiClient = {
  find: async () => queryResult
};
const sessionClientMock: GeneralSessionClient = {
  // @ts-ignore mocking SessionClient
  get: async () => null,
  // @ts-ignore mocking SessionClient
  create: async () => ({})
};

const settingsMock = {
  entityClient: entityClientMock,
  sessionClient: sessionClientMock,
  directClient: directClientMock,
  dbClient: {} as GeneralDbClient
};

const findReqData: GeneralRequestData = {
  method: "find",
  payload: { entityName: "foo", where: {} }
};

const findReqData2: GeneralRequestData = {
  method: "find",
  payload: { entityName: "bar", where: {} }
};

const queryResult: GeneralQueryResult = { entities: [], versionsById: {} };
const findResData: GeneralResponseData = {
  type: "find",
  payload: {
    entities: [{ id: "foo", name: "bar" } as Entity],
    versionsById: {}
  }
};

describe("EntityRestApiDefinitionExecutor", () => {
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        { authorize: async () => false } as EntityRestApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        settingsMock
      );
      await executor.validate(findReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const executor = new EntityRestApiDefinitionExecutor(
        {
          validate: async () => {
            counter++;
            return;
          }
        } as EntityRestApiDefinition,
        settingsMock
      );
      await executor.validate(findReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        { normalize: async () => findReqData2 } as EntityRestApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData2);
    });
  });

  describe("execute()", () => {
    it("should run the client's method when a definition without wrapExecution() method is given", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        {} as EntityRestApiDefinition,
        settingsMock
      );
      const result = await executor.execute(findReqData);
      assert.deepStrictEqual(result, { type: "find", payload: queryResult });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const executor = new EntityRestApiDefinitionExecutor(
        { wrapExecution: async () => findResData } as EntityRestApiDefinition,
        settingsMock
      );
      const result = await executor.execute(findReqData);
      assert.strictEqual(result, findResData);
    });
  });
});

describe("UserRestApiDefinitionExecutor", () => {
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        { authenticate, authorize: async () => false } as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(findReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        settingsMock
      );
      await executor.validate(findReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate,
          validate: async () => {
            counter++;
            return;
          }
        } as UserRestApiDefinition,
        settingsMock
      );
      await executor.validate(findReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate,
          normalize: async () => findReqData2
        } as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(findReqData);
      assert.strictEqual(result, findReqData2);
    });
  });

  describe("execute()", () => {
    it("should run the client's method when a definition without wrapExecution() method is given", async () => {
      const executor = new UserRestApiDefinitionExecutor(
        {} as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.execute(findReqData);
      assert.deepStrictEqual(result, { type: "find", payload: queryResult });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const authenticate = async () => ({} as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate,
          wrapExecution: async () => findResData
        } as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.execute(findReqData);
      assert.strictEqual(result, findResData);
    });

    it("should run definition's authenticate() method when LoginRequestData is given", async () => {
      const authenticate = async () =>
        ({ versionId: "abcd" } as GeneralAuthenticationResult);
      const executor = new UserRestApiDefinitionExecutor(
        {
          authenticate
        } as UserRestApiDefinition,
        settingsMock
      );
      const result = await executor.execute({
        method: "login",
        payload: { entityName: "xxx", credentials: {} }
      });
      // @ts-ignore
      assert.strictEqual(result.payload.versionId, "abcd");
    });
  });
});

describe("CustomQueryApiDefinitionExecutor", () => {
  const customQueryReqData: GeneralCustomQueryRequestData = {
    method: "runCustomQuery",
    payload: { name: "hogefuga", params: { foo: 345 } }
  };
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(customQueryReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          authorize: async () => false
        } as CustomQueryApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(customQueryReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryApiDefinition,
        settingsMock
      );
      await executor.validate(customQueryReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const executor = new CustomQueryApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          validate: async () => {
            counter++;
            return;
          }
        } as CustomQueryApiDefinition,
        settingsMock
      );
      await executor.validate(customQueryReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(customQueryReqData);
      assert.strictEqual(result, customQueryReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          normalize: async () =>
            Object.assign({}, customQueryReqData, { ex: 1 })
        } as CustomQueryApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(customQueryReqData);
      assert.deepStrictEqual(
        result,
        Object.assign({}, customQueryReqData, { ex: 1 })
      );
    });
  });

  describe("execute()", () => {
    it("should return the result of exexute() when a given definition has no wrapExecution() method", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        { execute: async () => ({ result: 123 }) } as CustomQueryApiDefinition,
        settingsMock
      );
      const result = await executor.execute(customQueryReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomQuery",
        payload: { result: 123 }
      });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const executor = new CustomQueryApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          wrapExecution: async () => ({
            type: "runCustomQuery",
            payload: { result: 345 }
          })
        } as CustomQueryApiDefinition,
        settingsMock
      );
      const result = await executor.execute(customQueryReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomQuery",
        payload: { result: 345 }
      });
    });
  });
});

describe("CustomCommandApiDefinitionExecutor", () => {
  const customCommandReqData: GeneralCustomCommandRequestData = {
    method: "runCustomCommand",
    payload: { name: "hogefuga", params: { foo: 345 } }
  };
  describe("authorize()", () => {
    it("should return true when a definition without authorize() method is given", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 })
        } as CustomCommandApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(customCommandReqData);
      assert.strictEqual(result, true);
    });

    it("should return the result of a given definition's authorize() method when it exists", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          authorize: async () => false
        } as CustomCommandApiDefinition,
        settingsMock
      );
      const result = await executor.authorize(customCommandReqData);
      assert.strictEqual(result, false);
    });
  });

  describe("validate()", () => {
    it("should do nothing when a definition without validate() method is given", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 })
        } as CustomCommandApiDefinition,
        settingsMock
      );
      await executor.validate(customCommandReqData);
      assert.ok(true);
    });

    it("should run a given definition's validate() method when it exists", async () => {
      let counter = 0;
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          validate: async () => {
            counter++;
            return;
          }
        } as CustomCommandApiDefinition,
        settingsMock
      );
      await executor.validate(customCommandReqData);
      assert.strictEqual(counter, 1);
    });
  });

  describe("normalize()", () => {
    it("should return the same RequestData when a definition without normalize() method is given", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 })
        } as CustomCommandApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(customCommandReqData);
      assert.strictEqual(result, customCommandReqData);
    });

    it("should return the result of a given definition's normalize() method when it exists", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          normalize: async () =>
            Object.assign({}, customCommandReqData, { ex: 1 })
        } as CustomCommandApiDefinition,
        settingsMock
      );
      const result = await executor.normalize(customCommandReqData);
      assert.deepStrictEqual(
        result,
        Object.assign({}, customCommandReqData, { ex: 1 })
      );
    });
  });

  describe("execute()", () => {
    it("should return the result of exexute() when a given definition has no wrapExecution() method", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 })
        } as CustomCommandApiDefinition,
        settingsMock
      );
      const result = await executor.execute(customCommandReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomCommand",
        payload: { result: 123 }
      });
    });

    it("should return the wrapped result of a given definition's wrapExecution() method when it exists", async () => {
      const executor = new CustomCommandApiDefinitionExecutor(
        {
          execute: async () => ({ result: 123 }),
          wrapExecution: async () => ({
            type: "runCustomCommand",
            payload: { result: 345 }
          })
        } as CustomCommandApiDefinition,
        settingsMock
      );
      const result = await executor.execute(customCommandReqData);
      assert.deepStrictEqual(result, {
        type: "runCustomCommand",
        payload: { result: 345 }
      });
    });
  });
});
