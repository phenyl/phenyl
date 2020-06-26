import { GeneralRequestData } from "@phenyl/interfaces";
/* eslint-env mocha */
import assert from "assert";
import decodeRequest from "../src/decode-request";
import encodeRequest from "../src/encode-request";

describe("Check encode/decode deep equality: ", () => {
  it("find", () => {
    const reqData: GeneralRequestData = {
      method: "find",
      payload: {
        entityName: "hospital",
        where: {
          name: "Tokyo Hospital"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("findOne", () => {
    const reqData: GeneralRequestData = {
      method: "findOne",
      payload: {
        entityName: "hospital",
        where: {
          name: "Tokyo Hospital"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("get", () => {
    const reqData: GeneralRequestData = {
      method: "get",
      payload: {
        entityName: "hospital",
        id: "tokyo"
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("getByIds", () => {
    const reqData: GeneralRequestData = {
      method: "getByIds",
      payload: {
        entityName: "hospital",
        ids: ["tokyo", "nagoya", "osaka"]
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("pull", () => {
    const reqData: GeneralRequestData = {
      method: "pull",
      payload: {
        entityName: "hospital",
        id: "foo",
        versionId: "abc123"
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("insertOne", () => {
    const reqData: GeneralRequestData = {
      method: "insertOne",
      payload: {
        entityName: "hospital",
        value: {
          name: "Tokyo Hospital",
          address: "dummy-dummy"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("insertMulti", () => {
    const reqData: GeneralRequestData = {
      method: "insertMulti",
      payload: {
        entityName: "hospital",
        values: [
          {
            name: "Tokyo Hospital",
            address: "dummy-dummy"
          }
        ]
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("insertAndGet", () => {
    const reqData: GeneralRequestData = {
      method: "insertAndGet",
      payload: {
        entityName: "hospital",
        value: {
          name: "Tokyo Hospital",
          address: "dummy-dummy"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("insertAndGetMulti", () => {
    const reqData: GeneralRequestData = {
      method: "insertAndGetMulti",
      payload: {
        entityName: "hospital",
        values: [
          {
            name: "Tokyo Hospital",
            address: "dummy-dummy"
          },
          {
            name: "Nagoya Hospital",
            address: "dummy-dummy-dummy"
          }
        ]
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("updateById", () => {
    const reqData: GeneralRequestData = {
      method: "updateById",
      payload: {
        id: "tokyo",
        entityName: "hospital",
        operation: {
          $set: {
            tel: "dummy"
          }
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("updateMulti", () => {
    const reqData: GeneralRequestData = {
      method: "updateMulti",
      payload: {
        where: {
          id: "tokyo"
        },
        entityName: "hospital",
        operation: {
          $set: {
            tel: "dummy"
          }
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("updateAndGet", () => {
    const reqData: GeneralRequestData = {
      method: "updateAndGet",
      payload: {
        id: "tokyo",
        entityName: "hospital",
        operation: {
          $set: {
            tel: "dummy"
          }
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("updateAndFetch", () => {
    const reqData: GeneralRequestData = {
      method: "updateAndFetch",
      payload: {
        entityName: "hospital",
        where: {
          name: "tokyo"
        },
        operation: {
          $set: {
            tel: "dummy"
          }
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("push", () => {
    const reqData: GeneralRequestData = {
      method: "push",
      payload: {
        id: "tokyo",
        entityName: "hospital",
        versionId: "abc123",
        operations: [
          {
            $set: {
              tel: "dummy"
            }
          }
        ]
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("delete", () => {
    const reqData: GeneralRequestData = {
      method: "delete",
      payload: {
        entityName: "hospital",
        where: {
          name: "tokyo"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("runCustomQuery", () => {
    const reqData: GeneralRequestData = {
      method: "runCustomQuery",
      payload: {
        name: "is-occupied",
        params: {
          email: "abc@example.com"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("runCustomQuery without params", () => {
    const reqData: GeneralRequestData = {
      method: "runCustomQuery",
      payload: {
        name: "is-occupied",
        params: {}
      }
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(reqData, decodedReqData);
  });
  it("runCustomCommand", () => {
    const reqData: GeneralRequestData = {
      method: "runCustomCommand",
      payload: {
        name: "reset-password",
        params: {
          email: "abc@example.com"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("login", () => {
    const reqData: GeneralRequestData = {
      method: "login",
      payload: {
        entityName: "doctor",
        credentials: {
          email: "abc@example.com",
          password: "dummy"
        }
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
  it("logout", () => {
    const reqData: GeneralRequestData = {
      method: "logout",
      payload: {
        entityName: "doctor",
        sessionId: "foobar",
        userId: "shinout"
      },
      sessionId: "foobar"
    };
    const encodedHttpRequest = encodeRequest(reqData);
    const decodedReqData = decodeRequest(encodedHttpRequest);
    assert.deepStrictEqual(decodedReqData, reqData);
    assert(decodedReqData.sessionId === "foobar");
  });
});
