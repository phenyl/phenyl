# Phenyl

Phenyl is a mBaaS(mobile backend as a service) for React Native and web apps.
Written in pure JavaScript, extensible.

It provides client libraries available in every JavaScript environment (React Native, web browsers and Node.js).
Together with [Redux](https://redux.js.org/), you can synchronize model states on local memory with remote server.
Also [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) on React Native is supported.

You can host Phenyl on [AWS Lambda](https://aws.amazon.com/lambda/).

### Installation

```
npm install --save phenyl
```

#### Client Libraries

TBD

### Usage


```js
import Phenyl from 'phenyl'

const server = new Phenyl({
  aclHandler: asnyc (request, session, client) => {
    return true
  },

  validationHandler: async (request, session, client) => {
    return true
  },

  client: new DynamoDbClient({ url: 'xxxx' }),

  sessionClient: DynamoDbClient.createSessionClient({ url: 'xxxx' }),

  users: {
    admin: new AdminAccount(),
    patient: new PatientAccount(),
    doctor: new DoctorAccount(),
  },
})

server.listen('5000')
```

### License

MIT
