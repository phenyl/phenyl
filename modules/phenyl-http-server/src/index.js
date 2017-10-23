// @flow
import type {
  IncomingMessage,
  ServerResponse,
} from 'http'
import type {
  RequestData,
  ResponseData,
  PathModifier,
  PhenylRunner,
  ServerOptions,
} from 'phenyl-interfaces'

import url from 'url'
import {
  decodeRequest,
  encodeResponse,
  getStatusCode,
} from 'phenyl-http-rules/jsnext'
import {
  createErrorResult,
} from 'phenyl-utils/jsnext'

export default class PhenylHttpServer {
  server: net$Server
  phenylCore: PhenylRunner
  /**
   * (path: string) => string
   * Real server path to regular path.
   * The argument is path string, start with "/api/".
   * e.g. (path) => path.slice(5)
   */
  modifyPath: PathModifier

  constructor(server: net$Server, phenylCore: PhenylRunner, options: ServerOptions = {}) {
    this.server = server
    this.phenylCore = phenylCore
    this.modifyPath = options.modifyPath || (path => path)
  }

  /**
   *
   */
  listen(port: number, hostname?: string, backlog?: number, callback?: Function) {
    this.server.on('request', this.onRequest.bind(this))
    this.server.listen(port, hostname, backlog, callback)
  }

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
   */
  async onRequest(request: IncomingMessage, response: ServerResponse) {
    const requestUrl = url.parse(request.url, true)
    let responseData

    try {
      // 1. Decoding Request
      // $FlowIssue(request.method-is-always-compatible)
      const requestData = decodeRequest({
        method: request.method,
        path: this.modifyPath(requestUrl.pathname || ''),
        body: await this.getRequestBody(request),
        headers: request.headers,
        qsParams: requestUrl.query,
      })
      // 2. Invoking PhenylCore
      responseData = await this.phenylCore.run(requestData)
    }
    catch (err) {
      responseData = { error: createErrorResult(err) }
    }

    // 3. Encoding Response
    const statusCode = getStatusCode(responseData)
    const body = JSON.stringify(encodeResponse(responseData))
    const headers = {
      'Content-Length': Buffer.byteLength(body).toString(),
      'Content-Type': 'application/json',
    }
    response.writeHead(statusCode, headers)
    response.write(body)
    response.end()
  }
}
