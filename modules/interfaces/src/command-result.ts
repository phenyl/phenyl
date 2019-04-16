import { Entity } from "./entity";
import { GeneralUpdateOperation } from "@sp2/format";
import { Session } from "./session";

type IdMap = { [id: string]: string | null };

export type DeleteCommandResult = {
  n: number;
};

export type SingleInsertCommandResult = {
  n: number;
  versionId: string;
};

export type MultiInsertCommandResult = {
  n: number;
  versionsById: IdMap;
};

export type IdUpdateCommandResult = {
  n: number;
  versionId: string;
  prevVersionId: string | null;
};

export type MultiUpdateCommandResult = {
  n: number;
  versionsById: IdMap;
  prevVersionsById: IdMap;
};

export type MultiValuesCommandResult<E extends Entity> = {
  n: number;
  entities: E[];
  versionsById: IdMap;
  prevVersionsById: IdMap;
};

export type GetCommandResult<E extends Entity> = {
  n: number; // TODO necessary?
  entity: E;
  versionId: string;
  prevVersionId: string | null;
};

export type PushCommandResult<E extends Entity> =
  | {
      n: number; // TODO necessary?
      hasEntity: 0;
      operations: GeneralUpdateOperation[];
      newOperation: GeneralUpdateOperation;
      versionId: string;
      prevVersionId: string | null;
    }
  | {
      n: number; // TODO necessary?
      hasEntity: 1;
      entity: E;
      versionId: string;
      prevVersionId: string | null;
      newOperation: GeneralUpdateOperation;
    };

export type CustomCommandResult<CR extends Object> = {
  result: CR;
};

export type LoginCommandResult<
  EN extends string,
  E extends Entity,
  S extends Object
> = {
  session: Session<EN, S>;
  user: E | null;
  versionId: string | null;
};

export type LogoutCommandResult = {
  ok: 1;
};
