import {
  AllSessions,
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
  GeneralCustomQueryMap,
  GeneralEntityMap
} from "./type-map";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityDefinition } from "./entity-definition";
import { Key } from "./key";
import { UserDefinition } from "./user-definition";

export type EntityDefinitions<
  M extends GeneralEntityMap,
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> = {
  [EN in Key<M>]: EntityDefinition<EN, BroaderEntity<M, EN>, AllSessions<AM>>
};

export type CustomQueryDefinitions<
  QM extends GeneralCustomQueryMap,
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> = {
  [QN in Key<QM>]: CustomQueryDefinition<
    QN,
    CustomQueryParams<QM, QN>,
    CustomQueryResultValue<QM, QN>,
    AllSessions<AM>
  >
};

export type CustomCommandDefinitions<
  CM extends GeneralCustomCommandMap,
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> = {
  [CN in Key<CM>]: CustomCommandDefinition<
    CN,
    CustomCommandParams<CM, CN>,
    CustomCommandResultValue<CM, CN>,
    AllSessions<AM>
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
    AuthSessions<AM, EN>,
    AllSessions<AM>
  >
};

export type NormalizedFunctionalGroup<
  EM extends GeneralEntityMap = GeneralEntityMap,
  QM extends GeneralCustomQueryMap = GeneralCustomQueryMap,
  CM extends GeneralCustomCommandMap = GeneralCustomCommandMap,
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> = {
  users: UserDefinitions<AM, EM>;
  nonUsers: EntityDefinitions<EM, AM>;
  customQueries: CustomQueryDefinitions<QM, AM>;
  customCommands: CustomCommandDefinitions<CM, AM>;
};

export type FunctionalGroup = Partial<NormalizedFunctionalGroup>;
