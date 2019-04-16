<<<<<<< HEAD
import { $bind, update, getNestedValue } from "sp2";
=======
import { $bind, update, getNestedValue } from 'sp2'
>>>>>>> fix types
import {
  switchByRequestMethod,
  assertValidEntityName,
  assertNonEmptyString
} from "@phenyl/utils";
import {
  Entity,
  GeneralReqResEntityMap,
  ForeignWhereQuery,
  ForeignIdQuery,
  ForeignIdsQuery,
  ForeignQueryParams,
  Key,
  GeneralRequestData,
  GeneralResponseData,
  Session,
  EntitiesById,
<<<<<<< HEAD
  EntityClient
} from "@phenyl/interfaces";

import { RestApiExecution } from "./decls";
=======
  EntityClient,
  UserEntityRequestData,
  Nullable,
} from '@phenyl/interfaces'

import { RestApiExecution } from './decls'
>>>>>>> fix types

/**
 * Instance containing ExecutionWrapper and ValidationHandler to attach foreign Entity by foreign key.
 *
 * methods:
 * wrapExecution: ExecutionWrapper
 * validation: ValidationHandler
 */
export class ForeignQueryWrapper<M extends GeneralReqResEntityMap> {
  entityClient: EntityClient<M>;

  constructor(entityClient: EntityClient<M>) {
    this.entityClient = entityClient;
  }

  /**
   *
   */
  async validation(
    reqData: GeneralRequestData,
<<<<<<< HEAD
    session: Session | null | undefined
=======
    session: Session | null | undefined,
>>>>>>> fix types
  ): Promise<void> {
    // eslint-disable-line no-unused-vars
    return switchByRequestMethod(reqData, {
      async find(query: ForeignWhereQuery<any, any>) {
        assertValidForeignQuery(query.foreign, "ForeignWhereQuery");
      },
      async findOne(query: ForeignWhereQuery<any, any>) {
        assertValidForeignQuery(query.foreign, "ForeignWhereQuery");
      },
      async get(query: ForeignIdQuery<any, any>) {
        assertValidForeignQuery(query.foreign, "ForeignIdQuery");
      },
      async getByIds(query: ForeignIdsQuery<any, any>) {
<<<<<<< HEAD
        assertValidForeignQuery(query.foreign, "ForeignIdsQuery");
=======
        assertValidForeignQuery(query.foreign, 'ForeignIdsQuery')
      },
      async handleDefault(reqData) {
        // eslint-disable-line no-unused-vars
        return
>>>>>>> fix types
      },
      async handleDefault(reqData) {
        // eslint-disable-line no-unused-vars
        return;
      }
    });
  }

