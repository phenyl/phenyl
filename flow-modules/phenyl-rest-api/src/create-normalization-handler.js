// @flow
import type {
  RequestNormalizationHandler,
  NormalizedFunctionalGroup,
  RequestData,
  Session,
} from 'phenyl-interfaces'

/**
 *
 */
export function createNormalizationHandler(fg: NormalizedFunctionalGroup): RequestNormalizationHandler {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function requestNormalizationHandler(reqData: RequestData, session: ?Session) :Promise<RequestData> {
    const { method } = reqData
    switch (reqData.method) {
      case 'find':
      case 'findOne':
      case 'get':
      case 'getByIds':
      case 'pull':
      case 'insertOne':
      case 'insertMulti':
      case 'insertAndGet':
      case 'insertAndGetMulti':
      case 'updateById':
      case 'updateMulti':
      case 'updateAndGet':
      case 'updateAndFetch':
      case 'push':
      case 'delete': {
        const data = reqData.payload
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        if (entityDefinition.normalization == null) return reqData
        return entityDefinition.normalization(reqData, session)
      }

      case 'runCustomQuery': {
        const { payload } = reqData
        const customQueryDefinition = customQueries[payload.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
        if (customQueryDefinition.normalization == null) return reqData
        return {
          method: 'runCustomQuery',
          payload: await customQueryDefinition.normalization(payload, session)
        }
      }

      case 'runCustomCommand': {
        const { payload } = reqData
        const customCommandDefinition = customCommands[payload.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
        if (customCommandDefinition.normalization == null) return reqData
        return {
          method: 'runCustomCommand',
          payload: await customCommandDefinition.normalization(payload, session)
        }
      }

      case 'logout':
      case 'login': {
        const { payload } = reqData
        const userEntityDefinition = users[payload.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
        if (userEntityDefinition.normalization == null) return reqData
        return userEntityDefinition.normalization(reqData, session)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
