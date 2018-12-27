import {
  SubscriptionRequest,
  SubscriptionResult,
  VersionDiff,
  VersionDiffSubscriber
} from "./versioning";

import { RequestData } from "./request-data";
import { ResponseData } from "./response-data";
import { RestApiHandler } from "./rest-api-handler";
import { ServerError } from "./error";

export type WebSocketClientMessage =
  | WebSocketClientRequestDataMessage
  | WebSocketClientSubscriptionRequestMessage;

export type WebSocketClientRequestDataMessage = {
  reqData: RequestData;
  tag: string;
};

export type WebSocketClientSubscriptionRequestMessage = {
  subscription: SubscriptionRequest;
  tag: string;
};

export type WebSocketServerMessage =
  | WebSocketServerResponseDataMessage
  | WebSocketServerVersionDiffMessage
  | WebSocketServerSubscriptionResultMessage
  | WebSocketServerErrorMessage;

export type WebSocketServerResponseDataMessage = {
  resData: ResponseData;
  tag: string;
};

export type WebSocketServerVersionDiffMessage = {
  versionDiff: VersionDiff;
};

export type WebSocketServerSubscriptionResultMessage = {
  subscriptionResult: SubscriptionResult;
  tag: string;
};

export type WebSocketServerErrorMessage = {
  error: ServerError;
  tag: string | null;
};

export type WebSocketServerParams = {
  restApiHandler: RestApiHandler;
  versionDiffSubscriber?: VersionDiffSubscriber;
};
