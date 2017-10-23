// @flow

import type {
  RequestData,
  ResponseData,
  CustomCommand,
  CustomQuery,
  LoginCommand,
  Session,
  ClientPool,
  CoreExecution,
} from 'phenyl-interfaces'


/**
 * PassThroughHandler: handler passing through any request,
 * designed to apply for AuthorizationHandler and ValidationHandler
 */
export async function passThroughHandler() {
  return true
}

/**
 * NoHandler: handler always throwing an Error.
 * designed to apply for AuthenticationHandler, CustomCommandHandler and CustomQueryHandler
 */
export async function noHandler(commandOrQuery: LoginCommand | CustomCommand | CustomQuery) {
  if (commandOrQuery.credentials != null) {
    throw new Error(`No Login Handler is registered.`)
  }
  if (commandOrQuery.name != null) {
    throw new Error(`No Custom Handler is registered.`)
  }
  throw new Error(`No Handler is registered to the given request.`)
}

/**
 * SimpleExecutionWrapper: ExecutionWrapper which simply wraps execution function.
 */
export async function simpleExecutionWrapper(reqData: RequestData, session: ?Session, clients: ClientPool, execution: CoreExecution): Promise<ResponseData> {
  return execution(reqData, session)
}
