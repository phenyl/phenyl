import {
  SubscriptionRequest,
  SubscriptionResult,
  VersionDiff,
  VersionDiffSubscriber
} from "./versioning";

import { GeneralRequestData } from "./request-data";
import { GeneralResponseData } from "./response-data";
import { GeneralRestApiHandler } from "./rest-api-handler";
import { ServerError } from "./error";

export type WebSocketClientMessage =
  | WebSocketClientRequestDataMessage
  | WebSocketClientSubscriptionRequestMessage;

export type WebSocketClientRequestDataMessage = {
  reqData: GeneralRequestData;
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
  resData: GeneralResponseData;
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
  restApiHandler: GeneralRestApiHandler;
  versionDiffSubscriber?: VersionDiffSubscriber;
};
