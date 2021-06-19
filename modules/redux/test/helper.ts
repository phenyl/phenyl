import http from "http";
import { createStore, combineReducers, applyMiddleware } from "redux";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import {
  GeneralTypeMap,
  ActionWithTypeMap,
  LocalState,
  AuthCommandMapOf,
  ResponseEntityMapOf,
} from "../../interfaces";
import { createEntityClient as createMemoryClient } from "@phenyl/memory-db";
import { StandardUserDefinition } from "@phenyl/standards";
import { createRedux } from "../src";

export const PORT = 8080;
const HTTP_CLIENT_URL = `http://localhost`;

type PlainPatient = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type PatientResponse = PlainPatient;
export type PatientRequest = PlainPatient;

type MyEntityRestInfoMap = {
  patient: {
    request: PatientRequest;
    response: PatientResponse;
  };
};

type Store = {
  phenyl: LocalState<MyEntityRestInfoMap, AuthCommandMapOf<MyTypeMap>>;
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

class PatientDefinition extends StandardUserDefinition {
  constructor(entityClient: ReturnType<typeof createDbClient>) {
    super({
      accountPropName: "email",
      passwordPropName: "password",
      entityClient,
      ttl: 24 * 3600,
    });
  }

  authorize() {
    return Promise.resolve(true);
  }
}

export const createHttpClient = (port: number): PhenylHttpClient<MyTypeMap> => {
  return new PhenylHttpClient({
    url: `${HTTP_CLIENT_URL}:${port}`,
  });
};

export const createPhenylRedux = (client: PhenylHttpClient<MyTypeMap>) => {
  const { reducer, middleware, actions } = createRedux({
    client,
    storeKey: "phenyl",
  });
  const store = createStore<
    Store,
    ActionWithTypeMap<MyTypeMap, "patient", "patient">,
    {},
    {}
  >(combineReducers({ phenyl: reducer }), applyMiddleware(middleware));
  return { store, actions };
};

export const createDbClient = () => {
  return createMemoryClient<ResponseEntityMapOf<MyTypeMap>>();
};

export const createSessionClient = (
  entityClient: ReturnType<typeof createDbClient>
) => {
  return entityClient.createSessionClient<AuthCommandMapOf<MyTypeMap>>();
};

export const createServer = (dbClient: ReturnType<typeof createDbClient>) => {
  const functionalGroup = {
    customQueries: {},
    customCommands: {},
    users: {
      patient: new PatientDefinition(dbClient),
    },
    nonUsers: {},
  };

  const restApiHandler: PhenylRestApi<MyTypeMap> = new PhenylRestApi<MyTypeMap>(
    functionalGroup,
    {
      entityClient: dbClient,
    }
  );

  return new PhenylHttpServer(http.createServer(), {
    restApiHandler,
  });
};
