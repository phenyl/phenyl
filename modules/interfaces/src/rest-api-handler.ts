import {
  AuthCredentialsOf,
  AuthEntityNameOf,
  AuthOptionsOf,
  AuthUserOf,
  CustomCommandNameOf,
  CustomCommandParamsOf,
  CustomCommandResultValueOf,
  CustomQueryNameOf,
  CustomQueryParamsOf,
  CustomQueryResultValueOf,
  EntityNameOf,
  EntityOf,
  GeneralTypeMap
} from "./type-map";
import {
  DeleteRequestData,
  FindOneRequestData,
  FindRequestData,
  GetByIdsRequestData,
  GetRequestData,
  InsertAndGetMultiRequestData,
  InsertAndGetRequestData,
  InsertMultiRequestData,
  InsertOneRequestData,
  LoginRequestData,
  LogoutRequestData,
  PullRequestData,
  PushRequestData,
  RunCustomCommandRequestData,
  RunCustomQueryRequestData,
  UpdateAndFetchRequestData,
  UpdateAndGetRequestData,
  UpdateMultiRequestData,
  UpdateOneRequestData
} from "./request-data";
import {
  DeleteResponseData,
  ErrorResponseData,
  FindOneResponseData,
  FindResponseData,
  GetByIdsResponseData,
  GetResponseData,
  InsertAndGetMultiResponseData,
  InsertAndGetResponseData,
  InsertMultiResponseData,
  InsertOneResponseData,
  LoginResponseData,
  LogoutResponseData,
  PullResponseData,
  PushResponseData,
  RunCustomCommandResponseData,
  RunCustomQueryResponseData,
  UpdateAndFetchResponseData,
  UpdateAndGetResponseData,
  UpdateMultiResponseData,
  UpdateOneResponseData
} from "./response-data";

type Res<T> = Promise<T | ErrorResponseData>;

export interface RestApiHandler<TM extends GeneralTypeMap = GeneralTypeMap> {
  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: FindRequestData<EN>
  ): Res<FindResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: FindOneRequestData<EN>
  ): Res<FindOneResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: GetRequestData<EN>
  ): Res<GetResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: GetByIdsRequestData<EN>
  ): Res<GetByIdsResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: PullRequestData<EN>
  ): Res<PullResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: InsertOneRequestData<EN, EntityOf<TM, EN>>
  ): Res<InsertOneResponseData>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: InsertMultiRequestData<EN, EntityOf<TM, EN>>
  ): Res<InsertMultiResponseData>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: InsertAndGetRequestData<EN, EntityOf<TM, EN>>
  ): Res<InsertAndGetResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: InsertAndGetMultiRequestData<EN, EntityOf<TM, EN>>
  ): Res<InsertAndGetMultiResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: UpdateOneRequestData<EN>
  ): Res<UpdateOneResponseData>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: UpdateMultiRequestData<EN>
  ): Res<UpdateMultiResponseData>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: UpdateAndGetRequestData<EN>
  ): Res<UpdateAndGetResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: UpdateAndFetchRequestData<EN>
  ): Res<UpdateAndFetchResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: PushRequestData<EN>
  ): Res<PushResponseData<EntityOf<TM, EN>>>;

  handleRequestData<EN extends EntityNameOf<TM>>(
    reqData: DeleteRequestData<EN>
  ): Res<DeleteResponseData>;

  handleRequestData<QN extends CustomQueryNameOf<TM>>(
    reqData: RunCustomQueryRequestData<QN, CustomQueryParamsOf<TM, QN>>
  ): Res<RunCustomQueryResponseData<CustomQueryResultValueOf<TM, QN>>>;

  handleRequestData<CN extends CustomCommandNameOf<TM>>(
    reqData: RunCustomCommandRequestData<CN, CustomCommandParamsOf<TM, CN>>
  ): Res<RunCustomCommandResponseData<CustomCommandResultValueOf<TM, CN>>>;

  handleRequestData<EN extends AuthEntityNameOf<TM>>(
    reqData: LoginRequestData<
      EN,
      AuthCredentialsOf<TM, EN>,
      AuthOptionsOf<TM, EN>
    >
  ): Res<LoginResponseData<AuthUserOf<TM, EN>>>;

  handleRequestData<EN extends AuthEntityNameOf<TM>>(
    reqData: LogoutRequestData<EN>
  ): Res<LogoutResponseData>;

  // handleRequestData(reqData: RequestData): Promise<ResponseData>;
}
