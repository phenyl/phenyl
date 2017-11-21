// @flow

import kocha from 'kocha'
import assert from 'power-assert'
import PhenylHttpClient from '../src/index.js'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'
import PhenylHttpServer from 'phenyl-http-server/jsnext'
import { createServer } from 'http'
import PhenylRestApi from 'phenyl-rest-api/jsnext'
import { createEntityClient } from 'phenyl-memory-db/jsnext'

const entityClient = createEntityClient()

const restApiHandler = new PhenylRestApi({ client: entityClient })
const server = new PhenylHttpServer(createServer(), { restApiHandler })
server.listen(8080)

const client = new PhenylHttpClient({ url: 'http://localhost:8080' })
assertEntityClient(client, kocha, assert)
