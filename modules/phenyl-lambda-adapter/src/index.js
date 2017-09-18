// @flow
import {
  decodeRequest,
  encodeResponse,
} from 'phenyl-http-rules/jsnext'

import type {
  Id,
  RequestData,
  ResponseData,
  PhenylClient,
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
    try {
      const [requestData, sessionId] = decodeRequest({
        method: event.httpMethod,
        path: event.path,
        body: event.body,
        headers: event.headers,
        queryString: event.queryStringParameters,
      })
      const responseData = await phenylCore.run(requestData, sessionId)
      cb(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encodeResponse(responseData)),
      })
    }
    catch (e) {
      cb(e)
    }
  }
}
