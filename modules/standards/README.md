# phenyl/standards

Standards has templates for user definition.

## example
You can define authentication and authorization by extending StandardUserDefinition.
See [here](../rest-api/README.md) for how to create a PhenylRestApi instance using the userDefinition.

```js
import { StandardUserDefinition } from "@phenyl/standards";
import { EntityDefinition } from "@phenyl/interfaces";

class UserDefinition extends StandardUserDefinition {
  constructor(entityClient) {
    super({
      entityClient,
      accountPropName: "email",
      passwordPropName: "password",
      ttl: 1000 * 60 * 60,
    });
  }
}

class NonUserDefinition implements EntityDefinition {
  constructor(entityClient) {
    super({ entityClient });
  }

  async authorize(reqData) {
    const { authType } = reqData.payload;

    if (authType !== "user") {
      return false;
    }

    switch (reqData.method) {
      case "find": {
        if (authType === "user") {
          return true;
        }
        return false;
      }
      default: {
        return false;
      }
    }
  }
}
```