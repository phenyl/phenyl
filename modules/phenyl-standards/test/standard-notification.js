// @flow

import { describe, it, before, xit } from 'kocha'
import assert from 'power-assert'
import PhenylRestApi, { createCustomCommandHandler } from 'phenyl-rest-api/jsnext'
import PhenylHttpClient from 'phenyl-http-client/jsnext'
import PhenylHttpServer from 'phenyl-http-server/jsnext'
import PhenylMemoryClient from 'phenyl-memory-client/jsnext'
import { NotificationCommand } from '../src/standard-notification.js'
import { createServer } from 'http'

let client

describe('StandardNotification', () => {
  before(() =>  {
    const clientForRestApi = new PhenylMemoryClient()
    const entityName = 'installation'

    const notificationCommand = new NotificationCommand(clientForRestApi, entityName)

    const customCommandHandler = createCustomCommandHandler({
      notification: notificationCommand
    })

    const restApiHandler = new PhenylRestApi({
      client: clientForRestApi,
      customCommandHandler,
    })

    const server = new PhenylHttpServer(createServer(), { restApiHandler })
    server.listen(8080)

    client = new PhenylHttpClient({ url: 'http://localhost:8080' })
  })

  it('registers installation', async () => {
    const installation = {
      id: 'installation',
      userId: 'dummy',
      entityName: 'installation',
      os: 'iOS',
      deviceToken: 'dummy',
    }

    await client.insertOne({
      entityName: 'installation',
      value: installation,
    })

    const result = await client.findOne({
      entityName: 'installation',
      where: { userId: 'dummy' },
    })

    assert(result.ok === 1)
    assert(result.entity.deviceToken === 'dummy')
    assert(result.entity.os === 'iOS')
  })

  it('can delete installation', async () => {
    const installation = {
      id: 'installationToDelete',
      userId: 'user1',
      entityName: 'installation',
      os: 'iOS',
      deviceToken: 'dummy',
    }

    await client.insertOne({
      entityName: 'installation',
      value: installation,
    })

    const result = await client.delete({
      entityName: 'installation',
      id: 'installationToDelete'
    })

    assert(result.ok === 1)

    try {
      await client.findOne({
        entityName: 'installation',
        where: { userId: 'user1' }
      })
    } catch (err) {
      assert(err.type === 'NotFound')
    }
  })

  xit('throws error except insertOne and delete', async () => {
    const installation = await client.get({
      entityName: 'installation',
      id: 'installation',
    })

    const { versionId } = installation

    try {
      await client.pull({
        entityName: 'installation',
        id: 'installation',
        versionId,
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  })

  it('notifies when client runs notificationCommand(customCommand)', async () => {
    const notificationCommand = {
      name: 'notification',
      params: {
        userId: 'dummy',
        entityName: 'installation',
        payload: {
          type: 'talk',
          body: 'hello',
        },
      }
    }

    const result = await client.runCustomCommand(notificationCommand)
  })
})
