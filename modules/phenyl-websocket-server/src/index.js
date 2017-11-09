// @flow
/*eslint-env node*/

import WebSocket from 'ws'

import {
  createErrorResult
} from 'phenyl-utils/jsnext'

import type {
  RestApiHandler,
  RequestData,
  ServerParams,
} from 'phenyl-interfaces'

/**
 * WebSocket server emitting VersionDiff
 */
export default class PhenylWebSocketServer {
  /**
   * Instance of the result: require('http').createServer()
   */
  server: net$Server
  /**
   * WebSocketServer (https://github.com/websockets/ws/blob/master/lib/WebSocketServer.js)
   */
  wss: WebSocket.Server
  restApiHandler: RestApiHandler

  constructor(server: net$Server, params: ServerParams) {
    this.server = server
    this.wss = new WebSocket.Server({ server })
    this.restApiHandler = params.restApiHandler
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => this.onMessage(message, ws))
    })
  }

  async onMessage(message: string, ws: WebSocket) {
    try {
      const reqData: RequestData = JSON.parse(message)
      const resData = await this.restApiHandler.handleRequestData(reqData)
      ws.send(JSON.stringify(resData))
    }
    catch (e) {
      ws.send(JSON.stringify(createErrorResult(e)))
    }
  }

  /**
   * @public
   * Listen the given port to launch http server.
   */
  listen(port: number, hostname?: string, backlog?: number, callback?: Function) {
    this.server.on('request', (req, res) => {
      res.writeHead(200)
      res.write('shinout')
      res.end()
    })
    this.server.listen(port, hostname, backlog, callback)
  }
}
