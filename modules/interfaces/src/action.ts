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
import { ExtraParams } from "./extra";
import { GeneralTypeMap } from "./type-map";
import {
  EntityNameOf,
  EntityExtraParamsOf,
  ResponseEntityOf,
  EntityRestInfoMapOf
} from "./entity-rest-info-map";
import {
  UserEntityNameOf,
  AuthCredentialsOf,
  AuthSessionOf,
  AuthCommandMapOf
} from "./auth-command-map";
import { LocalState } from "./local-state";

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

export type CommitActionPayload<EN extends string> = IdUpdateCommand<EN, {}>;

export type CommitAction<EN extends string> = {
  type: "phenyl/commit";
  payload: CommitActionPayload<EN>;
  tag: string;
};

export type PushActionPayload<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  entityName: EN;
  id: string;
  until?: number; // Index of commits
  extra?: EP;
};

export type PushAction<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/push";
  payload: PushActionPayload<EN, EP> & { until: number };
  tag: string;
};

export type RePushAction = {
  type: "phenyl/repush";
  tag: string;
};

export type CommitAndPushActionPayload<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = IdUpdateCommand<EN, EP>;

export type CommitAndPushAction<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/commitAndPush";
  payload: CommitAndPushActionPayload<EN, EP>;
  tag: string;
};

export type DeleteAction<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/delete";
  payload: IdDeleteCommand<EN, EP>;
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

export type LoginAction<
  UN extends string,
  C extends Object,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/login";
  payload: LoginCommand<UN, C, EP>;
  tag: string;
};

export type LogoutAction<
  UN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/logout";
  payload: LogoutCommand<UN, EP>;
  tag: string;
};

export type PatchAction<EN extends string> = {
  type: "phenyl/patch";
  payload: VersionDiff<EN>;
  tag: string;
};

export type PullActionPayload<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = IdQuery<EN, EP>; // Not PullQuery here, as versionId is unnecessary.

export type PullAction<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/pull";
  payload: PullActionPayload<EN, EP>;
  tag: string;
};

export type PushAndCommitActionPayload<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = IdUpdateCommand<EN, EP>;

export type PushAndCommitAction<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = {
  type: "phenyl/pushAndCommit";
  payload: PushAndCommitActionPayload<EN, EP>;
  tag: string;
};

export type ResolveErrorAction = {
  type: "phenyl/resolveError";
};

export type SetSessionAction<
  UN extends string,
  E extends Entity,
  S extends Object = Object
> = {
  type: "phenyl/setSession";
  payload: {
    session: Session<UN, S>;
    user?: E;
    versionId?: string;
  };
  tag: string;
};

export type UnfollowAction<EN extends string> = {
  type: "phenyl/unfollow";
  payload: IdQuery<EN, {}>;
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

export type ReplaceActionOf<TM extends GeneralTypeMap> = ReplaceAction<
  LocalState<EntityRestInfoMapOf<TM>, AuthCommandMapOf<TM>>
>;

export type DeleteActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = DeleteAction<EN, EntityExtraParamsOf<TM, EN, "delete">>;

export type PushActionPayloadOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PushActionPayload<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type PushActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PushAction<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type CommitAndPushActionPayloadOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = CommitAndPushActionPayload<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type CommitAndPushActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = CommitAndPushAction<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type FollowActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = FollowAction<EN, ResponseEntityOf<TM, EN>>;

export type FollowAllActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = FollowAllAction<EN, ResponseEntityOf<TM, EN>>;

export type LoginActionOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = LoginAction<
  UN,
  AuthCredentialsOf<TM, UN>,
  EntityExtraParamsOf<TM, UN, "login">
>;

export type LogoutActionOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = LogoutAction<UN, EntityExtraParamsOf<TM, UN, "logout">>;

export type PullActionPayloadOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PullActionPayload<EN, EntityExtraParamsOf<TM, EN, "pull">>;

export type PullActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PullAction<EN, EntityExtraParamsOf<TM, EN, "pull">>;

export type PushAndCommitActionPayloadOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PushAndCommitActionPayload<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type PushAndCommitActionOf<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>
> = PushAndCommitAction<EN, EntityExtraParamsOf<TM, EN, "push">>;

export type SetSessionActionOf<
  TM extends GeneralTypeMap,
  UN extends UserEntityNameOf<TM>
> = SetSessionAction<UN, ResponseEntityOf<TM, UN>, AuthSessionOf<TM, UN>>;

export type UseEntitiesActionOf<TM extends GeneralTypeMap> = UseEntitiesAction<
  EntityNameOf<TM>
>;

export type ActionWithTypeMap<
  TM extends GeneralTypeMap,
  EN extends EntityNameOf<TM>,
  UN extends UserEntityNameOf<TM>
> =
  | AssignAction
  | ReplaceActionOf<TM>
  | ResetAction
  | CommitAction<EN>
  | PushActionOf<TM, EN>
  | RePushAction
  | CommitAndPushActionOf<TM, EN>
  | DeleteActionOf<TM, EN>
  | FollowActionOf<TM, EN>
  | FollowAllActionOf<TM, EN>
  | LoginActionOf<TM, UN>
  | LogoutActionOf<TM, UN>
  | PatchAction<EN>
  | PullActionOf<TM, EN>
  | PushAndCommitActionOf<TM, EN>
  | ResolveErrorAction
  | SetSessionActionOf<TM, UN>
  | UnfollowAction<EN>
  | UnsetSessionAction
  | OnlineAction
  | OfflineAction
  | UseEntitiesActionOf<TM>;

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
  | PatchAction<string>
  | PullAction<string>
  | PushAndCommitAction<string>
  | ResolveErrorAction
  | SetSessionAction<string, Entity, Object>
  | UnfollowAction<string>
  | UnsetSessionAction
  | OnlineAction
  | OfflineAction
  | UseEntitiesAction<string>;
