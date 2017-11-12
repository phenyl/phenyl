// @flow
/* eslint-disable no-console */
import http from 'http'
import PhenylHttpServer from 'phenyl-http-server/jsnext'
import PhenylRestApi from 'phenyl-rest-api/jsnext'
import PhenylHttpClient from 'phenyl-http-client/jsnext'
import PhenylMemoryClient from 'phenyl-memory-client/jsnext'
import { StandardUserDefinition } from 'phenyl-standards/jsnext'

import type {
  FunctionalGroup
} from 'phenyl-interfaces'

const memoryClient = new PhenylMemoryClient()

class PatientDefinition extends StandardUserDefinition {
  constructor() {
    super({
      entityClient: memoryClient,
      accountPropName: 'email',
      passwordPropName: 'password',
      ttl: 60 * 60 * 24 * 7
    })
  }
  async authorization(reqData): Promise<boolean> {
    if (['insert', 'insertAndGet', 'insertAndFetch', 'login', 'logout'].includes(reqData.method)) return true
    return false
  }
}

const functionalGroup: FunctionalGroup = {
  customQueries: {},
  customCommands: {},
  users: {
    patient: new PatientDefinition()
  },
  nonUsers: {}
}

async function main() {
  const restApiHandler = PhenylRestApi.createFromFunctionalGroup(functionalGroup, { client: memoryClient })
  const server = new PhenylHttpServer(http.createServer(), { restApiHandler })
  server.listen(8080)

  const client = new PhenylHttpClient({ url: 'http://localhost:8080' })

  const inserted = await client.insertAndGet({ entityName: 'patient', value: {
    name: 'Shin Suzuki',
    email: 'shinout@example.com',
    password: 'shin123',
  }})
  console.log(inserted)

  const logined = await client.login({
    entityName: 'patient',
    credentials: {
      email: 'shinout@example.com',
      password: 'shin123'
    }
  })
  console.log(logined)
}

main().catch(e => console.log(e))
