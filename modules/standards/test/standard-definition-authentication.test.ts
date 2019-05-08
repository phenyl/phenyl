import http from "http";
import { it, describe, before, after } from "mocha";
import PhenylHttpServer from "@phenyl/http-server";
import PhenylRestApi from "@phenyl/rest-api";
import PhenylHttpClient from "@phenyl/http-client";
import { GeneralTypeMap, KvsClient, Session } from "@phenyl/interfaces";
import { createEntityClient } from "@phenyl/memory-db";
import { StandardUserDefinition } from "../src";
import assert from "assert";

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
  patient: {
    request: PatientRequest;
    response: PatientResponse;
  };
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
