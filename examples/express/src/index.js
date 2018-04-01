// @flow
/* eslint-disable no-console */
import express from 'express'
import PhenylRestApi from 'phenyl-rest-api'
import PhenylHttpClient from 'phenyl-http-client'
import { createEntityClient } from 'phenyl-memory-db'
import { StandardUserDefinition } from 'phenyl-standards'
import {
  createPhenylApiMiddleware,
  createPhenylMiddleware,
} from 'phenyl-express'

import type { FunctionalGroup } from 'phenyl-interfaces'

const memoryClient = createEntityClient()

type PlainPatient = { id: string, name: string, email: string, password?: string }
type PatientAuthSetting = { credentials: { email: string, password: string }, options: Object }
class PatientDefinition extends StandardUserDefinition<{ patient: PlainPatient }, PatientAuthSetting> {
  constructor() {
    super({
      entityClient: memoryClient,
      accountPropName: 'email',
      passwordPropName: 'password',
      ttl: 24 * 3600,
    })
  }
  async authorization(reqData, session): Promise<boolean> {
    if (
      ['insert', 'insertAndGet', 'insertAndFetch', 'login', 'logout'].includes(
        reqData.method
      )
    )
      return true
    if (['updateAndGet'].includes(reqData.method))
      // $FlowIssue(reqData.payload-has-id)
      return session != null && session.userId === reqData.payload.id
    return false
  }
}

const functionalGroup: FunctionalGroup = {
  customQueries: {},
  customCommands: {},
  users: {
    patient: new PatientDefinition(),
  },
  nonUsers: {},
}

async function expressWithRestApi() {
  const restApiHandler = PhenylRestApi.createFromFunctionalGroup(
    functionalGroup,
    { client: memoryClient }
  )

  const app = express()
  app.use(createPhenylApiMiddleware(restApiHandler))
  const server = app.listen(3333, () =>
    console.log('Express is listening on port 3333')
  )

  const client = new PhenylHttpClient({ url: 'http://localhost:3333' })

  const inserted = await client.insertAndGet({
    entityName: 'patient',
    value: {
      name: 'Shin Suzuki',
      email: 'shinout@example.com',
      password: 'shin123',
    },
  })
  console.log(inserted)

  const logined = await client.login({
    entityName: 'patient',
    credentials: {
      email: 'shinout@example.com',
      password: 'shin123',
    },
  })
  console.log(logined)
  const updated = await client.updateAndGet(
    {
      entityName: 'patient',
      id: inserted.entity.id,
      operation: { $set: { password: 'shin1234' } },
    },
    logined.session.id
  )
  console.log(updated)

  // $FlowIssue(compatible)
  app.get('/abc/def/ghi', (req, res) => {
    res.send('Hello, Express!')
  })

  const text = await client.requestText('/abc/def/ghi')
  console.log(text)

  server.close()
}

async function expressWithCustomRequestHandler() {
  const restApiHandler = PhenylRestApi.createFromFunctionalGroup(
    functionalGroup,
    { client: memoryClient }
  )

  const app = express()
  const customRequestHandler = async () => {
    return {
      statusCode: 200,
      body: 'Explorer',
      headers: { 'Content-Type': 'text/plain' },
    }
  }
  app.use(createPhenylMiddleware({ restApiHandler, customRequestHandler }))
  const server = app.listen(3333, () =>
    console.log('Express is listening on port 3333')
  )

  const client = new PhenylHttpClient({ url: 'http://localhost:3333' })

  const inserted = await client.insertAndGet({
    entityName: 'patient',
    value: {
      name: 'Shin Suzuki',
      email: 'shinout@example.com',
      password: 'shin123',
    },
  })
  console.log(inserted)

  const logined = await client.login({
    entityName: 'patient',
    credentials: {
      email: 'shinout@example.com',
      password: 'shin123',
    },
  })
  console.log(logined)
  const updated = await client.updateAndGet(
    {
      entityName: 'patient',
      id: inserted.entity.id,
      operation: { $set: { password: 'shin1234' } },
    },
    logined.session.id
  )
  console.log(updated)

  // $FlowIssue(compatible)
  app.get('/abc/def/ghi', (req, res) => {
    res.send('Hello, Express!')
  })

  // Express
  const text = await client.requestText('/abc/def/ghi')
  console.log(text)

  // Phenyl Custom Request Handler
  const text2 = await client.requestText('/explorer')
  console.log(text2)

  server.close()
}

async function main() {
  await expressWithRestApi()
  await expressWithCustomRequestHandler()
}

main()
