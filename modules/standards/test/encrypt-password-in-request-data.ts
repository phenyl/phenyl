import { it, describe } from "mocha";
// @ts-ignore
import powerCrypt from "power-crypt";
import assert from "assert";
import { GeneralRequestData } from "@phenyl/interfaces";
import { encryptPasswordInRequestData } from "../src/encrypt-password-in-request-data";

<<<<<<< HEAD
describe("encryptPasswordInRequestData", () => {
  it("does nothing if request isnt update", () => {
=======
describe('encryptPasswordInRequestData', () => {
  it('does nothing if request isnt update', () => {
>>>>>>> update test
    const requestData: GeneralRequestData = {
      method: "get",
      payload: {
        entityName: "user",
        id: "user1"
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
<<<<<<< HEAD
      "password",
      powerCrypt
    );
    assert.deepEqual(encryptedRequestData, requestData);
  });

  it("encrypts password if password is in request data with insertOne method", () => {
=======
      'password',
      powerCrypt,
    )
    assert.deepEqual(encryptedRequestData, requestData)
  })

  it('encrypts password if password is in request data with insertOne method', () => {
>>>>>>> update test
    const requestData: GeneralRequestData = {
      method: "insertOne",
      payload: {
        entityName: "user",
        value: { password: "test1234" }
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
<<<<<<< HEAD
      "password",
      powerCrypt
    );
=======
      'password',
      powerCrypt,
    )
>>>>>>> update test

    const expectedRequestData = {
      method: "insertOne",
      payload: {
<<<<<<< HEAD
        entityName: "user",
        value: { password: "OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=" }
      }
    };
=======
        entityName: 'user',
        value: { password: 'dfzO3OHHF0Snmnx7j5jn0Um7bRFLk89qq1/AoZ5Dcvs=' },
      },
    }
>>>>>>> update test

    assert.deepEqual(encryptedRequestData, expectedRequestData);
  });

<<<<<<< HEAD
  it("encrypts password if password is in request data with insertMulti method", () => {
=======
  it('encrypts password if password is in request data with insertMulti method', () => {
>>>>>>> update test
    const requestData: GeneralRequestData = {
      method: "insertMulti",
      payload: {
        entityName: "user",
        values: [{ password: "test1234" }, { name: "user1" }]
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
<<<<<<< HEAD
      "password",
      powerCrypt
    );
=======
      'password',
      powerCrypt,
    )
>>>>>>> update test

    const expectedRequestData = {
      method: "insertMulti",
      payload: {
<<<<<<< HEAD
        entityName: "user",
        values: [
          { password: "OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=" },
          { name: "user1" }
        ]
      }
    };
=======
        entityName: 'user',
        values: [
          { password: 'OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=' },
          { name: 'user1' },
        ],
      },
    }
>>>>>>> update test

    assert.deepEqual(encryptedRequestData, expectedRequestData);
  });

<<<<<<< HEAD
  it("encrypts password if password is in request data with update method", () => {
=======
  it('encrypts password if password is in request data with update method', () => {
>>>>>>> update test
    const requestData: GeneralRequestData = {
      method: "updateById",
      payload: {
        id: "foo",
        entityName: "user",
        operation: {
          $set: { password: "test1234" },
          $inc: { friends: 3 }
        }
      }
    };

    const encryptedRequestData = encryptPasswordInRequestData(
      requestData,
<<<<<<< HEAD
      "password",
      powerCrypt
    );
=======
      'password',
      powerCrypt,
    )
>>>>>>> update test

    const expectedRequestData = {
      method: "updateById",
      payload: {
        id: "foo",
        entityName: "user",
        operation: {
          $set: { password: "OWoroorUQ5aGLRL62r7LazdwCuPPcf08eGdU+XKQZy0=" },
          $inc: { friends: 3 }
        }
      }
    };

    assert.deepEqual(encryptedRequestData, expectedRequestData);
  });
});
