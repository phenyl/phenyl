/* eslint-disable no-dupe-class-members */
import {
  EveryNameOf,
  GeneralTypeMap,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiHandler,
  ErrorResponseData
} from "@phenyl/interfaces";

import { PhenylRestApiClient } from "./phenyl-rest-api-client";

/**
 * Client to access to the given RestApiHandler directly.
 */

export class PhenylRestApiDirectClient<
  TM extends GeneralTypeMap = GeneralTypeMap
> extends PhenylRestApiClient<TM> {
  restApiHandler: RestApiHandler<TM>;

  constructor(restApiHandler: RestApiHandler<TM>) {
    super();
    this.restApiHandler = restApiHandler;
  }

  /**
   * @override
   * Access to PhenylRestApi directly.
   */
  handleRequestData<
    MN extends RequestMethodName,
    N extends EveryNameOf<TM, MN>
  >(
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>
  ): Promise<ResponseDataWithTypeMap<TM, MN, N> | ErrorResponseData> {
    // TODO: use HandlerRequest Type instead of Promise
    return this.restApiHandler.handleRequestData(reqData);
  }
}
