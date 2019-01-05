import {
  AuthCredentials,
  AuthSessions,
  BroaderAuthUser,
  BroaderEntity,
  CustomCommandParams,
  CustomCommandResultValue,
  CustomQueryParams,
  CustomQueryResultValue,
  GeneralAuthCommandMap,
  GeneralCustomCommandMap,
  GeneralCustomMap,
  GeneralCustomQueryMap,
  GeneralEntityMap
} from "./type-map";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityDefinition } from "./entity-definition";
import { Key } from "./key";
import { UserDefinition } from "./user-definition";

export type EntityDefinitions<M extends GeneralEntityMap> = {
  [EN in Key<M>]: EntityDefinition<EN, BroaderEntity<M, EN>>
};

export type CustomQueryDefinitions<QM extends GeneralCustomQueryMap> = {
  [QN in Key<QM>]: CustomQueryDefinition<
    QN,
    CustomQueryParams<QM, QN>,
    CustomQueryResultValue<QM, QN>
  >
};

export type CustomCommandDefinitions<CM extends GeneralCustomCommandMap> = {
  [CN in Key<CM>]: CustomCommandDefinition<
    CN,
    CustomCommandParams<CM, CN>,
    CustomCommandResultValue<CM, CN>
  >
};

export type UserDefinitions<
  AM extends GeneralAuthCommandMap,
  EM extends GeneralEntityMap
> = {
  [EN in Key<AM>]: UserDefinition<
    EN,
    BroaderAuthUser<AM, EN, EM>,
    AuthCredentials<AM, EN>,
    AuthSessions<AM, EN>
  >
};

export type NormalizedFunctionalGroup = {
  users: UserDefinitions<GeneralAuthCommandMap, GeneralEntityMap>;
  nonUsers: EntityDefinitions<GeneralEntityMap>;
  customQueries: CustomQueryDefinitions<GeneralCustomMap>;
  customCommands: CustomCommandDefinitions<GeneralCustomMap>;
};

export type FunctionalGroup = Partial<NormalizedFunctionalGroup>;
