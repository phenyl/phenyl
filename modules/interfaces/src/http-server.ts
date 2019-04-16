import { EncodedHttpRequest, EncodedHttpResponse } from "./http";

import { GeneralTypeMap } from "./type-map";
import { RestApiClient } from "./client";
import { RestApiHandler } from "./rest-api-handler";

export type ServerParams<TM extends GeneralTypeMap> = {
  restApiHandler: RestApiHandler<TM>;
  modifyPath?: PathModifier;
  customRequestHandler?: CustomRequestHandler<TM>;
};

/**
 * (path: string) => string
 * Real server path to regular path.
 * The argument is real path string, start with "/".
 * e.g. (path) => path.slice(8)
 * e.g. (path) => path.split(/^\/path\/to/)[1]
 */
export type PathModifier = (path: string) => string;

/**
 * Custom Request Handler.
 * Receive non-API HTTP request and return HTTP response in 'phenyl-http-server' and 'phenyl-lambda-adapter' modules.
 *  (non-API Request: request whose path doesn't start with "/api/")
 * Response can be any type, like HTML/CSS/JavaScript/Image.
 *
 * Intended Use: Web page. Don't use this function as API.
 * Example: Rich API explorer like swagger.
 *
 * The second argument "restApiClient" is a client to access directly to PhenylRestApi (bypass HTTP).
 */
export type CustomRequestHandler<TM extends GeneralTypeMap> = (
  encodedHttpRequest: EncodedHttpRequest,
  restApiClient: RestApiClient<TM>
) => Promise<EncodedHttpResponse>;
