// @flow

import kocha from 'kocha'
import PhenylHttpClient from '../src'
import { assertEntityClient } from 'phenyl-interfaces/test-cases'
import PhenylHttpServer from 'phenyl-http-server/jsnext.js'
import { createServer } from 'http'
import PhenylRestApi from 'phenyl-rest-api/jsnext.js'
import PhenylMemoryClient, { MemorySessionClient } from 'phenyl-memory-client/jsnext'


const sessionClient = new MemorySessionClient()
const entityClient = new PhenylMemoryClient()

const restApiHandler = new PhenylRestApi({ clients: { entityClient, sessionClient } })
const server = new PhenylHttpServer(createServer(), { restApiHandler })
server.listen(8080)

const client = new PhenylHttpClient({ url: 'http://localhost:8080' })
assertEntityClient(client, kocha)
