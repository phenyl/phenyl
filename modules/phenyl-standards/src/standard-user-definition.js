// @flow

import powerCrypt from 'power-crypt/jsnext'
import {
  createServerError,
} from 'phenyl-utils/jsnext'

import { StandardEntityDefinition } from './standard-entity-definition.js'
import { encryptPasswordInRequestData } from './encrypt-password-in-request-data.js'
import { removePasswordFromResponseData } from './remove-password-from-response-data.js'

import type {
  EntityClient,
  EntityDefinition,
  UserDefinition,
  LoginCommand,
  Session,
  AuthenticationResult,
  RequestData,
  ResponseData,
  RestApiExecution,
} from 'phenyl-interfaces'

import type {
  EncryptFunction,
} from '../decls/index.js.flow'

export type StandardUserDefinitionParams = {
  entityClient: EntityClient,
  encrypt?: EncryptFunction,
  accountPropName?: string,
  passwordPropName?: string,
  ttl?: number,
}

export class StandardUserDefinition extends StandardEntityDefinition implements EntityDefinition, UserDefinition {
  entityClient: EntityClient
  encrypt: EncryptFunction
  accountPropName: string
  passwordPropName: string
  ttl: number

  constructor(params: StandardUserDefinitionParams) {
    super(params)
    this.entityClient = params.entityClient
    this.encrypt = params.encrypt || powerCrypt // TODO: pass salt string to powerCrypt
    this.accountPropName = params.accountPropName || 'account'
    this.passwordPropName = params.passwordPropName || 'password'
    this.ttl = params.ttl || 60 * 60 * 24 * 365 // one year
  }

  async authentication(loginCommand: LoginCommand, session: ?Session): Promise<AuthenticationResult> { // eslint-disable-line no-unused-vars
    const { accountPropName, passwordPropName, ttl } = this
    const { credentials, entityName } = loginCommand

    const account = credentials[accountPropName]
    const password = credentials[passwordPropName]
    try {
      const result = await this.entityClient.findOne({
        entityName,
        where: {
          [accountPropName]: account,
          [passwordPropName]: this.encrypt(password),
        },
      })
      const user = result.entity
      const expiredAt = new Date(Date.now() + ttl * 1000).toISOString()
      const preSession = { expiredAt, entityName, userId: user.id }
      return { ok: 1, preSession, user, versionId: result.versionId }
    }
    catch (e) {
      throw createServerError(e.message, 'Unauthorized')
    }
  }

  async wrapExecution(reqData: RequestData, session: ?Session, execution: RestApiExecution): Promise<ResponseData> {
    const newReqData = encryptPasswordInRequestData(reqData, this.passwordPropName, this.encrypt)
    const resData = await execution(newReqData, session)
    const newResData = removePasswordFromResponseData(resData, this.passwordPropName)
    return newResData
  }
}
