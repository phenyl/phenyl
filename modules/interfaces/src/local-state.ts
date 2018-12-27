import { ErrorLocation, PhenylErrorType } from "./error";

import { Entity } from "./entity";
import { GeneralEntityMap } from "./type-map";
import { GeneralUpdateOperation } from "@sp2/format";
import { Key } from "./key";
import { Session } from "./session";

export type LocalEntityInfo<E extends Entity> = {
  origin: E;
  versionId: string | null;
  commits: Array<GeneralUpdateOperation>;
  head: E | null;
};

export type LocalEntityInfoById<E extends Entity> = {
  [entityId: string]: LocalEntityInfo<E>;
};

export type LocalEntityState<M extends GeneralEntityMap> = {
  [EN in Key<M>]: LocalEntityInfoById<M[EN]>
};

export type UnreachedCommit<EN extends string> = {
  entityName: EN; // "update" key in MongoDB reference
  id: string;
  commitCount: number;
};

export type LocalState<M extends GeneralEntityMap> = {
  entities: LocalEntityState<M>;
  network: {
    requests: Array<string>;
    isOnline: boolean;
  };
  unreachedCommits: UnreachedCommit<Key<M>>[];
  error?: {
    type: PhenylErrorType;
    at: ErrorLocation;
    message: string;
    actionTag: string;
  };
  session?: Session | null;
};
