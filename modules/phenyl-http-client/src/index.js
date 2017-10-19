// @flow
import fp from 'fetch-ponyfill'
import {
  encodeRequest,
  decodeResponse,
} from 'phenyl-http-rules/jsnext'
const { fetch } = fp()

import type {
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
  AuthClient,
  EntityClient,
  CustomClient,
  QueryResultOrError,
  QueryStringParams,
  SingleQueryResultOrError,
  UpdateCommand,
  IdUpdateCommand,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type HttpClientParams = {
  url: string,
  sessionId?: ?Id,
}

export default class PhenylHttpClient implements EntityClient, CustomClient, AuthClient {
  url: string
  sessionId: ?Id

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
    const qs = stringifyQsParams(qsParams)
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
  async find(query: WhereQuery): Promise<QueryResultOrError> {
    const reqData = { method: 'find', payload: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.find != null) return resData.find
    throw new Error(`Invalid response data: property name "find" is not found in response.`)
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    const reqData = { method: 'findOne', payload: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.findOne != null) return resData.findOne
    throw new Error(`Invalid response data: property name "findOne" is not found in response.`)
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    const reqData = { method: 'get', payload: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.get != null) return resData.get
    throw new Error(`Invalid response data: property name "get" is not found in response.`)
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    const reqData = { method: 'getByIds', payload: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.getByIds != null) return resData.getByIds
    throw new Error(`Invalid response data: property name "getByIds" is not found in response.`)
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResultOrError> {
    const reqData = { method: 'insert', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.insert != null) return resData.insert
    throw new Error(`Invalid response data: property name "insert" is not found in response.`)
  }

  /**
   *
   */
  async insertAndGet(command: SingleInsertCommand): Promise<GetCommandResultOrError> {
    const reqData = { method: 'insertAndGet', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.insertAndGet != null) return resData.insertAndGet
    throw new Error(`Invalid response data: property name "insertAndGet" is not found in response.`)
  }

  /**
   *
   */
  async insertAndGetMulti(command: MultiInsertCommand): Promise<MultiValuesCommandResultOrError> {
    const reqData = { method: 'insertAndGetMulti', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.insertAndGetMulti != null) return resData.insertAndGetMulti
    throw new Error(`Invalid response data: property name "insertAndGetMulti" is not found in response.`)
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResultOrError> {
    const reqData = { method: 'update', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.update != null) return resData.update
    throw new Error(`Invalid response data: property name "update" is not found in response.`)
  }

  /**
   *
   */
  async updateAndGet(command: IdUpdateCommand): Promise<GetCommandResultOrError> {
    const reqData = { method: 'updateAndGet', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.updateAndGet != null) return resData.updateAndGet
    throw new Error(`Invalid response data: property name "updateAndGet" is not found in response.`)
  }

  /**
   *
   */
  async updateAndFetch(command: MultiUpdateCommand): Promise<MultiValuesCommandResultOrError> {
    const reqData = { method: 'updateAndFetch', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.updateAndFetch != null) return resData.updateAndFetch
    throw new Error(`Invalid response data: property name "updateAndFetch" is not found in response.`)
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResultOrError> {
    const reqData = { method: 'delete', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.delete != null) return resData.delete
    throw new Error(`Invalid response data: property name "delete" is not found in response.`)
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery): Promise<CustomQueryResultOrError> {
    const reqData = { method: 'runCustomQuery', payload: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.runCustomQuery != null) return resData.runCustomQuery
    throw new Error(`Invalid response data: property name "runCustomQuery" is not found in response.`)
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand): Promise<CustomCommandResultOrError> {
    const reqData = { method: 'runCustomCommand', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.runCustomCommand != null) return resData.runCustomCommand
    throw new Error(`Invalid response data: property name "runCustomCommand" is not found in response.`)
  }

  /**
   *
   */
  async login(command: LoginCommand): Promise<LoginCommandResultOrError> {
    const reqData = { method: 'login', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.login != null) return resData.login
    throw new Error(`Invalid response data: property name "login" is not found in response.`)
  }

  /**
   *
   */
  async logout(command: LogoutCommand): Promise<LogoutCommandResultOrError> {
    const reqData = { method: 'logout', payload: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    if (resData.logout != null) return resData.logout
    throw new Error(`Invalid response data: property name "logout" is not found in response.`)
  }
}

function stringifyQsParams(qsParams: ?QueryStringParams): string {
  if (qsParams == null) {
    return ''
  }

  return '?' + Object.keys(qsParams).map(name =>
    // $FlowIssue(object-keys-iteration)
    `${name}=${encodeURIComponent(qsParams[name])}`
  ).join('&')
}