  /**
   *
   */
<<<<<<< HEAD
  async wrapExecution(
    reqData: GeneralRequestData,
    session: Session | null | undefined,
    execution: RestApiExecution
  ): Promise<GeneralResponseData> {
    const resData = await execution(reqData, session);

    return await switchByRequestMethod(reqData, {
      find: async (query: ForeignWhereQuery<any, any>) => {
        if (resData.type !== "find" || query.foreign == null) return resData;
        const foreignEntitiesById = await this.getForeignEntities(
          resData.payload.entities,
          query.foreign
        );
        const { $set, $docPath } = $bind<typeof resData>();
        return update(
          resData,
          // @ts-ignore: GeneralResponseData is not have payload.foreign
          $set($docPath("payload", "foreign", "entities"), foreignEntitiesById)
        );
      },

      findOne: async (query: ForeignWhereQuery<any, any>) => {
        if (resData.type !== "findOne" || query.foreign == null) return resData;
        const foreignEntity = await this.getForeignEntity(
          resData.payload.entity,
          query.foreign
        );
        const { $set, $docPath } = $bind<typeof resData>();
        return update(
          resData,
          // @ts-ignore: GeneralResponseData is not have payload.foreign
          $set($docPath("payload", "foreign", "entity"), foreignEntity)
        );
      },

      get: async (query: ForeignIdQuery<any, any>) => {
        if (resData.type !== "get" || query.foreign == null) return resData;
        const foreignEntity = await this.getForeignEntity(
          resData.payload.entity,
          query.foreign
        );
        const { $set, $docPath } = $bind<typeof resData>();
        return update(
          resData,
          // @ts-ignore: GeneralResponseData is not have payload.foreign
          $set($docPath("payload", "foreign", "entity"), foreignEntity)
        );
      },

      getByIds: async (query: ForeignIdsQuery<any, any>) => {
        if (resData.type !== "getByIds" || query.foreign == null)
          return resData;
        const foreignEntitiesById = await this.getForeignEntities(
          resData.payload.entities,
          query.foreign
        );
        const { $set, $docPath } = $bind<typeof resData>();
        return update(
          resData,
          // @ts-ignore: GeneralResponseData is not have payload.foreign
          $set($docPath("payload", "foreign", "entities"), foreignEntitiesById)
        );
=======
  async wrapExecution<
    M extends GeneralReqResEntityMap,
    EN extends Key<M>,
    Ereqres extends M[EN],
    C extends Object,
    S extends Object,
    SS extends Session<string, Object> = Session<string, Object>
  >(
    reqData: UserEntityRequestData<EN, Ereqres['request'], C>,
    session: Nullable<SS>,
    execution: RestApiExecution<M, EN, Ereqres, C, S, SS>,
  ): Promise<GeneralResponseData> {
    const resData = await execution(reqData, session)

    return await switchByRequestMethod(reqData, {
      find: async (query: ForeignWhereQuery<any, any>) => {
        if (resData.type !== 'find' || query.foreign == null) return resData
        const foreignEntitiesById = await this.getForeignEntities(
          resData.payload.entities,
          query.foreign,
        )
        const { $set, $docPath } = $bind<typeof resData>()
        return update(
          resData,
          // @ts-ignore: has no foreign key
          $set($docPath('payload', 'foreign', 'entities'), foreignEntitiesById),
        )
      },

      findOne: async (query: ForeignWhereQuery<any, any>) => {
        if (resData.type !== 'findOne' || query.foreign == null) return resData
        const foreignEntity = await this.getForeignEntity(
          resData.payload.entity,
          query.foreign,
        )
        const { $set, $docPath } = $bind<typeof resData>()
        return update(
          resData,
          // @ts-ignore: has no foreign key
          $set($docPath('payload', 'foreign', 'entity'), foreignEntity),
        )
      },

      get: async (query: ForeignIdQuery<any, any>) => {
        if (resData.type !== 'get' || query.foreign == null) return resData
        const foreignEntity = await this.getForeignEntity(
          resData.payload.entity,
          query.foreign,
        )
        const { $set, $docPath } = $bind<typeof resData>()
        return update(
          resData,
          // @ts-ignore: has no foreign key
          $set($docPath('payload', 'foreign', 'entity'), foreignEntity),
        )
      },

      getByIds: async (query: ForeignIdsQuery<any, any>) => {
        if (resData.type !== 'getByIds' || query.foreign == null) return resData
        const foreignEntitiesById = await this.getForeignEntities(
          resData.payload.entities,
          query.foreign,
        )
        const { $set, $docPath } = $bind<typeof resData>()
        return update(
          resData,
          // @ts-ignore: has no foreign key
          $set($docPath('payload', 'foreign', 'entities'), foreignEntitiesById),
        )
>>>>>>> fix types
      },

      handleDefault: async (reqData: GeneralRequestData) => {
        // eslint-disable-line no-unused-vars
<<<<<<< HEAD
        return resData;
      }
    });
=======
        return resData
      },
    })
>>>>>>> fix types
  }

  /**
   * @private
   */
  async getForeignEntities<E extends Entity, FN extends Key<M>>(
    entities: Array<E>,
<<<<<<< HEAD
    foreign: ForeignQueryParams<FN>
  ): Promise<EntitiesById<M[FN]["response"]>> {
    const { documentPath, entityName } = foreign;

    try {
      const foreignIds = entities.map(entity =>
        getNestedValue(entity, documentPath)
      );
      const result = await this.entityClient.getByIds({
        ids: foreignIds,
        entityName
      });
      const entitiesById: EntitiesById<M[FN]["response"]> = {};
=======
    foreign: ForeignQueryParams<FN>,
  ): Promise<EntitiesById<M[FN]['response']>> {
    const { documentPath, entityName } = foreign

    try {
      const foreignIds = entities.map(entity =>
        getNestedValue(entity, documentPath),
      )
      const result = await this.entityClient.getByIds({
        ids: foreignIds,
        entityName,
      })
      const entitiesById: EntitiesById<M[FN]['response']> = {}
>>>>>>> fix types
      for (const entity of result.entities) {
        entitiesById[entity.id] = entity;
      }
<<<<<<< HEAD
      return entitiesById;
    } catch (e) {
      e.message = `Error while getting entities "${entityName}" by foreign keys "${documentPath}".\n${
        e.message
      }`;
      throw e;
=======
      return entitiesById
    } catch (e) {
      e.message = `Error while getting entities "${entityName}" by foreign keys "${documentPath}".\n${
        e.message
      }`
      throw e
>>>>>>> fix types
    }
  }

  /**
   * @private
   */
  async getForeignEntity<E extends Entity, FN extends Key<M>>(
    entity: E,
<<<<<<< HEAD
    foreign: ForeignQueryParams<FN>
  ): Promise<M[FN]["response"]> {
    const { documentPath, entityName } = foreign;

    try {
      const foreignId = getNestedValue(entity, documentPath);
      const result = await this.entityClient.get({ id: foreignId, entityName });
      return result.entity;
    } catch (e) {
      e.message = `Error while getting entities "${entityName}" by foreign keys "${documentPath}".\n${
        e.message
      }`;
      throw e;
=======
    foreign: ForeignQueryParams<FN>,
  ): Promise<M[FN]['response']> {
    const { documentPath, entityName } = foreign

    try {
      const foreignId = getNestedValue(entity, documentPath)
      const result = await this.entityClient.get({ id: foreignId, entityName })
      return result.entity
    } catch (e) {
      e.message = `Error while getting entities "${entityName}" by foreign keys "${documentPath}".\n${
        e.message
      }`
      throw e
>>>>>>> fix types
    }
  }
}

/**
 *
 */
function assertValidForeignQuery(foreign: any, dataName: string) {
  if (foreign == null) {
    return;
  }
<<<<<<< HEAD
  const { documentPath, entityName } = foreign;
  assertNonEmptyString(
    documentPath,
    `${dataName}.foreign.documentPath must be a non-empty string.`
  );
  assertValidEntityName(entityName, `${dataName}.foreign`);
=======
  const { documentPath, entityName } = foreign
  assertNonEmptyString(
    documentPath,
    `${dataName}.foreign.documentPath must be a non-empty string.`,
  )
  assertValidEntityName(entityName, `${dataName}.foreign`)
>>>>>>> fix types
}
export const GeneralForeignQueryWrapper: typeof ForeignQueryWrapper = ForeignQueryWrapper;
