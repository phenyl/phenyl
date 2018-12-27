import { FindOperation, GeneralUpdateOperation } from "@sp2/format";

import { ProEntity } from "./entity";

/**
 * Type of a parameter for creating an entity.
 * Value doesn't need to contain "id" property.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/insert/
 */
export type SingleInsertCommand<EN extends string, PE extends ProEntity> = {
  entityName: EN; // "insert" key in MongoDB reference
  value: PE; // "documents" key in MongoDB reference
  ordered?: boolean;
};

/**
 * Type of a parameter for creating multiple entities.
 * Values is an array containing entity which doesn't need to contain "id" property.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/insert/
 */
export type MultiInsertCommand<EN extends string, PE extends ProEntity> = {
  entityName: EN; // "insert" key in MongoDB reference
  values: PE[]; // "documents" key in MongoDB reference
  ordered?: boolean;
};

/**
 * Type of a parameter for updating entity(s).
 *
 * See more for https://docs.mongodb.com/manual/reference/command/update/
 */
export type UpdateCommand<EN extends string> =
  | IdUpdateCommand<EN>
  | MultiUpdateCommand<EN>;

/**
 * Type of a parameter for updating one entity.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/update/
 */
export type IdUpdateCommand<EN extends string> = {
  entityName: EN; // "update" key in MongoDB reference
  id: string;
  operation: GeneralUpdateOperation; // "u" key in MongoDB reference
};

/**
 * Type of a parameter for updating multiple entities.
 *
 * See more for https://docs.mongodb.com/manual/reference/command/update/
 */
export type MultiUpdateCommand<EN extends string> = {
  entityName: EN; // "update" key in MongoDB reference
  where: FindOperation; // "q" key in MongoDB reference
  operation: GeneralUpdateOperation; // "u" key in MongoDB reference
  ordered?: boolean;
};

/**
 * Type of a parameter for push (like Git does) the difference expressed by operations.
 */
export type PushCommand<EN extends string> = {
  entityName: EN;
  id: string;
  operations: GeneralUpdateOperation[];
  versionId: string | null;
};

/**
 * Type of a parameter for removing entity(s).
 *
 * see https://docs.mongodb.com/manual/reference/command/delete/
 */
export type DeleteCommand<EN extends string> =
  | IdDeleteCommand<EN>
  | MultiDeleteCommand<EN>;

/**
 * Type of a parameter for removing one entity.
 *
 * see https://docs.mongodb.com/manual/reference/command/delete/
 */
export type IdDeleteCommand<EN extends string> = {
  entityName: EN; // "delete" key in MongoDB reference
  id: string;
};

/**
 * Type of a parameter for removing multiple entities.
 *
 * see https://docs.mongodb.com/manual/reference/command/delete/
 */
export type MultiDeleteCommand<En extends string> = {
  entityName: En; // "delete" key in MongoDB reference
  where: FindOperation; // "q" key in MongoDB reference
  limit?: number;
  ordered?: boolean;
};

export interface CustomCommand<CN extends string, CP extends Object> {
  name: CN; // custom insert command name
  params: CP;
}

export interface LoginCommand<
  EN extends string,
  C extends Object,
  O extends Object
> {
  entityName: EN;
  credentials: C;
  options?: O;
}

export interface LogoutCommand<EN extends string> {
  sessionId: string;
  userId: string;
  entityName: EN;
}
