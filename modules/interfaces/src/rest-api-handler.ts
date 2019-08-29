import {
  EveryNameOf,
  RequestDataWithTypeMapForResponse,
  ResponseDataWithTypeMap
} from "./bound-request-response";

import { ErrorResponseData, GeneralResponseData } from "./response-data";
import { GeneralTypeMap } from "./type-map";
import { RequestMethodName, GeneralRequestData } from "./request-data";

export type HandlerResult<T> = Promise<T | ErrorResponseData>;

/**
 * A class to handle request data to get response data with `handleRequestData()` method.
 * This simple expression makes less type error, although we cannot infer detailed response data type from this.
 *
 * If we want more detailed types, we could use `RestApiHandler` with `TypeMap`.
 * Be careful of using the type, as there is an issue(#275) that `RestApiHandler<GeneralTypeMap>` is not equal to `GeneralRestApiHandler` in TypeScript.
 */

export interface GeneralRestApiHandler {
  handleRequestData(reqData: GeneralRequestData): Promise<GeneralResponseData>;
}

/**
 * A class to handle request data to get response data with `handleRequestData()` method.
 * Passing the type parameter `TM` enables us to get accurate response type for request.
 *
 * As this type implementation is too complicated for library users to analyize,
 * use of `GeneralRestApiHandler` is recommended when you run into a type error related to this.
 * These error may be related to #275, which is a confound problem with conditional type.
 *
 * Make sure that `RestApiHandler<GeneralTypeMap>` is not equal to `GeneralRestApiHandler` in TypeScript.
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
