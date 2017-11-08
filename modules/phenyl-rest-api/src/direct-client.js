// @flow
import {
  PhenylRestApiClient,
} from 'phenyl-utils/jsnext'

import type {
  RestApiHandler,
  RequestData,
  ResponseData,
} from 'phenyl-interfaces'

/**
 * Client to access to PhenylRestApi directly.
 *
 * (Query | Command) + sessionId => RequestData => [PhenylRestApi] => ResponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                             handleRequestData()
 * @see PhenylRestApiClient in module 'phenyl-utils' for all interfaces.
 * Roughly, this implements RestApiClient = (EntityClient, CustomClient and AuthClient).
 * EntityClient:
 *   find | findOne | get | getByIds | pull
 *   insert | insertAndGet | insertAndGetMulti
 *   update | updateAndGet | updateAndFetch | push
 *   delete
 *
 * CustomClient:
 *   runCustomQuery | runCustomCommand
 *
 * AuthClient:
 *   login | logout
 */
export default class PhenylRestApiDirectClient extends PhenylRestApiClient {
  /**
   * expects PhenylRestApi
   */
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
