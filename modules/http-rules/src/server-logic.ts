/*eslint-env node*/
import {
  CustomRequestHandler,
  EncodedHttpRequest,
  EncodedHttpResponse,
  GeneralResponseData,
  GeneralTypeMap,
  PathModifier,
  RestApiHandler,
  ServerParams
} from "@phenyl/interfaces";
import { PhenylRestApiDirectClient, createServerError } from "@phenyl/utils";

import decodeRequest from "./decode-request";
import encodeResponse from "./encode-response";
import { isApiRequest } from "./encode-request";

/**
 *
 */
export default class ServerLogic<TM extends GeneralTypeMap> {
  /**
   * Instance containing API logic invoked via run().
   * PhenylRestApi instance is expected.
   */
  restApiHandler: RestApiHandler<TM>;

  /**
   * (path: string) => string
   * Real server path to regular path.
   * The argument is path string, start with "/api/".
   * e.g. (path) => path.slice(5)
   */
  modifyPath: PathModifier;

  /**
   * Custom Request Handler.
   * Receive non-API HTTP request and return HTTP response.
   *  (non-API Request: request whose path doesn't start with "/api/")
   * Response can be any type, like HTML/CSS/JavaScript/Image.
   *
   * Intended Use: Web page. Don't use this function as API.
   * Example: Rich API explorer like swagger.
   *
   * The second argument "restApiClient" is a client to access directly to PhenylRestApi (bypass HTTP).
   */
  customRequestHandler: CustomRequestHandler<TM>;

  constructor(params: ServerParams<TM>) {
    this.restApiHandler = params.restApiHandler;

    this.modifyPath = params.modifyPath || (path => path);

    this.customRequestHandler = params.customRequestHandler || notFoundHandler;
  }

  /**
   * Handle request to get response.
   * If modified path starts with "/api/", invoke RestApiHandler#run().
   * Otherwise, invoke registered customRequestHandler.
   */
  async handleRequest(
    encodedHttpRequest: EncodedHttpRequest
  ): Promise<EncodedHttpResponse> {
    const modifiedPath = this.modifyPath(encodedHttpRequest.path) || ""; // Check if modified path start with "/api/"

    return isApiRequest(modifiedPath)
      ? await this.handleApiRequest(
          Object.assign(encodedHttpRequest, {
            path: modifiedPath
          })
        ) //  "path" is modifiedPath here.
      : await this.handleCustomRequest(encodedHttpRequest); //  "path" is original path here.
  }

  /**
   * @private
   * Invoke RestApiHandler#run().
   */
  async handleApiRequest(encodedHttpRequest: EncodedHttpRequest) {
    let responseData: GeneralResponseData;
    // This line casts restApiHandler to supertype so that it should receive pre-sanitized data.
    const restApiHandler: RestApiHandler<GeneralTypeMap> = this.restApiHandler;

    try {
      // 1. Decoding Request
      const requestData = decodeRequest(encodedHttpRequest);

      // 2. Invoking PhenylRestApi
      responseData = await restApiHandler.handleRequestData(requestData);
    } catch (err) {
      responseData = {
        type: "error",
        payload: createServerError(err)
      };
    }

    // 3. Encoding Response
    return encodeResponse(responseData);
  }

  /**
   * @private
   * Run custom request registered.
   * Note that encodedHttpRequest.path is originalPath ( not equal to the modified path by this.modifyPath()).
   */
  async handleCustomRequest(encodedHttpRequest: EncodedHttpRequest) {
    try {
      const restApiClient = new PhenylRestApiDirectClient(this.restApiHandler);
      const customResponse = await this.customRequestHandler(
        encodedHttpRequest,
        restApiClient
      );
      return customResponse;
    } catch (err) {
      // TODO: Show error in development environment.
      const body = "Internal Server Error.";
      return createPlainTextResponse(body, 500);
    }
  }
}

/**
 * @private
 * Default value of ServerLogic#handleCustomRequest().
 * Return 404 response.
 */
async function notFoundHandler(
  encodedHttpRequest: EncodedHttpRequest
): Promise<EncodedHttpResponse> {
  const { path } = encodedHttpRequest;
  const body = `Not Found.\nThe requested URL "${path}" is not found on this server.`;
  return createPlainTextResponse(body, 404);
}

/**
 * @private
 * Create plain text response from the body.
 */
function createPlainTextResponse(
  body: string,
  statusCode: number
): EncodedHttpResponse {
  return {
    body,
    statusCode,
    headers: {
      "content-length": Buffer.byteLength(body).toString(),
      "content-type": "text/plain"
    }
  };
}
