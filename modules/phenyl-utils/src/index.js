// @flow

/**
 *
 */
export function assertValidRequest(op: any): void {
  if (typeof op !== 'object' || op === null) {
    throw new Error(`request must be an object. ${typeof op} given.`)
  }
  const keys = Object.keys(op)
  if (keys.length !== 1) {
    const keysDescription = keys.length === 0 ? '' : ` keys=[${keys.join(', ')}]`
    throw new Error(`request object must have just one key, ${keys.length} given.${keysDescription}`)
  }
  const key = keys[0]
  switch(key) {
    case 'find':
      return assertValidWhereQuery(op.find)
    case 'findOne':
      return assertValidWhereQuery(op.findOne)
    case 'get':
      return assertValidIdQuery(op.get)
    case 'getByIds':
      return assertValidIdsQuery(op.getByIds)
    case 'insert':
      return assertValidInsertCommand(op.insert)
    case 'insertAndGet':
      return assertValidInsertCommand(op.insertAndGet)
    case 'insertAndFetch':
      return assertValidInsertCommand(op.insertAndFetch)
    case 'update':
      return assertValidUpdateCommand(op.update)
    case 'updateAndGet':
      return assertValidUpdateCommand(op.updateAndGet)
    case 'updateAndFetch':
      return assertValidUpdateCommand(op.updateAndFetch)
    case 'delete':
      return assertValidDeleteCommand(op.delete)
    case 'runCustomQuery':
      return assertValidCustomQuery(op.runCustomQuery)
    case 'runCustomCommand':
      return assertValidCustomCommand(op.runCustomCommand)
    default:
      throw new Error(`Invalid request key: "${key}"`)
  }
}

/**
 *
 */
export function assertValidWhereQuery(q: any): void {
  if (typeof q !== 'object' || q === null) {
    throw new Error(`whereQuery must be an object. ${typeof q} given.`)
  }
  const { from, where } = q

  if (typeof from !== 'string' || !from) {
    throw new Error(`whereQuery.from must be a non-empty string. "${from}" given.`)
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
  const { from, id } = q

  if (typeof from !== 'string' || !from) {
    throw new Error(`idQuery.from must be a non-empty string. "${from}" given.`)
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
  const { from, ids } = q

  if (typeof from !== 'string' || !from) {
    throw new Error(`idsQuery.from must be a non-empty string. "${from}" given.`)
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

  const { from, value, values } = com

  if (typeof from !== 'string' || !from) {
    throw new Error(`insertCommand.from must be a non-empty string. "${from}" given.`)
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

  const { from, operators, id, where } = com

  if (typeof from !== 'string' || !from) {
    throw new Error(`updateCommand.from must be a non-empty string. "${from}" given.`)
  }

  assertValidUpdateOperators(operators)

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

  const { from, id, where } = com

  if (typeof from !== 'string' || !from) {
    throw new Error(`deleteCommand.from must be a non-empty string. "${from}" given.`)
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
    throw new Error(`customCommand.from must be a non-empty string. "${name}" given.`)
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
export function assertValidUpdateOperators(ope: any): void {
  if (typeof ope !== 'object' || ope === null) {
    throw new Error(`update operators must be an object. "${ope}" given.`)
  }
}
