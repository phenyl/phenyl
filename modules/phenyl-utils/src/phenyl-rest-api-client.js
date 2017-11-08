// @flow
import {
  createErrorResult
} from './create-error-result.js'

import type {
  RestApiClient,
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
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
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
 * Client to access to PhenylRestApi.
 *
 * (Query | Command) + sessionId => RequestData => ResponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                     This part is abstract.
 *
 * Child classes must implements handleRequestData(reqData: RequestData) => Promise<ResponseData>
 * For example, PhenylHttpClient is the child and its "handleRequestData()" is to access to PhenylRestApi via HttpServer.
 * Also, PhenylRestApiDirectClient is the direct client which contains PhenylRestApi instance.
 */
export class PhenylRestApiClient implements RestApiClient {

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
    if (resData.type === 'find') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async findOne(query: WhereQuery, sessionId?: ?Id): Promise<SingleQueryResult> {
    const reqData = { method: 'findOne', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'findOne') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async get(query: IdQuery, sessionId?: ?Id): Promise<SingleQueryResult> {
    const reqData = { method: 'get', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'get') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery, sessionId?: ?Id): Promise<QueryResult> {
    const reqData = { method: 'getByIds', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'getByIds') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async pull(query: PullQuery, sessionId?: ?Id): Promise<PullQueryResult> {
    const reqData = { method: 'pull', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'pull') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insert(command: InsertCommand, sessionId?: ?Id): Promise<CommandResult> {
    const reqData = { method: 'insert', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insert') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand, sessionId?: ?Id): Promise<GetCommandResult> {
    const reqData = { method: 'insertAndGet', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGet') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand, sessionId?: ?Id): Promise<MultiValuesCommandResult> {
    const reqData = { method: 'insertAndGetMulti', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGetMulti') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async update(command: UpdateCommand, sessionId?: ?Id): Promise<CommandResult> {
    const reqData = { method: 'update', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'update') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand, sessionId?: ?Id): Promise<GetCommandResult> {
    const reqData = { method: 'updateAndGet', payload: command, sessionId}
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndGet') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand, sessionId?: ?Id): Promise<MultiValuesCommandResult> {
    const reqData = { method: 'updateAndFetch', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndFetch') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }
  /**
   *
   */
  async push(command: PushCommand, sessionId?: ?Id): Promise<PushCommandResult> {
    const reqData = { method: 'push', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'push') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async delete(command: DeleteCommand, sessionId?: ?Id): Promise<CommandResult> {
    const reqData = { method: 'delete', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'delete') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery, sessionId?: ?Id): Promise<CustomQueryResult> {
    const reqData = { method: 'runCustomQuery', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomQuery') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand, sessionId?: ?Id): Promise<CustomCommandResult> {
    const reqData = { method: 'runCustomCommand', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomCommand') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async login(command: LoginCommand, sessionId?: ?Id): Promise<LoginCommandResult> {
    const reqData = { method: 'login', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'login') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async logout(command: LogoutCommand, sessionId?: ?Id): Promise<LogoutCommandResult> {
    const reqData = { method: 'logout', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'logout') return resData.payload
    throw createErrorResult(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }
}
