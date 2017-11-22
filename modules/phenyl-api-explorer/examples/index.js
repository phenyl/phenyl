// @flow
import fs from 'fs'
import path from 'path'
import http from 'http'
import type {
  EncodedHttpRequest,
  EncodedHttpResponse,
  RestApiClient,
} from 'phenyl-interfaces'
import PhenylRestApi from 'phenyl-rest-api'
import { createEntityClient } from 'phenyl-memory-db'
import { StandardUserDefinition, StandardEntityDefinition } from 'phenyl-standards'
import PhenylHttpServer from 'phenyl-http-server'
import PhenylApiExplorer from '../src/PhenylApiExplorer'

const memoryClient = createEntityClient()

class HospitalDefinition extends StandardEntityDefinition {
  async authorization(reqData: RequestData, session: ?Session): Promise<boolean> { // eslint-disable-line no-unused-vars
    return true
  }
}

class PatientDefinition extends StandardUserDefinition {
  constructor() {
    super({
      entityClient: memoryClient,
      accountPropName: 'email',
      passwordPropName: 'password',
      ttl: 24 * 3600
    })
  }

  async authorization(reqData, session): Promise<boolean> {
    const noLoginCommands = ['insertOne', 'insertAndGet', 'insertMulti', 'insertAndGetMulti', 'login']

    if (noLoginCommands.includes(reqData.method)) {
      return true
    }

    return session != null && session.userId === reqData.payload.id
  }
}

const functionalGroup = {
  customQueries: {

  },
  customCommands: {

  },
  users: {
    patient: new PatientDefinition(),
  },
  nonUsers: {
    hospital: new HospitalDefinition(),
  },
}

const server = new PhenylHttpServer(http.createServer(), {
  restApiHandler: PhenylRestApi.createFromFunctionalGroup(functionalGroup, {
    client: memoryClient,
  }),
  customRequestHandler: new PhenylApiExplorer(functionalGroup, { path: '/explorer' }).handler,
})

server.listen(8000)
