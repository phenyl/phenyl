import {
  DeleteCommand,
  IdUpdateCommand,
  MultiInsertCommand,
  MultiUpdateCommand,
  SingleInsertCommand
} from "./command";
import { GeneralEntityMap, ResponseEntity } from "./type-map";
import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { Key } from "./utils";
import { PreEntity } from "./entity";

export interface DbClient<M extends GeneralEntityMap> {
  find<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<Array<ResponseEntity<M, EN>>>;

  findOne<EN extends Key<M>>(
    query: WhereQuery<EN>
  ): Promise<ResponseEntity<M, EN>>;

  get<EN extends Key<M>>(query: IdQuery<EN>): Promise<ResponseEntity<M, EN>>;

  getByIds<EN extends Key<M>>(
    query: IdsQuery<EN>
  ): Promise<Array<ResponseEntity<M, EN>>>;

  insertOne<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>
  ): Promise<number>;

  insertMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>
  ): Promise<number>;

  insertAndGet<EN extends Key<M>>(
    command: SingleInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>
  ): Promise<ResponseEntity<M, EN>>;

  insertAndGetMulti<EN extends Key<M>>(
    command: MultiInsertCommand<EN, PreEntity<ResponseEntity<M, EN>>>
  ): Promise<ResponseEntity<M, EN>[]>;

  updateAndGet<EN extends Key<M>>(
    command: IdUpdateCommand<EN>
  ): Promise<ResponseEntity<M, EN>>;

  updateAndFetch<EN extends Key<M>>(
    command: MultiUpdateCommand<EN>
  ): Promise<ResponseEntity<M, EN>[]>;

  delete<EN extends Key<M>>(command: DeleteCommand<EN>): Promise<number>;
}
