// @flow
import {
  decodeRequest,
  encodeResponse,
  getStatusCode,
} from 'phenyl-http-rules/jsnext'

import {
  createErrorResponse,
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

    // 1. Decoding Request
    try {
      [requestData, sessionId] = decodeRequest({
        method: event.httpMethod,
        path: event.path,
        body: event.body,
        headers: event.headers,
        queryString: event.queryStringParameters,
      })
    }
    catch (err) {
      const responseData = createErrorResponse(err)
      return cb(null, {
        statusCode: getStatusCode(responseData),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      })
    }

    // 2. Invoking PhenylCore
    try {
      responseData = await phenylCore.run(requestData, sessionId)
    }
    catch (err) {
      responseData = createErrorResponse(err)
    }

    // 3. Encoding Response
    cb(null, {
      statusCode: getStatusCode(responseData),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encodeResponse(responseData)),
    })
  }
}
