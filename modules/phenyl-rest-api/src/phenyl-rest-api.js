// @flow
import {
  assertValidRequestData,
  createServerError,
} from 'phenyl-utils/jsnext'

import {
  passThroughHandler,
  noOperationHandler,
  noHandler,
  simpleExecutionWrapper
} from './default-handlers.js'

import {
  createParamsByFunctionalGroup,
} from './create-params-by-functional-group.js'

import {
  createVersionDiff,
} from './create-version-diff.js'

import type {
  RequestData,
  ResponseData,
  FunctionalGroup,
  EntityClient,
  SessionClient,
  RestApiHandler,
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
  VersionDiffPublisher,
} from 'phenyl-interfaces'

export type PhenylRestApiParams = {
  client: EntityClient,
  sessionClient?: SessionClient,
  authorizationHandler?: AuthorizationHandler,
  validationHandler?: ValidationHandler,
  customQueryHandler?: CustomQueryHandler,
  customCommandHandler?: CustomCommandHandler,
  authenticationHandler?: AuthenticationHandler,
  executionWrapper?: ExecutionWrapper,
  versionDiffPublisher?: VersionDiffPublisher,
}

/**
 *
 */
export class PhenylRestApi implements RestApiHandler {
  client: EntityClient
  sessionClient: SessionClient
  authorizationHandler: AuthorizationHandler
  validationHandler: ValidationHandler
  customQueryHandler: CustomQueryHandler
  customCommandHandler: CustomCommandHandler
  authenticationHandler: AuthenticationHandler
  executionWrapper: ExecutionWrapper
  versionDiffPublisher: ?VersionDiffPublisher

  constructor(params: PhenylRestApiParams) {
    this.client = params.client
    this.sessionClient = params.sessionClient || this.createSessionClient()
    this.authorizationHandler = params.authorizationHandler || passThroughHandler
    this.validationHandler = params.validationHandler || noOperationHandler
    this.customQueryHandler = params.customQueryHandler || noHandler
    this.customCommandHandler = params.customCommandHandler || noHandler
    this.authenticationHandler = params.authenticationHandler || noHandler
    this.executionWrapper = params.executionWrapper || simpleExecutionWrapper
    this.versionDiffPublisher = params.versionDiffPublisher
  }

  /**
   * Create instance from FunctionalGroup.
   * "client" params must be set in 2nd argument.
   *
   * @example
   *   const restApiHandler = PhenylRestApi.createFromFunctionalGroup({
   *     customQueries: {}, customCommands: {}, users: {}, nonUsers: {}
   *   }, { client: new PhenylMemoryClient() })
   */
  static createFromFunctionalGroup(fg: FunctionalGroup, params: PhenylRestApiParams): PhenylRestApi {
    const fgParams = createParamsByFunctionalGroup(fg)
    const newParams = Object.assign({}, params, fgParams)
    return new PhenylRestApi(newParams)
  }

