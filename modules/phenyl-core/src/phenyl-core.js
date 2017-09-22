// @flow
import {
  assertValidRequestData,
  createErrorResult,
} from 'phenyl-utils'

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
  LoginHandler,
  ExecutionWrapper,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
} from 'phenyl-interfaces'

type PhenylCoreParams = {
  clients: ClientPool,
  aclHandler: AclHandler,
  validationHandler: ValidationHandler,
  customQueryHandler: CustomQueryHandler,
  customCommandHandler: CustomCommandHandler,
  loginHandler: LoginHandler,
  executionWrapper: ExecutionWrapper,
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
  loginHandler: LoginHandler
  executionWrapper: ExecutionWrapper

  constructor(params: PhenylCoreParams) {
    this.clients = params.clients
    this.aclHandler = params.aclHandler
    this.validationHandler = params.validationHandler
    this.customQueryHandler = params.customQueryHandler
    this.customCommandHandler = params.customCommandHandler
    this.loginHandler = params.loginHandler
    this.executionWrapper = params.executionWrapper
  }

  /**
   *
   */
  async run(reqData: RequestData, sessionId: ?Id): Promise<ResponseData> {
    const session = await this.clients.sessionClient.get(sessionId)

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

    if (reqData.find != null) {
      const result = await entityClient.find(reqData.find)
      return result.ok ? { find: result } : { error: result }
    }
    if (reqData.findOne != null) {
      const result = await entityClient.findOne(reqData.findOne)
      return result.ok ? { findOne: result } : { error: result }
    }
    if (reqData.get != null) {
      const result = await entityClient.get(reqData.get)
      return result.ok ? { get: result } : { error: result }
    }
    if (reqData.getByIds != null) {
      const result = await entityClient.getByIds(reqData.getByIds)
      return result.ok ? { getByIds: result } : { error: result }
    }
    if (reqData.insert != null) {
      const result = await entityClient.insert(reqData.insert)
      return result.ok ? { insert: result } : { error: result }
    }
    if (reqData.insertAndGet != null) {
      const result = await entityClient.insertAndGet(reqData.insertAndGet)
      return result.ok ? { insertAndGet: result } : { error: result }
    }
    if (reqData.insertAndFetch != null) {
      const result = await entityClient.insertAndFetch(reqData.insertAndFetch)
      return result.ok ? { insertAndFetch: result } : { error: result }
    }
    if (reqData.update != null) {
      const result = await entityClient.update(reqData.update)
      return result.ok ? { update: result } : { error: result }
    }
    if (reqData.updateAndGet != null) {
      const result = await entityClient.updateAndGet(reqData.updateAndGet)
      return result.ok ? { updateAndGet: result } : { error: result }
    }
    if (reqData.updateAndFetch != null) {
      const result = await entityClient.updateAndFetch(reqData.updateAndFetch)
      return result.ok ? { updateAndFetch: result } : { error: result }
    }
    if (reqData.delete != null) {
      const result = await entityClient.delete(reqData.delete)
      return result.ok ? { delete: result } : { error: result }
    }

    if (reqData.runCustomQuery != null) {
      const result = await this.customQueryHandler(reqData.runCustomQuery, session, this.clients)
      return result.ok ? { runCustomQuery: result } : { error: result }
    }
    if (reqData.runCustomCommand != null) {
      const result = await this.customCommandHandler(reqData.runCustomCommand, session, this.clients)
      return result.ok ? { runCustomCommand: result } : { error: result }
    }

    if (reqData.login != null) {
      const result = await this.loginHandler(reqData.login, session, this.clients)
      return result.ok ? { login: result } : { error: result }
    }
    if (reqData.logout != null) {
      const result = await this.logout(reqData.logout)
      return result.ok ? { logout: result } : { error: result }
    }

    return { error: createErrorResult(new Error('Invalid method name.'), 'NotFound') }
  }

  async logout(logoutCommand: LogoutCommand): Promise<LogoutCommandResult> {
    await this.clients.sessionClient.delete(logoutCommand.sessionId)
    return { ok: 1 }
  }
}
