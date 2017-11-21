// @flow

/**
 *
 */
export function assertValidRequestData(rd: any): void {
  if (typeof rd !== 'object' || rd === null) {
    throw new Error(`RequestData must be an object. ${typeof rd} given.`)
  }
  const { method, sessionId } = rd
  if (sessionId != null && typeof sessionId !== 'string') {
    throw new Error('RequestData.sessionId must be null or string.')
  }
  if (!method) {
    throw new Error('RequestData must have "method" property.')
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
      case 'pull':
        return assertValidPullQuery(rd.payload)
      case 'insertOne':
        return assertValidSingleInsertCommand(rd.payload)
      case 'insertMulti':
        return assertValidMultiInsertCommand(rd.payload)
      case 'insertAndGet':
        return assertValidSingleInsertCommand(rd.payload)
      case 'insertAndGetMulti':
        return assertValidMultiInsertCommand(rd.payload)
      case 'updateById':
        return assertValidIdUpdateCommand(rd.payload)
      case 'updateMulti':
        return assertValidMultiUpdateCommand(rd.payload)
      case 'updateAndGet':
        return assertValidIdUpdateCommand(rd.payload)
      case 'updateAndFetch':
        return assertValidMultiUpdateCommand(rd.payload)
      case 'push':
        return assertValidPushCommand(rd.payload)
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
        throw new Error('Invalid method name.')
    }
  }
  catch (e) {
    const err = new Error(`Error in "RequestData(method=${method})": ${e.message}`)
    err.stack = e.stack
    throw err
  }
}

/**
 *
 */
export function assertValidWhereQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`WhereQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, where } = q
  assertValidEntityName(entityName, 'WhereQuery')

  if (typeof where !== 'object' || where === null) {
    throw new Error(`WhereQuery.where must be an object. "${where}" given.`)
  }
}

/**
 *
 */
export function assertValidIdQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`IdQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, id } = q
  assertValidEntityName(entityName, 'IdQuery')
  assertNonEmptyString(id, `IdQuery.id must be a non-empty string. "${id}" given.`)
}

/**
 *
 */
export function assertValidIdsQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`IdsQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, ids } = q
  assertValidEntityName(entityName, 'IdsQuery')

  if (!Array.isArray(ids)) {
    throw new Error(`IdsQuery.ids must be an array. "${typeof ids}" given.`)
  }
  assertNonEmptyString(ids[0], 'IdsQuery.ids must be a non-empty array.')
}

/**
 *
 */
export function assertValidPullQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`PullQuery must be an object. ${typeof q} given.`)
  }
  const { entityName, id, versionId } = q
  assertValidEntityName(entityName, 'PullQuery')
  assertNonEmptyString(id, `PullQuery.id must be a non-empty string. "${id}" given.`)
  assertNonEmptyString(versionId, `PullQuery.versionId must be a non-empty string. "${versionId}" given.`)
}

/**
 *
 */
export function assertValidSingleInsertCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`SingleInsertCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, value } = com
  assertValidEntityName(entityName, 'SingleInsertCommand')

  if (value == null) {
    throw new Error('SingleInsertCommand must have key "value".')
  }

  if (typeof value !== 'object') {
    throw new Error('SingleInsertCommand.value must be an object.')
  }
}

/**
 *
 */
export function assertValidMultiInsertCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`MultiInsertCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, values } = com
  assertValidEntityName(entityName, 'MultiInsertCommand')

  if (values == null) {
    throw new Error('MultiInsertCommand must have key "values".')
  }

  if (!Array.isArray(values)) {
    throw new Error(`MultiInsertCommand.values must be an array. "${typeof values}" given.`)
  }

  if (typeof values[0] !== 'object') {
    throw new Error('MultiInsertCommand.values must be an non-empty array<Object>.')
  }
}

/**
 *
 */
export function assertValidIdUpdateCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`IdUpdateCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, operation, id } = com
  assertNonEmptyString(id, `IdUpdateCommand.id must be a non-empty string. "${id}" given.`)
  assertValidEntityName(entityName, 'IdUpdateCommand')
  assertValidUpdateOperation(operation)
}

/**
 *
 */
