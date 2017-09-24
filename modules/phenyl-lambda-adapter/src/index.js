// @flow
import {
  decodeRequest,
  encodeResponse,
  getStatusCode,
} from 'phenyl-http-rules/jsnext'

import {
  createErrorResult,
} from 'phenyl-utils'

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
  CustomQueryHandler,
  CustomCommandHandler,
} from 'phenyl-interfaces'

import type {
  LambdaEvent,
  LambdaContext,
  LambdaCallback,
  LambdaHandler,
} from '../decls/lambda.js.flow'

export const createLambdaHandler = (phenylCore: PhenylRunner): LambdaHandler => {
  return async (event: LambdaEvent, context: LambdaContext, cb: LambdaCallback): Promise<void> => {
    let requestData, sessionId, responseData

    try {
      // 1. Decoding Request
      [requestData, sessionId] = decodeRequest({
        method: event.httpMethod,
        path: event.path,
        body: event.body,
        headers: event.headers,
        queryString: event.queryStringParameters,
      })
      // 2. Invoking PhenylCore
      responseData = await phenylCore.run(requestData, sessionId)
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
