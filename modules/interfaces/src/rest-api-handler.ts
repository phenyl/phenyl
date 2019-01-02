import {
  AuthEntityNameOf,
  CustomCommandNameOf,
  CustomQueryNameOf,
  EntityNameOf,
  GeneralTypeMap
} from "./type-map";
import {
  RequestDataWithTypeMap,
  ResponseDataWithTypeMap
} from "./bound-request-response";

import { ErrorResponseData } from "./response-data";
import { RequestMethodName } from "./request-data";

export type HandlerResult<T> = Promise<T | ErrorResponseData>;

export interface RestApiHandler<TM extends GeneralTypeMap = GeneralTypeMap> {
  handleRequestData<
    MN extends RequestMethodName,
    EN extends EntityNameOf<TM>,
    QN extends CustomQueryNameOf<TM>,
    CN extends CustomCommandNameOf<TM>,
    AN extends AuthEntityNameOf<TM>
  >(
    reqData: RequestDataWithTypeMap<TM, MN, EN, QN, CN, AN>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, EN, QN, CN, AN>>;
}
