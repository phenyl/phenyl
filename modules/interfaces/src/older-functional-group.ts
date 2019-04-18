import { AuthDefinition, UserDefinition } from "./user-definition";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityDefinition } from "./entity-definition";

export interface OlderEntityDefinition {
  authorization?: EntityDefinition["authorize"];
  normalization?: EntityDefinition["normalize"];
  validation?: EntityDefinition["validate"];
  wrapExecution?: EntityDefinition["wrapExecution"];
}

type OlderEntityDefinitions = {
  [EntityName: string]: OlderEntityDefinition | EntityDefinition;
};

export interface OlderCustomQueryDefinition {
  authorization?: CustomQueryDefinition["authorize"];
  normalization?: CustomQueryDefinition["normalize"];
  validation?: CustomQueryDefinition["validate"];
  execution: CustomQueryDefinition["execute"];
}

type OlderCustomQueryDefinitions = {
  [QueryName: string]: OlderCustomQueryDefinition | CustomQueryDefinition;
};

export interface OlderCustomCommandDefinition {
  authorization?: CustomCommandDefinition["authorize"];
  normalization?: CustomCommandDefinition["normalize"];
  validation?: CustomCommandDefinition["validate"];
  execution: CustomCommandDefinition["execute"];
}

type OlderCustomCommandDefinitions = {
  [CommandName: string]: OlderCustomCommandDefinition | CustomCommandDefinition;
};

export interface OlderUserDefinition extends OlderEntityDefinition {
  authentication: AuthDefinition["authenticate"];
}

type OlderUserDefinitions = {
  [EntityName: string]: OlderUserDefinition | UserDefinition;
};

export type OlderFunctionalGroup = Partial<{
  users: OlderUserDefinitions;
  nonUsers: OlderEntityDefinitions;
  customQueries: OlderCustomQueryDefinitions;
  customCommands: OlderCustomCommandDefinitions;
}>;
