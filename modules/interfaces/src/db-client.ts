import {
  DeleteCommand,
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  SingleInsertCommand
} from "./command";
import { GeneralEntityMap, NarrowEntity } from "./type-map";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { Key } from "./key";
import { PreEntity } from "./entity";

export interface DbClient<M extends GeneralEntityMap> {
  find<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<Array<NarrowEntity<M, EN>>>;

  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<NarrowEntity<M, EN>>;

  get<EN extends Key<M>>(query: IdQuery<EN>): Promise<NarrowEntity<M, EN>>;

  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>
  ): Promise<Array<NarrowEntity<M, EN>>>;

  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<NarrowEntity<M, EN>>>
  ): Promise<number>;

  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<NarrowEntity<M, EN>>>
  ): Promise<number>;

  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<NarrowEntity<M, EN>>>
  ): Promise<NarrowEntity<M, EN>>;

  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<NarrowEntity<M, EN>>>
  ): Promise<NarrowEntity<M, EN>[]>;

  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<NarrowEntity<M, EN>>;

  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<NarrowEntity<M, EN>[]>;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): Promise<number>;
}
