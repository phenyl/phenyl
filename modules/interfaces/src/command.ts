import {
  FindOperation,
  GeneralUpdateOperation,
  SimpleFindOperation
} from "sp2";

import { ProEntity } from "./entity";
import { ObjectMap } from "./utils";
type ExtraParams = ObjectMap;

/**
 * Type of a parameter for creating an entity.
 * Value doesn't need to contain "id" property.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/insert/
 */
export interface SingleInsertCommand<
  EN extends string,
  PE extends ProEntity,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN; // "insert" key in MongoDB reference
  value: PE; // "documents" key in MongoDB reference
  ordered?: boolean;
  extra?: EP;
}

/**
 * Type of a parameter for creating multiple entities.
 * Values is an array containing entity which doesn't need to contain "id" property.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/insert/
 */
export interface MultiInsertCommand<
  EN extends string,
  PE extends ProEntity,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN; // "insert" key in MongoDB reference
  values: PE[]; // "documents" key in MongoDB reference
  ordered?: boolean;
  extra?: EP;
}

/**
 * Type of a parameter for updating entity(s).
 *
 * See more for https://docs.mongodb.com/manual/reference/command/update/
 */
export type UpdateCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = IdUpdateCommand<EN, EP> | MultiUpdateCommand<EN, EP>;

/**
 * Type of a parameter for updating one entity.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/update/
 */
export interface IdUpdateCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN; // "update" key in MongoDB reference
  id: string;
  operation: GeneralUpdateOperation; // "u" key in MongoDB reference
  filter?: SimpleFindOperation;
  extra?: EP;
}

/**
 * Type of a parameter for updating multiple entities.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/update/
 */
export interface MultiUpdateCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN; // "update" key in MongoDB reference
  where: FindOperation; // "q" key in MongoDB reference
  operation: GeneralUpdateOperation; // "u" key in MongoDB reference
  ordered?: boolean;
  extra?: EP;
}

/**
 * Type of a parameter for push (like Git does) the difference expressed by operations.
 */
export interface PushCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  id: string;
  operations: GeneralUpdateOperation[];
  versionId: string | null;
  extra?: EP;
}

/**
 * Type of a parameter for removing entity(s).
 *
 * see https://docs.mongodb.com/manual/reference/command/delete/
 */
export type DeleteCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> = IdDeleteCommand<EN, EP> | MultiDeleteCommand<EN, EP>;

/**
 * Type of a parameter for removing one entity.
 *
 * see https://docs.mongodb.com/manual/reference/command/delete/
 */
export interface IdDeleteCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN; // "delete" key in MongoDB reference
  id: string;
  extra?: EP;
}

/**
 * Type of a parameter for removing multiple entities.
 *
 * see https://docs.mongodb.com/manual/reference/command/delete/
 */
export interface MultiDeleteCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN; // "delete" key in MongoDB reference
  where: FindOperation; // "q" key in MongoDB reference
  limit?: number;
  ordered?: boolean;
  extra?: EP;
}

export interface CustomCommand<
  CN extends string,
  CP extends Object,
  EP extends ExtraParams = ExtraParams
> {
  name: CN; // custom insert command name
  params: CP;
  extra?: EP;
}

export interface LoginCommand<
  EN extends string,
  C extends Object,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  credentials: C;
  extra?: EP;
}

export interface LogoutCommand<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  sessionId: string;
  userId: string;
  entityName: EN;
  extra?: EP;
}

export type GeneralSingleInsertCommand = SingleInsertCommand<string, ProEntity>;
export type GeneralMultiInsertCommand = MultiInsertCommand<string, ProEntity>;
export type GeneralUpdateCommand = UpdateCommand<string>;
export type GeneralIdUpdateCommand = IdUpdateCommand<string>;
export type GeneralMultiUpdateCommand = MultiUpdateCommand<string>;
export type GeneralPushCommand = PushCommand<string>;
export type GeneralDeleteCommand = DeleteCommand<string>;
export type GeneralIdDeleteCommand = IdDeleteCommand<string>;
export type GeneralMultiDeleteCommand = MultiDeleteCommand<string>;
export type GeneralCustomCommand = CustomCommand<string, Object>;
export type GeneralLoginCommand = LoginCommand<string, Object>;
export type GeneralLogoutCommand = LogoutCommand<string>;
