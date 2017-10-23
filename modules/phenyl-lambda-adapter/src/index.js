// @flow
import {
  decodeRequest,
  encodeResponse,
  getStatusCode,
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

export const createLambdaHandler = (phenylCore: PhenylRunner, options: ServerOptions = {}): LambdaHandler => {
  return async (event: LambdaEvent, context: LambdaContext, cb: LambdaCallback): Promise<void> => {
    let requestData, responseData
    /**
     * (path: string) => string
     * Real server path to regular path.
     * The argument is path string, start with "/api/".
     * e.g. (path) => path.slice(5)
     */
    const modifyPath = options.modifyPath || (path => path)

    try {
      // 1. Decoding Request
      requestData = decodeRequest({
        method: event.httpMethod,
        path: modifyPath(event.path),
        body: event.body,
        headers: event.headers,
        queryString: event.queryStringParameters,
      })
      // 2. Invoking PhenylCore
      responseData = await phenylCore.run(requestData)
    }
    catch (err) {
      responseData = { error: createErrorResult(err) }
    }

    // 3. Encoding Response
    cb(null, {
      statusCode: getStatusCode(responseData),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encodeResponse(responseData)),
    })
  }
}
