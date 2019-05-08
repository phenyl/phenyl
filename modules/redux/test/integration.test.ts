import http from "http";
import { it, describe, before, after } from "mocha";
import { createStore, combineReducers, applyMiddleware } from "redux";
import PhenylHttpServer from "../../http-server";
import PhenylRestApi from "../../rest-api";
import PhenylHttpClient from "../../http-client";
import {
  GeneralTypeMap,
  KvsClient,
  Session,
  PhenylAction,
  LocalState,
  GetCommandResult,
  ReqRes
} from "../..//interfaces";
import { createEntityClient } from "../..//memory-db";
import { StandardUserDefinition } from "../../standards";
import assert from "assert";

import { PhenylRedux, LocalStateFinder } from "../src";
import { PhenylReduxModule } from "../src/phenyl-redux-module";

type PlainPatient = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type PatientRequest = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type PatientResponse = {
  id: string;
  name: string;
  email: string;
};

type Credentials = {
  email: string;
  password: string;
};

type MyAuthSetting = {
  credentials: Credentials;
  options: {};
};

type MyEntityMap = {
  patient: PlainPatient;
};
type MyGeneralReqResEntityMap = {
  patient: ReqRes<PatientRequest, PatientResponse>;
};

type MyAuthCommandMap = {
  patient: MyAuthSetting;
};

type MemberSessionValue = { externalId: string; ttl: number };

interface MyTypeMap extends GeneralTypeMap {
  entities: MyGeneralReqResEntityMap;
  customQueries: {};
  customCommands: {};
  auths: {
    patient: MyAuthSetting;
  };
}

const memoryClient = createEntityClient<MyEntityMap>();
// TODO: need refinement
const sessionClient = memoryClient.createSessionClient() as KvsClient<
  Session<"patient", MemberSessionValue>
>;

class PatientDefinition extends StandardUserDefinition<
  MyGeneralReqResEntityMap,
  MyAuthSetting
> {
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

const phenylRedux: PhenylRedux<MyTypeMap> = new PhenylRedux();
const { reducer } = phenylRedux;
const httpClient: PhenylHttpClient<MyTypeMap> = new PhenylHttpClient({
  url: "http://localhost:8080"
});

type Store = {
  phenyl: LocalState<MyGeneralReqResEntityMap, MyAuthCommandMap>;
};

const store = createStore<Store, PhenylAction, {}, {}>(
  combineReducers({ phenyl: reducer }),
  applyMiddleware(
    phenylRedux.createMiddleware({
      client: httpClient,
      storeKey: "phenyl"
    })
  )
);

let server: PhenylHttpServer<MyTypeMap>;
before(() => {
  const restApiHandler: PhenylRestApi<MyTypeMap> = new PhenylRestApi(
    functionalGroup,
    {
      client: memoryClient,
      sessionClient
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
      PhenylReduxModule.follow("patient", inserted.entity, inserted.versionId)
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
      PhenylReduxModule.login({
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
    store.dispatch(
      PhenylReduxModule.useEntities(["patient", "dummy001", "dummy002"])
    );
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
      PhenylReduxModule.logout({
        entityName: "patient",
        sessionId: session.id,
        userId: inserted.entity.id
      })
    );
    const { entities } = store.getState().phenyl;
    assert.deepStrictEqual(entities, {});
  });
});
