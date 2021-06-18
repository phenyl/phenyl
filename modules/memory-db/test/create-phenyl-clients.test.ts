import { createPhenylClients } from "../src/create-phenyl-clients";
import assert from "assert";

import { PhenylSessionClient } from "@phenyl/central-state";
import PhenylRestApi from "@phenyl/rest-api";
import { PhenylMemoryDbEntityClient } from "../src/create-entity-client";

describe("createPhenylClients", () => {
  const clients = createPhenylClients();
  it("should create entityClient and sessionClient", () => {
    const { entityClient, sessionClient } = clients;
    assert.strictEqual(
      entityClient instanceof PhenylMemoryDbEntityClient,
      true
    );
    assert.strictEqual(sessionClient instanceof PhenylSessionClient, true);
  });

  it("should create phenylRestApi correctly", () => {
    const phenylRestApi = new PhenylRestApi({}, clients);
    assert.strictEqual(phenylRestApi instanceof PhenylRestApi, true);
  });
});
