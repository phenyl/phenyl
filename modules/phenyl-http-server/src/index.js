// @flow
/*eslint-env node*/

import url from 'url'
import {
  ServerLogic,
} from 'phenyl-http-rules/jsnext'

import type {
  IncomingMessage,
  ServerResponse,
} from 'http'
import type {
  EncodedHttpResponse,
  HttpMethod,
  ServerParams,
  TypeMap,
} from 'phenyl-interfaces'

/**
 * HTTP(s) server wrapping ServerLogic (implemented at "phenyl-http-rules") and Node.js server.
 */
export default class PhenylHttpServer<TM: TypeMap> {
  /**
   * Instance of the result: require('http').createServer()
   */
  server: net$Server
  /**
   * Universal server logic.
   * Offers the flow: EncodedHttpRequest => EncodedHttpResponse
   */
  logic: ServerLogic<TM>

  constructor(server: net$Server, params: ServerParams<TM>) {
    this.server = server
    this.logic = new ServerLogic(params)
  }

  /**
   * @public
   * Listen the given port to launch http server.
   */
  listen(port: number, hostname?: string, backlog?: number, callback?: Function) {
    this.server.on('request', this.handleIncomingMessage.bind(this))
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
          const chunks: Array<Buffer> = []
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
   * Handle one IncomingMessage.
   *
   * 1. Prepare EncodedHttpRequest.
   * 2. Invoke ServerLogic.
   * 3. Response to client via ServerResponse object.
   */
  async handleIncomingMessage(request: IncomingMessage, response: ServerResponse) {
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