export function assertValidMultiUpdateCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`UpdateCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, operation, where } = com
  if (typeof where !== 'object') {
    throw new Error(`MultiUpdateCommand.where must be an object. "${where}" given.`)
  }
  assertValidEntityName(entityName, 'MultiUpdateCommand')
  assertValidUpdateOperation(operation)
}

/**
 *
 */
export function assertValidPushCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`PushCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, operations, id, versionId } = com
  assertValidEntityName(entityName, 'PushCommand')
  assertNonEmptyString(id, `PushCommand.id must be a non-empty string. "${id}" given.`)
  assertNonEmptyString(versionId, `PushCommand.versionId must be a non-empty string. "${versionId}" given.`)

  if (!Array.isArray(operations)) {
    throw new Error(`PushCommand.operations must be an array. "${typeof operations}" given.`)
  }
  if (operations.length === 0) {
    throw new Error('PushCommand.operations must be a non-empty array. Empty array is given.')
  }
  operations.forEach(assertValidUpdateOperation)
}

/**
 *
 */
export function assertValidDeleteCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`DeleteCommand must be an object. ${typeof com} given.`)
  }

  const { entityName, id, where } = com
  assertValidEntityName(entityName, 'DeleteCommand')

  if (id != null) {
    assertNonEmptyString(id, `DeleteCommand.id must be a non-empty string. "${id}" given.`)
    return
  }

  if (where != null) {
    if (typeof where !== 'object') {
      throw new Error(`DeleteCommand.where must be an object. "${where}" given.`)
    }
    return
  }
  throw new Error('DeleteCommand must have key "id" or "where". Neither given.')
}

/**
 *
 */
export function assertValidCustomQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`CustomQuery must be an object. ${typeof q} given.`)
  }
  const { name, params } = q
  assertValidCustomName(name, 'CustomQuery')

  // params can be null
  if (params == null) {
    return
  }

  // if params exists, it must be an object
  if (typeof params !== 'object') {
    throw new Error(`CustomQuery.params must be an object or null. ${typeof params} given.`)
  }
}

/**
 *
 */
export function assertValidCustomCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`CustomCommand must be an object. ${typeof com} given.`)
  }

  const { name, params } = com
  assertValidCustomName(name, 'CustomCommand')

  // params can be null
  if (params == null) {
    return
  }

  // if params exists, it must be an object
  if (typeof params !== 'object') {
    throw new Error(`CustomCommand.params must be an object or null. ${typeof params} given.`)
  }
}

/**
 *
 */
export function assertValidLoginCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`LoginCommand must be an object. ${typeof com} given.`)
  }

  const { credentials, entityName } = com
  assertValidEntityName(entityName, 'LoginCommand')

  // credentials must be an object
  if (typeof credentials !== 'object' || com === null) {
    throw new Error(`LoginCommand.credentials must be an object or null. ${typeof credentials} given.`)
  }
  // values in credentials must be strings
  Object.keys(credentials).forEach(credKey => {
    const value = credentials[credKey]
    assertNonEmptyString(value, `LoginCommand.credentials['${credKey}'] must be a non-empty string.`)
  })
}

/**
 *
 */
export function assertValidLogoutCommand(com: any): void {
  if (typeof com !== 'object' || com === null) {
    throw new Error(`LogoutCommand must be an object. ${typeof com} given.`)
  }

  const { entityName } = com
  assertValidEntityName(entityName, 'LogoutCommand')
}

/**
 *
 */
export function assertValidUpdateOperation(ope: any): void {
  if (typeof ope !== 'object' || ope === null) {
    throw new Error(`Update operation must be an object. "${ope}" given.`)
  }
}

/**
 *
 */
export function assertValidEntityName(entityName: any, _dataName?: string) {
  const dataName = _dataName ? _dataName + '.' : ''
  assertNonEmptyString(entityName, `${dataName}entityName must be a non-empty string. "${entityName}" given.`)

  if (!/[A-Za-z][A-Za-z0-9-_]*/.test(entityName)) {
    throw new Error(`${dataName}entityName must be the regex: "[A-Za-z][A-Za-z0-9-_]*". "${entityName}" given.`)
  }
}

/**
 *
 */
export function assertValidCustomName(name: any, _dataName?: string) {
  const dataName = _dataName ? _dataName + '.' : ''
  assertNonEmptyString(name, `${dataName}name must be a non-empty string. "${name}" given.`)

  if (!/[A-Za-z][A-Za-z0-9-_]*/.test(name)) {
    throw new Error(`${dataName}name must be the regex: "[A-Za-z][A-Za-z0-9-_]*". "${name}" given.`)
  }
}

/**
 *
 */
export function assertNonEmptyString(val: any, message: string) {
  if (typeof val !== 'string' || !val) {
    throw new Error(message)
  }
}
