import { Entity } from "./entity";
import { GeneralUpdateOperation } from "@sp2/format";

export type CustomQueryResult<QR extends Object> = {
  ok: 1;
  result: QR;
};

export type QueryResult<E extends Entity> = {
  ok: 1;
  entities: E[];
  versionsById: { [entityId: string]: string | null };
};

export type SingleQueryResult<E extends Entity> = {
  ok: 1;
  entity: E;
  versionId: string | null;
};

export type PullQueryResult<E extends Entity> =
  | {
      ok: 1;
      pulled: 1;
      operations: GeneralUpdateOperation[];
      versionId: string | null;
    }
  | SingleQueryResult<E>;
