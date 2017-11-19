// @flow
/* eslint-disable no-unused-vars */
import {
  switchByRequestMethod
} from 'phenyl-utils/jsnext'

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
  userId: Id,
  entityName: string,
  payload: Object,
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
    switchByRequestMethod(reqData, {
      async insertOne(payload) {
        // $FlowIssue(pre-installation)
        const preInstallation: PreEntity<InstallationEntity> = payload.value
        const where = { userId: preInstallation.userId }
        this.client.findOne({ entityName: this.name, where })
      },

      async handleDefault(reqData) {
        throw new Error(`Method not allowed "${reqData.method}" to the entityName "${this.name}".`)
      }
    })

  }

  async wrapExecution(reqData: RequestData, session: ?Session, execution: RestApiExecution): Promise<ResponseData> {
    return execution(reqData, session)
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
    const { entityName, userId } = params
    const where = { entityName, userId }
    const installationResult = await this.client.findOne({ entityName: this.installationEntityName, where })
    const installation: InstallationEntity = installationResult.entity

    // notify(installation.os, installation.deviceToken, params.payload)

    return {
      ok: 1
    }
  }


}
