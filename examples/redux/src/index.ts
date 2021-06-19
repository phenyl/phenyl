/* eslint-disable no-console */
/* eslint-env node */
import * as assert from "assert";
import * as http from "http";
import { LocalStateFinder } from "@phenyl/redux";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import { createEntityClient } from "@phenyl/memory-db";
import { createMiddleware, reducer, actions } from "@phenyl/redux";
import { createStore, applyMiddleware, combineReducers } from "redux";
import {
  UserDefinition,
  ThisTypeMap,
  AuthCommandMap,
  ThisEntityMap,
} from "./definitions";
import { LocalState } from "@phenyl/interfaces";

function setUpServer() {
  const entityClient = createEntityClient();
  const sessionClient = entityClient.createSessionClient();

  const functionalGroup = {
    customQueries: {},
    customCommands: {},
    users: {
      user: new UserDefinition(entityClient),
    },
    nonUsers: {},
  };

  const restApiHandler = new PhenylRestApi<ThisTypeMap>(functionalGroup, {
    entityClient,
    sessionClient,
  });
  const server = new PhenylHttpServer(http.createServer(), { restApiHandler });
  server.listen(8080);
}

function createReduxStore(client) {
  type State = { phenyl: LocalState<ThisEntityMap, AuthCommandMap> };
  return createStore<State>(
    combineReducers({ phenyl: reducer }),
    applyMiddleware(
      createMiddleware<ThisTypeMap>({ client, storeKey: "phenyl" })
    )
  );
}

const wait = async (msec: number) => new Promise((ok) => setTimeout(ok, msec));

/**
 * Example of server and local state synchronization.
 *
 * 1. Set up a server and http client.
 * 2. Insert user data into the server.
 * 3. Follow local state to server state.
 * 4. Log in as the inserted user.
 * 5. Logout as the user.
 */
async function main() {
  // 1. Set up a server and http client.
  setUpServer();

  const client = new PhenylHttpClient<ThisTypeMap>({
    url: "http://localhost:8080",
  });
  const store = createReduxStore(client);

  // 2. Insert user data into the server.
  const inserted = await client.insertAndGet({
    entityName: "user",
    value: {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      password: "shin123",
    },
  });

  // 3. Follow local state to server state.
  store.dispatch(actions.follow("user", inserted.entity, inserted.versionId));

  const state = store.getState().phenyl;
  const value = LocalStateFinder.getHeadEntity<ThisTypeMap, "user">(state, {
    entityName: "user",
    id: inserted.entity.id,
  });

  console.log(value.email);
  console.log(JSON.stringify(state, null, 2));

  // 4. Log in as the inserted user.
  store.dispatch(
    actions.login({
      entityName: "user",
      credentials: {
        email: "shinout@example.com",
        password: "shin123",
      },
    })
  );
  await wait(10);
  console.log(JSON.stringify(store.getState().phenyl, null, 2));

  const { session } = store.getState().phenyl;
  if (!session) throw new Error("No session");

  // Add dummy001 and dummy002 properties to entity
  store.dispatch(actions.useEntities(["user", "dummy001", "dummy002"]));
  const entities = store.getState().phenyl.entities;

  console.log(entities);
  assert(Object.keys(entities.user).length === 1);

  // @ts-ignore any Property 'dummy001' does not exist on type 'LocalEntityState<ThisEntityMap>'.
  const { dummy001, dummy002 } = entities;
  assert(dummy001);
  assert(dummy002);
  assert(Object.keys(dummy001).length === 0);
  assert(Object.keys(dummy002).length === 0);

  // 5. Logout as the user.
  store.dispatch(
    actions.logout({
      entityName: "user",
      sessionId: session.id,
      userId: inserted.entity.id,
    })
  );
  await wait(10);
  console.log(JSON.stringify(store.getState().phenyl, null, 2));

  process.exit();
}

main().catch((e) => {
  console.log(e);
  process.exit();
});
