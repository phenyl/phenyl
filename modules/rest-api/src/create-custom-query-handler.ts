import { CustomQuery, CustomQueryHandler, CustomQueryDefinitions, CustomQueryResult, Session } from 'phenyl-interfaces'
/**
 *
 */

export function createCustomQueryHandler(queryDefinitions: CustomQueryDefinitions<>): CustomQueryHandler {
  return function customQueryHandler(
    query: CustomQuery<>,
    session: Session | undefined | null,
  ): Promise<CustomQueryResult<>> {
    const { name } = query
    const definition = queryDefinitions[name]

    if (definition == null || typeof definition.execution !== 'function') {
      throw new Error(`No execution function found for custom query named "${name}".`)
    }

    return definition.execution(query, session)
  }
}
