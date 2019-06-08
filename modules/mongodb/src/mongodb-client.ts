import {
  $bind,
  FindOperation,
  SimpleFindOperation,
  toMongoFindOperation,
  toMongoUpdateOperation,
  update,
  visitFindOperation
} from "sp2";
import {
  ChangeStream,
  ChangeStreamOptions,
  ChangeStreamPipeline
} from "./change-stream";
import {
  DbClient,
  DeleteCommand,
  Entity,
  EntityOf,
  GeneralEntityMap,
  IdQuery,
  IdUpdateCommand,
  IdsQuery,
  Key,
  MultiInsertCommand,
  MultiUpdateCommand,
  OverWriteCommand,
  PreEntity,
  SingleInsertCommand,
  WhereQuery
} from "@phenyl/interfaces";

import { MongoDbConnection } from "./connection";
import { ObjectId } from "bson";
import { createServerError } from "@phenyl/utils";
import mongodb from "mongodb";

// TODO: Remove `id` prop
type MongoEntity<E extends Entity> = E & { _id: string };
type MongoEntityWithObjectId<E extends Entity> = E & { _id: ObjectId };

// convert 24-byte hex lower string to ObjectId
function ObjectID<T>(id: string | ObjectId): string | ObjectId {
  if (id instanceof mongodb.ObjectID) return id;
  if (typeof id !== "string") return id;
  try {
    return /^[0-9a-f]{24}$/.test(id) ? new ObjectId(id) : id;
  } catch (e) {
    return id;
  }
}

function convertToObjectIdRecursively(src: any): any {
  if (Array.isArray(src)) return src.map(id => ObjectID(id));
  if (typeof src !== "object") return ObjectID(src);
  return Object.keys(src).reduce((dst: any, key: string) => {
    dst[key] = convertToObjectIdRecursively(src[key]);
    return dst;
  }, {});
}

function convertIdToObjectIdInWhere(
  simpleFindOperation: SimpleFindOperation
): SimpleFindOperation {
  const { $set, $docPath } = $bind<SimpleFindOperation>();
  return simpleFindOperation.id
    ? update(
        simpleFindOperation,
        $set(
          $docPath("id"),
          convertToObjectIdRecursively(simpleFindOperation.id)
        )
      )
    : simpleFindOperation;
}

function replaceIdInto_idInWhere(
  simpleFindOperation: SimpleFindOperation
): SimpleFindOperation {
  const { $rename, $docPath } = $bind<SimpleFindOperation>();
  return update(
    simpleFindOperation,
    $rename($docPath("id"), "_id")
  ) as SimpleFindOperation;
}

function composedFindOperationFilters(
  simpleFindOperation: SimpleFindOperation
): SimpleFindOperation {
  return [
    convertIdToObjectIdInWhere,
    replaceIdInto_idInWhere,
    toMongoFindOperation
  ].reduce(
    (operation, filterFunc) => filterFunc(operation),
    simpleFindOperation
  );
}

export function filterFindOperation(operation: FindOperation): FindOperation {
  return visitFindOperation(operation, {
    simpleFindOperation: composedFindOperationFilters
  });
}

function convertIdToObjectIdInEntity<E extends Entity>(entity: E): E {
  return entity.id ? update(entity, { id: ObjectID(entity.id) }) : entity;
}

function replaceIdInto_idInEntity<E extends Entity>(entity: E): MongoEntity<E> {
  // @ts-ignore ReturnType has "_id"
  return update(entity, { $rename: { id: "_id" } });
}

export function filterInputEntity<E extends PreEntity<Entity>>(
  srcEntity: E
): E {
  return [
    convertIdToObjectIdInEntity,
    replaceIdInto_idInEntity
    // @ts-ignore @TODO
  ].reduce((entity: Entity, filterFunc) => filterFunc(entity), srcEntity);
}

function isObjectId(id: any): id is ObjectId {
  return id instanceof mongodb.ObjectID;
}

function convertObjectIdToStringInMongoEntity<E extends Entity>(
  mongoEntity: MongoEntityWithObjectId<E>
): MongoEntity<E> {
  // @ts-ignore
  return isObjectId(mongoEntity._id)
    ? update(mongoEntity, { _id: mongoEntity._id.toString() })
    : mongoEntity;
}

function replace_idIntoIdInEntity<E extends Entity>(entity: MongoEntity<E>): E {
  // @ts-ignore
  return update(entity, { $rename: { _id: "id" } });
}

export function restoreIdInEntity<E extends Entity>(
  mongoEntityWithObjectId: MongoEntityWithObjectId<E>
): E {
  const intermediate = convertObjectIdToStringInMongoEntity(
    mongoEntityWithObjectId
  );
  return replace_idIntoIdInEntity(intermediate);
}

