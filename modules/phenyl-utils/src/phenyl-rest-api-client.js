// @flow
import {
  createServerError
} from './create-error.js'

import type {
  RestApiClient,
  CommandParamsOf,
  CommandResultOf,
  CredentialsOf,
  CustomQuery,
  CustomQueryNameOf,
  CustomQueryResult,
  CustomCommand,
  CustomCommandNameOf,
  CustomCommandResult,
  DeleteCommand,
  DeleteCommandResult,
  EntityNameOf,
  EntityOf,
  MultiValuesCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  IdUpdateCommandResult,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommandResult,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  OptionsOf,
  PreEntity,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  QueryParamsOf,
  QueryResult,
  QueryResultOf,
  RequestData,
  ResponseData,
  SessionClient,
  SingleInsertCommand,
  SingleInsertCommandResult,
  SingleQueryResult,
  TypeMap,
  UserEntityNameOf,
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
export class PhenylRestApiClient<TM: TypeMap> implements RestApiClient<TM> {

  /**
   * @abstract
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> { // eslint-disable-line no-unused-vars
    throw new Error('No implementation')
  }

  /**
   *
   */
  async find<N: EntityNameOf<TM>>(query: WhereQuery<N>, sessionId?: ?Id): Promise<QueryResult<EntityOf<TM, N>>> {
    const reqData = { method: 'find', payload: query, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'find') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async findOne<N: EntityNameOf<TM>>(query: WhereQuery<N>, sessionId?: ?Id): Promise<SingleQueryResult<EntityOf<TM, N>>> {
    const reqData = { method: 'findOne', payload: query, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'findOne') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async get<N: EntityNameOf<TM>>(query: IdQuery<N>, sessionId?: ?Id): Promise<SingleQueryResult<EntityOf<TM, N>>> {
    const reqData = { method: 'get', payload: query, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'get') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async getByIds<N: EntityNameOf<TM>>(query: IdsQuery<N>, sessionId?: ?Id): Promise<QueryResult<EntityOf<TM, N>>> {
    const reqData = { method: 'getByIds', payload: query, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'getByIds') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async pull<N: EntityNameOf<TM>>(query: PullQuery<N>, sessionId?: ?Id): Promise<PullQueryResult<EntityOf<TM, N>>> {
    const reqData = { method: 'pull', payload: query, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'pull') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertOne<N: EntityNameOf<TM>>(command: SingleInsertCommand<N, PreEntity<EntityOf<TM, N>>>, sessionId?: ?Id): Promise<SingleInsertCommandResult> {
    const reqData = { method: 'insertOne', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertOne') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertMulti<N: EntityNameOf<TM>>(command: MultiInsertCommand<N, PreEntity<EntityOf<TM, N>>>, sessionId?: ?Id): Promise<MultiInsertCommandResult> {
    const reqData = { method: 'insertMulti', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertMulti') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertAndGet<N: EntityNameOf<TM>>(command: SingleInsertCommand<N, PreEntity<EntityOf<TM, N>>>, sessionId?: ?Id): Promise<GetCommandResult<EntityOf<TM, N>>> {
    const reqData = { method: 'insertAndGet', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGet') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertAndGetMulti<N: EntityNameOf<TM>>(command: MultiInsertCommand<N, PreEntity<EntityOf<TM, N>>>, sessionId?: ?Id): Promise<MultiValuesCommandResult<EntityOf<TM, N>, *>> {
    const reqData = { method: 'insertAndGetMulti', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGetMulti') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateById<N: EntityNameOf<TM>>(command: IdUpdateCommand<N>, sessionId?: ?Id): Promise<IdUpdateCommandResult> {
    const reqData = { method: 'updateById', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateById') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateMulti<N: EntityNameOf<TM>>(command: MultiUpdateCommand<N>, sessionId?: ?Id): Promise<MultiUpdateCommandResult<*>> {
    const reqData = { method: 'updateMulti', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateMulti') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateAndGet<N: EntityNameOf<TM>>(command: IdUpdateCommand<N>, sessionId?: ?Id): Promise<GetCommandResult<EntityOf<TM, N>>> {
    const reqData = { method: 'updateAndGet', payload: command, sessionId}
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndGet') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateAndFetch<N: EntityNameOf<TM>>(command: MultiUpdateCommand<N>, sessionId?: ?Id): Promise<MultiValuesCommandResult<EntityOf<TM, N>, *>> {
    const reqData = { method: 'updateAndFetch', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndFetch') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }
  /**
   *
   */
  async push<N: EntityNameOf<TM>>(command: PushCommand<N>, sessionId?: ?Id): Promise<PushCommandResult<EntityOf<TM, N>>> {
    const reqData = { method: 'push', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'push') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async delete<N: EntityNameOf<TM>>(command: DeleteCommand<N>, sessionId?: ?Id): Promise<DeleteCommandResult> {
    const reqData = { method: 'delete', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'delete') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async runCustomQuery<N: CustomQueryNameOf<TM>>(query: CustomQuery<N, QueryParamsOf<TM, N>>, sessionId?: ?Id): Promise<CustomQueryResult<QueryResultOf<TM, N>>> {
    const reqData = { method: 'runCustomQuery', payload: query, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomQuery') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async runCustomCommand<N: CustomCommandNameOf<TM>>(command: CustomCommand<N, CommandParamsOf<TM, N>>, sessionId?: ?Id): Promise<CustomCommandResult<CommandResultOf<TM, N>>> {
    const reqData = { method: 'runCustomCommand', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomCommand') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async login<N: UserEntityNameOf<TM>>(command: LoginCommand<N, CredentialsOf<TM, N>, OptionsOf<TM, N>>, sessionId?: ?Id): Promise<LoginCommandResult<EntityOf<TM, N>>> {
    const reqData = { method: 'login', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'login') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async logout<N: UserEntityNameOf<TM>>(command: LogoutCommand<N>, sessionId?: ?Id): Promise<LogoutCommandResult> {
    const reqData = { method: 'logout', payload: command, sessionId }
    // $FlowIssue(handleRequestData-is-imcomplete)
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'logout') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   * Create session client.
   * RestApiClient cannot create SessionClient.
   */
  createSessionClient(): SessionClient {
    throw new Error('Cannot create SessionClient from RestApiClient.')
  }
}
