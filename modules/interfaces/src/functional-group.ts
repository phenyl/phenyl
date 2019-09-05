import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityRestApiDefinition } from "./entity-definition";
import { UserDefinition } from "./user-definition";
import { GeneralTypeMap } from "./type-map";
import { UserEntityNameOf, NonUserEntityNameOf } from "./auth-command-map";
import { CustomQueryNameOf, CustomCommandNameOf } from "./custom-map";

export type EntityRestApiDefinitions = {
  [EntityName: string]: EntityRestApiDefinition;
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
  nonUsers: EntityRestApiDefinitions;
  customQueries: CustomQueryDefinitions;
  customCommands: CustomCommandDefinitions;
};

export interface NormalizedFunctionalGroup<TM extends GeneralTypeMap>
  extends GeneralNormalizedFunctionalGroup {
  users: { [UN in UserEntityNameOf<TM>]: UserDefinition };
  nonUsers: { [EN in NonUserEntityNameOf<TM>]: EntityRestApiDefinition };
  customQueries: { [QN in CustomQueryNameOf<TM>]: CustomQueryDefinition };
  customCommands: { [CN in CustomCommandNameOf<TM>]: CustomCommandDefinition };
}

export type FunctionalGroup<TM extends GeneralTypeMap> = Partial<
  NormalizedFunctionalGroup<TM>
>;

export type GeneralFunctionalGroup = Partial<GeneralNormalizedFunctionalGroup>;
