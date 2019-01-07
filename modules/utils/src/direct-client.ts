/* eslint-disable no-dupe-class-members */
import {
  EveryNameOf,
  GeneralTypeMap,
  HandlerResult,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiHandler
} from "@phenyl/interfaces";

import { PhenylRestApiClient } from "./phenyl-rest-api-client.js";

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
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, N>> {
    return this.restApiHandler.handleRequestData(reqData);
  }
}
