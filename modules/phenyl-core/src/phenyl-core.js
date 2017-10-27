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
import PhenylCoreDirectClient from './direct-client.js'

import type {
  Id,
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
  LoginCommandResultOrError,
  LogoutCommand,
  LogoutCommandResultOrError,
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
    this.validationHandler = params.validationHandler || passThroughHandler
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
        return { type: 'error', payload: createErrorResult(new Error('Authorization Required.'), 'Unauthorized') }
      }

      // 3. Validation
      const isValid = await this.validationHandler(reqData, session)
      if (!isValid) {
        return { type: 'error', payload: createErrorResult(new Error('Params are not valid.'), 'BadRequest') }
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
      case 'find': {
        const payload = await entityClient.find(reqData.payload)
        return payload.ok ? { type: 'find', payload } : { type: 'error', payload }
      }
      case 'findOne': {
        const payload = await entityClient.findOne(reqData.payload)
        return payload.ok ? { type: 'findOne', payload } : { type: 'error', payload }
      }
      case 'get': {
        const payload = await entityClient.get(reqData.payload)
        return payload.ok ? { type: 'get', payload } : { type: 'error', payload }
      }
      case 'getByIds': {
        const payload = await entityClient.getByIds(reqData.payload)
        return payload.ok ? { type: 'getByIds', payload } : { type: 'error', payload }
      }
      case 'insert': {
        const payload = await entityClient.insert(reqData.payload)
        return payload.ok ? { type: 'insert', payload } : { type: 'error', payload }
      }
      case 'insertAndGet': {
        const payload = await entityClient.insertAndGet(reqData.payload)
        return payload.ok ? { type: 'insertAndGet', payload } : { type: 'error', payload }
      }
      case 'insertAndGetMulti': {
        const payload = await entityClient.insertAndGetMulti(reqData.payload)
        return payload.ok ? { type: 'insertAndGetMulti', payload } : { type: 'error', payload }
      }
      case 'update': {
        const payload = await entityClient.update(reqData.payload)
        return payload.ok ? { type: 'update', payload } : { type: 'error', payload }
      }
      case 'updateAndGet': {
        const payload = await entityClient.updateAndGet(reqData.payload)
        return payload.ok ? { type: 'updateAndGet', payload } : { type: 'error', payload }
      }
      case 'updateAndFetch': {
        const payload = await entityClient.updateAndFetch(reqData.payload)
        return payload.ok ? { type: 'updateAndFetch', payload } : { type: 'error', payload }
      }
      case 'delete': {
        const payload = await entityClient.delete(reqData.payload)
        return payload.ok ? { type: 'delete', payload } : { type: 'error', payload }
      }
      case 'runCustomQuery': {
        const payload = await this.customQueryHandler(reqData.payload, session)
        return payload.ok ? { type: 'runCustomQuery', payload } : { type: 'error', payload }
      }
      case 'runCustomCommand': {
        const payload = await this.customCommandHandler(reqData.payload, session)
        return payload.ok ? { type: 'runCustomCommand', payload } : { type: 'error', payload }
      }
      case 'login': {
        const payload = await this.login(reqData.payload, session)
        return payload.ok ? { type: 'login', payload } : { type: 'error', payload }
      }
      case 'logout': {
        const payload = await this.logout(reqData.payload, session)
        return payload.ok ? { type: 'logout', payload } : { type: 'error', payload }
      }
      default: {
        return { type: 'error', payload: createErrorResult(new Error('Invalid method name.'), 'NotFound') }
      }
    }
  }

  /**
   * create Session
   */
  async login(loginCommand: LoginCommand, session: ?Session): Promise<LoginCommandResultOrError> {
    try {
      const result = await this.authenticationHandler(loginCommand, session)

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
