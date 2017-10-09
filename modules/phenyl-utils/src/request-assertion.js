// @flow

/**
 *
 */
export function assertValidRequestData(rd: any): void {
  if (typeof rd !== 'object' || rd === null) {
    throw new Error(`RequestData must be an object. ${typeof rd} given.`)
  }
  const { method } = rd
  if (!method) {
    throw new Error(`RequestData must have "method" property.`)
  }

  try {
    switch(method) {
      case 'find':
        return assertValidWhereQuery(rd.payload)
      case 'findOne':
        return assertValidWhereQuery(rd.payload)
      case 'get':
        return assertValidIdQuery(rd.payload)
      case 'getByIds':
        return assertValidIdsQuery(rd.payload)
      case 'insert':
        return assertValidInsertCommand(rd.payload)
      case 'insertAndGet':
        return assertValidInsertCommand(rd.payload)
      case 'insertAndGetMulti':
        return assertValidInsertCommand(rd.payload)
      case 'update':
        return assertValidUpdateCommand(rd.payload)
      case 'updateAndGet':
        return assertValidUpdateCommand(rd.payload)
      case 'updateAndFetch':
        return assertValidUpdateCommand(rd.payload)
      case 'delete':
        return assertValidDeleteCommand(rd.payload)
      case 'runCustomQuery':
        return assertValidCustomQuery(rd.payload)
      case 'runCustomCommand':
        return assertValidCustomCommand(rd.payload)
      case 'login':
        return assertValidLoginCommand(rd.payload)
      case 'logout':
        return assertValidLogoutCommand(rd.payload)
      default:
        throw new Error(`Invalid method name.`)
    }
  }
  catch (e) {
    throw new Error(`Error in "requestData.${method}": \n\t{$e.message}`)
  }
}

/**
 *
 */
export function assertValidWhereQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`whereQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, where } = q

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`whereQuery.entityName must be a non-empty string. "${entityName}" given.`)
  }

  if (typeof where !== 'object' || where === null) {
    throw new Error(`whereQuery.where must be an object. "${where}" given.`)
  }
}

/**
 *
 */
export function assertValidIdQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`idQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, id } = q

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`idQuery.entityName must be a non-empty string. "${entityName}" given.`)
  }

  if (typeof id !== 'string' || !id) {
    throw new Error(`idQuery.id must be a non-empty string. "${id}" given.`)
  }
}

/**
 *
 */
export function assertValidIdsQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`idsQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, ids } = q

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`idsQuery.entityName must be a non-empty string. "${entityName}" given.`)
  }

  if (!Array.isArray(ids)) {
    throw new Error(`idsQuery.ids must be an array. "${typeof ids}" given.`)
  }

  if (typeof ids[0] !== 'string' || !ids[0]) {
    throw new Error(`idsQuery.ids must be a non-empty array.`)
  }
}

/**
 *
 */
export function assertValidInsertCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`insertCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, value, values } = com

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`insertCommand.entityName must be a non-empty string. "${entityName}" given.`)
  }

  if (value != null) {
    if (typeof value !== 'object') {
      throw new Error(`insertCommand.value must be an object.`)
    }
    return
  }

  if (values != null) {
    if (!Array.isArray(values)) {
      throw new Error(`insertCommand.values must be an array. "${typeof values}" given.`)
    }

    if (typeof values[0] !== 'object') {
      throw new Error(`insertCommand.values must be an non-empty array<Object>.`)
    }
    return
  }

  throw new Error('insertCommand must have key "value" or "values". Neither given.')
}

/**
 *
 */
export function assertValidUpdateCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`updateCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, rderators, id, where } = com

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`updateCommand.entityName must be a non-empty string. "${entityName}" given.`)
  }

  assertValidUpdateOperators(rderators)

  if (id != null) {
    if (typeof id !== 'string' || !id) {
      throw new Error(`updateCommand.id must be a non-empty string. "${id}" given.`)
    }
    return
  }

  if (where != null) {
    if (typeof where !== 'object') {
      throw new Error(`updateCommand.where must be an object. "${where}" given.`)
    }
    return
  }
  throw new Error('updateCommand must have key "id" or "where". Neither given.')
}

/**
 *
 */
export function assertValidDeleteCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`deleteCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, id, where } = com

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`deleteCommand.entityName must be a non-empty string. "${entityName}" given.`)
  }

  if (id != null) {
    if (typeof id !== 'string' || !id) {
      throw new Error(`deleteCommand.id must be a non-empty string. "${id}" given.`)
    }
    return
  }

  if (where != null) {
    if (typeof where !== 'object') {
      throw new Error(`deleteCommand.where must be an object. "${where}" given.`)
    }
    return
  }
  throw new Error('deleteCommand must have key "id" or "where". Neither given.')
}

/**
 *
 */
export function assertValidCustomQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`customQuery must be an object. ${typeof q} given.`)
  }
  const { name, params } = q

  if (typeof name !== 'string' || !name) {
    throw new Error(`customQuery.name must be a non-empty string. "${name}" given.`)
  }

  // params can be null
  if (params == null) {
    return
  }

  // if params exists, it must be an object
  if (typeof params !== 'object') {
    throw new Error(`customQuery.params must be an object or null. ${typeof params} given.`)
  }
}

/**
 *
 */
export function assertValidCustomCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`customCommand must be an object. ${typeof com} given.`)
  }

  const { name, params } = com

  if (typeof name !== 'string' || !name) {
    throw new Error(`customCommand.name must be a non-empty string. "${name}" given.`)
  }

  // params can be null
  if (params == null) {
    return
  }

  // if params exists, it must be an object
  if (typeof params !== 'object') {
    throw new Error(`customCommand.params must be an object or null. ${typeof params} given.`)
  }
}

/**
 *
 */
export function assertValidLoginCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`loginCommand must be an object. ${typeof com} given.`)
  }

  const { credentials, entityName } = com

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`loginCommand.entityName must be a non-empty string. "${entityName}" given.`)
  }

  // credentials must be an object
  if (typeof credentials !== 'object' || com === null) {
    throw new Error(`loginCommand.credentials must be an object or null. ${typeof credentials} given.`)
  }
  // values in credentials must be strings
  Object.keys(credentials).forEach(credKey => {
    if (!credentials[credKey] !== 'string' || !credentials[credKey]) {
      throw new Error(`loginCommand.credentials['${credKey}'] must be a non-empty string.`)
    }
  })
}

/**
 *
 */
export function assertValidLogoutCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`logoutCommand must be an object. ${typeof com} given.`)
  }

  const { sessionId, entityName } = com

  if (typeof sessionId !== 'string' || !sessionId) {
    throw new Error(`logoutCommand.sessionId must be a non-empty string. "${sessionId}" given.`) // ISSUE: sessionId is explicitly shown (but not string...).
  }

  if (typeof entityName !== 'string' || !entityName) {
    throw new Error(`loginCommand.entityName must be a non-empty string. "${entityName}" given.`)
  }
}

/**
 *
 */
export function assertValidUpdateOperators(ope: any): void {
  if (typeof ope !== 'object' || ope === null) {
    throw new Error(`update operators must be an object. "${ope}" given.`)
  }
}
