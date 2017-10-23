// @flow
import url from 'url'
import {
  isApiRequest,
  decodeRequest,
  encodeResponse,
} from 'phenyl-http-rules/jsnext'
import {
  createErrorResult,
} from 'phenyl-utils/jsnext'

import type {
  IncomingMessage,
  ServerResponse,
} from 'http'
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
 * HTTP(s) server wrapping PhenylRunner( ≒ PhenylCore)
 */
export default class PhenylHttpServer {
  /**
   * Instance of the result: require('http').createServer()
   */
  server: net$Server
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

  constructor(server: net$Server, runner: PhenylRunner, options: ServerOptions = {}) {
    this.server = server
    this.runner = runner
    this.modifyPath = options.modifyPath || (path => path)
    this.customRequestHandler = options.customRequestHandler || notFoundHandler
  }

  /**
   * @public
   * Listen the given port to launch http server.
   */
  listen(port: number, hostname?: string, backlog?: number, callback?: Function) {
    this.server.on('request', this.handleRequest.bind(this))
    this.server.listen(port, hostname, backlog, callback)
  }

  /**
   * @private
   * Concatenate request body from chunks.
   */
  getRequestBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const read = () => {
        try {
          // https://nodejs.org/api/stream.html#stream_readable_read_size
          const chunks = []
          let chunk
          let totalLength = 0
          while (null !== (chunk = request.read())) {
            // $FlowIssue(chunk-is-always-Buffer)
            chunks.push(chunk)
            // $FlowIssue(chunk-is-always-Buffer)
            totalLength += chunk.length
          }
          resolve(Buffer.concat(chunks, totalLength).toString('utf8'))
        } catch (err) {
          reject(err)
        }
      }

      request.once('error', err => {
        request.removeListener('readable', read)
        reject(err)
      })

      request.once('readable', read)
    })
  }

  /**
   * @private
   * Handle one request.
   * When API request comes, get response from PhenylRunner.
   * Otherwise, delegate execution to customRequestHandler.
   */
  async handleRequest(request: IncomingMessage, response: ServerResponse) {
    const requestUrl = url.parse(request.url, true)
    const originalPath = requestUrl.pathname || ''

    const encodedHttpRequest = {
      // $FlowIssue(request-method-is-HttpMethod)
      method: (request.method: HttpMethod),
      path: this.modifyPath(originalPath) || '',
      body: await this.getRequestBody(request),
      headers: request.headers,
      qsParams: requestUrl.query,
    }

    const encodedResponse =
      isApiRequest(encodedHttpRequest.path) // Check if path start with "/api/"
        ? await this.handleApiRequest(encodedHttpRequest)
        : await this.handleCustomRequest(Object.assign(encodedHttpRequest, { path: originalPath })) // IMPORTANT: "path" is originalPath here.

    respond(response, encodedResponse)
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
 * Response with Node.js's ServerResponse object.
 * TODO: Buffer type will be allowed in encodedResponse.body.
 */
function respond(response: ServerResponse, encodedResponse: EncodedHttpResponse) {
  let { body, statusCode, headers } = encodedResponse
  response.writeHead(statusCode, headers)
  if (typeof body !== 'string') {
    body = JSON.stringify(body)
  }
  response.write(body)
  response.end()
}

/**
 * @private
 * Default value of PhenylHttpServer#handleCustomRequest().
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
