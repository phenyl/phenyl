/* eslint-env mocha */
import assert from "assert";
import decodeRequest from "../src/decode-request";

/**
 * DecodeRequest allows wider expressions than encodeRequest returns.
 * This test checks "wider" parts.
 */
describe("Parsing path", () => {
  it('detects first "/api/" and parse URLs', () => {
    const reqData = decodeRequest({
      headers: {},
      path: "/api/api/api",
      method: "GET"
    });
    assert.deepStrictEqual(reqData, {
      method: "get",
      payload: {
        id: "api",
        entityName: "api"
      }
    });
  });
  it("path whose depth is greater than three are not allowed", () => {
    assert.throws(
      () =>
        decodeRequest({
          headers: {},
          path: "/api/api/api/api",
          method: "GET"
        }),
      /greater than 3/
    );
  });
});
describe("sessionId", () => {
  it("uses value in querystring prior to headers", () => {
    const reqData = decodeRequest({
      headers: {
        authorization: "sessionId-in-headers"
      },
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      path: "/api/user/xxxx",
      method: "GET"
    });
    assert(reqData.sessionId === "sessionId-in-querystring");
  });

  it("is null in querystring", () => {
    const reqData = decodeRequest({
      headers: {},
      path: "/api/user/xxxx",
      method: "GET"
    });
    assert(reqData.sessionId == null);
  });
});
describe("GET request", () => {
  it('when no methodName is given and payload.where exists, regarded as "find"', () => {
    const reqData = decodeRequest({
      headers: {},
      qsParams: {
        d: JSON.stringify({
          where: {
            firstName: "John"
          }
        }),
        sessionId: "sessionId-in-querystring"
      },
      path: "/api/user",
      method: "GET"
    });
    assert(reqData.method === "find");
    // @ts-ignore entityName exists.
    assert(reqData.payload.entityName === "user");
  });
  it('when no methodName is given and payload.where does not exist, regarded as "runCustomQuery"', () => {
    const reqData = decodeRequest({
      headers: {},
      path: "/api/user",
      method: "GET"
    });
    assert(reqData.method === "runCustomQuery");
    // @ts-ignore name exists.
    assert(reqData.payload.name === "user");
  });
});

describe("POST request", () => {
  it('when no methodName is given and payload.value exists, regarded as "isnertOne"', () => {
    const reqData = decodeRequest({
      headers: {},
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      body: JSON.stringify({
        value: {
          firstName: "John"
        }
      }),
      path: "/api/user",
      method: "POST"
    });
    assert(reqData.method === "insertOne");
    // @ts-ignore entityName exists.
    assert(reqData.payload.entityName === "user");
  });
  it('when no methodName is given and payload.values exists, regarded as "isnertMulti"', () => {
    const reqData = decodeRequest({
      headers: {},
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      body: JSON.stringify({
        values: [
          {
            firstName: "John"
          }
        ]
      }),
      path: "/api/user",
      method: "POST"
    });
    assert(reqData.method === "insertMulti");
    // @ts-ignore entityName exists.
    assert(reqData.payload.entityName === "user");
  });
  it('when no methodName is given and payload.value or payload.values does not exist, regarded as "runCustomCommand"', () => {
    const reqData = decodeRequest({
      headers: {},
      body: JSON.stringify({
        params: {
          firstName: "John"
        }
      }),
      path: "/api/user",
      method: "POST"
    });
    assert(reqData.method === "runCustomCommand");
    // @ts-ignore name exists.
    assert(reqData.payload.name === "user");
  });
  it("when body is given. and it parse into payload", () => {
    const reqData = decodeRequest({
      headers: {},
      body: JSON.stringify({
        params: {
          firstName: "John"
        }
      }),
      path: "/api/user",
      method: "POST"
    });
    // @ts-ignore params exists.
    assert(reqData.payload.params.firstName === "John");
  });
  it("when parsedBody is given instead of body. and it set into payload", () => {
    const reqData = decodeRequest({
      headers: {},
      parsedBody: {
        params: {
          firstName: "John"
        }
      },
      path: "/api/user",
      method: "POST"
    });
    // @ts-ignore params exists.
    assert(reqData.payload.params.firstName === "John");
  });
});

describe("PUT request", () => {
  it('when no methodName is given and payload.operation exists, regarded as "updateById"', () => {
    const reqData = decodeRequest({
      headers: {},
      body: JSON.stringify({
        id: "john",
        operation: {
          $set: {
            firstName: "John"
          }
        }
      }),
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      path: "/api/user",
      method: "PUT"
    });
    assert(reqData.method === "updateById");
    // @ts-ignore entityName exists.
    assert(reqData.payload.entityName === "user");
  });
  it("when body is given and it parse into payload", () => {
    const reqData = decodeRequest({
      headers: {},
      body: JSON.stringify({
        id: "john",
        operation: {
          $set: {
            firstName: "John"
          }
        }
      }),
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      path: "/api/user",
      method: "PUT"
    });

    // @ts-ignore id exists.
    assert(reqData.payload.id === "john");
  });

  it("when body is given and it parse into payload", () => {
    const reqData = decodeRequest({
      headers: {},
      parsedBody: {
        id: "john",
        operation: {
          $set: {
            firstName: "John"
          }
        }
      },
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      path: "/api/user",
      method: "PUT"
    });
    // @ts-ignore id exists.
    assert(reqData.payload.id === "john");
  });

  it("when methodName is none of updateById, updateMulti, updateAndGet, updateAndFetch or push, regarded as IdUpdateCommand", () => {
    const reqData = decodeRequest({
      headers: {},
      body: JSON.stringify({
        operation: {
          $set: {
            firstName: "John"
          }
        }
      }),
      qsParams: {
        sessionId: "sessionId-in-querystring"
      },
      path: "/api/user/john",
      method: "PUT"
    });
    assert(reqData.method === "updateById");
    // @ts-ignore id exists.
    assert(reqData.payload.id === "john");
  });

  it("when methodName is none of updateById, updateMulti, updateAndGet, updateAndFetch or push and no operation is given in body, Error is thrown", () => {
    assert.throws(
      () =>
        decodeRequest({
          headers: {},
          body: JSON.stringify({
            params: {
              firstName: "John"
            }
          }),
          qsParams: {
            sessionId: "sessionId-in-querystring"
          },
          path: "/api/user/john",
          method: "PUT"
        }),
      /Could not decode the given PUT request/
    );
  });
});