  /**
   * @public
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    try {
      // 0. Request data validation
      assertValidRequestData(reqData)

      // 1. Get session information
      const session = await this.sessionClient.get(reqData.sessionId)

      // 2. Authorization
      const isAccessible = await this.authorizationHandler(reqData, session)
      if (!isAccessible) {
        return { type: 'error', payload: createServerError('Authorization Required.', 'Unauthorized') }
      }

      // 3. Validation
      try {
        await this.validationHandler(reqData, session)
      }
      catch (validationError) {
        validationError.message = `Validation Failed. ${validationError.mesage}`
        return { type: 'error', payload: createServerError(validationError, 'BadRequest') }
      }

      // 4. Execution
      const resData = await this.executionWrapper(reqData, session, this.execute.bind(this))

      // 5. Publish VersionDiff (Side-Effect)
      this.publishVersionDiff(reqData, resData)

      return resData
    }
    catch (e) {
      return { type: 'error', payload: createServerError(e) }
    }
  }

  /**
   *
   */
  async execute(reqData: RequestData, session: ?Session): Promise<ResponseData> {
    switch (reqData.method) {
      case 'find':
        return { type: 'find', payload: await this.client.find(reqData.payload) }

      case 'findOne':
        return { type: 'findOne', payload: await this.client.findOne(reqData.payload) }

      case 'get':
        return { type: 'get', payload: await this.client.get(reqData.payload) }

      case 'getByIds':
        return { type: 'getByIds', payload: await this.client.getByIds(reqData.payload) }

      case 'pull':
        return { type: 'pull', payload: await this.client.pull(reqData.payload) }

      case 'insertOne':
        return { type: 'insertOne', payload: await this.client.insertOne(reqData.payload) }

      case 'insertMulti':
        return { type: 'insertMulti', payload: await this.client.insertMulti(reqData.payload) }

      case 'insertAndGet':
        return { type: 'insertAndGet', payload: await this.client.insertAndGet(reqData.payload) }

      case 'insertAndGetMulti':
        return { type: 'insertAndGetMulti', payload: await this.client.insertAndGetMulti(reqData.payload) }

      case 'updateById':
        return { type: 'updateById', payload: await this.client.updateById(reqData.payload) }

      case 'updateMulti':
        return { type: 'updateMulti', payload: await this.client.updateMulti(reqData.payload) }

      case 'updateAndGet':
        return { type: 'updateAndGet', payload: await this.client.updateAndGet(reqData.payload) }

      case 'updateAndFetch':
        return { type: 'updateAndFetch', payload: await this.client.updateAndFetch(reqData.payload) }

      case 'push':
        return { type: 'push', payload: await this.client.push(reqData.payload) }

      case 'delete':
        return { type: 'delete', payload: await this.client.delete(reqData.payload) }

      case 'runCustomQuery':
        return { type: 'runCustomQuery', payload: await this.customQueryHandler(reqData.payload, session) }

      case 'runCustomCommand':
        return { type: 'runCustomCommand', payload: await this.customCommandHandler(reqData.payload, session) }

      case 'login':
        return { type: 'login', payload: await this.login(reqData.payload, session) }

      case 'logout':
        return { type: 'logout', payload: await this.logout(reqData.payload, session) }

      default: {
        return { type: 'error', payload: createServerError('Invalid method name.', 'NotFound') }
      }
    }
  }

  /**
   * create Session
   */
  async login(loginCommand: LoginCommand, session: ?Session): Promise<LoginCommandResult> {
    const result = await this.authenticationHandler(loginCommand, session)
    const newSession = await this.sessionClient.create(result.preSession)
    return {
      ok: 1,
      user: result.user,
      versionId: result.versionId,
      session: newSession
    }
  }

  /**
   * Publish entity version diffs.
   */
  publishVersionDiff(reqData: RequestData, resData: ResponseData) {
    const { versionDiffPublisher } = this
    if (versionDiffPublisher == null) return
    const versionDiffs = createVersionDiff(reqData, resData)
    for (const versionDiff of versionDiffs) {
      versionDiffPublisher.publishVersionDiff(versionDiff)
    }
  }

  /**
   * delete Session by sessionId if exists.
   */
  async logout(logoutCommand: LogoutCommand, session: ?Session): Promise<LogoutCommandResult> { // eslint-disable-line no-unused-vars
    const { sessionId } = logoutCommand
    const result = await this.sessionClient.delete(sessionId)
    // sessionId not found
    if (!result) {
      throw createServerError('sessionId not found', 'BadRequest')
    }
    return { ok: 1 }
  }

  /**
   * @private
   */
  createSessionClient(): SessionClient {
    try {
      return this.client.createSessionClient()
    }
    catch (e) {
      throw new Error('"sessionClient" is missing in 1st argument of constructor "new PhenylRestApi()". SessionClient can be created by EntityClient ("client" property in argument), but the given client couldn\'t.')
    }
  }
}
