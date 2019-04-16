import {
  DbClient,
  DeleteCommand,
  EntityState,
  GeneralEntityMap,
  IdQuery,
  IdUpdateCommand,
  IdsQuery,
  Key,
  MultiDeleteCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  PreEntity,
  SingleInsertCommand,
  WhereQuery
} from "@phenyl/interfaces";
import { PhenylStateFinder, PhenylStateUpdater } from "@phenyl/state";
import { createServerError, timeStampWithRandomString } from "@phenyl/utils";

import { update } from "sp2";

type MemoryClientParams<M extends GeneralEntityMap> = {
  entityState?: EntityState<M>;
};
export class PhenylMemoryDbClient<M extends GeneralEntityMap>
  implements DbClient<M> {
  entityState: EntityState<M>;

  constructor(params: MemoryClientParams<M> = {}) {
    this.entityState =
      params.entityState ||
      ({
        pool: {}
      } as EntityState<M>);
  }

  /**
   *
   */
  async find<N extends Key<M>>(query: WhereQuery<N>): Promise<Array<M[N]>> {
    return PhenylStateFinder.find(this.entityState, query);
  }

  /**
   *
   */
  async findOne<N extends Key<M>>(query: WhereQuery<N>): Promise<M[N]> {
    const entity = PhenylStateFinder.findOne(this.entityState, query);

    if (entity == null) {
      throw createServerError(
        '"PhenylMemoryClient#findOne()" failed. Could not find any entity with the given query',
        "NotFound"
      );
    }

    return entity;
  }
  /**
   *
   */

  async get<N extends Key<M>>(query: IdQuery<N>): Promise<M[N]> {
    try {
      return PhenylStateFinder.get(this.entityState, query);
    } catch (e) {
      if (e.constructor.name === "Error") {
        // Error from entityState
        throw createServerError(
          `"PhenylMemoryClient#get()" failed. Could not find any entity with the given id: "${
            query.id
          }"`,
          "NotFound"
        );
      }

      throw e;
    }
  }
  /**
   *
   */

  async getByIds<N extends Key<M>>(query: IdsQuery<N>): Promise<Array<M[N]>> {
    try {
      return PhenylStateFinder.getByIds(this.entityState, query);
    } catch (e) {
      if (e.constructor.name === "Error") {
        // Error from entityState
        throw createServerError(
          `"PhenylMemoryClient#getByIds()" failed. Some ids are not found. ids: "${query.ids.join(
            ", "
          )}"`, // TODO: prevent from showing existing ids
          "NotFound"
        );
      }

      throw e;
    }
  }
  /**
   *
   */

  async insertOne<N extends Key<M>>(
    command: SingleInsertCommand<N, PreEntity<M[N]>>
  ): Promise<number> {
    await this.insertAndGet(command);
    return 1;
  }
  /**
   *
   */

  async insertMulti<N extends Key<M>>(
    command: MultiInsertCommand<N, PreEntity<M[N]>>
  ): Promise<number> {
    const entities = await this.insertAndGetMulti(command);
    return entities.length;
  }
  /**
   *
   */

  async insertAndGet<N extends Key<M>>(
    command: SingleInsertCommand<N, PreEntity<M[N]>>
  ): Promise<M[N]> {
    const { entityName, value } = command;
    // @ts-ignore newValue must contain id
    const newValue: M[N] = value.id
      ? value
      : update(value, {
          id: timeStampWithRandomString()
        });
    const operation = PhenylStateUpdater.register(
      this.entityState,
      entityName,
      newValue
    );
    // @ts-ignore operation is nonbreaking
    this.entityState = update(this.entityState, operation);
    return newValue;
  }
  /**
   *
   */

  async insertAndGetMulti<N extends Key<M>>(
    command: MultiInsertCommand<N, PreEntity<M[N]>>
  ): Promise<Array<M[N]>> {
    const { entityName, values } = command;
    // @ts-ignore newValue must contain id
    const newValues: M[N][] = values.map(value =>
      value.id
        ? value
        : update(value, {
            id: timeStampWithRandomString()
          })
    );

    for (const newValue of newValues) {
      const operation = PhenylStateUpdater.register(
        this.entityState,
        entityName,
        newValue
      );
      // @ts-ignore operation is nonbreaking
      this.entityState = update(this.entityState, operation);
    }

    return newValues;
  }
  /**
   *
   */

  async updateById<N extends Key<M>>(
    command: IdUpdateCommand<N>
  ): Promise<number> {
    await this.updateAndGet(command as IdUpdateCommand<N>); // eslint-disable-line no-unused-vars
    return 1;
  }
  /**
   *
   */

  async updateMulti<N extends Key<M>>(
    command: MultiUpdateCommand<N>
  ): Promise<number> {
    const entities = await this.updateAndFetch(command as MultiUpdateCommand<
      N
    >);
    return entities.length;
  }
  /**
   *
   */

  async updateAndGet<N extends Key<M>>(
    command: IdUpdateCommand<N>
  ): Promise<M[N]> {
    const { entityName, id } = command;

    try {
      const operation = PhenylStateUpdater.updateById(
        this.entityState,
        command
      );
      // @ts-ignore operation is nonbreaking
      this.entityState = update(this.entityState, operation);
      return PhenylStateFinder.get(this.entityState, {
        entityName,
        id
      });
    } catch (error) {
      throw createServerError(
        '"PhenylMemoryClient#updateAndGet()" failed. Could not find any entity with the given query.',
        "NotFound"
      );
    }
  }
  /**
   *
   */

  async updateAndFetch<N extends Key<M>>(
    command: MultiUpdateCommand<N>
  ): Promise<Array<M[N]>> {
    const { entityName, where } = command; // TODO Performance issue: find() runs twice for just getting N

    const values = PhenylStateFinder.find(this.entityState, {
      entityName,
      where
    });
    const ids = values.map(value => value.id);
    const operation = PhenylStateUpdater.updateMulti(this.entityState, command);
    // @ts-ignore operation is nonbreaking
    this.entityState = update(this.entityState, operation);
    const updatedValues = PhenylStateFinder.getByIds(this.entityState, {
      ids,
      entityName
    });
    return updatedValues;
  }
  /**
   *
   */

  async delete<N extends Key<M>>(command: DeleteCommand<N>): Promise<number> {
    const { entityName } = command; // TODO Performance issue: find() runs twice for just getting N

    const n = isMultiDeleteCommand(command)
      ? PhenylStateFinder.find(this.entityState, {
          where: command.where,
          entityName
        }).length
      : 1;
    const operation = PhenylStateUpdater.delete(this.entityState, command);
    // @ts-ignore operation is nonbreaking
    this.entityState = update(this.entityState, operation);
    return n;
  }
}

function isMultiDeleteCommand<EN extends string>(
  command: DeleteCommand<EN>
): command is MultiDeleteCommand<EN> {
  return command.hasOwnProperty("where");
}
