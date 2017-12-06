// @flow
/*eslint-env node*/

import WebSocket from 'ws'

import { createServerError } from 'phenyl-utils/jsnext'

import WebSocketClientInfo from './client-info.js'

import type {
  RestApiHandler,
  WebSocketClientMessage,
  WebSocketServerParams,
  SubscriptionResult,
  VersionDiff,
} from 'phenyl-interfaces'

/**
 * WebSocket server emitting VersionDiff
 */
export class PhenylWebSocketServer {
  /**
   * Instance of the result: require('http').createServer()
   */
  server: net$Server

  restApiHandler: RestApiHandler

  clients: Array<WebSocketClientInfo>

  constructor(server: net$Server, params: WebSocketServerParams) {
    this.server = server
    this.restApiHandler = params.restApiHandler
    this.clients = []

    const wss = new WebSocket.Server({ server })
    wss.on('connection', (ws: WebSocket) => {
      const clientInfo = new WebSocketClientInfo(ws)
      this.clients.push(clientInfo)
      ws.addEventListener('message', (evt: Event) =>
        this.onMessage(evt.data || '', clientInfo)
      )
    })
    if (params.versionDiffSubscriber) {
      params.versionDiffSubscriber.subscribeVersionDiff(
        (versionDiff: VersionDiff) => {
          const { entityName, id } = versionDiff
          this.clients
            .filter(client => client.isSubscribed(entityName, id))
            .forEach(client => client.send({ versionDiff }))
        }
      )
    }
  }

  /**
   *
   */
  async onMessage(message: any, clientInfo: WebSocketClientInfo) {
    let tag
    try {
      const clientMessage: WebSocketClientMessage = JSON.parse(message)
      const { tag } = clientMessage
      if (clientMessage.reqData != null) {
        const resData = await this.restApiHandler.handleRequestData(
          clientMessage.reqData
        )
        return clientInfo.send({ tag, resData })
      } else if (clientMessage.subscription != null) {
        const { payload, sessionId } = clientMessage.subscription
        const getRequestData = { method: 'get', payload, sessionId }
        const getResult = await this.restApiHandler.handleRequestData(
          getRequestData
        )
        const result = getResult.type !== 'error'
        const subscriptionResult: SubscriptionResult = {
          entityName: payload.entityName,
          id: payload.id,
          result,
        } // TODO: set ttl.
        if (result) {
          clientInfo.addSubscription(payload.entityName, payload.id) // TODO set ttl.
        }
        return clientInfo.send({ tag, subscriptionResult })
      }
    } catch (e) {
      return clientInfo.send({ tag, error: createServerError(e) })
    }
  }

  /**
   * @public
   * Listen the given port to launch http server.
   */
  listen(
    port: number,
    hostname?: string,
    backlog?: number,
    callback?: Function
  ) {
    this.server.on('request', (req, res) => {
      res.writeHead(404)
      res.end()
    })
    this.server.listen(port, hostname, backlog, callback)
  }
}
