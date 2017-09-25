// @flow

import powerCrypt from 'power-crypt/jsnext'

import StandardEntityDefinition from './standard-entity-definition.js'
import { encryptPasswordInRequestData } from './encrypt-password-in-request-data.js'
import { removePasswordFromResponseData } from './remove-password-from-response-data.js'

import type {
  EntityDefinition,
  UserDefinition,
  LoginCommand,
  Session,
  ClientPool,
  AuthenticationResult,
  RequestData,
  ResponseData,
  CoreExecution,
} from 'phenyl-interfaces'

import type {
  EncryptFunction,
} from '../decls/index.js.flow'

export type StandardUserDefinitionParams = {
  encrypt?: EncryptFunction,
  accountPropName?: string,
  passwordPropName?: string,
  ttl?: number,
}

export default class StandardUserDefinition extends StandardEntityDefinition implements EntityDefinition, UserDefinition {
  encrypt: EncryptFunction
  accountPropName: string
  passwordPropName: string
  ttl: number

  constructor(params: StandardUserDefinitionParams) {
    super(params)
    this.encrypt = params.encrypt || powerCrypt // TODO: pass salt string to powerCrypt
    this.accountPropName = params.accountPropName || 'account'
    this.passwordPropName = params.passwordPropName || 'password'
    this.ttl = params.ttl || 60 * 60 * 24 * 365 // one year
  }

  async authentication(loginCommand: LoginCommand, session: ?Session, clients: ClientPool): Promise<AuthenticationResult> {
    const { accountPropName, passwordPropName, ttl } = this
    const { credentials, entityName } = loginCommand
    const { entityClient } = clients

    const account = credentials[accountPropName]
    const password = credentials[passwordPropName]
    const result = await entityClient.findOne({
      entityName,
      where: {
        [accountPropName]: account,
        [passwordPropName]: this.encrypt(password),
      },
    })

    // findOne failed
    if (!result.ok) {
      // NGAuthenticationResult
      return {
        ok: 0,
        error: new Error(result.message),
        resultType: 'Unauthorized',
      }
    }

    // findOne succeeded
    const user = result.value
    const preSession = {
      ttl,
      entityName,
      userId: user.id,
    }

    // OKAuthenticationResult
    return {
      ok: 1,
      preSession,
      user,
    }
  }

  async executionWrapper(reqData: RequestData, session: ?Session, clients: ClientPool, execution: CoreExecution): Promise<ResponseData> {
    const newReqData = encryptPasswordInRequestData(reqData, this.passwordPropName, this.encrypt)
    const resData = await execution(newReqData, session)
    const newResData = removePasswordFromResponseData(resData, this.passwordPropName)
    return newResData
  }
}
