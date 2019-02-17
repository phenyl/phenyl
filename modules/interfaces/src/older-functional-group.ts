import {
  AuthCredentials,
  AuthSessions,
  ReqRes,
  ReqResAuthUser,
  ReqResEntity,
  CustomCommandParams,
  CustomCommandResultValue,
  CustomQueryParams,
  CustomQueryResultValue,
  GeneralAuthCommandMap,
  GeneralCustomCommandMap,
  GeneralCustomMap,
  GeneralCustomQueryMap,
  GeneralReqResEntityMap
} from "./type-map";
import { AuthDefinition, UserDefinition } from "./user-definition";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { Key } from "./utils";

export interface OlderEntityDefinition<
  EN extends string = string,
  Ebroader extends ReqRes<Entity> = ReqRes<Entity>
> {
  authorization?: EntityDefinition<EN, Ebroader>["authorize"];
  normalization?: EntityDefinition<EN, Ebroader>["normalize"];
  validation?: EntityDefinition<EN, Ebroader>["validate"];
  wrapExecution?: EntityDefinition<EN, Ebroader>["wrapExecution"];
}

type OlderEntityDefinitions<M extends GeneralReqResEntityMap> = {
  [EN in Key<M>]:
    | OlderEntityDefinition<EN, ReqResEntity<M, EN>>
    | EntityDefinition<EN, ReqResEntity<M, EN>>
};

export interface OlderCustomQueryDefinition<
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

export interface OlderCustomCommandDefinition<
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

export interface OlderUserDefinition<
  EN extends string = string,
  Ebroader extends ReqRes<Entity> = ReqRes<Entity>,
  C extends Object = Object,
  S extends Object = Object
> extends OlderEntityDefinition<EN, Ebroader> {
  authentication: AuthDefinition<EN, Ebroader, C, S>["authenticate"];
}

type OlderUserDefinitions<
  AM extends GeneralAuthCommandMap,
  EM extends GeneralReqResEntityMap
> = {
  [EN in Key<AM>]:
    | OlderUserDefinition<
        EN,
        ReqResAuthUser<AM, EN, EM>,
        AuthCredentials<AM, EN>,
        AuthSessions<AM, EN>
      >
    | UserDefinition<
        EN,
        ReqResAuthUser<AM, EN, EM>,
        AuthCredentials<AM, EN>,
        AuthSessions<AM, EN>
      >
};

export type OlderFunctionalGroup = Partial<{
  users: OlderUserDefinitions<GeneralAuthCommandMap, GeneralReqResEntityMap>;
  nonUsers: OlderEntityDefinitions<GeneralReqResEntityMap>;
  customQueries: OlderCustomQueryDefinitions<GeneralCustomMap>;
  customCommands: OlderCustomCommandDefinitions<GeneralCustomMap>;
}>;
