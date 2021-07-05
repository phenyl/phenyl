/* eslint-disable no-dupe-class-members */
import {
  EveryNameOf,
  GeneralTypeMap,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  RestApiHandler,
  ErrorResponseData,
  GeneralRestApiHandler,
  RestApiClient,
  GeneralRestApiClient,
} from "@phenyl/interfaces";

import { PhenylRestApiClient } from "./phenyl-rest-api-client";

export function createDirectClient<TM extends GeneralTypeMap>(
  restApiHandler: RestApiHandler<TM>
): RestApiClient<TM>;
// eslint-disable-next-line no-redeclare
export function createDirectClient(
  restApiHandler: GeneralRestApiHandler
): GeneralRestApiClient;
// This deliberate duplication was added due to TypeScript's miscompilation to .d.ts. The last overload definition will be deleted there.
// eslint-disable-next-line no-redeclare
export function createDirectClient(
  restApiHandler: GeneralRestApiHandler
): GeneralRestApiClient {
  // @ts-ignore casting to subtype
  return new PhenylRestApiDirectClient(restApiHandler);
}

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
