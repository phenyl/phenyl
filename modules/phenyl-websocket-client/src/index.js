// @flow
import WebSocket from './websocket.js'
import { randomStringWithTimeStamp } from 'phenyl-utils'

import type {
  Id,
  RequestData,
  ResponseData,
  RestApiHandler,
  SubscriptionRequest,
  SubscriptionResult,
  VersionDiff,
  VersionDiffListener,
  VersionDiffSubscriber,
  WebSocketServerMessage,
} from 'phenyl-interfaces'


/**
 * Universal WebSocket Client for PhenylWebSocketServer.
 */
export default class PhenylWebSocketClient implements RestApiHandler, VersionDiffSubscriber {
  client: WebSocket
  opened: Promise<boolean>
  versionDiffListener: ?VersionDiffListener

  constructor(url: string) {
    this.client = new WebSocket(url)

    this.opened = new Promise((resolve, reject) => {
      let timer
      const openListener = this.client.addEventListener('open', () => {
        // $FlowIssue(compatible)
        this.client.removeEventListener('open', openListener)
        clearTimeout(timer)
        resolve(true)
      })
      timer = setTimeout(() => {
        // $FlowIssue(compatible)
        this.client.removeEventListener('open', openListener)
        reject(new Error(`PhenylWebSocketClient could not connect to server "${url}" in 30sec.`))
      }, 30000)
    })

    // TODO: evt: MessageEvent
    this.client.addEventListener('message', (evt: Object) => {
      const { versionDiffListener } = this
      if (versionDiffListener == null) return
      const versionDiff = this.parseAsVersionDiff(evt.data || '')
      if (versionDiff == null) return
      versionDiffListener(versionDiff)
    })
  }

  /**
   * @public
   */
  async subscribe(entityName: string, id: Id, sessionId?: ?Id): Promise<SubscriptionResult> {
    await this.opened
    return new Promise((resolve, reject) => {
      const subscription: SubscriptionRequest = {
        method: 'subscribe',
        payload: { entityName, id },
        sessionId
      }

      const tag = randomStringWithTimeStamp()
      let timer

      this.client.send(JSON.stringify({ subscription, tag }))

      // TODO: evt: MessageEvent
      const listener = this.client.addEventListener('message', (evt: Object) => {
        try {
          const subscriptionResult = this.parseAsWaitingSubscriptionResult(evt.data || '', tag)
          if (subscriptionResult == null) return
          // $FlowIssue(compatible)
          this.client.removeEventListener('message', listener)
          clearTimeout(timer)
          return resolve(subscriptionResult)
        }
        catch (e) {
          reject(e)
        }
      })

      timer = setTimeout(() => {
        // $FlowIssue(compatible)
        this.client.removeEventListener('message', listener)
        reject(new Error(`subscribe(tag=${tag}) timed out (30sec).`))
      }, 10000)
    })
  }

  /**
   * @public
   */
  subscribeVersionDiff(versionDiffListener: VersionDiffListener) {
    this.versionDiffListener = versionDiffListener
  }

  /**
   * @public
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    await this.opened
    return new Promise((resolve, reject) => {
      const tag = randomStringWithTimeStamp()
      let timer

      this.client.send(JSON.stringify({ reqData, tag }))

      // TODO: evt: MessageEvent
      const listener = this.client.addEventListener('message', (evt: Object) => {
        try {
          const resData = this.parseAsWaitingResponseData(evt.data || '', tag)
          if (resData == null) return
          // $FlowIssue(compatible)
          this.client.removeEventListener('message', listener)
          clearTimeout(timer)
          return resolve(resData)
        }
        catch (e) {
          reject(e)
        }
      })

      timer = setTimeout(() => {
        // $FlowIssue(compatible)
        this.client.removeEventListener('message', listener)
        reject(new Error(`handleRequestData(tag=${tag}) timed out (30sec).`))
      }, 10000)
    })
  }

  /**
   * @private
   */
  parseAsWaitingResponseData(message: any, tag: string): ?ResponseData {
    try {
      const parsed: WebSocketServerMessage = JSON.parse(message)
      return (parsed.resData != null && parsed.tag != null && parsed.tag === tag) ? parsed.resData : null
    }
    catch (e) {
      return null
    }
  }

  /**
   * @private
   */
  parseAsWaitingSubscriptionResult(message: any, tag: string): ?SubscriptionResult {
    try {
      const parsed: WebSocketServerMessage = JSON.parse(message)
      return (parsed.subscriptionResult != null && parsed.tag != null && parsed.tag === tag) ? parsed.subscriptionResult : null
    }
    catch (e) {
      return null
    }
  }

  /**
   * @private
   */
  parseAsVersionDiff(message: any): ?VersionDiff {
    try {
      const parsed: WebSocketServerMessage = JSON.parse(message)
      return parsed.versionDiff != null ? parsed.versionDiff : null
    }
    catch (e) {
      return null
    }
  }
}
