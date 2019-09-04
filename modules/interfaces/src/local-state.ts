import {
  AllSessions,
  GeneralAuthCommandMap,
  ResponseEntity,
  GeneralEntityRestInfoMap
} from "./type-map";
import { PhenylError } from "./error";

import { Entity } from "./entity";
import { GeneralUpdateOperation } from "sp2";
import { Key } from "./utils";

export type LocalEntityInfo<E extends Entity> = {
  origin: E;
  versionId: string | null;
  commits: Array<GeneralUpdateOperation>;
  head: E | null;
};

export type LocalEntityInfoById<E extends Entity> = {
  [entityId: string]: LocalEntityInfo<E>;
};

export type LocalEntityState<RM extends GeneralEntityRestInfoMap> = {
  [EN in Key<RM>]: LocalEntityInfoById<ResponseEntity<RM, EN>>
};

export type UnreachedCommit<EN extends string> = {
  entityName: EN; // "update" key in MongoDB reference
  id: string;
  commitCount: number;
};

export type LocalState<
  RM extends GeneralEntityRestInfoMap,
  AM extends GeneralAuthCommandMap
> = {
  entities: LocalEntityState<RM>;
  network: {
    requests: Array<string>;
    isOnline: boolean;
  };
  unreachedCommits: UnreachedCommit<Key<RM>>[];
  error?: PhenylError;
  session?: AllSessions<AM> | null;
};
