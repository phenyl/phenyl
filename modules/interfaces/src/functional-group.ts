import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityDefinition } from "./entity-definition";
import { UserDefinition } from "./user-definition";

export type EntityDefinitions = {
  [EntityName: string]: EntityDefinition;
};

export type CustomQueryDefinitions = {
  [QueryName: string]: CustomQueryDefinition;
};

export type CustomCommandDefinitions = {
  [CommandName: string]: CustomCommandDefinition;
};

export type UserDefinitions = {
  [EntityName: string]: UserDefinition;
};

export type NormalizedFunctionalGroup = {
  users: UserDefinitions;
  nonUsers: EntityDefinitions;
  customQueries: CustomQueryDefinitions;
  customCommands: CustomCommandDefinitions;
};

export type FunctionalGroup = Partial<NormalizedFunctionalGroup>;
