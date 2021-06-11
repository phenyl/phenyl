# @phenyl/redux

State synchronization among Phenyl CentralState(server) and LocalState(client) using Redux.

## usage
Apply phenyl middleware to redux middleware.
PhenylHttpClient instance is required to create phenyl middleware for synchronization with CentralState(server).

```js
import { createMiddleware, reducer } from "@phenyl/redux";
import { createStore, applyMiddleware } from "redux";
import PhenylHttpClient from "@phenyl/http-client";

const httpClient = new PhenylHttpClient({ url: "localhost:8080" });
const middleware = createMiddleware({ client: httpClient });
const enhancer = applyMiddleware(middleware);
const store = createStore(reducer, enhancer);
```

## Installation

```sh
npm install @phenyl/redux
```
