# @phenyl/http-client

Client to PhenylRestApi.
you can handle data on server with MongoDB-like operations

## example
```
import PhenylHttpClient from "@phenyl/http-client";

const httpClient = new PhenylHttpClient({
  url: "localhost:8080",
});

await httpClient.insertAndGet({ entityName: "user", value: { id: "user" } });
const { entity: user } = httpClient.get({ entityName: "user", id: "user" }); // { id: 'user' }
```