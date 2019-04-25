import { it, describe } from "mocha";
import assert from "assert";
import { removePasswordFromResponseEntity } from "../src/remove-password-from-response-data";

describe("removePasswordFromResponseEntity", () => {
  it("should be removed passwordPropName", () => {
    const entity = {
      password: "hogehoge",
      name: "Foo Bar",
      id: "foobar"
    };

    const result = removePasswordFromResponseEntity(entity, "password");
    assert.deepStrictEqual(result, { name: "Foo Bar", id: "foobar" });
  });

  it("should be no change when entity doesn't have passwordPropName", () => {
    const entity = {
      name: "Foo Bar",
      id: "foobar"
    };

    const result = removePasswordFromResponseEntity(entity, "password");
    assert.deepStrictEqual(result, { name: "Foo Bar", id: "foobar" });
  });
});
