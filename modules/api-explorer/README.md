# phenyl-api-explorer
Automatically renders API explorer pages like [swagger UI](https://github.com/swagger-api/swagger-ui).

![screenshot.png](https://github.com/phenyl-js/phenyl/raw/master/modules/phenyl-api-explorer/examples/screenshot.png)

## Install
```
npm install phenyl-api-explorer
```

## Usage
```js
const PhenylApiExplorer = require('phenyl-api-explorer').default

const server = new PhenylHttpServer(http.createServer(), {
  // ...
  customRequestHandler: new PhenylApiExplorer(functionalGroup, { path: '/explorer' }).handler,
})
```

Or ES6:

```js
import PhenylApiExplorer from 'phenyl-api-explorer'

// ...
```

For more details, please refer [our example](https://github.com/phenyl-js/phenyl/tree/master/modules/phenyl-api-explorer/examples).

## LICENSE
Apache License 2.0
