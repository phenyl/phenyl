import {
  EveryNameOf,
  RequestDataWithTypeMapForResponse,
  ResponseDataWithTypeMap
} from "./bound-request-response";

import { ErrorResponseData } from "./response-data";
import { GeneralTypeMap } from "./type-map";
import { RequestMethodName } from "./request-data";

export type HandlerResult<T> = Promise<T | ErrorResponseData>;

export interface RestApiHandler<TM extends GeneralTypeMap> {
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>>;
}

export type GeneralRestApiHandler = RestApiHandler<GeneralTypeMap>;
