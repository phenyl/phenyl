// @flow
import type {
  AclHandler,
  ClientPool,
  CoreExecution,
  ExecutionWrapper,
  FunctionalGroup,
  RequestData,
  ResponseData,
  Session,
} from 'phenyl-interfaces'

function assertExecutionWrapper(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No acl function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createExecutionWrapper(fg: FunctionalGroup): ExecutionWrapper {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function executionWrapper(reqData: RequestData, session: ?Session, clients: ClientPool, execution: CoreExecution) :Promise<ResponseData> {
    const { method } = reqData
    switch (method) {
      case 'find':
      case 'findOne':
      case 'get':
      case 'getByIds':
      case 'insert':
      case 'insertAndGet':
      case 'insertAndFetch':
      case 'update':
      case 'updateAndGet':
      case 'updateAndFetch':
      case 'delete':
      case 'login':
      case 'logout': {
        const data = reqData[method]
        if (data == null) throw new Error(`property "${method}" not found in RequestData.`) // for flow
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertExecutionWrapper(entityDefinition.executionWrapper, data.entityName, method)
        return entityDefinition.executionWrapper(reqData, session, clients, execution)
      }

      case 'runCustomQuery':
      case 'runCustomCommand':
        return execution(reqData, session)

      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
