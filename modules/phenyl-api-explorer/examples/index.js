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
import PhenylMemoryClient from 'phenyl-memory-client'
import { StandardUserDefinition } from 'phenyl-standards'
import PhenylHttpServer from 'phenyl-http-server'
import PhenylApiExplorer from '../src/PhenylApiExplorer'

const memoryClient = new PhenylMemoryClient()

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
    if (['insert', 'insertAndGet', 'insertAndFetch', 'login', 'logout'].includes(reqData.method)) return true
    console.log(session, reqData.payload)
    // $FlowIssue(reqData.payload-has-id)
    if (['updateAndGet'].includes(reqData.method)) return session != null && session.userId === reqData.payload.id
    return false
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

  },
}

const server = new PhenylHttpServer(http.createServer(), {
  restApiHandler: PhenylRestApi.createFromFunctionalGroup(functionalGroup, {
    client: memoryClient,
  }),
  customRequestHandler: new PhenylApiExplorer(functionalGroup, { path: '/explorer' }).handler,
})

server.listen(3000)
