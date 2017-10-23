// @flow

import type {
  CoreClient,
  CommandResultOrError,
  CustomQuery,
  CustomQueryResultOrError,
  CustomCommand,
  CustomCommandResultOrError,
  DeleteCommand,
  MultiValuesCommandResultOrError,
  GetCommandResultOrError,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  SingleInsertCommand,
  MultiInsertCommand,
  LoginCommand,
  LoginCommandResultOrError,
  LogoutCommand,
  LogoutCommandResultOrError,
  RequestData,
  ResponseData,
  HttpClientParams,
  ClientPathModifier,
  QueryResultOrError,
  SingleQueryResultOrError,
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
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    throw new Error('No implementation')
  }

  /**
   *
   */
  async find(query: WhereQuery, sessionId?: ?Id): Promise<QueryResultOrError> {
    const reqData = { method: 'find', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.find != null) return resData.find
    throw new Error(`Invalid response data: property name "find" is not found in response.`)
  }

  /**
   *
   */
  async findOne(query: WhereQuery, sessionId?: ?Id): Promise<SingleQueryResultOrError> {
    const reqData = { method: 'findOne', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.findOne != null) return resData.findOne
    throw new Error(`Invalid response data: property name "findOne" is not found in response.`)
  }

  /**
   *
   */
  async get(query: IdQuery, sessionId?: ?Id): Promise<SingleQueryResultOrError> {
    const reqData = { method: 'get', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.get != null) return resData.get
    throw new Error(`Invalid response data: property name "get" is not found in response.`)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery, sessionId?: ?Id): Promise<QueryResultOrError> {
    const reqData = { method: 'getByIds', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.getByIds != null) return resData.getByIds
    throw new Error(`Invalid response data: property name "getByIds" is not found in response.`)
  }

  /**
   *
   */
  async insert(command: InsertCommand, sessionId?: ?Id): Promise<CommandResultOrError> {
    const reqData = { method: 'insert', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.insert != null) return resData.insert
    throw new Error(`Invalid response data: property name "insert" is not found in response.`)
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand, sessionId?: ?Id): Promise<GetCommandResultOrError> {
    const reqData = { method: 'insertAndGet', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.insertAndGet != null) return resData.insertAndGet
    throw new Error(`Invalid response data: property name "insertAndGet" is not found in response.`)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand, sessionId?: ?Id): Promise<MultiValuesCommandResultOrError> {
    const reqData = { method: 'insertAndGetMulti', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.insertAndGetMulti != null) return resData.insertAndGetMulti
    throw new Error(`Invalid response data: property name "insertAndGetMulti" is not found in response.`)
  }

  /**
   *
   */
  async update(command: UpdateCommand, sessionId?: ?Id): Promise<CommandResultOrError> {
    const reqData = { method: 'update', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.update != null) return resData.update
    throw new Error(`Invalid response data: property name "update" is not found in response.`)
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand, sessionId?: ?Id): Promise<GetCommandResultOrError> {
    const reqData = { method: 'updateAndGet', payload: command, sessionId}
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.updateAndGet != null) return resData.updateAndGet
    throw new Error(`Invalid response data: property name "updateAndGet" is not found in response.`)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand, sessionId?: ?Id): Promise<MultiValuesCommandResultOrError> {
    const reqData = { method: 'updateAndFetch', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.updateAndFetch != null) return resData.updateAndFetch
    throw new Error(`Invalid response data: property name "updateAndFetch" is not found in response.`)
  }

  /**
   *
   */
  async delete(command: DeleteCommand, sessionId?: ?Id): Promise<CommandResultOrError> {
    const reqData = { method: 'delete', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.delete != null) return resData.delete
    throw new Error(`Invalid response data: property name "delete" is not found in response.`)
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery, sessionId?: ?Id): Promise<CustomQueryResultOrError> {
    const reqData = { method: 'runCustomQuery', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.runCustomQuery != null) return resData.runCustomQuery
    throw new Error(`Invalid response data: property name "runCustomQuery" is not found in response.`)
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand, sessionId?: ?Id): Promise<CustomCommandResultOrError> {
    const reqData = { method: 'runCustomCommand', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.runCustomCommand != null) return resData.runCustomCommand
    throw new Error(`Invalid response data: property name "runCustomCommand" is not found in response.`)
  }

  /**
   *
   */
  async login(command: LoginCommand, sessionId?: ?Id): Promise<LoginCommandResultOrError> {
    const reqData = { method: 'login', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.login != null) return resData.login
    throw new Error(`Invalid response data: property name "login" is not found in response.`)
  }

  /**
   *
   */
  async logout(command: LogoutCommand, sessionId?: ?Id): Promise<LogoutCommandResultOrError> {
    const reqData = { method: 'logout', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.error != null) return resData.error
    if (resData.logout != null) return resData.logout
    throw new Error(`Invalid response data: property name "logout" is not found in response.`)
  }
}
