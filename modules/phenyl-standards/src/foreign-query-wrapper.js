// @flow
import {
  assign,
} from 'power-assign/jsnext'
import {
  switchByRequestMethod,
  assertValidEntityName,
  assertNonEmptyString,
} from 'phenyl-utils/jsnext'
import {
  getNestedValue,
} from 'oad-utils/jsnext'
import type {
  Entity,
  ForeignWhereQuery,
  ForeignIdQuery,
  ForeignIdsQuery,
  ForeignQueryParams,
  RequestData,
  Session,
  CoreExecution,
  ResponseData,
  DocumentPath,
  EntitiesById,
  EntityClient,
} from 'phenyl-interfaces'

/**
 * Instance containing ExecutionWrapper and ValidationHandler to attach foreign Entity by foreign key.
 *
 * methods:
 * wrapExecution: ExecutionWrapper
 * validation: ValidationHandler
 */
export default class ForeignQueryWrapper {
  entityClient: EntityClient

  constructor(entityClient: EntityClient) {
    this.entityClient = entityClient
  }

  /**
   *
   */
  async validation(reqData: RequestData, session: ?Session): Promise<void> {
    return switchByRequestMethod(reqData, {
      async find(query: ForeignWhereQuery) {
        assertValidForeignQuery(query.foreign, 'ForeignWhereQuery')
      },
      async findOne(query: ForeignWhereQuery) {
        assertValidForeignQuery(query.foreign, 'ForeignWhereQuery')
      },
      async get(query: ForeignIdQuery) {
        assertValidForeignQuery(query.foreign, 'ForeignIdQuery')
      },
      async getByIds(query: ForeignIdsQuery) {
        assertValidForeignQuery(query.foreign, 'ForeignIdsQuery')
      },
      async handleDefault(reqData, session) {
        return
      },
    })
  }

  /**
   *
   */
  async wrapExecution(reqData: RequestData, session: ?Session, execution: CoreExecution): Promise<ResponseData> {
    const { entityClient } = this
    const resData = await execution(reqData, session)

    return await switchByRequestMethod(reqData, {
      find: async (query: ForeignWhereQuery) => {
        if (resData.type !== 'find' || query.foreign == null) return resData
        const foreignEntitiesById = await this.getForeignEntities(resData.payload.values, query.foreign)
        return assign(resData, { 'payload.foreign': { values: foreignEntitiesById } })
      },

      findOne: async (query: ForeignWhereQuery) => {
        if (resData.type !== 'findOne' || query.foreign == null) return resData
        const foreignEntity = await this.getForeignEntity(resData.payload.value, query.foreign)
        return assign(resData, { 'payload.foreign': { value: foreignEntity } })
      },

      get: async (query: ForeignIdQuery) => {
        if (resData.type !== 'get' || query.foreign == null) return resData
        const foreignEntity = await this.getForeignEntity(resData.payload.value, query.foreign)
        return assign(resData, { 'payload.foreign': { value: foreignEntity } })
      },

      getByIds: async (query: ForeignIdsQuery) => {
        if (resData.type !== 'getByIds' || query.foreign == null) return resData
        const foreignEntitiesById = await this.getForeignEntities(resData.payload.values, query.foreign)
        return assign(resData, { 'payload.foreign': { values: foreignEntitiesById } })
      },

      handleDefault: async (reqData, session) => {
        return resData
      },
    })
  }

  /**
   * @private
   */
  async getForeignEntities(entities: Array<Entity>, foreign: ForeignQueryParams): Promise<EntitiesById> {
    const { documentPath, entityName } = foreign

    try {
      const foreignIds = entities.map(entity => getNestedValue(entity, documentPath))
      const result = await this.entityClient.getByIds({ ids: foreignIds, entityName })
      if (!result.ok) {
        throw new Error(result.message)
      }
      const entitiesById = {}
      for (const entity of result.values) {
        entitiesById[entity.id] = entity
      }
      return entitiesById
    }
    catch (e) {
      e.message = `Error while getting entities "${entityName}" by foreign keys "${documentPath}".\n${e.message}`
      throw e
    }
  }

  /**
   * @private
   */
  async getForeignEntity(entity: Entity, foreign: ForeignQueryParams): Promise<Entity> {
    const { documentPath, entityName } = foreign

    try {
      const foreignId = getNestedValue(entity, documentPath)
      const result = await this.entityClient.get({ id: foreignId, entityName })
      if (!result.ok) {
        throw new Error(result.message)
      }
      return result.value
    }
    catch (e) {
      e.message = `Error while getting entities "${entityName}" by foreign keys "${documentPath}".\n${e.message}`
      throw e
    }
  }
}

/**
 *
 */
function assertValidForeignQuery(foreign: any, dataName: string) {
  if (foreign == null) {
    return
  }
  const { documentPath, entityName } = foreign
  assertNonEmptyString(documentPath, `${dataName}.foreign.documentPath must be a non-empty string.`)
  assertValidEntityName(entityName, `${dataName}.foreign`)
}
