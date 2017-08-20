// @flow
import type {
  AclHandler,
  CustomCommandSettings,
  CustomQuerySettings,
  EntityAclSettings,
  Operation,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

export type AclSettings = {
  entities: EntityAclSettings,
  queries: CustomQuerySettings,
  commands: CustomCommandSettings,
}

function assertAclFunction(fn: any, name: string, operationName: string) {
  if (typeof fn !== 'string') throw new Error(`No acl function found for ${name} (operation = ${operationName})`)
}

/**
 *
 */
export default function createAclHandler(settings: AclSettings): AclHandler {
  return async function isAccessible(operation: Operation, session: ?Session, client: PhenylClient) :Promise<boolean> {
    if (operation.find != null) {
      const query = operation.find
      const entityName = query.from
      const aclHandler = settings.entities[entityName].find
      assertAclFunction(aclHandler, entityName, 'find')
      return aclHandler(query, session, client)
    }

    if (operation.findOne != null) {
      const query = operation.findOne
      const entityName = query.from
      const aclHandler = settings.entities[entityName].findOne
      assertAclFunction(aclHandler, entityName, 'findOne')
      return aclHandler(query, session, client)
    }

    if (operation.get != null) {
      const query = operation.get
      const entityName = query.from
      const aclHandler = settings.entities[entityName].get
      assertAclFunction(aclHandler, entityName, 'get')
      return aclHandler(query, session, client)
    }

    if (operation.getByIds != null) {
      const query = operation.getByIds
      const entityName = query.from
      const aclHandler = settings.entities[entityName].getByIds
      assertAclFunction(aclHandler, entityName, 'getByIds')
      return aclHandler(query, session, client)
    }

    if (operation.insert != null) {
      const command = operation.insert
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insert
      assertAclFunction(aclHandler, entityName, 'insert')
      return aclHandler(command, session, client)
    }

    if (operation.insertAndGet != null) {
      const command = operation.insertAndGet
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insertAndGet
      assertAclFunction(aclHandler, entityName, 'insertAndGet')
      return aclHandler(command, session, client)
    }

    if (operation.insertAndFetch != null) {
      const command = operation.insertAndFetch
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insertAndFetch
      assertAclFunction(aclHandler, entityName, 'insertAndFetch')
      return aclHandler(command, session, client)
    }

    if (operation.update != null) {
      const command = operation.update
      const entityName = command.from
      const aclHandler = settings.entities[entityName].update
      assertAclFunction(aclHandler, entityName, 'update')
      return aclHandler(command, session, client)
    }

    if (operation.updateAndGet != null) {
      const command = operation.updateAndGet
      const entityName = command.from
      const aclHandler = settings.entities[entityName].updateAndGet
      assertAclFunction(aclHandler, entityName, 'updateAndGet')
      return aclHandler(command, session, client)
    }

    if (operation.updateAndFetch != null) {
      const command = operation.updateAndFetch
      const entityName = command.from
      const aclHandler = settings.entities[entityName].updateAndFetch
      assertAclFunction(aclHandler, entityName, 'updateAndFetch')
      return aclHandler(command, session, client)
    }

    if (operation.delete != null) {
      const command = operation.delete
      const entityName = command.from
      const aclHandler = settings.entities[entityName].delete
      assertAclFunction(aclHandler, entityName, 'delete')
      return aclHandler(command, session, client)
    }

    if (operation.runCustomQuery != null) {
      const query = operation.runCustomQuery
      const { name } = query
      const aclHandler = settings.queries[name].acl
      assertAclFunction(aclHandler, name, 'runCustomQuery')
      return aclHandler(query, session, client)
    }

    if (operation.runCustomCommand != null) {
      const command = operation.runCustomCommand
      const { name } = command
      const aclHandler = settings.commands[name].acl
      assertAclFunction(aclHandler, name, 'runCustomCommand')
      return aclHandler(command, session, client)
    }

    throw new Error('Invalid operation.')
  }
}
