import { it, describe, afterEach, beforeEach } from "mocha";
import assert from "assert";
import { Server } from "http";
import express, { Express } from "express";
import PhenylHttpClient from "@phenyl/http-client";
import { createEntityClient } from "@phenyl/memory-db";
import PhenylRestApi from "@phenyl/rest-api";
import { createPhenylApiMiddleware, createPhenylMiddleware } from "../src";

import {
  TypeMapFromFunctionalGroup,
  EntityDefinition,
  TypeOnly,
  ReqRes,
  CustomQueryDefinition,
  CustomQuery,
  LoginCommand,
  AuthenticationResult,
  RestApiHandler,
  CustomRequestHandler,
  KvsClient,
  Session,
  EncodedHttpRequest
} from "@phenyl/interfaces";

type Diary = { id: string };
class DiaryDefinition implements EntityDefinition {
  entityName: TypeOnly<"diary">;
  entity: TypeOnly<ReqRes<Diary>>;

  constructor() {
    // @ts-ignore
    this.entityName = "";
    // @ts-ignore
    this.entity = "";
  }

  async authorize() {
    return true;
  }

  async validate() {
    return undefined;
  }
}

type GetVersionParams = { name: string };
class GetVersionDefinition implements CustomQueryDefinition {
  async authorize() {
    return true;
  }
  async validate() {
    return undefined;
  }
  async execute(query: CustomQuery<"getVersion", GetVersionParams>) {
    return {
      result: {
        name: query.params.name,
        version: "1.2.3"
      }
    };
  }
}

type EntityMap = {
  member: any;
  diary: any;
};
type Member = { id: string };
type MemberResponse = { id: string; name: string; age: number };
type MemberSessionValue = { externalId: string; ttl: number };
type Credentials = { email: string; password: string };
class MemberDefinition implements EntityDefinition {
  entityName: TypeOnly<"member">;
  entity: TypeOnly<ReqRes<Member>>;
  constructor() {
    // @ts-ignore
    this.entityName = "";
    // @ts-ignore
    this.entity = "";
  }

  async authorize() {
    return true;
  }
  async authenticate(loginCommand: LoginCommand<"member", Credentials>) {
    const { entityName, credentials } = loginCommand;

    const ret: AuthenticationResult<
      "member",
      MemberResponse,
      MemberSessionValue
    > = {
      preSession: {
        entityName,
        expiredAt: "",
        userId: credentials.email,
        externalId: "",
        ttl: 12345
      },
      user: { id: "bar", name: "John", age: 23 },
      versionId: "foo"
    };
    return ret;
  }
}

const fg = {
  users: { member: new MemberDefinition() },
  nonUsers: {
    diary: new DiaryDefinition()
  },
  customQueries: {
    getVersion: new GetVersionDefinition()
  },
  customCommands: {}
};

type MyTypeMap = TypeMapFromFunctionalGroup<typeof fg>;

const restApiHandler = new PhenylRestApi<MyTypeMap>(fg, {
  client: createEntityClient<EntityMap>(),
  sessionClient: createEntityClient<
    EntityMap
  >().createSessionClient() as KvsClient<Session<"member", MemberSessionValue>>
});

describe("createPhenylApiMiddleware", () => {
  let server: Server;
  let app: Express;
  beforeEach(() => {
    app = express();
    server = app.listen(3333);
  });

  afterEach(() => {
    server.close();
  });

  it("can handle Phenyl API request", async () => {
    app.use(createPhenylApiMiddleware(restApiHandler as RestApiHandler));
    const client = new PhenylHttpClient<MyTypeMap>({
      url: "http://localhost:3333"
    });
    const queryResult = await client.runCustomQuery({
      name: "getVersion",
      params: { name: "foo" }
    });
    assert(queryResult.result && queryResult.result.version === "1.2.3");
  });

  it("can handle non-API request by express", async () => {
    app.use(createPhenylApiMiddleware(restApiHandler as RestApiHandler));
    app.get("/foo/bar", (req, res) => {
      res.send(`Hello, Express! I'm ${req.query.name}.`);
    });
    const client = new PhenylHttpClient<MyTypeMap>({
      url: "http://localhost:3333"
    });
    const text = await client.requestText("/foo/bar?name=Shin");
    assert(text === "Hello, Express! I'm Shin.");
  });
  it.skip("can handle Phenyl API request with path modifier", async () => {
    // TODO
  });
  it.skip("can handle non-API request with path modifier", async () => {
    // TODO
  });
});

describe("createPhenylMiddleware", () => {
  const customRequestHandler = async (httpReq: EncodedHttpRequest) => {
    if (!httpReq.qsParams || !httpReq.qsParams.name) {
      return {
        statusCode: 401,
        body: "No name given",
        headers: { "Content-Type": "text/plain" }
      };
    }

    return {
      statusCode: 200,
      body: `Hi, Phenyl Custom Request Handler. I'm ${httpReq.qsParams.name}`,
      headers: { "Content-Type": "text/plain" }
    };
  };
  let server: Server;
  let app: Express;
  beforeEach(() => {
    app = express();
    server = app.listen(3333);
  });

  afterEach(() => {
    server.close();
  });

  it("can handle Phenyl API request", async () => {
    app.use(
      createPhenylMiddleware(
        { restApiHandler, customRequestHandler } as {
          restApiHandler: RestApiHandler;
          customRequestHandler: CustomRequestHandler<MyTypeMap>;
        },
        /\/api\/.*|\/foo\/bar$/
      )
    );
    const client = new PhenylHttpClient<MyTypeMap>({
      url: "http://localhost:3333"
    });
    const queryResult = await client.runCustomQuery({
      name: "getVersion",
      params: { name: "bar" }
    });

    assert(queryResult.result && queryResult.result.version === "1.2.3");
  });

  it("can handle non-API request by Phenyl Custom Request", async () => {
    app.use(
      createPhenylMiddleware(
        { restApiHandler, customRequestHandler } as {
          restApiHandler: RestApiHandler;
          customRequestHandler: CustomRequestHandler<MyTypeMap>;
        },
        /\/api\/.*|\/foo\/bar$/
      )
    );
    app.get("/foo/bar", (req, res) => {
      res.send(`Hello, Express! I'm ${req.query.name}.`);
    });
    const client = new PhenylHttpClient<MyTypeMap>({
      url: "http://localhost:3333"
    });
    const text = await client.requestText("/foo/bar?name=Shin");
    assert(text === "Hi, Phenyl Custom Request Handler. I'm Shin");
  });

  it("can handle non-API request by express", async () => {
    app.use(
      createPhenylMiddleware(
        { restApiHandler, customRequestHandler } as {
          restApiHandler: RestApiHandler;
          customRequestHandler: CustomRequestHandler<MyTypeMap>;
        },
        /\/api\/.*|\/foo\/bar$/
      )
    );
    app.get("/foo/bar/baz", (req, res) => {
      // This won't be called.
      res.send(`Hello, Express! I'm ${req.query.name}.`);
    });

    const client = new PhenylHttpClient<MyTypeMap>({
      url: "http://localhost:3333"
    });
    const text = await client.requestText("/foo/bar/baz?name=Shin");
    assert(text === "Hello, Express! I'm Shin.");
  });

  it.skip('can handle "/explorer" by default', async () => {
    // TODO
  });
  it.skip("can handle Phenyl API request with path modifier", async () => {
    // TODO
  });
  it.skip("can handle non-API request with path modifier", async () => {
    // TODO
  });
});
