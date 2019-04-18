import {
  ReqRes,
  CustomCommandParams,
  CustomCommandResultValue,
  GeneralCustomCommandMap,
  GeneralCustomMap
} from "./type-map";
import { AuthDefinition, UserDefinition } from "./user-definition";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { Key } from "./utils";

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

export interface OlderCustomCommandDefinition<
  CN extends string = string,
  CP extends Object = Object,
  CR extends Object = Object
> {
  authorization?: CustomCommandDefinition["authorize"];
  normalization?: CustomCommandDefinition["normalize"];
  validation?: CustomCommandDefinition["validate"];
  execution: CustomCommandDefinition["execute"];
}

type OlderCustomCommandDefinitions<CM extends GeneralCustomCommandMap> = {
  [CN in Key<CM>]:
    | OlderCustomCommandDefinition<
        CN,
        CustomCommandParams<CM, CN>,
        CustomCommandResultValue<CM, CN>
      >
    | CustomCommandDefinition
};

export interface OlderUserDefinition<
  EN extends string = string,
  Ebroader extends ReqRes<Entity> = ReqRes<Entity>,
  C extends Object = Object,
  S extends Object = Object
> extends OlderEntityDefinition {
  authentication: AuthDefinition["authenticate"];
}

type OlderUserDefinitions = {
  [EntityName: string]: OlderUserDefinition | UserDefinition;
};

export type OlderFunctionalGroup = Partial<{
  users: OlderUserDefinitions;
  nonUsers: OlderEntityDefinitions;
  customQueries: OlderCustomQueryDefinitions;
  customCommands: OlderCustomCommandDefinitions<GeneralCustomMap>;
}>;
