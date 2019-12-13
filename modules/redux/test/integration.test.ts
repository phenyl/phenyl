import http from "http";
import { it, describe, before, after } from "mocha";
import { createStore, combineReducers, applyMiddleware } from "redux";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import {
  GeneralTypeMap,
  GeneralAction,
  LocalState,
  GetCommandResult,
  AuthCommandMapOf,
  ResponseEntityMapOf
} from "../..//interfaces";
import { createEntityClient } from "@phenyl/memory-db";
import { StandardUserDefinition } from "@phenyl/standards";
import assert from "assert";

import { useRedux, LocalStateFinder } from "../src";

type PlainPatient = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type PatientRequest = PlainPatient;

type PatientResponse = PlainPatient;

type MyEntityRestInfoMap = {
  patient: {
    request: PatientRequest;
    response: PatientResponse;
  };
};

interface MyTypeMap extends GeneralTypeMap {
  entities: MyEntityRestInfoMap;
  customQueries: {};
  customCommands: {};
  auths: {
    patient: {
      credentials: {
        email: string;
        password: string;
      };
      session: { externalId: string; ttl: number };
    };
  };
}

const memoryClient = createEntityClient<ResponseEntityMapOf<MyTypeMap>>();
const sessionClient = memoryClient.createSessionClient<
  AuthCommandMapOf<MyTypeMap>
>();

class PatientDefinition extends StandardUserDefinition {
  constructor() {
    super({
      accountPropName: "email",
      passwordPropName: "password",
      entityClient: memoryClient,
      ttl: 24 * 3600
    });
  }

  authorize() {
    return Promise.resolve(true);
  }
}

const functionalGroup = {
  customQueries: {},
  customCommands: {},
  users: {
    patient: new PatientDefinition()
  },
  nonUsers: {}
};

const httpClient: PhenylHttpClient<MyTypeMap> = new PhenylHttpClient({
  url: "http://localhost:8080"
});

const { reducer, middleware, actions } = useRedux({
  client: httpClient,
  storeKey: "phenyl"
});

type Store = {
  phenyl: LocalState<MyEntityRestInfoMap, AuthCommandMapOf<MyTypeMap>>;
};

const store = createStore<Store, GeneralAction, {}, {}>(
  combineReducers({ phenyl: reducer }),
  applyMiddleware(middleware)
);

let server: PhenylHttpServer;
before(() => {
  const restApiHandler: PhenylRestApi<MyTypeMap> = new PhenylRestApi(
    functionalGroup,
    {
      entityClient: memoryClient
    }
  );

  server = new PhenylHttpServer(http.createServer(), {
    restApiHandler
  });
  server.listen(8080);
});

after(() => {
  server.close();
});

describe("Integration", () => {
  let inserted: GetCommandResult<PatientResponse>;
  it("should be inserted", async () => {
    // TODO: need refinement. Should preSession be created by others?
    const preSession = await sessionClient.create({
      entityName: "patient",
      expiredAt: "",
      userId: "shinout@example.com",
      externalId: "",
      ttl: 12345
    });

    inserted = await httpClient.insertAndGet(
      {
        entityName: "patient",
        value: {
          name: "Shin Suzuki",
          email: "shinout@example.com",
          password: "shin123"
        }
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
      id: inserted.entity.id
      // TODO: needs refinement for getHeadEntity response should infer type.
    }) as PatientResponse;
    assert.deepStrictEqual(value, {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      id: inserted.entity.id
    });
  });

  it("should be success to login", async () => {
    // wait for login command
    await store.dispatch(
      actions.login({
        entityName: "patient",
        credentials: {
          email: "shinout@example.com",
          password: "shin123"
        }
      })
    );
    const { entities } = store.getState().phenyl;
    const loggedInUser = entities.patient[inserted.entity.id].origin;
    assert.deepStrictEqual(loggedInUser, {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      id: inserted.entity.id
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
        userId: inserted.entity.id
      })
    );
    const { entities } = store.getState().phenyl;
    assert.deepStrictEqual(entities, {});
  });
});
