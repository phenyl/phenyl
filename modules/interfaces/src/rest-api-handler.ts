import {
  EveryNameOf,
  RequestDataWithTypeMap,
  ResponseDataWithTypeMap
} from "./bound-request-response";

import { ErrorResponseData } from "./response-data";
import { GeneralTypeMap } from "./type-map";
import { RequestMethodName } from "./request-data";

export type HandlerResult<T> = Promise<T | ErrorResponseData>;

export interface RestApiHandler<TM extends GeneralTypeMap = GeneralTypeMap> {
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMap<TM, MN, N>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>>;
}
