// @flow

import { isApiRequest } from './encode-request.js'
import decodeRequest from './decode-request.js'
import encodeResponse from './encode-response.js'
import {
  createErrorResult,
} from 'phenyl-utils/jsnext'

import type {
  CoreClient,
  CustomRequestHandler,
  EncodedHttpRequest,
  EncodedHttpResponse,
  HttpMethod,
  RequestData,
  ResponseData,
  PathModifier,
  PhenylRunner,
  ServerOptions,
} from 'phenyl-interfaces'

/**
 *
 */
export default class ServerLogic {
  /**
   * Instance with methods: run(RequestData) => Promise<ResponseData>
   * In almost all the cases it will be put instance of PhenylCore.
   */
  runner: PhenylRunner
  /**
   * (path: string) => string
   * Real server path to regular path.
   * The argument is path string, start with "/api/".
   * e.g. (path) => path.slice(5)
   */
  modifyPath: PathModifier
  /**
   * Custom Request Handler.
   * Receive non-API HTTP request and return HTTP response.
   *  (non-API Request: request whose path doesn't start with "/api/")
   * Response can be any type, like HTML/CSS/JavaScript/Image.
   *
   * Intended Use: Web page. Don't use this function as API.
   * Example: Rich API explorer like swagger.
   *
   * The second argument "coreClient" is a client to access directly to PhenylCore (bypass HTTP).
   */
  customRequestHandler: CustomRequestHandler

  constructor(runner: PhenylRunner, options: ServerOptions = {}) {
    this.runner = runner
    this.modifyPath = options.modifyPath || (path => path)
    this.customRequestHandler = options.customRequestHandler || notFoundHandler
  }

  async handleRequest(encodedHttpRequest: EncodedHttpRequest): Promise<EncodedHttpResponse> {
    const modifiedPath = this.modifyPath(encodedHttpRequest.path)

     // Check if modified path start with "/api/"
    return isApiRequest(modifiedPath)
      ? await this.handleApiRequest(Object.assign(encodedHttpRequest, { path: modifiedPath }))  //  "path" is modifiedPath here.
      : await this.handleCustomRequest(encodedHttpRequest) //  "path" is original path here.
  }

  /**
   * @private
   * PhenylRunner#run(RequestData) => Promise<ResponseData>
   */
  async handleApiRequest(encodedHttpRequest: EncodedHttpRequest) {
    let responseData
    try {
      // 1. Decoding Request
      const requestData = decodeRequest(encodedHttpRequest)
      // 2. Invoking PhenylCore
      responseData = await this.runner.run(requestData)
    }
    catch (err) {
      responseData = { error: createErrorResult(err) }
    }
    // 3. Encoding Response
    return encodeResponse(responseData)
  }

  /**
   * @private
   * Run custom request registered
   * Note that encodedHttpRequest.path is originalPath ( not equal to the modified path by this.modifyPath())
   */
  async handleCustomRequest(encodedHttpRequest: EncodedHttpRequest) {
    try {
      const coreClient = this.runner.createDirectClient()
      const customResponse = await this.customRequestHandler(encodedHttpRequest, coreClient)
      return customResponse
    }
    // TODO: Show error in development environment.
    catch (err) {
      const body = 'Internal Server Error.'
      return createPlainTextResponse(body, 500)
    }
  }
}

/**
 * @private
 * Default value of ServerLogic#handleCustomRequest().
 * Return 404 response.
 */
async function notFoundHandler(encodedHttpRequest: EncodedHttpRequest, client: CoreClient): Promise<EncodedHttpResponse> {
  const { path } = encodedHttpRequest
  const body = `Not Found.\nThe requested URL "${path}" is not found on this server.`
  return createPlainTextResponse(body, 404)
}

/**
 * @private
 * Create plain text response from the body.
 */
function createPlainTextResponse(body: string, statusCode: number): EncodedHttpResponse {
  return {
    body,
    statusCode,
    headers: {
      'content-length': Buffer.byteLength(body).toString(),
      'content-type': 'text/plain',
    }
  }
}
