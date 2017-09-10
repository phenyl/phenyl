// @flow
import type {
  AclHandler,
  CustomCommandSettings,
  CustomQuerySettings,
  EntityAclSettings,
  Request,
  PhenylClient,
  Session,
} from 'phenyl-interfaces'

export type AclSettings = {
  entities: EntityAclSettings,
  queries: CustomQuerySettings,
  commands: CustomCommandSettings,
}

function assertAclFunction(fn: any, name: string, requestName: string) {
  if (typeof fn !== 'string') throw new Error(`No acl function found for ${name} (request = ${requestName})`)
}

/**
 *
 */
export default function createAclHandler(settings: AclSettings): AclHandler {
  return async function isAccessible(request: Request, session: ?Session, client: PhenylClient) :Promise<boolean> {
    if (request.find != null) {
      const query = request.find
      const entityName = query.from
      const aclHandler = settings.entities[entityName].find
      assertAclFunction(aclHandler, entityName, 'find')
      return aclHandler(query, session, client)
    }

    if (request.findOne != null) {
      const query = request.findOne
      const entityName = query.from
      const aclHandler = settings.entities[entityName].findOne
      assertAclFunction(aclHandler, entityName, 'findOne')
      return aclHandler(query, session, client)
    }

    if (request.get != null) {
      const query = request.get
      const entityName = query.from
      const aclHandler = settings.entities[entityName].get
      assertAclFunction(aclHandler, entityName, 'get')
      return aclHandler(query, session, client)
    }

    if (request.getByIds != null) {
      const query = request.getByIds
      const entityName = query.from
      const aclHandler = settings.entities[entityName].getByIds
      assertAclFunction(aclHandler, entityName, 'getByIds')
      return aclHandler(query, session, client)
    }

    if (request.insert != null) {
      const command = request.insert
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insert
      assertAclFunction(aclHandler, entityName, 'insert')
      return aclHandler(command, session, client)
    }

    if (request.insertAndGet != null) {
      const command = request.insertAndGet
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insertAndGet
      assertAclFunction(aclHandler, entityName, 'insertAndGet')
      return aclHandler(command, session, client)
    }

    if (request.insertAndFetch != null) {
      const command = request.insertAndFetch
      const entityName = command.from
      const aclHandler = settings.entities[entityName].insertAndFetch
      assertAclFunction(aclHandler, entityName, 'insertAndFetch')
      return aclHandler(command, session, client)
    }

    if (request.update != null) {
      const command = request.update
      const entityName = command.from
      const aclHandler = settings.entities[entityName].update
      assertAclFunction(aclHandler, entityName, 'update')
      return aclHandler(command, session, client)
    }

    if (request.updateAndGet != null) {
      const command = request.updateAndGet
      const entityName = command.from
      const aclHandler = settings.entities[entityName].updateAndGet
      assertAclFunction(aclHandler, entityName, 'updateAndGet')
      return aclHandler(command, session, client)
    }

    if (request.updateAndFetch != null) {
      const command = request.updateAndFetch
      const entityName = command.from
      const aclHandler = settings.entities[entityName].updateAndFetch
      assertAclFunction(aclHandler, entityName, 'updateAndFetch')
      return aclHandler(command, session, client)
    }

    if (request.delete != null) {
      const command = request.delete
      const entityName = command.from
      const aclHandler = settings.entities[entityName].delete
      assertAclFunction(aclHandler, entityName, 'delete')
      return aclHandler(command, session, client)
    }

    if (request.runCustomQuery != null) {
      const query = request.runCustomQuery
      const { name } = query
      const aclHandler = settings.queries[name].acl
      assertAclFunction(aclHandler, name, 'runCustomQuery')
      return aclHandler(query, session, client)
    }

    if (request.runCustomCommand != null) {
      const command = request.runCustomCommand
      const { name } = command
      const aclHandler = settings.commands[name].acl
      assertAclFunction(aclHandler, name, 'runCustomCommand')
      return aclHandler(command, session, client)
    }

    throw new Error('Invalid request.')
  }
}
