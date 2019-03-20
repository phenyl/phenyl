import { ServerLogic } from "@phenyl/http-rules";

import {
  HttpMethod,
  QueryStringParams,
  ServerParams
} from "@phenyl/interfaces";

export type LambdaCallback = (err?: Error | null, result?: any) => void;
export type LambdaHandler = (
  event: LambdaEvent,
  context: LambdaContext,
  cb: LambdaCallback
) => any;

export type LambdaEvent = {
  resource: string;
  path: string;
  httpMethod: HttpMethod;
  headers: { [key: string]: string };
  queryStringParameters: QueryStringParams;
  pathParameters: { [key: string]: string };
  requestContext: {
    accountId: string;
    resourceId: string;
    stage: string;
    requestId: string;
    identity: Object;
    resourcePath: string;
    httpMethod: HttpMethod;
    apiId: string;
  };
  body: string;
  isBase64Encoded: boolean;
};

export type LambdaContext = Object;

/**
 * This adapter runs the following three steps.
 * 1. Prepare EncodedHttpRequest.
 * 2. Invoke ServerLogic.
 * 3. Return EncodedHttpResponse using callback.
 */
export const createLambdaHandler = (
  params: ServerParams<any>
): LambdaHandler => {
  return async (
    event: LambdaEvent,
    context: LambdaContext,
    cb: LambdaCallback
  ): Promise<void> => {
    /**
     * Universal server logic.
     * Offers the flow: EncodedHttpRequest => EncodedHttpResponse
     */
    const logic = new ServerLogic(params);

    const encodedHttpRequest = {
      method: event.httpMethod,
      path: event.path,
      body: event.body,
      headers: event.headers,
      qsParams: event.queryStringParameters
    };
    const encodedHttpResponse = await logic.handleRequest(encodedHttpRequest);

    cb(null, encodedHttpResponse);
  };
};
