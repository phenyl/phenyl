// @flow
import {
  assertValidRequestData,
  createErrorResult,
} from 'phenyl-utils/jsnext'

import {
  passThroughHandler,
  noHandler,
  simpleExecutionWrapper
} from './default-handlers.js'

import type {
  Id,
  RequestData,
  ResponseData,
  ClientPool,
  PhenylRunner,
  Session,
  AclHandler,
  ValidationHandler,
  CustomQueryHandler,
  CustomCommandHandler,
  AuthenticationHandler,
  ExecutionWrapper,
  LoginCommand,
  LoginCommandResultOrError,
  LogoutCommand,
  LogoutCommandResultOrError,
} from 'phenyl-interfaces'

type PhenylCoreParams = {
  clients: ClientPool,
  aclHandler?: AclHandler,
  validationHandler?: ValidationHandler,
  customQueryHandler?: CustomQueryHandler,
  customCommandHandler?: CustomCommandHandler,
  authenticationHandler?: AuthenticationHandler,
  executionWrapper?: ExecutionWrapper,
}

/**
 *
 */
export default class PhenylCore implements PhenylRunner {
  clients: ClientPool
  aclHandler: AclHandler
  validationHandler: ValidationHandler
  customQueryHandler: CustomQueryHandler
  customCommandHandler: CustomCommandHandler
  authenticationHandler: AuthenticationHandler
  executionWrapper: ExecutionWrapper

  constructor(params: PhenylCoreParams) {
    this.clients = params.clients
    this.aclHandler = params.aclHandler || passThroughHandler
    this.validationHandler = params.validationHandler || passThroughHandler
    this.customQueryHandler = params.customQueryHandler || noHandler
    this.customCommandHandler = params.customCommandHandler || noHandler
    this.authenticationHandler = params.authenticationHandler || noHandler
    this.executionWrapper = params.executionWrapper || simpleExecutionWrapper
  }

  /**
   *
   */
  async run(reqData: RequestData): Promise<ResponseData> {
    const session = await this.clients.sessionClient.get(reqData.sessionId)

    try {
      // 0. Request data validation
      assertValidRequestData(reqData)

      // 1. ACL
      const isAccessible = await this.aclHandler(reqData, session, this.clients)
      if (!isAccessible) {
        return { error: createErrorResult(new Error('Authorization Required.'), 'Unauthorized') }
      }

      // 2. Validation
      const isValid = await this.validationHandler(reqData, session, this.clients)
      if (!isValid) {
        return { error: createErrorResult(new Error('Params are not valid.'), 'BadRequest') }
      }
      // 3. Execution
      return this.executionWrapper(reqData, session, this.clients, this.execute.bind(this))
    }
    catch (e) {
      return { error: createErrorResult(e) }
    }
  }

  /**
   *
   */
  async execute(reqData: RequestData, session: ?Session): Promise<ResponseData> {
    const { entityClient } = this.clients

    switch (reqData.method) {
      case 'find': {
        const result = await entityClient.find(reqData.payload)
        return result.ok ? { find: result } : { error: result }
      }
      case 'findOne': {
        const result = await entityClient.findOne(reqData.payload)
        return result.ok ? { findOne: result } : { error: result }
      }
      case 'get': {
        const result = await entityClient.get(reqData.payload)
        return result.ok ? { get: result } : { error: result }
      }
      case 'getByIds': {
        const result = await entityClient.getByIds(reqData.payload)
        return result.ok ? { getByIds: result } : { error: result }
      }
      case 'insert': {
        const result = await entityClient.insert(reqData.payload)
        return result.ok ? { insert: result } : { error: result }
      }
      case 'insertAndGet': {
        const result = await entityClient.insertAndGet(reqData.payload)
        return result.ok ? { insertAndGet: result } : { error: result }
      }
      case 'insertAndGetMulti': {
        const result = await entityClient.insertAndGetMulti(reqData.payload)
        return result.ok ? { insertAndGetMulti: result } : { error: result }
      }
      case 'update': {
        const result = await entityClient.update(reqData.payload)
        return result.ok ? { update: result } : { error: result }
      }
      case 'updateAndGet': {
        const result = await entityClient.updateAndGet(reqData.payload)
        return result.ok ? { updateAndGet: result } : { error: result }
      }
      case 'updateAndFetch': {
        const result = await entityClient.updateAndFetch(reqData.payload)
        return result.ok ? { updateAndFetch: result } : { error: result }
      }
      case 'delete': {
        const result = await entityClient.delete(reqData.payload)
        return result.ok ? { delete: result } : { error: result }
      }
      case 'runCustomQuery': {
        const result = await this.customQueryHandler(reqData.payload, session, this.clients)
        return result.ok ? { runCustomQuery: result } : { error: result }
      }
      case 'runCustomCommand': {
        const result = await this.customCommandHandler(reqData.payload, session, this.clients)
        return result.ok ? { runCustomCommand: result } : { error: result }
      }
      case 'login': {
        const result = await this.login(reqData.payload, session)
        return result.ok ? { login: result } : { error: result }
      }
      case 'logout': {
        const result = await this.logout(reqData.payload, session)
        return result.ok ? { logout: result } : { error: result }
      }
      default: {
        return { error: createErrorResult(new Error('Invalid method name.'), 'NotFound') }
      }
    }
  }

  /**
   * create Session
   */
  async login(loginCommand: LoginCommand, session: ?Session): Promise<LoginCommandResultOrError> {
    try {
      const result = await this.authenticationHandler(loginCommand, session, this.clients)

      // login failed
      if (!result.ok) {
        return createErrorResult(result.error, result.resultType)
      }

      const newSession = await this.clients.sessionClient.create(result.preSession)
      return {
        ok: 1,
        user: result.user,
        session: newSession
      }
    }
    catch (e) {
      return createErrorResult(e)
    }
  }

  /**
   * delete Session by sessionId if exists.
   */
  async logout(logoutCommand: LogoutCommand, session: ?Session): Promise<LogoutCommandResultOrError> {
    const { sessionId } = logoutCommand
    try {
      const result = await this.clients.sessionClient.delete(sessionId)
      // sessionId not found
      if (!result) {
        return createErrorResult(new Error('sessionId not found'), 'BadRequest')
      }
      return { ok: 1 }
    }
    catch (e) {
        return createErrorResult(e)
    }
  }
}
