// @flow
import fp from 'fetch-ponyfill'
import {
  encodeRequest,
  decodeResponse,
} from 'phenyl-http-rules/jsnext'
const { fetch } = fp()

import type {
  CommandResult,
  CustomQuery,
  CustomQueryResult,
  CustomCommand,
  CustomCommandResult,
  DeleteCommand,
  FetchCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  RequestData,
  ResponseData,
  AuthClient,
  EntityClient,
  CustomClient,
  QueryResult,
  SingleQueryResult,
  UpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type HttpClientParams = {
  url: string,
  sessionId: Id,
}

export default class PhenylHttpClient implements EntityClient, CustomClient, AuthClient {
  url: string
  sessionId: Id

  constructor(params: HttpClientParams) {
    this.url = params.url
    this.sessionId = params.sessionId
  }

  async request(reqData: RequestData): Promise<ResponseData> {
    const {
      method,
      headers,
      path,
      qsParams,
      body,
    } = encodeRequest(reqData, this.sessionId)
    const qs = ''
    const url = `${this.url}${path}${qs}`

    const response = await fetch(url, {
      method,
      headers,
      body,
    }).then(res => res.json())

    return decodeResponse(response)
  }
  /**
   *
   */
  async find(query: WhereQuery): Promise<QueryResult> {
    const reqData = { method: 'find', find: query }
    const resData = await this.request(reqData)
    const ret = resData.find
    if (ret == null) throw new Error(`Invalid response data: property name "find" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResult> {
    const reqData = { method: 'findOne', findOne: query }
    const resData = await this.request(reqData)
    const ret = resData.findOne
    if (ret == null) throw new Error(`Invalid response data: property name "findOne" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResult> {
    const reqData = { method: 'get', get: query }
    const resData = await this.request(reqData)
    const ret = resData.get
    if (ret == null) throw new Error(`Invalid response data: property name "get" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResult> {
    const reqData = { method: 'getByIds', getByIds: query }
    const resData = await this.request(reqData)
    const ret = resData.getByIds
    if (ret == null) throw new Error(`Invalid response data: property name "getByIds" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResult> {
    const reqData = { method: 'insert', insert: command }
    const resData = await this.request(reqData)
    const ret = resData.insert
    if (ret == null) throw new Error(`Invalid response data: property name "insert" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async insertAndGet(command: InsertCommand): Promise<GetCommandResult> {
    const reqData = { method: 'insertAndGet', insertAndGet: command }
    const resData = await this.request(reqData)
    const ret = resData.insertAndGet
    if (ret == null) throw new Error(`Invalid response data: property name "insertAndGet" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async insertAndFetch(command: InsertCommand): Promise<FetchCommandResult> {
    const reqData = { method: 'insertAndFetch', insertAndFetch: command }
    const resData = await this.request(reqData)
    const ret = resData.insertAndFetch
    if (ret == null) throw new Error(`Invalid response data: property name "insertAndFetch" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResult> {
    const reqData = { method: 'update', update: command }
    const resData = await this.request(reqData)
    const ret = resData.update
    if (ret == null) throw new Error(`Invalid response data: property name "update" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async updateAndGet(command: UpdateCommand): Promise<GetCommandResult> {
    const reqData = { method: 'updateAndGet', updateAndGet: command }
    const resData = await this.request(reqData)
    const ret = resData.updateAndGet
    if (ret == null) throw new Error(`Invalid response data: property name "updateAndGet" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async updateAndFetch(command: UpdateCommand): Promise<FetchCommandResult> {
    const reqData = { method: 'updateAndFetch', updateAndGet: command }
    const resData = await this.request(reqData)
    const ret = resData.updateAndFetch
    if (ret == null) throw new Error(`Invalid response data: property name "updateAndFetch" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResult> {
    const reqData = { method: 'delete', delete: command }
    const resData = await this.request(reqData)
    const ret = resData.delete
    if (ret == null) throw new Error(`Invalid response data: property name "delete" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery): Promise<CustomQueryResult> {
    const reqData = { method: 'runCustomQuery', runCustomQuery: query }
    const resData = await this.request(reqData)
    const ret = resData.runCustomQuery
    if (ret == null) throw new Error(`Invalid response data: property name "runCustomQuery" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand): Promise<CustomCommandResult> {
    const reqData = { method: 'runCustomCommand', runCustomCommand: command }
    const resData = await this.request(reqData)
    const ret = resData.runCustomCommand
    if (ret == null) throw new Error(`Invalid response data: property name "runCustomCommand" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async login(command: LoginCommand): Promise<LoginCommandResult> {
    const reqData = { method: 'login', login: command }
    const resData = await this.request(reqData)
    const ret = resData.login
    if (ret == null) throw new Error(`Invalid response data: property name "login" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async logout(command: LogoutCommand): Promise<LogoutCommandResult> {
    const reqData = { method: 'logout', logout: command }
    const resData = await this.request(reqData)
    const ret = resData.logout
    if (ret == null) throw new Error(`Invalid response data: property name "logout" is not found in response.`)
    return ret
  }
}
