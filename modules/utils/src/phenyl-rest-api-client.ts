import {
  AuthCredentialsOf,
  UserEntityNameOf,
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
  SingleInsertCommand,
  SingleInsertCommandResult,
  SingleQueryResult,
  WhereQuery,
  ErrorResponseData,
  EntityExtraParamsOf,
  CustomQueryExtraParamsOf,
  CustomCommandExtraParamsOf,
  EntityExtraResultOf,
  CustomQueryExtraResultOf,
  ObjectMap
} from "@phenyl/interfaces";

import { createServerError } from "./create-error";

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
  TM extends GeneralTypeMap = GeneralTypeMap,
  OP extends ObjectMap = {}
> implements RestApiClient<TM> {
  abstract handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>,
    options?: OP
  ): Promise<ResponseDataWithTypeMap<TM, MN, N> | ErrorResponseData>;
  /**
   *
   */
  async find<EN extends EntityNameOf<TM>>(
    query: WhereQuery<EN, EntityExtraParamsOf<TM, EN, "find">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    QueryResult<ResponseEntityOf<TM, EN>, EntityExtraResultOf<TM, EN, "find">>
  > {
    const resData = await this.handleRequestData(
      {
        method: "find",
        payload: query,
        sessionId
      },
      options
    );
    if (resData.type === "find") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async findOne<EN extends EntityNameOf<TM>>(
    query: WhereQuery<EN, EntityExtraParamsOf<TM, EN, "findOne">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    SingleQueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "findOne">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "findOne",
        payload: query,
        sessionId
      },
      options
    );
    if (resData.type === "findOne") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async get<EN extends EntityNameOf<TM>>(
    query: IdQuery<EN, EntityExtraParamsOf<TM, EN, "get">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    SingleQueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "get">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "get",
        payload: query,
        sessionId
      },
      options
    );
    if (resData.type === "get") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async getByIds<EN extends EntityNameOf<TM>>(
    query: IdsQuery<EN, EntityExtraParamsOf<TM, EN, "getByIds">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    QueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "getByIds">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "getByIds",
        payload: query,
        sessionId
      },
      options
    );
    if (resData.type === "getByIds") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async pull<EN extends EntityNameOf<TM>>(
    query: PullQuery<EN, EntityExtraParamsOf<TM, EN, "pull">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    PullQueryResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "pull">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "pull",
        payload: query,
        sessionId
      },
      options
    );
    if (resData.type === "pull") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertOne<EN extends EntityNameOf<TM>>(
    command: SingleInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertOne">
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    SingleInsertCommandResult<EntityExtraResultOf<TM, EN, "insertOne">>
  > {
    const resData = await this.handleRequestData(
      {
        method: "insertOne",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "insertOne") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertMulti<EN extends EntityNameOf<TM>>(
    command: MultiInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertMulti">
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    MultiInsertCommandResult<EntityExtraResultOf<TM, EN, "insertMulti">>
  > {
    const resData = await this.handleRequestData(
      {
        method: "insertMulti",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "insertMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertAndGet<EN extends EntityNameOf<TM>>(
    command: SingleInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertAndGet">
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    GetCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "insertAndGet">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "insertAndGet",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "insertAndGet") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async insertAndGetMulti<EN extends EntityNameOf<TM>>(
    command: MultiInsertCommand<
      EN,
      PreEntity<RequestEntityOf<TM, EN>>,
      EntityExtraParamsOf<TM, EN, "insertAndGetMulti">
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    MultiValuesCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "insertAndGetMulti">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "insertAndGetMulti",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "insertAndGetMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateById<EN extends EntityNameOf<TM>>(
    command: IdUpdateCommand<EN, EntityExtraParamsOf<TM, EN, "updateById">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<IdUpdateCommandResult<EntityExtraResultOf<TM, EN, "updateById">>> {
    const resData = await this.handleRequestData(
      {
        method: "updateById",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "updateById") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateMulti<EN extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<EN, EntityExtraParamsOf<TM, EN, "updateMulti">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    MultiUpdateCommandResult<EntityExtraResultOf<TM, EN, "updateMulti">>
  > {
    const resData = await this.handleRequestData(
      {
        method: "updateMulti",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "updateMulti") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateAndGet<EN extends EntityNameOf<TM>>(
    command: IdUpdateCommand<EN, EntityExtraParamsOf<TM, EN, "updateAndGet">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    GetCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "updateAndGet">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "updateAndGet",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "updateAndGet") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async updateAndFetch<EN extends EntityNameOf<TM>>(
    command: MultiUpdateCommand<
      EN,
      EntityExtraParamsOf<TM, EN, "updateAndFetch">
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    MultiValuesCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "updateAndFetch">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "updateAndFetch",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "updateAndFetch") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async push<EN extends EntityNameOf<TM>>(
    command: PushCommand<EN, EntityExtraParamsOf<TM, EN, "push">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    PushCommandResult<
      ResponseEntityOf<TM, EN>,
      EntityExtraResultOf<TM, EN, "push">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "push",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "push") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async delete<EN extends EntityNameOf<TM>>(
    command: DeleteCommand<EN, EntityExtraParamsOf<TM, EN, "delete">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<DeleteCommandResult<EntityExtraResultOf<TM, EN, "delete">>> {
    const resData = await this.handleRequestData(
      {
        method: "delete",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "delete") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async runCustomQuery<QN extends CustomQueryNameOf<TM>>(
    query: CustomQuery<
      QN,
      CustomQueryParamsOf<TM, QN>,
      CustomQueryExtraParamsOf<TM, QN>
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    CustomQueryResult<
      CustomQueryResultValueOf<TM, QN>,
      CustomQueryExtraResultOf<TM, QN>
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "runCustomQuery",
        payload: query,
        sessionId
      },
      options
    );
    if (resData.type === "runCustomQuery") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async runCustomCommand<CN extends CustomCommandNameOf<TM>>(
    command: CustomCommand<
      CN,
      CustomCommandParamsOf<TM, CN>,
      CustomCommandExtraParamsOf<TM, CN>
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    CustomCommandResult<
      CustomCommandResultValueOf<TM, CN>,
      CustomQueryExtraResultOf<TM, CN>
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "runCustomCommand",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "runCustomCommand") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async login<UN extends UserEntityNameOf<TM>>(
    command: LoginCommand<
      UN,
      AuthCredentialsOf<TM, UN>,
      EntityExtraParamsOf<TM, UN, "login">
    >,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<
    LoginCommandResult<
      UN,
      ResponseAuthUserOf<TM, UN>,
      AuthSessionOf<TM, UN>,
      EntityExtraResultOf<TM, UN, "login">
    >
  > {
    const resData = await this.handleRequestData(
      {
        method: "login",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "login") return resData.payload;
    throw createServerError(resData.payload);
  }

  /**
   *
   */
  async logout<UN extends UserEntityNameOf<TM>>(
    command: LogoutCommand<UN, EntityExtraParamsOf<TM, UN, "logout">>,
    sessionId?: string | undefined | null,
    options?: OP
  ): Promise<LogoutCommandResult<EntityExtraResultOf<TM, UN, "logout">>> {
    const resData = await this.handleRequestData(
      {
        method: "logout",
        payload: command,
        sessionId
      },
      options
    );
    if (resData.type === "logout") return resData.payload;
    throw createServerError(resData.payload);
  }
}
