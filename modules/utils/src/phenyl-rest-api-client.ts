import {
  AuthCommandMapOf,
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthSessionOf,
  RequestEntityOf,
  CustomCommand,
  CustomCommandNameOf,
  CustomCommandParamsOf,
  CustomCommandResult,
  CustomCommandResultValueOf,
  CustomQuery,
  CustomQueryNameOf,
  CustomQueryParamsOf,
  CustomQueryResult,
  CustomQueryResultValueOf,
  DeleteCommand,
  DeleteCommandResult,
  EntityNameOf,
  EveryNameOf,
  GeneralTypeMap,
  GetCommandResult,
  HandlerResult,
  IdQuery,
  IdUpdateCommand,
  IdUpdateCommandResult,
  IdsQuery,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommand,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  ResponseAuthUserOf,
  ResponseEntityOf,
  PreEntity,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  QueryResult,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiClient,
  SessionClient,
  SingleInsertCommand,
  SingleInsertCommandResult,
  SingleQueryResult,
  WhereQuery
} from "@phenyl/interfaces";

import { createServerError } from "./create-error.js";

/**
 * @abstract
 * Client to access to PhenylRestApi.
 *
 * (Query | Command) + sessionId => RequestData => ResqponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                     This part is abstract.
 *
 * Child classes must implements handleRequestData(reqData: RequestData) => Promise<ResponseData>
 * For example, PhenylHttpClient is the child and its "handleRequestData()" is to access to PhenylRestApi via HttpServer.
 * Also, PhenylRestApiDirectClient is the direct client which contains PhenylRestApi instance.
 */

export abstract class PhenylRestApiClient<
  TM extends GeneralTypeMap = GeneralTypeMap
> implements RestApiClient<TM> {
  abstract handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>>;
  /**
   *
   */
  async find<N extends EntityNameOf<TM>>(
    query: WhereQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<QueryResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "find",
      payload: query,
      sessionId
    });
    if (resData.type === "find") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async findOne<N extends EntityNameOf<TM>>(
    query: WhereQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<SingleQueryResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "findOne",
      payload: query,
      sessionId
    });
    if (resData.type === "findOne") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async get<N extends EntityNameOf<TM>>(
    query: IdQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<SingleQueryResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "get",
      payload: query,
      sessionId
    });
    if (resData.type === "get") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async getByIds<N extends EntityNameOf<TM>>(
    query: IdsQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<QueryResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "getByIds",
      payload: query,
      sessionId
    });
    if (resData.type === "getByIds") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async pull<N extends EntityNameOf<TM>>(
    query: PullQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<PullQueryResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "pull",
      payload: query,
      sessionId
    });
    if (resData.type === "pull") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertOne<N extends EntityNameOf<TM>>(
    command: SingleInsertCommand<N, PreEntity<RequestEntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<SingleInsertCommandResult> {
    const resData = await this.handleRequestData({
      method: "insertOne",
      payload: command,
      sessionId
    });
    if (resData.type === "insertOne") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertMulti<N extends EntityNameOf<TM>>(
    command: MultiInsertCommand<N, PreEntity<RequestEntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<MultiInsertCommandResult> {
    const resData = await this.handleRequestData({
      method: "insertMulti",
      payload: command,
      sessionId
    });
    if (resData.type === "insertMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertAndGet<N extends EntityNameOf<TM>>(
    command: SingleInsertCommand<N, PreEntity<RequestEntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<GetCommandResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "insertAndGet",
      payload: command,
      sessionId
    });
    if (resData.type === "insertAndGet") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertAndGetMulti<N extends EntityNameOf<TM>>(
    command: MultiInsertCommand<N, PreEntity<RequestEntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<MultiValuesCommandResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "insertAndGetMulti",
      payload: command,
      sessionId
    });
    if (resData.type === "insertAndGetMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateById<N extends EntityNameOf<TM>>(
    command: IdUpdateCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<IdUpdateCommandResult> {
    const resData = await this.handleRequestData({
      method: "updateById",
      payload: command,
      sessionId
    });
    if (resData.type === "updateById") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateMulti<N extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<MultiUpdateCommandResult> {
    const resData = await this.handleRequestData({
      method: "updateMulti",
      payload: command,
      sessionId
    });
    if (resData.type === "updateMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateAndGet<N extends EntityNameOf<TM>>(
    command: IdUpdateCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<GetCommandResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "updateAndGet",
      payload: command,
      sessionId
    });
    if (resData.type === "updateAndGet") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateAndFetch<N extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<MultiValuesCommandResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "updateAndFetch",
      payload: command,
      sessionId
    });
    if (resData.type === "updateAndFetch") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async push<N extends EntityNameOf<TM>>(
    command: PushCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<PushCommandResult<ResponseEntityOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "push",
      payload: command,
      sessionId
    });
    if (resData.type === "push") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async delete<N extends EntityNameOf<TM>>(
    command: DeleteCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<DeleteCommandResult> {
    const resData = await this.handleRequestData({
      method: "delete",
      payload: command,
      sessionId
    });
    if (resData.type === "delete") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async runCustomQuery<N extends CustomQueryNameOf<TM>>(
    query: CustomQuery<N, CustomQueryParamsOf<TM, N>>,
    sessionId?: string | undefined | null
  ): Promise<CustomQueryResult<CustomQueryResultValueOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "runCustomQuery",
      payload: query,
      sessionId
    });
    if (resData.type === "runCustomQuery") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async runCustomCommand<N extends CustomCommandNameOf<TM>>(
    command: CustomCommand<N, CustomCommandParamsOf<TM, N>>,
    sessionId?: string | undefined | null
  ): Promise<CustomCommandResult<CustomCommandResultValueOf<TM, N>>> {
    const resData = await this.handleRequestData({
      method: "runCustomCommand",
      payload: command,
      sessionId
    });
    if (resData.type === "runCustomCommand") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async login<N extends AuthEntityNameOf<TM>>(
    command: LoginCommand<N, AuthCredentialsOf<TM, N>>,
    sessionId?: string | undefined | null
  ): Promise<
    LoginCommandResult<N, ResponseAuthUserOf<TM, N>, AuthSessionOf<TM, N>>
  > {
    const resData = await this.handleRequestData({
      method: "login",
      payload: command,
      sessionId
    });
    if (resData.type === "login") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async logout<N extends AuthEntityNameOf<TM>>(
    command: LogoutCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<LogoutCommandResult> {
    const resData = await this.handleRequestData({
      method: "logout",
      payload: command,
      sessionId
    });
    if (resData.type === "logout") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   * Create session client.
   * RestApiClient cannot create SessionClient.
   */
  createSessionClient(): SessionClient<AuthCommandMapOf<TM>> {
    throw new Error("Cannot create SessionClient from RestApiClient.");
  }
}
