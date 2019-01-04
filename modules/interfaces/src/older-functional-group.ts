import {
  AuthCredentials,
  AuthOptions,
  Broader,
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
import { AuthDefinition, UserDefinition } from "./user-definition";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { Key } from "./key";

interface OlderEntityDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity]
> {
  authorization?: EntityDefinition<EN, Ebroader>["authorize"];
  normalization?: EntityDefinition<EN, Ebroader>["normalize"];
  validation?: EntityDefinition<EN, Ebroader>["validate"];
  wrapExecution?: EntityDefinition<EN, Ebroader>["wrapExecution"];
}

type OlderEntityDefinitions<M extends GeneralEntityMap> = {
  [EN in Key<M>]:
    | OlderEntityDefinition<EN, BroaderEntity<M, EN>>
    | EntityDefinition<EN, BroaderEntity<M, EN>>
};

interface OlderCustomQueryDefinition<
  QN extends string = string,
  QP extends Object = Object,
  QR extends Object = Object
> {
  authorization?: CustomQueryDefinition<QN, QP, QR>["authorize"];
  normalization?: CustomQueryDefinition<QN, QP, QR>["normalize"];
  validation?: CustomQueryDefinition<QN, QP, QR>["validate"];
  execution: CustomQueryDefinition<QN, QP, QR>["execute"];
}

type OlderCustomQueryDefinitions<QM extends GeneralCustomQueryMap> = {
  [QN in Key<QM>]:
    | OlderCustomQueryDefinition<
        QN,
        CustomQueryParams<QM, QN>,
        CustomQueryResultValue<QM, QN>
      >
    | CustomQueryDefinition<
        QN,
        CustomQueryParams<QM, QN>,
        CustomQueryResultValue<QM, QN>
      >
};

interface OlderCustomCommandDefinition<
  CN extends string = string,
  CP extends Object = Object,
  CR extends Object = Object
> {
  authorization?: CustomCommandDefinition<CN, CP, CR>["authorize"];
  normalization?: CustomCommandDefinition<CN, CP, CR>["normalize"];
  validation?: CustomCommandDefinition<CN, CP, CR>["validate"];
  execution: CustomCommandDefinition<CN, CP, CR>["execute"];
}

type OlderCustomCommandDefinitions<CM extends GeneralCustomCommandMap> = {
  [CN in Key<CM>]:
    | OlderCustomCommandDefinition<
        CN,
        CustomCommandParams<CM, CN>,
        CustomCommandResultValue<CM, CN>
      >
    | CustomCommandDefinition<
        CN,
        CustomCommandParams<CM, CN>,
        CustomCommandResultValue<CM, CN>
      >
};

interface OlderUserDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  C extends Object = Object,
  O extends Object = Object
> extends OlderEntityDefinition<EN, Ebroader> {
  authentication: AuthDefinition<EN, Ebroader, C, O>["authenticate"];
}

type OlderUserDefinitions<
  AM extends GeneralAuthCommandMap,
  EM extends GeneralEntityMap
> = {
  [EN in Key<AM>]:
    | OlderUserDefinition<
        EN,
        BroaderAuthUser<AM, EN, EM>,
        AuthCredentials<AM, EN>,
        AuthOptions<AM, EN>
      >
    | UserDefinition<
        EN,
        BroaderAuthUser<AM, EN, EM>,
        AuthCredentials<AM, EN>,
        AuthOptions<AM, EN>
      >
};

export type OlderFunctionalGroup = Partial<{
  users: OlderUserDefinitions<GeneralAuthCommandMap, GeneralEntityMap>;
  nonUsers: OlderEntityDefinitions<GeneralEntityMap>;
  customQueries: OlderCustomQueryDefinitions<GeneralCustomMap>;
  customCommands: OlderCustomCommandDefinitions<GeneralCustomMap>;
}>;
