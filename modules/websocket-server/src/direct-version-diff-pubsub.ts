import {
  VersionDiff,
  VersionDiffListener,
  VersionDiffPublisher,
  VersionDiffSubscriber
} from "@phenyl/interfaces";
/**
 * Direct VersionDiff Pub/Sub between PhenylRestApi and PhenylWebSocketServer.
 * This class is designed for test or small cases, thus non-scalable.
 * For more scalable design, you need Pub/Sub system like AWS SNS (Simple Notification Service).
 *
 * @example
 *  const pubsub = new DirectVersionDiffPubSub()
 *  // In PhenylRestApi, pubsub is regarded as VersionDiffPublisher
 *  const restApiHandler = new PhenylRestApi({ clients, versionDiffPublisher: pubsub })
 *
 *  // In PhenylWebSocketServer, pubsub is regarded as VersionDiffSubscriber
 *  const wsServer = new PhenylWebSocketServer(http.createServer(), { restApiHandler, versionDiffSubscriber: pubsub })
 *  wsServer.listen(8081)
 */

export class DirectVersionDiffPubSub
  implements VersionDiffPublisher, VersionDiffSubscriber {
  listeners: Array<VersionDiffListener>;

  constructor() {
    this.listeners = [];
  }

  subscribeVersionDiff(listener: VersionDiffListener) {
    this.listeners.push(listener);
  }

  publishVersionDiff(versionDiff: VersionDiff) {
    this.listeners.forEach(listener => listener(versionDiff));
  }
}
