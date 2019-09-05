import { AuthDefinition, UserRestApiDefinition } from "./user-definition";

import { CustomCommandApiDefinition } from "./custom-command-definition";
import { CustomQueryApiDefinition } from "./custom-query-definition";
import { EntityRestApiDefinition } from "./entity-definition";

export interface OlderEntityRestApiDefinition {
  authorization?: EntityRestApiDefinition["authorize"];
  normalization?: EntityRestApiDefinition["normalize"];
  validation?: EntityRestApiDefinition["validate"];
  wrapExecution?: EntityRestApiDefinition["wrapExecution"];
}

type OlderEntityRestApiDefinitions = {
  [EntityName: string]: OlderEntityRestApiDefinition | EntityRestApiDefinition;
};

export interface OlderCustomQueryApiDefinition {
  authorization?: CustomQueryApiDefinition["authorize"];
  normalization?: CustomQueryApiDefinition["normalize"];
  validation?: CustomQueryApiDefinition["validate"];
  execution: CustomQueryApiDefinition["execute"];
}

type OlderCustomQueryApiDefinitions = {
  [QueryName: string]: OlderCustomQueryApiDefinition | CustomQueryApiDefinition;
};

export interface OlderCustomCommandApiDefinition {
  authorization?: CustomCommandApiDefinition["authorize"];
  normalization?: CustomCommandApiDefinition["normalize"];
  validation?: CustomCommandApiDefinition["validate"];
  execution: CustomCommandApiDefinition["execute"];
}

type OlderCustomCommandApiDefinitions = {
  [CommandName: string]:
    | OlderCustomCommandApiDefinition
    | CustomCommandApiDefinition;
};

export interface OlderUserRestApiDefinition
  extends OlderEntityRestApiDefinition {
  authentication: AuthDefinition["authenticate"];
}

type OlderUserRestApiDefinitions = {
  [EntityName: string]: OlderUserRestApiDefinition | UserRestApiDefinition;
};

export type OlderFunctionalGroup = Partial<{
  users: OlderUserRestApiDefinitions;
  nonUsers: OlderEntityRestApiDefinitions;
  customQueries: OlderCustomQueryApiDefinitions;
  customCommands: OlderCustomCommandApiDefinitions;
}>;
