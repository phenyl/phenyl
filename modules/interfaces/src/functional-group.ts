import { CustomCommandApiDefinition } from "./custom-command-api-definition";
import { CustomQueryApiDefinition } from "./custom-query-api-definition";
import { EntityRestApiDefinition } from "./entity-rest-api-definition";
import { UserRestApiDefinition } from "./user-rest-api-definition";
import { GeneralTypeMap } from "./type-map";
import { UserEntityNameOf, NonUserEntityNameOf } from "./auth-command-map";
import { CustomQueryNameOf, CustomCommandNameOf } from "./custom-map";

export type EntityRestApiDefinitions = {
  [EntityName: string]: EntityRestApiDefinition;
};

export type CustomQueryApiDefinitions = {
  [QueryName: string]: CustomQueryApiDefinition;
};

export type CustomCommandApiDefinitions = {
  [CommandName: string]: CustomCommandApiDefinition;
};

export type UserRestApiDefinitions = {
  [UserEntityName: string]: UserRestApiDefinition;
};

export type GeneralNormalizedFunctionalGroup = {
  users: UserRestApiDefinitions;
  nonUsers: EntityRestApiDefinitions;
  customQueries: CustomQueryApiDefinitions;
  customCommands: CustomCommandApiDefinitions;
};

export interface NormalizedFunctionalGroup<TM extends GeneralTypeMap>
  extends GeneralNormalizedFunctionalGroup {
  users: { [UN in UserEntityNameOf<TM>]: UserRestApiDefinition };
  nonUsers: { [EN in NonUserEntityNameOf<TM>]: EntityRestApiDefinition };
  customQueries: { [QN in CustomQueryNameOf<TM>]: CustomQueryApiDefinition };
  customCommands: {
    [CN in CustomCommandNameOf<TM>]: CustomCommandApiDefinition
  };
}

export type FunctionalGroup<TM extends GeneralTypeMap> = Partial<
  NormalizedFunctionalGroup<TM>
>;

export type GeneralFunctionalGroup = Partial<GeneralNormalizedFunctionalGroup>;