export class PhenylMongoDbClient<M extends GeneralEntityMap>
  implements DbClient<M> {
  conn: MongoDbConnection;

  constructor(conn: MongoDbConnection) {
    this.conn = conn;
  }

  async find<N extends Key<M>>(
    query: WhereQuery<N>
  ): Promise<Array<EntityOf<M, N>>> {
    const { entityName, where, skip, limit } = query;
    const coll = this.conn.collection(entityName);
    const options: FindOperation = {};
    if (skip) options.skip = skip;
    if (limit) options.limit = limit;

    const result = await coll.find(filterFindOperation(where), options);
    return result.map<any>(restoreIdInEntity);
  }

  async findOne<N extends Key<M>>(
    query: WhereQuery<N>
  ): Promise<EntityOf<M, N>> {
    const { entityName, where } = query;
    const coll = this.conn.collection(entityName);
    const result = await coll.find(filterFindOperation(where), { limit: 1 });
    if (result.length === 0) {
      throw createServerError("findOne()", "NotFound");
    }
    // @TODO: use better type to take place of any
    return restoreIdInEntity<any>(result[0] || null);
  }

  async get<N extends Key<M>>(query: IdQuery<N>): Promise<EntityOf<M, N>> {
    const { entityName, id } = query;
    const coll = this.conn.collection(entityName);
    // @ts-ignore TODO: prepare new type: MongoSimpleFindOperation
    const result = await coll.find({ _id: ObjectID(id) });
    if (result.length === 0) {
      throw createServerError(
        '"PhenylMongodbClient#get()" failed. Could not find any entity with the given query.',
        "NotFound"
      );
    }
    return restoreIdInEntity<any>(result[0]);
  }

  async getByIds<E extends Key<M>>(
    query: IdsQuery<E>
  ): Promise<Array<EntityOf<M, E>>> {
    const { entityName, ids } = query;
    const coll = this.conn.collection(entityName);
    const result = await coll.find({ _id: { $in: ids.map(ObjectID) } });
    if (result.length === 0) {
      throw createServerError(
        '"PhenylMongodbClient#getByIds()" failed. Could not find any entity with the given query.',
        "NotFound"
      );
    }
    return result.map<any>(restoreIdInEntity);
  }

  async insertOne<N extends Key<M>>(
    command: SingleInsertCommand<N, PreEntity<M[N]>>
  ): Promise<number> {
    const { entityName, value } = command;
    const coll = this.conn.collection(entityName);
    const result = await coll.insertOne(filterInputEntity(value));
    return result.insertedCount;
  }

  async insertMulti<N extends Key<M>>(
    command: MultiInsertCommand<N, PreEntity<EntityOf<M, N>>>
  ): Promise<number> {
    const { entityName } = command;
    const coll = this.conn.collection(entityName);
    const result = await coll.insertMany(command.values.map(filterInputEntity));
    return result.insertedCount;
  }

  async insertAndGet<N extends Key<M>>(
    command: SingleInsertCommand<N, PreEntity<M[N]>>
  ): Promise<M[N]> {
    const { entityName } = command;
    const coll = this.conn.collection(entityName);
    const result = await coll.insertOne(filterInputEntity(command.value));
    // TODO transactional operation needed
    return this.get({ entityName, id: result.insertedId });
  }

  async insertAndGetMulti<N extends Key<M>>(
    command: MultiInsertCommand<N, PreEntity<EntityOf<M, N>>>
  ): Promise<EntityOf<M, N>[]> {
    const { entityName } = command;
    const coll = this.conn.collection(entityName);

    const result = await coll.insertMany(command.values.map(filterInputEntity));
    const ids: string[] = Object.values(result.insertedIds);
    // TODO: transactional operation needed
    return this.getByIds({ entityName, ids });
  }

  async overwrite<EN extends Key<M>>(
    command: OverWriteCommand<EN, EntityOf<M, EN>>
  ): Promise<void> {
    const { entityName, id, entity } = command;
    const coll = this.conn.collection(entityName);
    await coll.replaceOne({ _id: ObjectID(id) }, entity);
  }

  async updateById<N extends Key<M>>(
    command: IdUpdateCommand<N>
  ): Promise<void> {
    const { entityName, id, operation } = command;
    const coll = this.conn.collection(entityName);
    const result = await coll.updateOne(
      { _id: ObjectID(id) },
      toMongoUpdateOperation(operation)
    );
    const { matchedCount } = result;
    if (matchedCount === 0) {
      throw createServerError(
        '"PhenylMongodbClient#updateAndGet()" failed. Could not find any entity with the given query.',
        "NotFound"
      );
    }
  }

  async updateAndGet<N extends Key<M>>(
    command: IdUpdateCommand<N>
  ): Promise<EntityOf<M, N>> {
    const { entityName, id, operation } = command;
    const coll = this.conn.collection(entityName);
    const result = await coll.updateOne(
      { _id: ObjectID(id) },
      toMongoUpdateOperation(operation)
    );
    const { matchedCount } = result;
    if (matchedCount === 0) {
      throw createServerError(
        '"PhenylMongodbClient#updateAndGet()" failed. Could not find any entity with the given query.',
        "NotFound"
      );
    }
    // TODO: transactional operation needed
    return this.get({ entityName, id });
  }

  async updateAndFetch<N extends Key<M>>(
    command: MultiUpdateCommand<N>
  ): Promise<EntityOf<M, N>[]> {
    const { entityName, where, operation } = command;
    const coll = this.conn.collection(entityName);
    await coll.updateMany(
      filterFindOperation(where),
      toMongoUpdateOperation(operation)
    );
    // FIXME: the result may be different from updated entities.
    return this.find({ entityName, where });
  }

  async delete<N extends Key<M>>(command: DeleteCommand<N>): Promise<number> {
    const { entityName } = command;
    const coll = this.conn.collection(entityName);
    let result;
    // @ts-ignore TODO: improve the type of DeleteCommand
    const { id, where } = command;
    if (id) {
      result = await coll.deleteOne({ _id: ObjectID(id) });
    } else if (where) {
      result = await coll.deleteMany(filterFindOperation(where));
    }
    // @ts-ignore deleteCount-exists
    const { deletedCount } = result;
    return deletedCount;
  }

  watch<N extends Key<M>>(
    entityName: N,
    pipeline?: ChangeStreamPipeline,
    options?: ChangeStreamOptions
  ): ChangeStream {
    return this.conn.collection(entityName).watch(pipeline, options);
  }
}
