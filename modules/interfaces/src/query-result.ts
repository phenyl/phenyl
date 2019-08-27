import { Entity } from "./entity";
import { GeneralUpdateOperation } from "sp2";

export type CustomQueryResult<QR extends Object> = {
  result: QR;
};

export type QueryResult<E extends Entity> = {
  entities: E[];
  versionsById: { [entityId: string]: string | null };
};

export type SingleQueryResult<E extends Entity> = {
  entity: E;
  versionId: string | null;
};

export type PullQueryResult<E extends Entity> =
  | {
      pulled: 1;
      operations: GeneralUpdateOperation[];
      versionId: string | null;
    }
  | SingleQueryResult<E>;

export type GeneralCustomQueryResult = CustomQueryResult<Object>;
export type GeneralQueryResult = QueryResult<Entity>;
export type GeneralSingleQueryResult = SingleQueryResult<Entity>;
export type GeneralPullQueryResult = PullQueryResult<Entity>;
