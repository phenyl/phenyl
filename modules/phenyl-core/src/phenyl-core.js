// @flow
import {
  assertValidRequestData,
  createErrorResult,
} from 'phenyl-utils/jsnext'

import {
  passThroughHandler,
  noOperationHandler,
  noHandler,
  simpleExecutionWrapper
} from './default-handlers.js'
import PhenylCoreDirectClient from './direct-client.js'

import type {
  RequestData,
  ResponseData,
  ClientPool,
  PhenylRunner,
  Session,
  AuthorizationHandler,
  ValidationHandler,
  CustomQueryHandler,
  CustomCommandHandler,
  AuthenticationHandler,
  ExecutionWrapper,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
} from 'phenyl-interfaces'

type PhenylCoreParams = {
  clients: ClientPool,
  authorizationHandler?: AuthorizationHandler,
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
  authorizationHandler: AuthorizationHandler
  validationHandler: ValidationHandler
  customQueryHandler: CustomQueryHandler
  customCommandHandler: CustomCommandHandler
  authenticationHandler: AuthenticationHandler
  executionWrapper: ExecutionWrapper

  constructor(params: PhenylCoreParams) {
    this.clients = params.clients
    this.authorizationHandler = params.authorizationHandler || passThroughHandler
    this.validationHandler = params.validationHandler || noOperationHandler
    this.customQueryHandler = params.customQueryHandler || noHandler
    this.customCommandHandler = params.customCommandHandler || noHandler
    this.authenticationHandler = params.authenticationHandler || noHandler
    this.executionWrapper = params.executionWrapper || simpleExecutionWrapper
  }

  /**
   * @public
   */
  async run(reqData: RequestData): Promise<ResponseData> {
    try {
      // 0. Request data validation
      assertValidRequestData(reqData)

      // 1. Get session information
      const session = await this.clients.sessionClient.get(reqData.sessionId)

      // 2. Authorization
      const isAccessible = await this.authorizationHandler(reqData, session)
      if (!isAccessible) {
        return { type: 'error', payload: createErrorResult('Authorization Required.', 'Unauthorized') }
      }

      // 3. Validation
      try {
        await this.validationHandler(reqData, session)
      }
      catch (validationError) {
        validationError.message = `Validation Failed. ${validationError.mesage}`
        return { type: 'error', payload: createErrorResult(validationError, 'BadRequest') }
      }

      // 4. Execution
      const resData = await this.executionWrapper(reqData, session, this.execute.bind(this))
      return resData
    }
    catch (e) {
      return { type: 'error', payload: createErrorResult(e) }
    }
  }

  /**
   * @public
   * Create PhenylCoreDirectClient of this instance.
   */
  createDirectClient(): PhenylCoreDirectClient {
    return new PhenylCoreDirectClient(this)
  }

  /**
   *
   */
  async execute(reqData: RequestData, session: ?Session): Promise<ResponseData> {
    const { entityClient } = this.clients

    switch (reqData.method) {
      case 'find':
        return { type: 'find', payload: await entityClient.find(reqData.payload) }

      case 'findOne':
        return { type: 'findOne', payload: await entityClient.findOne(reqData.payload) }

      case 'get':
        return { type: 'get', payload: await entityClient.get(reqData.payload) }

      case 'getByIds':
        return { type: 'getByIds', payload: await entityClient.getByIds(reqData.payload) }

      case 'pull':
        return { type: 'pull', payload: await entityClient.pull(reqData.payload) }

      case 'insert':
        return { type: 'insert', payload: await entityClient.insert(reqData.payload) }

      case 'insertAndGet':
        return { type: 'insertAndGet', payload: await entityClient.insertAndGet(reqData.payload) }

      case 'insertAndGetMulti':
        return { type: 'insertAndGetMulti', payload: await entityClient.insertAndGetMulti(reqData.payload) }

      case 'update':
        return { type: 'update', payload: await entityClient.update(reqData.payload) }

      case 'updateAndGet':
        return { type: 'updateAndGet', payload: await entityClient.updateAndGet(reqData.payload) }

      case 'updateAndFetch':
        return { type: 'updateAndFetch', payload: await entityClient.updateAndFetch(reqData.payload) }

      case 'push':
        return { type: 'push', payload: await entityClient.push(reqData.payload) }

      case 'delete':
        return { type: 'delete', payload: await entityClient.delete(reqData.payload) }

      case 'runCustomQuery':
        return { type: 'runCustomQuery', payload: await this.customQueryHandler(reqData.payload, session) }

      case 'runCustomCommand':
        return { type: 'runCustomCommand', payload: await this.customCommandHandler(reqData.payload, session) }

      case 'login':
        return { type: 'login', payload: await this.login(reqData.payload, session) }

      case 'logout':
        return { type: 'logout', payload: await this.logout(reqData.payload, session) }

      default: {
        return { type: 'error', payload: createErrorResult('Invalid method name.', 'NotFound') }
      }
    }
  }

  /**
   * create Session
   */
  async login(loginCommand: LoginCommand, session: ?Session): Promise<LoginCommandResult> {
    const result = await this.authenticationHandler(loginCommand, session)
    const newSession = await this.clients.sessionClient.create(result.preSession)
    return {
      ok: 1,
      user: result.user,
      session: newSession
    }
  }

  /**
   * delete Session by sessionId if exists.
   */
  async logout(logoutCommand: LogoutCommand, session: ?Session): Promise<LogoutCommandResult> { // eslint-disable-line no-unused-vars
    const { sessionId } = logoutCommand
    const result = await this.clients.sessionClient.delete(sessionId)
    // sessionId not found
    if (!result) {
      throw createErrorResult('sessionId not found', 'BadRequest')
    }
    return { ok: 1 }
  }
}
