import {
  EveryNameOf,
  RequestDataWithTypeMapForResponse,
  ResponseDataWithTypeMap
} from "./bound-request-response";

import { ErrorResponseData, GeneralResponseData } from "./response-data";
import { GeneralTypeMap } from "./type-map";
import { RequestMethodName, GeneralRequestData } from "./request-data";
import { DirectRestApiOptions } from "./rest-api-client";

export type HandlerResult<T> = Promise<T | ErrorResponseData>;

/**
 * A class to handle request data to get response data with `handleRequestData()` method.
 *
 * If you need more detailed types, use `RestApiHandler` with `TypeMap`.
 */

export interface GeneralRestApiHandler {
  handleRequestData(reqData: GeneralRequestData): Promise<GeneralResponseData>;
}

/**
 * A class to handle request data to get response data with `handleRequestData()` method.
 * Passing the type parameter `TM` enables us to get accurate response type for request.
 *
 * If you don't need complicated types, use `GeneralRestApiHandler`.
 */
export interface RestApiHandler<TM extends GeneralTypeMap>
  extends GeneralRestApiHandler {
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>>;
}

/**
 * A class to handle request data to get response data with `handleRequestData()` method.
 * Passing the type parameter `TM` enables us to get accurate response type for request.
 *
 * If you don't need complicated types, use `GeneralRestApiHandler`.
 */
export interface DirectRestApiHandler<TM extends GeneralTypeMap>
  extends RestApiHandler<TM> {
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>,
    options?: DirectRestApiOptions
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>>;
}

export interface GeneralDirectRestApiHandler extends GeneralRestApiHandler {
  handleRequestData(
    reqData: GeneralRequestData,
    options?: DirectRestApiOptions
  ): Promise<GeneralResponseData>;
}
