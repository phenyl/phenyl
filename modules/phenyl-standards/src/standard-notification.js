// @flow
/* eslint-disable no-unused-vars */

import {
  assign,
} from 'power-assign/jsnext'

import {
  switchByRequestMethod,
  createErrorResult,
} from 'phenyl-utils/jsnext'

import {
  notify
} from './lib/notify.js'

import type {
  Payload
} from './lib/notify.js'

import type {
  CustomCommand,
  CustomCommandDefinition,
  CustomCommandResult,
  EntityClient,
  EntityDefinition,
  Id,
  PreEntity,
  RequestData,
  Session,
  ResponseData,
  RestApiExecution,
} from 'phenyl-interfaces'

type InstallationEntity = {
  id: Id,
  userId: Id,
  entityName: string,
  os: string,
  deviceToken: string,
}

type NotificationCommandParams = {
  appId: string,
  key: string,
  payload: Payload,
}

export class StandardInstallationDefinition implements EntityDefinition {
  client: EntityClient
  name: string

  constructor(client: EntityClient, name: string) {
    this.client = client
    this.name = name
  }

  async authorization(reqData: RequestData, session: ?Session): Promise<boolean> {
    return true
  }

  async validation(reqData: RequestData, session: ?Session): Promise<void> {
    return switchByRequestMethod(reqData, {
      async get(query) {
        assertValidQuery(query)
      },

      async findOne(query) {
        assertValidQuery(query)
      },

      async insertOne(query) {
        assertValidQuery(query)
      },

      async delete(query) {
        assertValidQuery(query)
      },

      handleDefault: async (reqData) => {
        throw new Error(`Method not allowed "${reqData.method}" to the entityName "${this.name}".`)
      }
    })
  }

  async wrapExecution(reqData: RequestData, session: ?Session, execution: RestApiExecution): Promise<ResponseData> {
    const resData = await execution(reqData, session)

    return await switchByRequestMethod(reqData, {
      get: async (payload) => {
        const { id } = payload
        const result = await this.client.get({ entityName: this.name, id })
        return assign(resData, { payload: result })
      },

      findOne: async (payload) => {
        const { where } = payload
        const result = await this.client.findOne({ entityName: this.name, where })
        return assign(resData, { payload: result })
      },

      insertOne: async (payload) => {
        const result = await this.client.insertOne({ entityName: this.name, value: payload.value })
        return assign(resData, { payload: result })
      },

      delete: async (payload) => {
        if (payload.id) {
          const { id } = payload
          const result = await this.client.delete({ entityName: this.name, id })
          return assign(resData, { payload: result })
        }
        if (payload.where) {
          const { where } = payload
          const result = await this.client.delete({ entityName: this.name, where })
          return assign(resData, { payload: result })
        }
      },

      handleDefault: async (reqData, session) => { // eslint-disable-line no-unused-vars
        throw new Error(`Method not allowed "${reqData.method}" to the entityName "${this.name}".`)
      },
    })
  }
}

export class NotificationCommand implements CustomCommandDefinition {
  client: EntityClient
  installationEntityName: string

  constructor(client: EntityClient, installationEntityName: string) {
    this.client = client
    this.installationEntityName = installationEntityName
  }

  async authorization(command: CustomCommand, session: ?Session): Promise<boolean> {
    return true // TODO
  }

  async validation(command: CustomCommand, session: ?Session): Promise<void> {
    if (command.params == null) {
      throw new Error('params must exist.')
    }
  }

  async execution(command: CustomCommand, session: ?Session): Promise<CustomCommandResult> {
    // $FlowIssue(params-exists)
    const params: NotificationCommandParams = command.params
    const { appId, payload, key } = params

    const result = await notify(appId, key, payload).catch((error) => {
      return createErrorResult(error)
    })

    return {
      ok: 1,
      result, // TODO
    }
  }
}

/**
 *
 */
function assertValidQuery(query) {
  // TODO
  return
}
