// @flow
import type { IncomingRequest, OutgoingResponse } from 'http' // = NODE ONLY

// import {
//   decodeRequest,
//   encodeResponse,
//   getStatusCode,
// } from 'phenyl-http-rules/jsnext'

// import {
//   createErrorResult,
// } from 'phenyl-utils'


import type {
  RequestData,
  ResponseData,
} from 'phenyl-interfaces'

export default class PhenylHTTPServer {
  server: net$Server

  constructor(httpModule, options: Object) {
    this.server = httpModule.createServer(options, this.onRequest)
  }

  /**
   *
   */
  listen(port: number, hostname: string, backlog: number, callback: Function) {
    this.server.listen(port, hostname, backlog, callback)
  }

  /**
   * @private
   * @param {IncomingRequest} request
   * @param {OutgoingResponse} response
   */
  onRequest(request: IncomingRequest, response: OutgoingResponse) {
    // TODO: Implement
  }
}
