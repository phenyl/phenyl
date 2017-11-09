// @flow
import {
  PhenylRestApiClient,
} from './phenyl-rest-api-client.js'

import type {
  RestApiHandler,
  RequestData,
  ResponseData,
} from 'phenyl-interfaces'

/**
 * Client to access to the given RestApiHandler directly.
 */
export class PhenylRestApiDirectClient extends PhenylRestApiClient {
  restApiHandler: RestApiHandler

  constructor(restApiHandler: RestApiHandler) {
    super()
    this.restApiHandler = restApiHandler
  }

  /**
   * @override
   * Access to PhenylRestApi directly.
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    return this.restApiHandler.handleRequestData(reqData)
  }
}
