// @flow
import type {
  AuthenticationHandler,
  AuthorizationHandler,
  CustomCommandHandler,
  CustomQueryHandler,
  ExecutionWrapper,
  RequestNormalizationHandler,
  ValidationHandler
} from './handler.js.flow'
import type { EntityClient, SessionClient } from './client.js.flow'
import type { EntityMapOf, TypeMap } from './type-map.js.flow'
import type {
  RequestData
  // FindRequestData,
  // FindOneRequestData,
  // GetRequestData,
  // GetByIdsRequestData,
  // PullRequestData,
  // InsertOneRequestData,
  // InsertMultiRequestData,
  // InsertAndGetRequestData,
  // InsertAndGetMultiRequestData,
  // UpdateOneRequestData,
  // UpdateMultiRequestData,
  // UpdateAndGetRequestData,
  // UpdateAndFetchRequestData,
  // PushRequestData,
  // DeleteRequestData,
  // RunCustomQueryRequestData,
  // RunCustomCommandRequestData,
  // LoginRequestData,
  // LogoutRequestData
} from './request-data.js.flow'
import type {
  ResponseData
  // FindResponseData,
  // FindOneResponseData,
  // GetResponseData,
  // GetByIdsResponseData,
  // PullResponseData,
  // InsertOneResponseData,
  // InsertMultiResponseData,
  // InsertAndGetResponseData,
  // InsertAndGetMultiResponseData,
  // UpdateOneResponseData,
  // UpdateMultiResponseData,
  // UpdateAndGetResponseData,
  // UpdateAndFetchResponseData,
  // PushResponseData,
  // DeleteResponseData,
  // RunCustomQueryResponseData,
  // RunCustomCommandResponseData,
  // LoginResponseData,
  // LogoutResponseData,
  // ErrorResponseData
} from './response-data.js.flow'
import { VersionDiffPublisher } from './versioning.js.flow'

export interface RestApiHandler {
  handleRequestData(reqData: RequestData): Promise<ResponseData>;
  // handleRequestData(reqData: FindRequestData): Promise<FindResponseData | ErrorResponseData>,
  // handleRequestData(reqData: FindOneRequestData): Promise<FindOneResponseData | ErrorResponseData>,
  // handleRequestData(reqData: GetRequestData): Promise<GetResponseData | ErrorResponseData>,
  // handleRequestData(reqData: GetByIdsRequestData): Promise<GetByIdsResponseData | ErrorResponseData>,
  // handleRequestData(reqData: PullRequestData): Promise<PullResponseData | ErrorResponseData>,
  // handleRequestData(reqData: InsertOneRequestData): Promise<InsertOneResponseData | ErrorResponseData>,
  // handleRequestData(reqData: InsertMultiRequestData): Promise<InsertMultiResponseData | ErrorResponseData>,
  // handleRequestData(reqData: InsertAndGetRequestData): Promise<InsertAndGetResponseData | ErrorResponseData>,
  // handleRequestData(reqData: InsertAndGetMultiRequestData): Promise<InsertAndGetMultiResponseData | ErrorResponseData>,
  // handleRequestData(reqData: UpdateOneRequestData): Promise<UpdateOneResponseData | ErrorResponseData>,
  // handleRequestData(reqData: UpdateMultiRequestData): Promise<UpdateMultiResponseData | ErrorResponseData>,
  // handleRequestData(reqData: UpdateAndGetRequestData): Promise<UpdateAndGetResponseData | ErrorResponseData>,
  // handleRequestData(reqData: UpdateAndFetchRequestData): Promise<UpdateAndFetchResponseData | ErrorResponseData>,
  // handleRequestData(reqData: PushRequestData): Promise<PushResponseData | ErrorResponseData>,
  // handleRequestData(reqData: DeleteRequestData): Promise<DeleteResponseData | ErrorResponseData>,
  // handleRequestData(reqData: RunCustomQueryRequestData): Promise<RunCustomQueryResponseData | ErrorResponseData>,
  // handleRequestData(reqData: RunCustomCommandRequestData): Promise<RunCustomCommandResponseData | ErrorResponseData>,
  // handleRequestData(reqData: LoginRequestData): Promise<LoginResponseData | ErrorResponseData>,
  // handleRequestData(reqData: LogoutRequestData): Promise<LogoutResponseData | ErrorResponseData>,
}
export type PhenylRestApiParams<TM: TypeMap = TypeMap> = {
  client: EntityClient<EntityMapOf<TM>>,
  sessionClient?: SessionClient,
  authorizationHandler?: AuthorizationHandler,
  normalizationHandler?: RequestNormalizationHandler,
  validationHandler?: ValidationHandler,
  customQueryHandler?: CustomQueryHandler,
  customCommandHandler?: CustomCommandHandler,
  authenticationHandler?: AuthenticationHandler,
  executionWrapper?: ExecutionWrapper,
  versionDiffPublisher?: VersionDiffPublisher
}
