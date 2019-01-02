/* eslint-disable no-dupe-class-members */
import {
  AuthEntityNameOf,
  CustomCommandNameOf,
  CustomQueryNameOf,
  EntityNameOf,
  GeneralTypeMap,
  HandlerResult,
  RequestDataWithTypeMap,
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
    EN extends EntityNameOf<TM>,
    QN extends CustomQueryNameOf<TM>,
    CN extends CustomCommandNameOf<TM>,
    AN extends AuthEntityNameOf<TM>
  >(
    reqData: RequestDataWithTypeMap<TM, MN, EN, QN, CN, AN>
  ): HandlerResult<ResponseDataWithTypeMap<TM, MN, EN, QN, CN, AN>> {
    return this.restApiHandler.handleRequestData(reqData);
  }
}
