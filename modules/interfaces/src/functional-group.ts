import {
  GeneralAuthCommandMap,
  GeneralCustomMap,
  GeneralEntityMap
} from "./type-map";

import { CustomCommandDefinitions } from "./custom-command-definition";
import { CustomQueryDefinitions } from "./custom-query-definition";
import { EntityDefinitions } from "./entity-definition";
import { UserDefinitions } from "./user-definition";

export type NormalizedFunctionalGroup = {
  users: UserDefinitions<GeneralAuthCommandMap, GeneralEntityMap>;
  nonUsers: EntityDefinitions<GeneralEntityMap>;
  customQueries: CustomQueryDefinitions<GeneralCustomMap>;
  customCommands: CustomCommandDefinitions<GeneralCustomMap>;
};

export type FunctionalGroup = Partial<NormalizedFunctionalGroup>;
