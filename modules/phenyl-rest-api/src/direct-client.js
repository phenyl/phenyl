// @flow
import {
  PhenylRestApiClient,
} from 'phenyl-utils/jsnext'

import type {
  PhenylRunner,
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
  runner: PhenylRunner

  constructor(runner: PhenylRunner) {
    super()
    this.runner = runner
  }

  /**
   * @override
   * Access to PhenylRestApi directly.
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    return this.runner.run(reqData)
  }
}
