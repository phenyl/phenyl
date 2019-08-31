import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityDefinition } from "./entity-definition";
import { UserDefinition } from "./user-definition";
import {
  GeneralTypeMap,
  UserEntityNameOf,
  NonUserEntityNameOf,
  CustomQueryNameOf,
  CustomCommandNameOf
} from "./type-map";

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
  [UserEntityName: string]: UserDefinition;
};

export type GeneralNormalizedFunctionalGroup = {
  users: UserDefinitions;
  nonUsers: EntityDefinitions;
  customQueries: CustomQueryDefinitions;
  customCommands: CustomCommandDefinitions;
};

export interface NormalizedFunctionalGroup<TM extends GeneralTypeMap>
  extends GeneralNormalizedFunctionalGroup {
  users: { [UN in UserEntityNameOf<TM>]: UserDefinition };
  nonUsers: { [EN in NonUserEntityNameOf<TM>]: EntityDefinition };
  customQueries: { [QN in CustomQueryNameOf<TM>]: CustomQueryDefinition };
  customCommands: { [CN in CustomCommandNameOf<TM>]: CustomCommandDefinition };
}

export type FunctionalGroup<TM extends GeneralTypeMap> = Partial<
  NormalizedFunctionalGroup<TM>
>;

export type GeneralFunctionalGroup = Partial<GeneralNormalizedFunctionalGroup>;
