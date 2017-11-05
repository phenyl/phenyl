// @flow
import {
  createErrorResult
} from './create-error-result.js'

import type {
  CoreClient,
  CommandResult,
  CustomQuery,
  CustomQueryResult,
  CustomCommand,
  CustomCommandResult,
  DeleteCommand,
  MultiValuesCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  RequestData,
  ResponseData,
  QueryResult,
  SingleQueryResult,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

/**
 * @abstract
 * Client to access to PhenylCore.
 *
 * (Query | Command) + sessionId => RequestData => ResponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                     This part is abstract.
 *
 * Child classes must implements handleRequestData(reqData: RequestData) => Promise<ResponseData>
 * For example, PhenylHttpClient is the child and its "handleRequestData()" is to access to PhenylCore via HttpServer.
 * Also, PhenylCoreDirectClient is the direct client which contains PhenylCore instance.
 */
export class PhenylCoreClient implements CoreClient {

  /**
   * @abstract
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> { // eslint-disable-line no-unused-vars
    throw new Error('No implementation')
  }

  /**
   *
   */
  async find(query: WhereQuery, sessionId?: ?Id): Promise<QueryResult> {
    const reqData = { method: 'find', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'find' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "find" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async findOne(query: WhereQuery, sessionId?: ?Id): Promise<SingleQueryResult> {
    const reqData = { method: 'findOne', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'findOne' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "findOne" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async get(query: IdQuery, sessionId?: ?Id): Promise<SingleQueryResult> {
    const reqData = { method: 'get', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'get' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "get" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery, sessionId?: ?Id): Promise<QueryResult> {
    const reqData = { method: 'getByIds', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'getByIds' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "getByIds" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async insert(command: InsertCommand, sessionId?: ?Id): Promise<CommandResult> {
    const reqData = { method: 'insert', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insert' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "insert" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand, sessionId?: ?Id): Promise<GetCommandResult> {
    const reqData = { method: 'insertAndGet', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGet' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "insertAndGet" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand, sessionId?: ?Id): Promise<MultiValuesCommandResult> {
    const reqData = { method: 'insertAndGetMulti', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGetMulti' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "insertAndGetMulti" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async update(command: UpdateCommand, sessionId?: ?Id): Promise<CommandResult> {
    const reqData = { method: 'update', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'update' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "update" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand, sessionId?: ?Id): Promise<GetCommandResult> {
    const reqData = { method: 'updateAndGet', payload: command, sessionId}
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndGet' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "updateAndGet" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand, sessionId?: ?Id): Promise<MultiValuesCommandResult> {
    const reqData = { method: 'updateAndFetch', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndFetch' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "updateAndFetch" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async delete(command: DeleteCommand, sessionId?: ?Id): Promise<CommandResult> {
    const reqData = { method: 'delete', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'delete' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "delete" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery, sessionId?: ?Id): Promise<CustomQueryResult> {
    const reqData = { method: 'runCustomQuery', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomQuery' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "runCustomQuery" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand, sessionId?: ?Id): Promise<CustomCommandResult> {
    const reqData = { method: 'runCustomCommand', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomCommand' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "runCustomCommand" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async login(command: LoginCommand, sessionId?: ?Id): Promise<LoginCommandResult> {
    const reqData = { method: 'login', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'login' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "login" or "error". "${resData.type}" is given.`)
  }

  /**
   *
   */
  async logout(command: LogoutCommand, sessionId?: ?Id): Promise<LogoutCommandResult> {
    const reqData = { method: 'logout', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'logout' || resData.type === 'error') throw createErrorResult(resData.payload)
    throw new Error(`Invalid response data: type must be "logout" or "error". "${resData.type}" is given.`)
  }
}
