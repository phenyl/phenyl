import { Entity } from "./entity";
import { GeneralUpdateOperation } from "sp2";
import { Session } from "./session";
import { ObjectMap } from "./utils";

type ExtraResult = ObjectMap;

type IdMap = { [id: string]: string | null };

export type CustomCommandResultObject = ObjectMap & { extra?: undefined };

export type DeleteCommandResult<ER extends ExtraResult = ExtraResult> = {
  n: number;
  extra?: ER;
};

export type SingleInsertCommandResult<ER extends ExtraResult = ExtraResult> = {
  n: number;
  versionId: string;
  extra?: ER;
};

export type MultiInsertCommandResult<ER extends ExtraResult = ExtraResult> = {
  n: number;
  versionsById: IdMap;
  extra?: ER;
};

export type IdUpdateCommandResult<ER extends ExtraResult = ExtraResult> = {
  n: number;
  versionId: string;
  prevVersionId: string | null;
  extra?: ER;
};

export type MultiUpdateCommandResult<ER extends ExtraResult = ExtraResult> = {
  n: number;
  versionsById: IdMap;
  prevVersionsById: IdMap;
  extra?: ER;
};

export type MultiValuesCommandResult<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  n: number;
  entities: E[];
  versionsById: IdMap;
  prevVersionsById: IdMap;
  extra?: ER;
};

export type GetCommandResult<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> = {
  n: number; // TODO necessary?
  entity: E;
  versionId: string;
  prevVersionId: string | null;
  extra?: ER;
};

export type PushCommandResult<
  E extends Entity,
  ER extends ExtraResult = ExtraResult
> =
  | {
      n: number; // TODO necessary?
      hasEntity: 0;
      operations: GeneralUpdateOperation[];
      versionId: string;
      prevVersionId: string | null;
      extra?: ER;
    }
  | {
      n: number; // TODO necessary?
      hasEntity: 1;
      entity: E;
      versionId: string;
      prevVersionId: string | null;
      extra?: ER;
    };

export type CustomCommandResult<
  CR extends CustomCommandResultObject,
  ER extends ExtraResult = ExtraResult
> = CR & {
  extra?: ER;
};

export type LoginCommandResult<
  EN extends string,
  E extends Entity,
  S extends Object,
  ER extends ExtraResult = ExtraResult
> = {
  session: Session<EN, S>;
  user: E | null;
  versionId: string | null;
  extra?: ER;
};

export type LogoutCommandResult<ER extends ExtraResult = ExtraResult> = {
  ok: 1;
  extra?: ER;
};

export type GeneralDeleteCommandResult = DeleteCommandResult;
export type GeneralSingleInsertCommandResult = SingleInsertCommandResult;
export type GeneralMultiInsertCommandResult = MultiInsertCommandResult;
export type GeneralIdUpdateCommandResult = IdUpdateCommandResult;
export type GeneralMultiUpdateCommandResult = MultiUpdateCommandResult;
export type GeneralMultiValuesCommandResult = MultiValuesCommandResult<Entity>;
export type GeneralGetCommandResult = GetCommandResult<Entity>;
export type GeneralPushCommandResult = PushCommandResult<Entity>;
export type GeneralCustomCommandResult = CustomCommandResult<
  CustomCommandResultObject
>;
export type GeneralLoginCommandResult = LoginCommandResult<
  string,
  Entity,
  Object
>;
export type GeneralLogoutCommandResult = LogoutCommandResult;
