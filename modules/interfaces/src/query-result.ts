import { Entity } from "./entity";
import { GeneralUpdateOperation } from "sp2";
import { ExtraResult, CustomQueryResultObject } from "./extra";

export type CustomQueryResult<
  QR extends CustomQueryResultObject,
  ER extends ExtraResult = ExtraResult
> = QR & { extra?: ER };

export type QueryResult<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  entities: E[];
  versionsById: { [entityId: string]: string | null };
  extra?: ER;
};

export type SingleQueryResult<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  entity: E;
  versionId: string | null;
  extra?: ER;
};

export type PullQueryResult<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> =
  | {
      pulled: 1;
      operations: GeneralUpdateOperation[];
      versionId: string | null;
      extra?: ER;
    }
  | SingleQueryResult<E, ER>;

export type GeneralCustomQueryResult = CustomQueryResult<
  CustomQueryResultObject
>;
export type GeneralQueryResult = QueryResult<Entity>;
export type GeneralSingleQueryResult = SingleQueryResult<Entity>;
export type GeneralPullQueryResult = PullQueryResult<Entity>;
