// @flow
import {
  ServerLogic,
} from 'phenyl-http-rules/jsnext'

import {
  createErrorResult,
} from 'phenyl-utils/jsnext'

import type {
  Id,
  RequestData,
  ResponseData,
  EntityClient,
  PhenylRunner,
  Session,
  AclHandler,
  ValidationHandler,
  SessionClient,
  ServerOptions,
  CustomQueryHandler,
  CustomCommandHandler,
} from 'phenyl-interfaces'

import type {
  LambdaEvent,
  LambdaContext,
  LambdaCallback,
  LambdaHandler,
} from '../decls/lambda.js.flow'

export const createLambdaHandler = (runner: PhenylRunner, options: ServerOptions = {}): LambdaHandler => {
  return async (event: LambdaEvent, context: LambdaContext, cb: LambdaCallback): Promise<void> => {

    const logic = new ServerLogic(runner, options)

    const encodedHttpRequest = {
      method: event.httpMethod,
      path: event.path,
      body: event.body,
      headers: event.headers,
      qsParams: event.queryStringParameters,
    }
    const encodedHttpResponse = await logic.handleRequest(encodedHttpRequest)

    cb(null, encodedHttpResponse)
  }
}
