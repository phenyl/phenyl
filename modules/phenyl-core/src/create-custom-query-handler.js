// @flow
import type {
  ClientPool,
  CustomQuery,
  CustomQueryHandler,
  CustomQueryDefinitions,
  CustomQueryResult,
  Session,
} from 'phenyl-interfaces'

/**
 *
 */
export default function createCustomQueryHandler(queryDefinitions: CustomQueryDefinitions): CustomQueryHandler {
  return function executeCustomQuery(query: CustomQuery, session: ?Session, clients: ClientPool): Promise<CustomQueryResult> {
    const { name } = query
    const setting = queryDefinitions[name]
    if (setting == null || typeof setting.execution !== 'function') {
      throw new Error(`No execution function found for custom query named "${name}".`)
    }
    return setting.execution(query, session, clients)
  }
}
