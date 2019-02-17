import { Entity } from "./entity";
import { GeneralReqResEntityMap } from "./type-map";
import { GeneralUpdateOperation } from "@sp2/format";
import { Key } from "./utils";
import { PushCommand } from "./command";

export type EntityVersion = {
  id: string;
  op: string; // stringified GeneralUpdateOperation
};

export type EntityMetaInfo = {
  versions: Array<EntityVersion>;
};

export type EntityWithMetaInfo<T extends Entity> = T & {
  _PhenylMeta: EntityMetaInfo;
};

export type VersionDiff = {
  entityName: string;
  id: string;
  prevVersionId: string;
  versionId: string;
  operation: GeneralUpdateOperation;
};

export type SubscriptionRequest = {
  method: "subscribe";
  payload: {
    entityName: string;
    id: string;
  };
  sessionId?: string | null;
};

export type SubscriptionResult = {
  entityName: string;
  id: string;
  result: boolean;
  ttl?: number;
};

export type SubscriptionInfo = {
  entityName: string;
  id: string;
  ttl?: number;
};

export type VersionDiffListener = (versionDiff: VersionDiff) => any;

export interface VersionDiffSubscriber {
  subscribeVersionDiff(listener: VersionDiffListener): any;
}

export interface VersionDiffPublisher {
  publishVersionDiff(versionDiff: VersionDiff): any;
}

/**
 * Validate PushCommand in PhenylEntityClient.
 */
export type PushValidation<EM extends GeneralReqResEntityMap> = <
  EN extends Key<EM>
>(
  command: PushCommand<EN>,
  entity: EM[EN],
  masterOperations?: GeneralUpdateOperation[]
) => void;
