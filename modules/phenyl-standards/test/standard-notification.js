// @flow

import { describe, it, before } from 'kocha'
import assert from 'power-assert'
import PhenylRestApi, {
  createCustomCommandHandler,
  createValidationHandler,
  createExecutionWrapper,
} from 'phenyl-rest-api/jsnext'
import PhenylHttpClient from 'phenyl-http-client/jsnext'
import PhenylHttpServer from 'phenyl-http-server/jsnext'
import PhenylMemoryClient from 'phenyl-memory-client/jsnext'
import { NotificationCommand, StandardInstallationDefinition } from '../src/standard-notification.js'
import { createServer } from 'http'

let client

describe('StandardNotification', () => {
  before(() =>  {
    const clientForRestApi = new PhenylMemoryClient()
    const entityName = 'installation'

    const notificationCommand = new NotificationCommand(clientForRestApi, entityName)
    const installationDefinition = new StandardInstallationDefinition(clientForRestApi, entityName)

    const customCommandHandler = createCustomCommandHandler({
      notification: notificationCommand
    })

    const validationHandler = createValidationHandler({
      users: {},
      nonUsers: { installation: installationDefinition },
      customQueries: {},
      customCommands: { notification: notificationCommand },
    })

    const executionWrapper = createExecutionWrapper({
      users: {},
      nonUsers: { installation: installationDefinition },
      customQueries: {},
      customCommands: { notification: notificationCommand },
    })

    const restApiHandler = new PhenylRestApi({
      client: clientForRestApi,
      customCommandHandler,
      validationHandler,
      executionWrapper,
    })

    const server = new PhenylHttpServer(createServer(), { restApiHandler })
    server.listen(8080)

    client = new PhenylHttpClient({ url: 'http://localhost:8080' })
  })

  it('registers installation', async () => {
    const installation = {
      id: 'installation',
      userId: 'dummy',
      os: 'android',
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
    assert(result.entity.os === 'android')
  })

  it('can delete installation with idDeleteCommand', async () => {
    const installation = {
      id: 'installationToDelete',
      userId: 'user1',
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
    await client.findOne({
      entityName: 'installation',
      where: { userId: 'user1' }
    }).catch((error) => {
      assert(error.type === 'NotFound')
    })
  })

  it('can delete installation with multiDeleteCommand', async () => {
    const where = { os: 'iOS' }
    const result = await client.delete({
      entityName: 'installation',
      where,
    })

    assert(result.ok === 1)
    await client.findOne({
      entityName: 'installation',
      where,
    }).catch((error) => {
      assert(error.type === 'NotFound')
    })
  })

  it('throws error except get, findOne, insertOne and delete', async () => {
    const installation = await client.get({
      entityName: 'installation',
      id: 'installation',
    })

    const { versionId } = installation
    await client.pull({
      entityName: 'installation',
      id: 'installation',
      versionId,
    }).catch((error) => {
      assert(error.type === 'BadRequest')
    })
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
