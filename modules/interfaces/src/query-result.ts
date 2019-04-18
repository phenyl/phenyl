import { Entity } from "./entity";
import { GeneralUpdateOperation } from "@sp2/format";

export type CustomQueryResult<QR extends Object = Object> = {
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
