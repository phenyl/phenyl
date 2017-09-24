// @flow
import type {
  IncomingMessage,
  ServerResponse,
} from 'http'
import type {
  RequestData,
  ResponseData,
  PhenylRunner,
} from 'phenyl-interfaces'

import url from 'url'
import {
  decodeRequest,
  encodeResponse,
  getStatusCode,
} from 'phenyl-http-rules/jsnext'
import {
  createErrorResult,
} from 'phenyl-utils'

export default class PhenylHTTPServer {
  server: net$Server
  phenylCore: PhenylRunner

  constructor(server: net$Server, phenylCore: PhenylRunner) {
    this.server = server
    this.phenylCore = phenylCore
    this.onRequest = this.onRequest.bind(this)
  }

  /**
   *
   */
  listen(port: number, hostname: string, backlog: number, callback: Function) {
    this.server.on('request', this.onRequest)
    this.server.listen(port, hostname, backlog, callback)
  }

  getRequestBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      // https://nodejs.org/api/stream.html#stream_readable_read_size
      request.on('readable', () => {
        const chunks = []
        let chunk
        let totalLength = 0
        while (null !== (chunk = request.read())) {
          chunks.push(chunk)
          totalLength += chunk.length
        }
        resolve(Buffer.concat(chunks, totalLength).toString('utf8'))
      })
    })
  }

  /**
   * @private
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   */
  async onRequest(request: IncomingMessage, response: ServerResponse) {
    const requestUrl = url.parse(request.url, true)
    let responseData

    try {
      // 1. Decoding Request
      const [requestData, sessionId] = decodeRequest({
        method: request.method,
        path: requestUrl.pathname,
        body: await this.getRequestBody(request),
        headers: request.headers,
        queryString: requestUrl.query,
      })
      // 2. Invoking PhenylCore
      responseData = await this.phenylCore.run(requestData, sessionId)
    }
    catch (err) {
      responseData = { error: createErrorResult(err) }
    }

    // 3. Encoding Response
    const statusCode = getStatusCode(responseData)
    const body = JSON.stringify(encodeResponse(responseData))
    const headers = {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'application/json',
    }
    response.writeHead(statusCode, headers)
    response.write(body)
    res.end()
  }
}
