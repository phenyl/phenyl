# phenyl-express[![CircleCI](https://circleci.com/gh/phenyl-js/phenyl.svg?style=shield&circle-token=e5b0170cf6df4acd73f13c66cc37e0cb1a56948c)](https://circleci.com/gh/phenyl-js/phenyl)

[Express](http://expressjs.com/) middleware to use [Phenyl](https://github.com/phenyl-js/phenyl) in it.

```js
import express from 'express'
import { createPhenylApiMiddleware } from 'phenyl-express'

// instance of PhenylRestApi (see [phenyl-rest-api](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-rest-api).)
const phenylRestApi = ...
const app = express()
app.use(createPhenylApiMiddleware(phenylRestApi))
app.listen(3000)
```

## Installation
```sh
npm install phenyl-express
```

# API Documentation
- createPhenylApiMiddleware()
- createPhenylMiddleware()

## createPhenylApiMiddleware()
Create express middleware to handle Phenyl REST APIs.

```js
createPhenylApiMiddleware(
  restApiHandler: GeneralRestApiHandler,
  pathRegex: RegExp = /\^/api\/.*$/,
): Function // express middleware
```

### Parameters
#### restApiHandler
Object, which has a method `handleRequestData(reqData: RequestData): Promise<ResponseData>`.
Instance of [PhenylRestApi](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-rest-api) are compatible with `restApiHandler`.

#### pathRegex
RegExp. Optional.
Paths which match the `pathRegex` are handled by Phenyl.
By default, it's `/\^/api\/.*$/`; paths start with "/api/" are passed.

### Example
```js
import express from 'express'
import { createPhenylApiMiddleware } from 'phenyl-express'
import PhenylRestApi from 'phenyl-rest-api'
import { createEntityClient } from 'phenyl-memory-db' // create DB Client used in Phenyl REST API

const getVersion = async (customQuery) => ({ version: '1.2.3' })

// Settings of Phenyl REST API
const fg = { users: {}, nonUsers: {}, customQueries: { getVersion: { execute: getVersion } }, customCommands: {} }
const phenylRestApi = PhenylRestApi.createFromFunctionalGroup(fg, { entityClient: createEntityClient() })
const app = express()
app.use(createPhenylApiMiddleware(phenylRestApi))
app.get('/foo/bar', (req, res) => res.text(`Hello, Express!`))
app.listen(3000)
```

Client-side code will be like the following.
```js
import PhenylHttpClient from 'phenyl-http-client'
const client = new PhenylHttpClient({ url: 'http://localhost:3000' })
const result = await client.runCustomQuery({ name: 'getVersion' })
console.log(result.version) // 1.2.3
const text = await client.requestText('/foo/bar')
console.log(text) // Hello, Express!
```

## createPhenylMiddleware()
Create express middleware to handle Phenyl REST APIs and non-REST-API paths defined by `customRequestHandler`.

```js
createPhenylMiddleware(
  params: GeneralServerParams,
  pathRegex: RegExp = /^\/api\/.*$|^\/explorer($|\/.*$)/
): Function // express middleware
```

### Why this?
It's true that Express can be easier to set your custom pages than Phenyl's `customRequestHandler`.
Some non-rest entrypoints, however, are offered by Phenyl Family (like [phenyl-api-explorer](https://github.com/phenyl-js/phenyl/blob/master/modules/phenyl-api-explorer)) and this function will be suitable for using them.

### Parameters
#### params: GeneralServerParams
Type of params is here:
```js
type GeneralServerParams = {
  restApiHandler: GeneralRestApiHandler,
  customRequestHandler?: (encodedHttpRequest: EncodedHttpRequest, restApiClient: RestApiClient) => Promise<EncodedHttpResponse>,
  modifyPath?: (path: string) => string,
}
```

`restApiHandler` is the same as one described in `createPhenylApiMiddleware()`.
It's an object with a method `handleRequestData(reqData: RequestData): Promise<ResponseData>`.

`customRequestHandler` is a function to handle general request and returns response information.
It's first argument is here:

```js
type EncodedHttpRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: { [name: string]: string },
  path: string, // must start with "/"
  qsParams?: { [name: string]: string },
  body?: string,
}
```

The second argument `restApiClient` is a client for `PhenylRestApi`.

The return value must be `Promise<EncodedHttpResponse>`.

```js
type EncodedHttpResponse = {
  +headers: { [name: string]: string } | Headers,
  +body: string, // stringified JSON or parsed JSON
  statusCode: number,
}
```

#### pathRegex
RegExp. Optional.
Paths which match the `pathRegex` are handled by Phenyl.
By default, it's /^\/api\/.*$|^\/explorer($|\/.*$)/; paths start with "/api/" or "/explorer" are passed.

`/explorer` is redirected because [phenyl-api-explorer](https://github.com/phenyl-js/phenyl/blob/master/modules/phenyl-api-explorer) use the URL.

### Example
```js
import express from 'express'
import { createPhenylApiMiddleware } from 'phenyl-express'
import PhenylRestApi from 'phenyl-rest-api'
import { createEntityClient } from 'phenyl-memory-db' // create DB Client used in Phenyl REST API

// Settings of Phenyl REST API
const fg = { users: {}, nonUsers: {}, customQueries: {}, customCommands: {} }
const phenylRestApi = PhenylRestApi.createFromFunctionalGroup(fg, { client: createEntityClient() })
const app = express()
app.use(createPhenylMiddleware({
  restApiHandler: phenylRestApi,
  async customRequestHandler(httpReq) {
    const { headers, body, method, qsParams, path } = httpReq
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: `Hi Phenyl, I'm ${qsParams ? qsParams.name : 'NoName'}!`
    }
  }
}, /^\/api\/.*$|^\/abc$/))

app.get('/foo/bar', (req, res) => res.text(`Hello, Express!`))
app.listen(3000)
```

Client-side code will be like the following.
```js
import PhenylHttpClient from 'phenyl-http-client'
const client = new PhenylHttpClient({ url: 'http://localhost:3000' })
const { result } = await client.runCustomQuery({ name: 'getVersion' })
console.log(result.version) // 1.2.3
const text1 = await client.requestText('/abc?name=John')
console.log(text1) // Hi Phenyl, I'm John!

const text2 = await client.requestText('/foo/bar')
console.log(text2) // Hello, Express!
```


# LICENSE
Apache License 2.0
