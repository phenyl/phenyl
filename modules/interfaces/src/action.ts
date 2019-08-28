import { EntitiesInfo, Entity, EntityInfo } from "./entity";
import {
  IdDeleteCommand,
  IdUpdateCommand,
  LoginCommand,
  LogoutCommand
} from "./command";

import { GeneralUpdateOperation } from "sp2";
import { IdQuery } from "./query";
import { Session } from "./session";
import { VersionDiff } from "./versioning";

/**
 *
 */
export type AssignAction = {
  type: "phenyl/assign";
  payload: GeneralUpdateOperation[];
  tag: string;
};

/**
 *
 */
export type ReplaceAction<L extends Object> = {
  type: "phenyl/replace";
  payload: L; // L: LocalState
  tag: string;
};

/**
 *
 */
export type ResetAction = {
  type: "phenyl/reset";
  payload?: Object;
  tag: string;
};

export type UseEntitiesAction<EN extends string> = {
  type: "phenyl/useEntities";
  payload: EN[];
  tag: string;
};

export type CommitAction<EN extends string> = {
  type: "phenyl/commit";
  payload: IdUpdateCommand<EN>;
  tag: string;
};

export type PushActionPayload<EN extends string> = {
  entityName: EN;
  id: string;
  until?: number; // Index of commits
  tag: string;
};

export type PushAction<EN extends string> = {
  type: "phenyl/push";
  payload: {
    entityName: EN;
    id: string;
    until: number; // Index of commits
  };
  tag: string;
};

export type RePushAction = {
  type: "phenyl/repush";
  tag: string;
};

export type CommitAndPushAction<EN extends string> = {
  type: "phenyl/commitAndPush";
  payload: IdUpdateCommand<EN>;
  tag: string;
};

export type DeleteAction<EN extends string> = {
  type: "phenyl/delete";
  payload: IdDeleteCommand<EN>;
  tag: string;
};

export type FollowAction<EN extends string, E extends Entity> = {
  type: "phenyl/follow";
  payload: EntityInfo<EN, E>;
  tag: string;
};

export type FollowAllAction<EN extends string, E extends Entity> = {
  type: "phenyl/followAll";
  payload: EntitiesInfo<EN, E>;
  tag: string;
};

export type LoginAction<EN extends string, C extends Object> = {
  type: "phenyl/login";
  payload: LoginCommand<EN, C>;
  tag: string;
};

export type LogoutAction<EN extends string> = {
  type: "phenyl/logout";
  payload: LogoutCommand<EN>;
  tag: string;
};

export type PatchAction = {
  type: "phenyl/patch";
  payload: VersionDiff;
  tag: string;
};

export type PullAction<EN extends string> = {
  type: "phenyl/pull";
  payload: IdQuery<EN>;
  tag: string;
};

export type PushAndCommitAction<EN extends string> = {
  type: "phenyl/pushAndCommit";
  payload: IdUpdateCommand<EN>;
  tag: string;
};

export type ResolveErrorAction = {
  type: "phenyl/resolveError";
};

export type SetSessionAction<
  EN extends string,
  E extends Entity,
  S extends Object = Object
> = {
  type: "phenyl/setSession";
  payload: {
    session: Session<EN, S>;
    user?: E;
    versionId?: string;
  };
  tag: string;
};

export type UnfollowAction<EN extends string> = {
  type: "phenyl/unfollow";
  payload: IdQuery<EN>;
  tag: string;
};

export type UnsetSessionAction = {
  type: "phenyl/unsetSession";
  payload?: Object;
  tag: string;
};

export type OnlineAction = {
  type: "phenyl/online";
};

export type OfflineAction = {
  type: "phenyl/offline";
};

export type GeneralAction =
  | AssignAction
  | ReplaceAction<Object>
  | ResetAction
  | CommitAction<string>
  | PushAction<string>
  | RePushAction
  | CommitAndPushAction<string>
  | DeleteAction<string>
  | FollowAction<string, Entity>
  | FollowAllAction<string, Entity>
  | LoginAction<string, Object>
  | LogoutAction<string>
  | PatchAction
  | PullAction<string>
  | PushAndCommitAction<string>
  | ResolveErrorAction
  | SetSessionAction<string, Entity, Object>
  | UnfollowAction<string>
  | UnsetSessionAction
  | OnlineAction
  | OfflineAction
  | UseEntitiesAction<string>;
