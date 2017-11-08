// @flow
import type {
  CoreExecution,
  ExecutionWrapper,
  FunctionalGroup,
  RequestData,
  ResponseData,
  Session,
} from 'phenyl-interfaces'

function assertWrapExecution(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No "wrapExecution" function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createExecutionWrapper(fg: FunctionalGroup): ExecutionWrapper {
  const { users, nonUsers } = fg
  return async function executionWrapper(reqData: RequestData, session: ?Session, execution: CoreExecution) :Promise<ResponseData> {
    const { method } = reqData
    switch (reqData.method) {
      case 'find':
      case 'findOne':
      case 'get':
      case 'getByIds':
      case 'pull':
      case 'insert':
      case 'insertAndGet':
      case 'insertAndGetMulti':
      case 'update':
      case 'updateAndGet':
      case 'updateAndFetch':
      case 'push':
      case 'delete':
      case 'login':
      case 'logout': {
        const data = reqData.payload
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        assertWrapExecution(entityDefinition.wrapExecution, data.entityName, method)
        return entityDefinition.wrapExecution(reqData, session, execution)
      }

      case 'runCustomQuery':
      case 'runCustomCommand':
        return execution(reqData, session)

      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
