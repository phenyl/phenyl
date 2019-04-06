import WebSocket from "ws";
import { WebSocketServerMessage } from "@phenyl/interfaces";

type Id = string;

/**
 *
 */
export default class WebSocketClientInfo {
  ws: WebSocket;
  subscriptions: {
    [key: string]: number;
  }; // key: ${entityName}/${id}

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.subscriptions = {};
  }

  send(message: WebSocketServerMessage) {
    return this.ws.send(JSON.stringify(message));
  }

  addSubscription(entityName: string, id: Id, ttl?: number) {
    const key = `${entityName}/${id}`;
    this.subscriptions[key] = ttl ? Date.now() + ttl * 1000 : -1;
  }

  isSubscribed(entityName: string, id: Id): boolean {
    const key = `${entityName}/${id}`;
    const expiredUnixTime = this.subscriptions[key];

    if (expiredUnixTime == null) {
      return false;
    }

    const now = Date.now();

    if (expiredUnixTime === -1 || now <= expiredUnixTime) {
      return true;
    }

    delete this.subscriptions[key];
    return false;
  }
}
