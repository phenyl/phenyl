import http from "http";
import { it, describe, before, after } from "mocha";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import {
  GeneralTypeMap,
  Session,
  AuthCommandMapOf,
  ResponseEntityMapOf
} from "@phenyl/interfaces";
import { createEntityClient } from "@phenyl/memory-db";
import { StandardUserRestApiDefinition } from "../src";
import assert from "assert";

type PlainPatient = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type PatientRequest = PlainPatient;

type PatientResponse = PlainPatient;

type MyGeneralEntityRestInfoMap = {
  patient: {
    request: PatientRequest;
    response: PatientResponse;
  };
};

interface MyTypeMap extends GeneralTypeMap {
  entities: MyGeneralEntityRestInfoMap;
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

class PatientDefinition extends StandardUserRestApiDefinition {
  constructor() {
    super({
      accountPropName: "email",
      passwordPropName: "password",
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

let server: PhenylHttpServer;
before(() => {
  const restApiHandler: PhenylRestApi<MyTypeMap> = new PhenylRestApi(
    functionalGroup,
    {
      entityClient: memoryClient,
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

describe("Phenyl Standards with Authentication", () => {
  const client: PhenylHttpClient<MyTypeMap> = new PhenylHttpClient({
    url: "http://localhost:8080"
  });

  let insertedEntity: PatientResponse;
  it(" should be inserted first user", async () => {
    // TODO: need refinement. Should preSession be created by others?
    const preSession = await sessionClient.create({
      entityName: "patient",
      expiredAt: "",
      userId: "shinout@example.com",
      externalId: "",
      ttl: 12345
    });

    const inserted = await client.insertAndGet(
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

    insertedEntity = inserted.entity;
    assert.strictEqual(insertedEntity.name, "Shin Suzuki");
    assert.strictEqual(insertedEntity.email, "shinout@example.com");
  });

  let loggedInUser: PatientResponse;
  let loggedInSession: Session;
  it("can login by inserted user", async () => {
    // TODO: loginCommandResult has hashed password. It's not good.
    const loginCommandResult = await client.login({
      entityName: "patient",
      credentials: {
        email: "shinout@example.com",
        password: "shin123"
      }
    });

    if (
      !loginCommandResult ||
      !loginCommandResult.user ||
      !loginCommandResult.session
    ) {
      assert.fail("loginCommandResult must not be null", loginCommandResult);
    }
    loggedInUser = loginCommandResult.user as PatientResponse;
    loggedInSession = loginCommandResult.session as Session;
    assert.deepStrictEqual(loggedInUser, {
      name: "Shin Suzuki",
      email: "shinout@example.com",
      id: insertedEntity.id
    });
  });

  it("can updateAndGet by loggedInSession", async () => {
    const updated = await client.updateAndGet(
      {
        entityName: "patient",
        id: insertedEntity.id,
        operation: { $set: { email: "example@example.com" } }
      },
      loggedInSession.id
    );
    const { entity: updatedEntity } = updated;
    assert.strictEqual(updatedEntity.name, "Shin Suzuki");
    assert.strictEqual(updatedEntity.email, "example@example.com");
  });
});
