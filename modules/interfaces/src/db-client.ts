import {
  DeleteCommand,
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  SingleInsertCommand
} from "./command";
import { GeneralEntityMap } from "./type-map";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { Key } from "./utils";
import { PreEntity } from "./entity";

type EntityOf<EM extends GeneralEntityMap, EN extends Key<EM>> = EM[EN];

export interface DbClient<M extends GeneralEntityMap> {
  find<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<Array<EntityOf<M, EN>>>;

  findOne<EN extends Key<M>>(query: WhereQuery<EN>): Promise<EntityOf<M, EN>>;

  get<EN extends Key<M>>(query: IdQuery<EN>): Promise<EntityOf<M, EN>>;

  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>
  ): Promise<Array<EntityOf<M, EN>>>;

  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<number>;

  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<number>;

  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<EntityOf<M, EN>>;

  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<EntityOf<M, EN>>>
  ): Promise<EntityOf<M, EN>[]>;

  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<EntityOf<M, EN>>;

  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<EntityOf<M, EN>[]>;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): Promise<number>;
}
