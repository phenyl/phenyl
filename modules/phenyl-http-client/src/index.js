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
  FetchCommandResultOrError,
  GetCommandResultOrError,
  Id,
  IdQuery,
  IdsQuery,
  InsertCommand,
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
    const reqData = { method: 'find', find: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.find
    if (ret == null) throw new Error(`Invalid response data: property name "find" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async findOne(query: WhereQuery): Promise<SingleQueryResultOrError> {
    const reqData = { method: 'findOne', findOne: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.findOne
    if (ret == null) throw new Error(`Invalid response data: property name "findOne" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async get(query: IdQuery): Promise<SingleQueryResultOrError> {
    const reqData = { method: 'get', get: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.get
    if (ret == null) throw new Error(`Invalid response data: property name "get" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async getByIds(query: IdsQuery): Promise<QueryResultOrError> {
    const reqData = { method: 'getByIds', getByIds: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.getByIds
    if (ret == null) throw new Error(`Invalid response data: property name "getByIds" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async insert(command: InsertCommand): Promise<CommandResultOrError> {
    const reqData = { method: 'insert', insert: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.insert
    if (ret == null) throw new Error(`Invalid response data: property name "insert" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async insertAndGet(command: InsertCommand): Promise<GetCommandResultOrError> {
    const reqData = { method: 'insertAndGet', insertAndGet: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.insertAndGet
    if (ret == null) throw new Error(`Invalid response data: property name "insertAndGet" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async insertAndFetch(command: InsertCommand): Promise<FetchCommandResultOrError> {
    const reqData = { method: 'insertAndFetch', insertAndFetch: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.insertAndFetch
    if (ret == null) throw new Error(`Invalid response data: property name "insertAndFetch" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async update(command: UpdateCommand): Promise<CommandResultOrError> {
    const reqData = { method: 'update', update: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.update
    if (ret == null) throw new Error(`Invalid response data: property name "update" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async updateAndGet(command: UpdateCommand): Promise<GetCommandResultOrError> {
    const reqData = { method: 'updateAndGet', updateAndGet: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.updateAndGet
    if (ret == null) throw new Error(`Invalid response data: property name "updateAndGet" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async updateAndFetch(command: UpdateCommand): Promise<FetchCommandResultOrError> {
    const reqData = { method: 'updateAndFetch', updateAndFetch: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.updateAndFetch
    if (ret == null) throw new Error(`Invalid response data: property name "updateAndFetch" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async delete(command: DeleteCommand): Promise<CommandResultOrError> {
    const reqData = { method: 'delete', delete: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.delete
    if (ret == null) throw new Error(`Invalid response data: property name "delete" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async runCustomQuery(query: CustomQuery): Promise<CustomQueryResultOrError> {
    const reqData = { method: 'runCustomQuery', runCustomQuery: query }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.runCustomQuery
    if (ret == null) throw new Error(`Invalid response data: property name "runCustomQuery" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async runCustomCommand(command: CustomCommand): Promise<CustomCommandResultOrError> {
    const reqData = { method: 'runCustomCommand', runCustomCommand: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.runCustomCommand
    if (ret == null) throw new Error(`Invalid response data: property name "runCustomCommand" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async login(command: LoginCommand): Promise<LoginCommandResultOrError> {
    const reqData = { method: 'login', login: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.login
    if (ret == null) throw new Error(`Invalid response data: property name "login" is not found in response.`)
    return ret
  }

  /**
   *
   */
  async logout(command: LogoutCommand): Promise<LogoutCommandResultOrError> {
    const reqData = { method: 'logout', logout: command }
    const resData = await this.request(reqData)
    if (resData.error != null) return resData.error
    const ret = resData.logout
    if (ret == null) throw new Error(`Invalid response data: property name "logout" is not found in response.`)
    return ret
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
