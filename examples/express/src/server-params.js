// @flow
/* eslint-disable no-console */
import express from 'express'
import fetch from 'node-fetch'
import PhenylRestApi from 'phenyl-rest-api/jsnext'
import PhenylHttpClient from 'phenyl-http-client/jsnext'
import { createEntityClient } from 'phenyl-memory-db/jsnext'
import { StandardUserDefinition } from 'phenyl-standards/jsnext'
import { createPhenylMiddleware } from 'phenyl-express/jsnext'

import type { FunctionalGroup } from 'phenyl-interfaces'

const memoryClient = createEntityClient()

class PatientDefinition extends StandardUserDefinition {
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

async function main() {
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
  app.listen(3333, () => console.log('Express is listening on port 3333'))

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

  const res = await fetch('http://localhost:3333/abc/def/ghi')
  console.log(await res.text())

  const res2 = await fetch('http://localhost:3333/explorer')
  console.log(await res2.text())
}

main().catch(e => console.log(e))
