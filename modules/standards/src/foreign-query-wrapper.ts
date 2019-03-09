import {
  assign,
  // @ts-ignore remove this comment after @phenyl/assign release
} from 'power-assign'
import {
  switchByRequestMethod,
  assertValidEntityName,
  assertNonEmptyString,
  // @ts-ignore remove this comment after @phenyl/utils release
} from '@phenyl/utils'
import {
  getNestedValue,
  // @ts-ignore remove this comment after @phenyl/oad-utils release
} from 'oad-utils'
import {
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
  Keys,
  // @ts-ignore remove this comment after @phenyl/interfaces release
} from '@phenyl/interfaces'

/**
 * Instance containing ExecutionWrapper and ValidationHandler to attach foreign Entity by foreign key.
 *
 * methods:
 * wrapExecution: ExecutionWrapper
 * validation: ValidationHandler
 */
export class ForeignQueryWrapper<M extends EntityMap> {
  entityClient: EntityClient<M>

  constructor(entityClient: EntityClient<M>) {
    this.entityClient = entityClient
  }

  /**
   *
   */
  async validation(reqData: RequestData, session: Session | void): Promise<void> { // eslint-disable-line no-unused-vars
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
      // @ts-ignore no-unused-vars
      async handleDefault(reqData, session) { // eslint-disable-line no-unused-vars
        return
      },
    })
  }

  /**
   *
   */
  async wrapExecution(reqData: RequestData, session: Session | void, execution: RestApiExecution): Promise<ResponseData> {
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
      // @ts-ignore no-unused-vars
      handleDefault: async (reqData, session) => { // eslint-disable-line no-unused-vars
        return resData
      },
    })
  }

  /**
   * @private
   */
  async getForeignEntities<E extends Entity, FN extends Keys<M>>(entities: Array<E>, foreign: ForeignQueryParams<FN>): Promise<EntitiesById<E>> {
    const { documentPath, entityName } = foreign

    try {
      const foreignIds = entities.map(entity => getNestedValue(entity, documentPath))
      const result = await this.entityClient.getByIds({ ids: foreignIds, entityName })
      const entitiesById: { [key: string]: E } = {}
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
  async getForeignEntity<E extends Entity, FN extends Keys<M>>(entity: E, foreign: ForeignQueryParams<FN>): Promise<E> {
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
export const GeneralForeignQueryWrapper: typeof ForeignQueryWrapper = ForeignQueryWrapper
