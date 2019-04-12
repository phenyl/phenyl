import WebSocket from "./websocket";
import { randomStringWithTimeStamp } from "@phenyl/utils";
import {
  GeneralRequestData,
  GeneralResponseData,
  SubscriptionRequest,
  SubscriptionResult,
  VersionDiff,
  VersionDiffListener,
  VersionDiffSubscriber,
  WebSocketServerSubscriptionResultMessage,
  WebSocketServerVersionDiffMessage,
  WebSocketServerResponseDataMessage
} from "@phenyl/interfaces";

type Id = string;
type WebSocketMessageEvent = { data: any; type: string; target: WebSocket };

/**
 * Universal WebSocket Client for PhenylWebSocketServer.
 */
export default class PhenylWebSocketClient implements VersionDiffSubscriber {
  client: WebSocket;
  opened: Promise<boolean>;
  versionDiffListener: VersionDiffListener | undefined | null;

  constructor(url: string) {
    this.client = new WebSocket(url);
    this.opened = new Promise((resolve, reject) => {
      let timer: NodeJS.Timer;

      const handler = () => {
        this.client.removeEventListener("open", handler);
        clearTimeout(timer);
        resolve(true);
      };

      this.client.addEventListener("open", handler);

      timer = setTimeout(() => {
        this.client.removeEventListener("open", handler);
        reject(
          new Error(
            `PhenylWebSocketClient could not connect to server "${url}" in 30sec.`
          )
        );
      }, 30000);
    });

    this.client.addEventListener("message", (evt: WebSocketMessageEvent) => {
      const { versionDiffListener } = this;
      if (versionDiffListener == null) return;
      const versionDiff = this.parseAsVersionDiff(evt.data || "");
      if (versionDiff == null) return;
      versionDiffListener(versionDiff);
    });
  }
  /**
   * @public
   */

  async subscribe(
    entityName: string,
    id: Id,
    sessionId?: Id | undefined | null
  ): Promise<SubscriptionResult> {
    await this.opened;
    return new Promise((resolve, reject) => {
      const subscription: SubscriptionRequest = {
        method: "subscribe",
        payload: {
          entityName,
          id
        },
        sessionId
      };
      const tag = randomStringWithTimeStamp();
      let timer: NodeJS.Timer;
      this.client.send(
        JSON.stringify({
          subscription,
          tag
        })
      );

      const messageEventHandler = (evt: WebSocketMessageEvent) => {
        try {
          const subscriptionResult = this.parseAsWaitingSubscriptionResult(
            evt.data || "",
            tag
          );
          if (subscriptionResult == null) return;

          this.client.removeEventListener("message", messageEventHandler);
          clearTimeout(timer);
          return resolve(subscriptionResult);
        } catch (e) {
          reject(e);
        }
      };

      this.client.addEventListener("message", messageEventHandler);
      timer = setTimeout(() => {
        this.client.removeEventListener("message", messageEventHandler);
        reject(new Error(`subscribe(tag=${tag}) timed out (30sec).`));
      }, 10000);
    });
  }
  /**
   * @public
   */

  subscribeVersionDiff(versionDiffListener: VersionDiffListener) {
    this.versionDiffListener = versionDiffListener;
  }
  /**
   * @public
   */

  async handleGeneralGeneralRequestData(
    reqData: GeneralRequestData
  ): Promise<GeneralResponseData> {
    await this.opened;
    return new Promise((resolve, reject) => {
      const tag = randomStringWithTimeStamp();
      let timer: NodeJS.Timer;
      this.client.send(
        JSON.stringify({
          reqData,
          tag
        })
      );

      const messageHandler = (evt: WebSocketMessageEvent) => {
        try {
          const resData = this.parseAsWaitingGeneralResponseData(
            evt.data || "",
            tag
          );
          if (resData == null) return;

          this.client.removeEventListener("message", messageHandler);
          clearTimeout(timer);
          return resolve(resData);
        } catch (e) {
          reject(e);
        }
      };

      this.client.addEventListener("message", messageHandler);
      timer = setTimeout(() => {
        this.client.removeEventListener("message", messageHandler);
        reject(
          new Error(`handleGeneralRequestData(tag=${tag}) timed out (30sec).`)
        );
      }, 10000);
    });
  }
  /**
   * @private
   */

  parseAsWaitingGeneralResponseData(
    message: any,
    tag: string
  ): GeneralResponseData | undefined | null {
    try {
      const parsed: WebSocketServerResponseDataMessage = JSON.parse(message);
      return parsed.resData != null && parsed.tag != null && parsed.tag === tag
        ? parsed.resData
        : null;
    } catch (e) {
      return null;
    }
  }
  /**
   * @private
   */

  parseAsWaitingSubscriptionResult(
    message: any,
    tag: string
  ): SubscriptionResult | undefined | null {
    try {
      const parsed: WebSocketServerSubscriptionResultMessage = JSON.parse(
        message
      );
      return parsed.subscriptionResult != null &&
        parsed.tag != null &&
        parsed.tag === tag
        ? parsed.subscriptionResult
        : null;
    } catch (e) {
      return null;
    }
  }
  /**
   * @private
   */

  parseAsVersionDiff(message: any): VersionDiff | undefined | null {
    try {
      const parsed: WebSocketServerVersionDiffMessage = JSON.parse(message);
      return parsed.versionDiff != null ? parsed.versionDiff : null;
    } catch (e) {
      return null;
    }
  }
}
