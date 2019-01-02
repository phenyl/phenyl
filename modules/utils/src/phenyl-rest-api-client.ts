import {
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthOptionsOf,
  AuthUserOf,
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
  DeleteRequestData,
  EntityNameOf,
  EntityOf,
  FindOneRequestData,
  FindRequestData,
  GeneralTypeMap,
  GetByIdsRequestData,
  GetCommandResult,
  GetRequestData,
  HandlerResult,
  IdQuery,
  IdUpdateCommand,
  IdUpdateCommandResult,
  IdsQuery,
  InsertAndGetMultiRequestData,
  InsertAndGetRequestData,
  InsertMultiRequestData,
  InsertOneRequestData,
  LoginCommand,
  LoginCommandResult,
  LoginRequestData,
  LogoutCommand,
  LogoutCommandResult,
  LogoutRequestData,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommand,
  MultiUpdateCommandResult,
  MultiValuesCommandResult,
  PreEntity,
  PullQuery,
  PullQueryResult,
  PullRequestData,
  PushCommand,
  PushCommandResult,
  PushRequestData,
  QueryResult,
  RequestDataWithTypeMap,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiClient,
  RunCustomCommandRequestData,
  RunCustomQueryRequestData,
  SessionClient,
  SingleInsertCommand,
  SingleInsertCommandResult,
  SingleQueryResult,
  UpdateAndFetchRequestData,
  UpdateAndGetRequestData,
  UpdateMultiRequestData,
  UpdateOneRequestData,
  WhereQuery
} from "@phenyl/interfaces";

import { createServerError } from "./create-error.js";

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

export abstract class PhenylRestApiClient<TM extends GeneralTypeMap>
  implements RestApiClient<TM> {
  abstract handleRequestData<
    MN extends RequestMethodName,
    EN extends EntityNameOf<TM>,
    QN extends CustomQueryNameOf<TM>,
    CN extends CustomCommandNameOf<TM>,
    AN extends AuthEntityNameOf<TM>
  >(
    reqData: RequestDataWithTypeMap<TM, MN, EN, QN, CN, AN>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, EN, QN, CN, AN>>;
  /**
   *
   */
  async find<N extends EntityNameOf<TM>>(
    query: WhereQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<QueryResult<EntityOf<TM, N>>> {
    const reqData: FindRequestData<N> = {
      method: "find",
      payload: query,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "find") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async findOne<N extends EntityNameOf<TM>>(
    query: WhereQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<SingleQueryResult<EntityOf<TM, N>>> {
    const reqData: FindOneRequestData<N> = {
      method: "findOne",
      payload: query,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "findOne") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async get<N extends EntityNameOf<TM>>(
    query: IdQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<SingleQueryResult<EntityOf<TM, N>>> {
    const reqData: GetRequestData<N> = {
      method: "get",
      payload: query,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "get") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async getByIds<N extends EntityNameOf<TM>>(
    query: IdsQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<QueryResult<EntityOf<TM, N>>> {
    const reqData: GetByIdsRequestData<N> = {
      method: "getByIds",
      payload: query,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "getByIds") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async pull<N extends EntityNameOf<TM>>(
    query: PullQuery<N>,
    sessionId?: string | undefined | null
  ): Promise<PullQueryResult<EntityOf<TM, N>>> {
    const reqData: PullRequestData<N> = {
      method: "pull",
      payload: query,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "pull") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertOne<N extends EntityNameOf<TM>>(
    command: SingleInsertCommand<N, PreEntity<EntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<SingleInsertCommandResult> {
    const reqData: InsertOneRequestData<N, PreEntity<EntityOf<TM, N>>> = {
      method: "insertOne",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "insertOne") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertMulti<N extends EntityNameOf<TM>>(
    command: MultiInsertCommand<N, PreEntity<EntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<MultiInsertCommandResult> {
    const reqData: InsertMultiRequestData<N, PreEntity<EntityOf<TM, N>>> = {
      method: "insertMulti",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "insertMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertAndGet<N extends EntityNameOf<TM>>(
    command: SingleInsertCommand<N, PreEntity<EntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<GetCommandResult<EntityOf<TM, N>>> {
    const reqData: InsertAndGetRequestData<N, PreEntity<EntityOf<TM, N>>> = {
      method: "insertAndGet",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "insertAndGet") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertAndGetMulti<N extends EntityNameOf<TM>>(
    command: MultiInsertCommand<N, PreEntity<EntityOf<TM, N>>>,
    sessionId?: string | undefined | null
  ): Promise<MultiValuesCommandResult<EntityOf<TM, N>>> {
    const reqData: InsertAndGetMultiRequestData<
      N,
      PreEntity<EntityOf<TM, N>>
    > = {
      method: "insertAndGetMulti",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
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
    const reqData: UpdateOneRequestData<N> = {
      method: "updateById",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
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
    const reqData: UpdateMultiRequestData<N> = {
      method: "updateMulti",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "updateMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateAndGet<N extends EntityNameOf<TM>>(
    command: IdUpdateCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<GetCommandResult<EntityOf<TM, N>>> {
    const reqData: UpdateAndGetRequestData<N> = {
      method: "updateAndGet",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "updateAndGet") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateAndFetch<N extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<MultiValuesCommandResult<EntityOf<TM, N>>> {
    const reqData: UpdateAndFetchRequestData<N> = {
      method: "updateAndFetch",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "updateAndFetch") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async push<N extends EntityNameOf<TM>>(
    command: PushCommand<N>,
    sessionId?: string | undefined | null
  ): Promise<PushCommandResult<EntityOf<TM, N>>> {
    const reqData: PushRequestData<N> = {
      method: "push",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
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
    const reqData: DeleteRequestData<N> = {
      method: "delete",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
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
    const reqData: RunCustomQueryRequestData<N, CustomQueryParamsOf<TM, N>> = {
      method: "runCustomQuery",
      payload: query,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
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
    const reqData: RunCustomCommandRequestData<
      N,
      CustomCommandParamsOf<TM, N>
    > = {
      method: "runCustomCommand",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "runCustomCommand") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async login<N extends AuthEntityNameOf<TM>>(
    command: LoginCommand<N, AuthCredentialsOf<TM, N>, AuthOptionsOf<TM, N>>,
    sessionId?: string | undefined | null
  ): Promise<LoginCommandResult<AuthUserOf<TM, N>>> {
    const reqData: LoginRequestData<
      N,
      AuthCredentialsOf<TM, N>,
      AuthOptionsOf<TM, N>
    > = {
      method: "login",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
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
    const reqData: LogoutRequestData<N> = {
      method: "logout",
      payload: command,
      sessionId
    };
    const resData = await this.handleRequestData(reqData);
    if (resData.type === "logout") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   * Create session client.
   * RestApiClient cannot create SessionClient.
   */
  createSessionClient(): SessionClient {
    throw new Error("Cannot create SessionClient from RestApiClient.");
  }
}
