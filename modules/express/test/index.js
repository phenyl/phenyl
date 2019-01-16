// @flow

import { it, describe, afterEach, beforeEach } from "mocha";
import assert from "power-assert";
import express from "express";
import PhenylHttpClient from "@phenyl/http-client";
import { createEntityClient } from "phenyl-memory-db/jsnext";
import PhenylRestApi from "phenyl-rest-api/jsnext";
import {
  createPhenylApiMiddleware,
  createPhenylMiddleware
} from "../src/index.js";

const fg = {
  users: {},
  nonUsers: {
    diary: {
      authorization: async () => true,
      validation: async () => undefined
    }
  },
  customQueries: {
    getVersion: {
      authorization: async () => true,
      validation: async () => undefined,
      execution: async req => {
        return { ok: 1, result: { name: req.name, version: "1.2.3" } };
      }
    }
  },
  customCommands: {}
};

const restApiHandler = PhenylRestApi.createFromFunctionalGroup(fg, {
  client: createEntityClient()
});

describe("createPhenylApiMiddleware", function() {
  let server;
  let app;
  beforeEach(() => {
    app = express();
    server = app.listen(3333);
  });

  afterEach(() => {
    server.close();
  });

  it("can handle Phenyl API request", async function() {
    app.use(createPhenylApiMiddleware(restApiHandler));
    const client = new PhenylHttpClient({ url: "http://localhost:3333" });
    const queryResult = await client.runCustomQuery({
      name: "getVersion",
      params: {}
    });
    assert(queryResult.ok === 1);
    assert(queryResult.result && queryResult.result.version === "1.2.3");
  });

  it("can handle non-API request by express", async function() {
    app.use(createPhenylApiMiddleware(restApiHandler));
    // $FlowIssue(express-valid-get-function)
    app.get("/foo/bar", (req, res) => {
      res.send(`Hello, Express! I'm ${req.query.name}.`);
    });
    const client = new PhenylHttpClient({ url: "http://localhost:3333" });
    const text = await client.requestText("/foo/bar?name=Shin");
    assert(text === "Hello, Express! I'm Shin.");
  });
  it.skip("can handle Phenyl API request with path modifier", async function() {
    // TODO
  });
  it.skip("can handle non-API request with path modifier", async function() {
    // TODO
  });
});

describe("createPhenylMiddleware", function() {
  const customRequestHandler = async httpReq => {
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
  let server;
  let app;
  beforeEach(() => {
    app = express();
    server = app.listen(3333);
  });

  afterEach(() => {
    server.close();
  });

  it("can handle Phenyl API request", async function() {
    app.use(
      createPhenylMiddleware(
        { restApiHandler, customRequestHandler },
        /\/api\/.*|\/foo\/bar$/
      )
    );
    const client = new PhenylHttpClient({ url: "http://localhost:3333" });
    const queryResult = await client.runCustomQuery({
      name: "getVersion",
      params: {}
    });
    assert(queryResult.ok === 1);
    assert(queryResult.result && queryResult.result.version === "1.2.3");
  });

  it("can handle non-API request by Phenyl Custom Request", async function() {
    app.use(
      createPhenylMiddleware(
        { restApiHandler, customRequestHandler },
        /\/api\/.*|\/foo\/bar$/
      )
    );

    // $FlowIssue(express-valid-get-function)
    app.get("/foo/bar", (req, res) => {
      res.send(`Hello, Express! I'm ${req.query.name}.`);
    });
    const client = new PhenylHttpClient({ url: "http://localhost:3333" });
    const text = await client.requestText("/foo/bar?name=Shin");
    assert(text === "Hi, Phenyl Custom Request Handler. I'm Shin");
  });

  it("can handle non-API request by express", async function() {
    app.use(
      createPhenylMiddleware(
        { restApiHandler, customRequestHandler },
        /\/api\/.*|\/foo\/bar$/
      )
    );
    // $FlowIssue(express-valid-get-function)
    app.get("/foo/bar/baz", (req, res) => {
      // This won't be called.
      res.send(`Hello, Express! I'm ${req.query.name}.`);
    });

    const client = new PhenylHttpClient({ url: "http://localhost:3333" });
    const text = await client.requestText("/foo/bar/baz?name=Shin");
    assert(text === "Hello, Express! I'm Shin.");
  });

  it.skip('can handle "/explorer" by default', async function() {
    // TODO
  });
  it.skip("can handle Phenyl API request with path modifier", async function() {
    // TODO
  });
  it.skip("can handle non-API request with path modifier", async function() {
    // TODO
  });
});
