// @flow
import {
  assign,
} from 'power-assign'
import {
  switchByRequestMethod,
  assertValidEntityName,
  assertNonEmptyString,
} from 'phenyl-utils'
import {
  getNestedValue,
} from 'oad-utils'
import type {
  Entity,
  EntityMap,
  ForeignWhereQuery,
  ForeignIdQuery,
  ForeignIdsQuery,
  ForeignQueryParams,
  RequestData,
  Session,
  RestApiExecution,
  ResponseData,
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
export class ForeignQueryWrapper<M: EntityMap> {
  entityClient: EntityClient<M>

  constructor(entityClient: EntityClient<M>) {
    this.entityClient = entityClient
  }

  /**
   *
   */
  async validation(reqData: RequestData, session: ?Session): Promise<void> { // eslint-disable-line no-unused-vars
    return switchByRequestMethod(reqData, {
      async find(query: ForeignWhereQuery<*, *>) {
        assertValidForeignQuery(query.foreign, 'ForeignWhereQuery')
      },
      async findOne(query: ForeignWhereQuery<*, *>) {
        assertValidForeignQuery(query.foreign, 'ForeignWhereQuery')
      },
      async get(query: ForeignIdQuery<*, *>) {
        assertValidForeignQuery(query.foreign, 'ForeignIdQuery')
      },
      async getByIds(query: ForeignIdsQuery<*, *>) {
        assertValidForeignQuery(query.foreign, 'ForeignIdsQuery')
      },
      async handleDefault(reqData, session) { // eslint-disable-line no-unused-vars
        return
      },
    })
  }

  /**
   *
   */
  async wrapExecution(reqData: RequestData, session: ?Session, execution: RestApiExecution): Promise<ResponseData> {
    const resData = await execution(reqData, session)

    return await switchByRequestMethod(reqData, {
      find: async (query: ForeignWhereQuery<*, *>) => {
        if (resData.type !== 'find' || query.foreign == null) return resData
        const foreignEntitiesById = await this.getForeignEntities(resData.payload.entities, query.foreign)
        return assign(resData, { 'payload.foreign': { entities: foreignEntitiesById } })
      },

      findOne: async (query: ForeignWhereQuery<*, *>) => {
        if (resData.type !== 'findOne' || query.foreign == null) return resData
        const foreignEntity = await this.getForeignEntity(resData.payload.entity, query.foreign)
        return assign(resData, { 'payload.foreign': { entity: foreignEntity } })
      },

      get: async (query: ForeignIdQuery<*, *>) => {
        if (resData.type !== 'get' || query.foreign == null) return resData
        const foreignEntity = await this.getForeignEntity(resData.payload.entity, query.foreign)
        return assign(resData, { 'payload.foreign': { entity: foreignEntity } })
      },

      getByIds: async (query: ForeignIdsQuery<*, *>) => {
        if (resData.type !== 'getByIds' || query.foreign == null) return resData
        const foreignEntitiesById = await this.getForeignEntities(resData.payload.entities, query.foreign)
        return assign(resData, { 'payload.foreign': { entities: foreignEntitiesById } })
      },

      handleDefault: async (reqData, session) => { // eslint-disable-line no-unused-vars
        return resData
      },
    })
  }

  /**
   * @private
   */
  async getForeignEntities<E: Entity, FN: $Keys<M>>(entities: Array<E>, foreign: ForeignQueryParams<FN>): Promise<EntitiesById<E>> {
    const { documentPath, entityName } = foreign

    try {
      const foreignIds = entities.map(entity => getNestedValue(entity, documentPath))
      const result = await this.entityClient.getByIds({ ids: foreignIds, entityName })
      const entitiesById = {}
      for (const entity of result.entities) {
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
  async getForeignEntity<E: Entity, FN: $Keys<M>>(entity: E, foreign: ForeignQueryParams<FN>): Promise<E> {
    const { documentPath, entityName } = foreign

    try {
      const foreignId = getNestedValue(entity, documentPath)
      const result = await this.entityClient.get({ id: foreignId, entityName })
      return result.entity
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
export const GeneralForeignQueryWrapper: Class<ForeignQueryWrapper<*>> = ForeignQueryWrapper
