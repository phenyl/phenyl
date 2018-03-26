// @flow
/* eslint-disable no-console */
/* eslint-env node */
import http from 'http'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import phenylReducer, { createMiddleware, actions } from 'phenyl-redux/jsnext'
import PhenylHttpServer from 'phenyl-http-server/jsnext'
import PhenylRestApi from 'phenyl-rest-api/jsnext'
import PhenylHttpClient from 'phenyl-http-client/jsnext'
import { createEntityClient } from 'phenyl-memory-db/jsnext'
import { StandardUserDefinition } from 'phenyl-standards/jsnext'

const wait = async msec => new Promise(ok => setTimeout(ok, msec))

import type {
  FunctionalGroup
} from 'phenyl-interfaces'

const httpClient = new PhenylHttpClient({ url: 'http://localhost:8080' })

const store = createStore(
  combineReducers({ phenyl: phenylReducer }),
  applyMiddleware(
    createMiddleware({
      client: httpClient,
      storeKey: 'phenyl'
    })
  )
)

const memoryClient = createEntityClient()

type PlainPatient = { id: string, name: string, email: string, password?: string }
type PatientAuthSetting = { credentials: { email: string, password: string }, options: Object }
class PatientDefinition extends StandardUserDefinition<{ patient: PlainPatient }, PatientAuthSetting> {
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
    // $FlowIssue(reqData.payload-has-id)
    if (['updateAndGet'].includes(reqData.method)) return session != null && session.userId === reqData.payload.id
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
  store.dispatch(actions.follow('patient', inserted.entity, inserted.versionId))
  console.log(JSON.stringify(store.getState().phenyl, null, 2))

  store.dispatch(actions.login({
    entityName: 'patient',
    credentials: {
      email: 'shinout@example.com',
      password: 'shin123'
    }
  }))
  await wait(10)
  console.log(JSON.stringify(store.getState().phenyl, null, 2))

  store.dispatch(actions.logout({
    entityName: 'patient',
    sessionId: store.getState().phenyl.session.id,
    userId: inserted.entity.id,
  }))
  await wait(10)
  console.log(JSON.stringify(store.getState().phenyl, null, 2))

  process.exit()
}

main().catch(e => console.log(e) || process.exit())
