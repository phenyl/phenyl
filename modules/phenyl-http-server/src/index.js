// @flow
import url from 'url'
import {
  ServerLogic,
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
   * Universal server logic.
   * Offers the flow: EncodedHttpRequest => EncodedHttpResponse
   */
  logic: ServerLogic

  constructor(server: net$Server, runner: PhenylRunner, options: ServerOptions = {}) {
    this.server = server
    this.logic = new ServerLogic(runner, options)
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

    const encodedHttpRequest = {
      // $FlowIssue(request-method-is-HttpMethod)
      method: (request.method: HttpMethod),
      path: requestUrl.pathname || '',
      body: await this.getRequestBody(request),
      headers: request.headers,
      qsParams: requestUrl.query,
    }

    const encodedResponse = await this.logic.handleRequest(encodedHttpRequest)
    respond(response, encodedResponse)
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
