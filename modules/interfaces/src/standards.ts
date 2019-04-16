import { IdQuery, IdsQuery, WhereQuery } from "./query";

import { Entity } from "./entity";

type ForeignQuery<FN extends string, T> = T & {
  foreign?: ForeignQueryParams<FN>;
};

export type ForeignQueryParams<FN extends string> = {
  documentPath: string;
  entityName: FN;
};

export type ForeignQueryResult<T> = T & {
  foreign?: { entities: Array<Entity> } | { entity: Entity };
};

export type ForeignIdQuery<N extends string, FN extends string> = ForeignQuery<
  FN,
  IdQuery<N>
>;
export type ForeignWhereQuery<
  N extends string,
  FN extends string
> = ForeignQuery<FN, WhereQuery<N>>;
export type ForeignIdsQuery<N extends string, FN extends string> = ForeignQuery<
  FN,
  IdsQuery<N>
>;
