// @flow

import type {
  RequestData,
  ResponseData,
  CustomCommand,
  CustomQuery,
  LoginCommand,
  Session,
  RestApiExecution,
} from 'phenyl-interfaces'


/**
 * PassThroughHandler: handler passing through any request,
 * designed to apply for AuthorizationHandler
 */
export async function passThroughHandler() {
  return true
}

/**
 * NoOperationHandler.
 * designed to apply for ValidationHandler
 */
export async function noOperationHandler() {
}

/**
 * NoHandler: handler always throwing an Error.
 * designed to apply for AuthenticationHandler, CustomCommandHandler and CustomQueryHandler
 */
export async function noHandler(commandOrQuery: LoginCommand | CustomCommand | CustomQuery) {
  if (commandOrQuery.credentials != null) {
    throw new Error('No Login Handler is registered.')
  }
  if (commandOrQuery.name != null) {
    throw new Error('No Custom Handler is registered.')
  }
  throw new Error('No Handler is registered to the given request.')
}

/**
 * SimpleExecutionWrapper: ExecutionWrapper which simply wraps execution function.
 */
export async function simpleExecutionWrapper(reqData: RequestData, session: ?Session, execution: RestApiExecution): Promise<ResponseData> {
  return execution(reqData, session)
}

/**
 * Handler with no normalization.
 */
export async function simpleNormalizationHandler(reqData: RequestData): Promise<RequestData> {
  return reqData
}
