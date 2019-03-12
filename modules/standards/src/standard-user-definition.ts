import powerCrypt from 'power-crypt/jsnext'
import {
  createServerError,
} from '@phenyl/utils'

import { StandardEntityDefinition } from './standard-entity-definition.js'
import { encryptPasswordInRequestData } from './encrypt-password-in-request-data.js'
import { removePasswordFromResponseData } from './remove-password-from-response-data.js'

import {
  GeneralReqResEntityMap,
  Key,
  AuthSetting,
  LoginCommand,
  EntityClient,
  EntityDefinition,
  UserDefinition,
  LoginCommandOf,
  Session,
  AuthenticationResult,
  GeneralRequestData,
  GeneralResponseData,
} from '@phenyl/interfaces'

import {
  EncryptFunction,
} from '../decls/index'

// @TODO: should we put this type in to @phenyl/interfaces?
type RestApiExecution = (
  reqData: GeneralRequestData,
  session: Session | null | undefined
) => Promise<GeneralResponseData>

export type StandardUserDefinitionParams<M extends GeneralReqResEntityMap, A extends AuthSetting> = {
  entityClient: EntityClient<M>,
  encrypt?: EncryptFunction,
  accountPropName?: Key<M[Key<M>]> & Key<A['credentials']>,
  passwordPropName?: Key<M[Key<M>]> & Key<A['credentials']>,
  ttl?: number,
}

export class StandardUserDefinition<M extends GeneralReqResEntityMap = GeneralReqResEntityMap, A extends AuthSetting = AuthSetting> extends StandardEntityDefinition implements EntityDefinition, UserDefinition {
  entityClient: EntityClient<M>
  encrypt: EncryptFunction
  accountPropName: Key<M[Key<M>]> & Key<A['credentials']> | 'account'
  passwordPropName: Key<M[Key<M>]> & Key<A['credentials']> | 'password'
  ttl: number

  constructor(params: StandardUserDefinitionParams<M, A>) {
    super(params)
    this.entityClient = params.entityClient
    this.encrypt = params.encrypt || powerCrypt // TODO: pass salt string to powerCrypt
    this.accountPropName = params.accountPropName || 'account'
    this.passwordPropName = params.passwordPropName || 'password'
    this.ttl = params.ttl || 60 * 60 * 24 * 365 // one year
  }

  async authentication<N extends Key<M>>(loginCommand: LoginCommandOf<A, N>, session: Session | null | undefined): Promise<AuthenticationResult<string, any>> { // eslint-disable-line no-unused-vars
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
      return { preSession, user, versionId: result.versionId }
    }
    catch (e) {
      throw createServerError(e.message, 'Unauthorized')
    }
  }

  async wrapExecution(reqData: GeneralRequestData, session: Session | null | undefined, execution: RestApiExecution): Promise<GeneralResponseData> {
    const newReqData = encryptPasswordInRequestData(reqData, this.passwordPropName, this.encrypt)
    const resData = await execution(newReqData, session)
    const newResData = removePasswordFromResponseData(resData, this.passwordPropName)
    return newResData
  }
}

export const GeneralStandardUserDefinition: typeof StandardUserDefinition = StandardUserDefinition
