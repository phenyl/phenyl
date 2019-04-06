/*eslint-env node*/
import WebSocket from "ws";
import { createServerError } from "@phenyl/utils";
import WebSocketClientInfo from "./client-info.js";
import {
  RestApiHandler,
  WebSocketClientSubscriptionRequestMessage,
  WebSocketClientRequestDataMessage,
  WebSocketClientMessage,
  WebSocketServerParams,
  SubscriptionResult,
  VersionDiff
} from "@phenyl/interfaces";
import http from "http";
import https from "https";

type WebSocketMessageEvent = { data: any; type: string; target: WebSocket };

/**
 * WebSocket server emitting VersionDiff
 */
export class PhenylWebSocketServer {
  /**
   * Instance of the result: require('http').createServer()
   */
  server: http.Server | https.Server;
  restApiHandler: RestApiHandler;
  clients: Array<WebSocketClientInfo>;

  constructor(
    server: http.Server | https.Server,
    params: WebSocketServerParams
  ) {
    this.server = server;
    this.restApiHandler = params.restApiHandler;
    this.clients = [];
    const wss = new WebSocket.Server({
      server
    });
    wss.on("connection", (ws: WebSocket) => {
      const clientInfo = new WebSocketClientInfo(ws);
      this.clients.push(clientInfo);

      ws.addEventListener("message", (evt: WebSocketMessageEvent) =>
        this.onMessage(evt.data || "", clientInfo)
      );
    });

    if (params.versionDiffSubscriber) {
      params.versionDiffSubscriber.subscribeVersionDiff(
        (versionDiff: VersionDiff) => {
          const { entityName, id } = versionDiff;
          this.clients
            .filter(client => client.isSubscribed(entityName, id))
            .forEach(client =>
              client.send({
                versionDiff
              })
            );
        }
      );
    }
  }

  /**
   *
   */
  async onMessage(message: any, clientInfo: WebSocketClientInfo) {
    let tag = null;

    try {
      const clientMessage: WebSocketClientMessage = JSON.parse(message);
      const { tag } = clientMessage;

      if (
        (clientMessage as WebSocketClientRequestDataMessage).reqData != null
      ) {
        const resData = await this.restApiHandler.handleRequestData(
          (clientMessage as WebSocketClientRequestDataMessage).reqData
        );
        return clientInfo.send({
          tag,
          resData
        });
      } else if (
        (clientMessage as WebSocketClientSubscriptionRequestMessage)
          .subscription != null
      ) {
        const {
          payload,
          sessionId
        } = (clientMessage as WebSocketClientSubscriptionRequestMessage).subscription;
        const getRequestData = {
          method: "get" as "get",
          payload,
          sessionId
        };
        const getResult = await this.restApiHandler.handleRequestData(
          getRequestData
        );
        const result = getResult.type !== "error";
        const subscriptionResult: SubscriptionResult = {
          entityName: payload.entityName,
          id: payload.id,
          result // TODO: set ttl.
        };

        if (result) {
          clientInfo.addSubscription(payload.entityName, payload.id); // TODO set ttl.
        }

        return clientInfo.send({
          tag,
          subscriptionResult
        });
      }
    } catch (e) {
      return clientInfo.send({
        tag,
        error: createServerError(e)
      });
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
    callback?: () => void
  ) {
    this.server.on("request", (req, res) => {
      res.writeHead(404);
      res.end();
    });
    this.server.listen(port, hostname, backlog, callback);
  }
}
