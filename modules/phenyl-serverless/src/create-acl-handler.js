// @flow
import type {
  AclHandler,
  CustomCommandSettings,
  CustomQuerySettings,
  EntityAclSettings,
  RequestData,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

export type AclSettings = {
  entities: EntityAclSettings,
  queries: CustomQuerySettings,
  commands: CustomCommandSettings,
}

function assertAclFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'string') throw new Error(`No acl function found for ${name} (methodName = ${methodName})`)
}

/**
 *
 */
export default function createAclHandler(settings: AclSettings): AclHandler {
  return async function isAccessible(reqData: RequestData, session: ?Session, client: PhenylClient) :Promise<boolean> {
    if (reqData.find != null) {
      const query = reqData.find
      const entityName = query.from
      const aclHandler = settings.entities[entityName].find
      assertAclFunction(aclHandler, entityName, 'find')
      return aclHandler(query, session, client)
    }

    if (reqData.findOne != null) {
      const query = reqData.findOne
      const entityName = query.from
      const aclHandler = settings.entities[entityName].findOne
      assertAclFunction(aclHandler, entityName, 'findOne')
      return aclHandler(query, session, client)
    }

    if (reqData.get != null) {
      const query = reqData.get
      const entityName = query.from
      const aclHandler = settings.entities[entityName].get
      assertAclFunction(aclHandler, entityName, 'get')
      return aclHandler(query, session, client)
    }

    if (reqData.getByIds != null) {
      const query = reqData.getByIds
      const entityName = query.from
      const aclHandler = settings.entities[entityName].getByIds
      assertAclFunction(aclHandler, entityName, 'getByIds')
      return aclHandler(query, session, client)
    }

    if (reqData.insert != null) {
      const command = reqData.insert
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insert
      assertAclFunction(aclHandler, entityName, 'insert')
      return aclHandler(command, session, client)
    }

    if (reqData.insertAndGet != null) {
      const command = reqData.insertAndGet
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insertAndGet
      assertAclFunction(aclHandler, entityName, 'insertAndGet')
      return aclHandler(command, session, client)
    }

    if (reqData.insertAndFetch != null) {
      const command = reqData.insertAndFetch
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insertAndFetch
      assertAclFunction(aclHandler, entityName, 'insertAndFetch')
      return aclHandler(command, session, client)
    }

    if (reqData.update != null) {
      const command = reqData.update
      const entityName = command.from
      const aclHandler = settings.entities[entityName].update
      assertAclFunction(aclHandler, entityName, 'update')
      return aclHandler(command, session, client)
    }

    if (reqData.updateAndGet != null) {
      const command = reqData.updateAndGet
      const entityName = command.from
      const aclHandler = settings.entities[entityName].updateAndGet
      assertAclFunction(aclHandler, entityName, 'updateAndGet')
      return aclHandler(command, session, client)
    }

    if (reqData.updateAndFetch != null) {
      const command = reqData.updateAndFetch
      const entityName = command.from
      const aclHandler = settings.entities[entityName].updateAndFetch
      assertAclFunction(aclHandler, entityName, 'updateAndFetch')
      return aclHandler(command, session, client)
    }

    if (reqData.delete != null) {
      const command = reqData.delete
      const entityName = command.from
      const aclHandler = settings.entities[entityName].delete
      assertAclFunction(aclHandler, entityName, 'delete')
      return aclHandler(command, session, client)
    }

    if (reqData.runCustomQuery != null) {
      const query = reqData.runCustomQuery
      const { name } = query
      const aclHandler = settings.queries[name].acl
      assertAclFunction(aclHandler, name, 'runCustomQuery')
      return aclHandler(query, session, client)
    }

    if (reqData.runCustomCommand != null) {
      const command = reqData.runCustomCommand
      const { name } = command
      const aclHandler = settings.commands[name].acl
      assertAclFunction(aclHandler, name, 'runCustomCommand')
      return aclHandler(command, session, client)
    }

    throw new Error('Invalid request data.')
  }
}
