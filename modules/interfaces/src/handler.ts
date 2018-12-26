// @flow
import type { RequestData } from './request-data.js.flow'
import type { ResponseData } from './response-data.js.flow'
import type { PreSession, Session } from './session.js.flow'
import type { CustomQuery } from './query.js.flow'
import type { CustomQueryResult } from './query-result.js.flow'
import type { LoginCommand, CustomCommand } from './command.js.flow'
import type { CustomCommandResult } from './command-result.js.flow'
import type { Id } from './id.js.flow'
import type { Entity } from './entity.js.flow'

export type AuthenticationResult = {|
  ok: 1,
  preSession: PreSession,
  user: ?Entity,
  versionId: ?Id,
|}

export type AuthorizationHandler = (reqData: RequestData, session: ?Session) => Promise<boolean>
export type RequestNormalizationHandler = (reqData: RequestData, session: ?Session) => Promise<RequestData>
export type ValidationHandler = (reqData: RequestData, session: ?Session) => Promise<void>
export type AuthenticationHandler = (loginCommand: LoginCommand<>, session: ?Session) => Promise<AuthenticationResult>
export type RestApiExecution = (reqData: RequestData, session: ?Session) => Promise<ResponseData>
export type ExecutionWrapper = (reqData: RequestData, session: ?Session, execution: RestApiExecution) => Promise<ResponseData>
export type CustomQueryHandler = (query: CustomQuery<>, session: ?Session) => Promise<CustomQueryResult<>>
export type CustomCommandHandler = (command: CustomCommand<>, session: ?Session) => Promise<CustomCommandResult<>>

export type HandlerParams = {
  authorizationHandler: AuthorizationHandler,
  normalizationHandler: RequestNormalizationHandler,
  validationHandler: ValidationHandler,
  authenticationHandler: AuthenticationHandler,
  executionWrapper: ExecutionWrapper,
  customQueryHandler: CustomQueryHandler,
  customCommandHandler: CustomCommandHandler,
}
