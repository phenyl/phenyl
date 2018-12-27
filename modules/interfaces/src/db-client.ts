import {
  DeleteCommand,
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  SingleInsertCommand
} from "./command";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { GeneralEntityMap } from "./type-map";
import { Key } from "./key";
import { PreEntity } from "./entity";

export interface DbClient<M extends GeneralEntityMap> {
  find<EN extends Key<M>>(query: WhereQuery<EN>): Promise<Array<M[EN]>>;

  findOne<EN extends Key<M>>(query: WhereQuery<EN>): Promise<M[EN]>;

  get<EN extends Key<M>>(query: IdQuery<EN>): Promise<M[EN]>;

  getByIds<EN extends Key<M>>(query: IdsQuery<EN>): Promise<Array<M[EN]>>;

  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<number>;

  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<number>;

  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<M[EN]>;

  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<M[EN]>>
  ): Promise<M[EN][]>;

  updateAndGet<EN extends Key<M>>(command: IdUpdateCommand<EN>): Promise<M[EN]>;

  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<M[EN][]>;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): Promise<number>;
}
