/* eslint-disable no-dupe-class-members */
import {
  EveryNameOf,
  GeneralTypeMap,
  RequestDataWithTypeMapForResponse,
  RequestMethodName,
  ResponseDataWithTypeMap,
  ErrorResponseData,
  GeneralDirectRestApiClient,
  DirectRestApiClient,
  DirectRestApiOptions,
  DirectRestApiHandler,
  GeneralDirectRestApiHandler
} from "@phenyl/interfaces";

import { PhenylRestApiClient } from "./phenyl-rest-api-client";

export function createDirectClient<TM extends GeneralTypeMap>(
  restApiHandler: DirectRestApiHandler<TM>
): DirectRestApiClient<TM>;
export function createDirectClient(
  restApiHandler: GeneralDirectRestApiHandler
): GeneralDirectRestApiClient;
// This deliberate duplication was added due to TypeScript's miscompilation to .d.ts. The last overload definition will be deleted there.
export function createDirectClient(
  restApiHandler: GeneralDirectRestApiHandler
): GeneralDirectRestApiClient {
  // @ts-ignore casting to subtype
  return new PhenylRestApiDirectClient(restApiHandler);
}

/**
 * Client to access to the given RestApiHandler directly.
 */
export class PhenylRestApiDirectClient<
  TM extends GeneralTypeMap = GeneralTypeMap
> extends PhenylRestApiClient<TM> implements DirectRestApiClient<TM> {
  restApiHandler: DirectRestApiHandler<TM>;
  constructor(restApiHandler: DirectRestApiHandler<TM>) {
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
    reqData: RequestDataWithTypeMapForResponse<TM, MN, N>,
    options?: DirectRestApiOptions
  ): Promise<ResponseDataWithTypeMap<TM, MN, N> | ErrorResponseData> {
    return this.restApiHandler.handleRequestData(reqData, options);
  }
}
