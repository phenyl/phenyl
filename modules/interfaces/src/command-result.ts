import { Entity } from "./entity";
import { GeneralUpdateOperation } from "@sp2/format";
import { Session } from "./session";

type IdMap = { [id: string]: string | null };

export type DeleteCommandResult = {
  ok: 1;
  n: number;
};

export type SingleInsertCommandResult = {
  ok: 1;
  n: number;
  versionId: string;
};

export type MultiInsertCommandResult = {
  ok: 1;
  n: number;
  versionsById: { [entityId: string]: string };
};

export type IdUpdateCommandResult = {
  ok: 1;
  n: number;
  versionId: string;
  prevVersionId: string | null;
};

export type MultiUpdateCommandResult = {
  ok: 1;
  n: number;
  versionsById: IdMap;
  prevVersionsById: IdMap;
};

export type MultiValuesCommandResult<E extends Entity> = {
  ok: 1;
  n: number;
  entities: E[];
  versionsById: IdMap;
  prevVersionsById: IdMap;
};

export type GetCommandResult<E extends Entity> = {
  ok: 1;
  n: number; // TODO necessary?
  entity: E;
  versionId: string;
  prevVersionId: string | null;
};

export type PushCommandResult<E extends Entity> =
  | {
      ok: 1;
      n: number; // TODO necessary?
      hasEntity: 0;
      operations: GeneralUpdateOperation[];
      newOperation: GeneralUpdateOperation;
      versionId: string;
      prevVersionId: string | null;
    }
  | {
      ok: 1;
      n: number; // TODO necessary?
      hasEntity: 1;
      entity: E;
      versionId: string;
      prevVersionId: string | null;
      newOperation: GeneralUpdateOperation;
    };

export type CustomCommandResult<CR extends Object> = {
  ok: 1;
  result: CR;
};

export type LoginCommandResult<E extends Entity> = {
  ok: 1;
  session: Session;
  user: E | null;
  versionId: string | null;
};

export type LogoutCommandResult = {
  ok: 1;
};
