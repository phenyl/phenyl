// @flow
import {
  PhenylCoreClient,
} from 'phenyl-utils/jsnext'

import type {
  PhenylRunner,
  RequestData,
  ResponseData,
} from 'phenyl-interfaces'

/**
 * Client to access to PhenylCore directly.
 *
 * (Query | Command) + sessionId => RequestData => [PhenylCore] => ResponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                             handleRequestData()
 * @see PhenylCoreClient in module 'phenyl-utils' for all interfaces.
 * Roughly, this implements CoreClient = (EntityClient, CustomClient and AuthClient).
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
export default class PhenylCoreDirectClient extends PhenylCoreClient {
  /**
   * expects PhenylCore
   */
  runner: PhenylRunner

  constructor(runner: PhenylRunner) {
    super()
    this.runner = runner
  }

  /**
   * @override
   * Access to PhenylCore directly.
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> {
    return this.runner.run(reqData)
  }
}
