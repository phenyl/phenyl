// @flow
import {
  ServerLogic,
} from 'phenyl-http-rules/jsnext'

import type {
  ServerParams,
} from 'phenyl-interfaces'

import type {
  LambdaEvent,
  LambdaContext,
  LambdaCallback,
  LambdaHandler,
} from '../decls/lambda.js.flow'

/**
 * This adapter runs the following three steps.
 * 1. Prepare EncodedHttpRequest.
 * 2. Invoke ServerLogic.
 * 3. Return EncodedHttpResponse using callback.
 */
export const createLambdaHandler = (params: ServerParams<*>): LambdaHandler => {
  return async (event: LambdaEvent, context: LambdaContext, cb: LambdaCallback): Promise<void> => {

    /**
     * Universal server logic.
     * Offers the flow: EncodedHttpRequest => EncodedHttpResponse
     */
    const logic = new ServerLogic(params)

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
