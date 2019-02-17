import {
  AllSessions,
  AuthCredentials,
  AuthSessions,
  ReqResAuthUser,
  ReqResEntity,
  CustomCommandParams,
  CustomCommandResultValue,
  CustomQueryParams,
  CustomQueryResultValue,
  GeneralAuthCommandMap,
  GeneralCustomCommandMap,
  GeneralCustomQueryMap,
  GeneralReqResEntityMap
} from "./type-map";

import { CustomCommandDefinition } from "./custom-command-definition";
import { CustomQueryDefinition } from "./custom-query-definition";
import { EntityDefinition } from "./entity-definition";
import { InverseTypeOnly } from "./type-only";
import { Key } from "./utils";
import { UserDefinition } from "./user-definition";

export type EntityDefinitions<
  M extends GeneralReqResEntityMap,
  AM extends GeneralAuthCommandMap = GeneralAuthCommandMap
> = {
  [EN in Key<M>]: EntityDefinition<EN, ReqResEntity<M, EN>, AllSessions<AM>>
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
  EM extends GeneralReqResEntityMap
> = {
  [EN in Key<AM>]: UserDefinition<
    EN,
    ReqResAuthUser<AM, EN, EM>,
    AuthCredentials<AM, EN>,
    AuthSessions<AM, EN>,
    AllSessions<AM>
  >
};

export type NormalizedFunctionalGroup<
  EM extends GeneralReqResEntityMap = GeneralReqResEntityMap,
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

/**
 * Get own TypeMap by typeof FunctionalGroup.
 *
 * ### Usage:
 *
 *     const functionalGroup = {
 *       users: { ... },
 *       nonUsers: { ... },
 *       customQueries: { ... },
 *       customCommands: { ... }
 *     }
 *     type MyTypeMap = TypeMapFromFG<typeof functionalGroup>
 *
 * **Please DON'T set type to `functionalGroup`** like the following.
 *
 *     const functionalGroup: GeneralFunctionalGroup = { ... }
 *
 * This will make no useful type inferrence.
 */
export type TypeMapFromFunctionalGroup<FG extends NormalizedFunctionalGroup> = {
  entities: EntityMapFromFGUsers<FG["users"]> &
    EntityMapFromFGNonUsers<FG["nonUsers"]>;
  customQueries: CustomQueryMapFromFGCustomQueries<FG["customQueries"]>;
  customCommands: CustomCommandMapFromFGCustomCommands<FG["customCommands"]>;
  auths: AuthCommandMapFromFGUsers<FG["users"]>;
};

type EntityMapFromFGUsers<FGU extends NormalizedFunctionalGroup["users"]> = {
  [K in keyof FGU]: FGU[K] extends UserDefinition
    ? K extends InverseTypeOnly<FGU[K]["entityName"]>
      ? InverseTypeOnly<FGU[K]["entity"]>
      : InverseTypeOnly<FGU[K]["entity"]> & {
          NAME_IMCOMPATIBLE: [InverseTypeOnly<FGU[K]["entityName"]>, K];
        }
    : never
};

type EntityMapFromFGNonUsers<
  FGNU extends NormalizedFunctionalGroup["nonUsers"]
> = {
  [K in keyof FGNU]: FGNU[K] extends EntityDefinition
    ? K extends InverseTypeOnly<FGNU[K]["entityName"]>
      ? InverseTypeOnly<FGNU[K]["entity"]>
      : InverseTypeOnly<FGNU[K]["entity"]> & {
          NAME_IMCOMPATIBLE: [InverseTypeOnly<FGNU[K]["entityName"]>, K];
        }
    : never
};

type CustomQueryMapFromFGCustomQueries<
  FGQ extends NormalizedFunctionalGroup["customQueries"]
> = {
  [K in keyof FGQ]: FGQ[K] extends CustomQueryDefinition<
    infer N,
    infer P,
    infer R
  >
    ? N extends K
      ? { params: P; result: R }
      : { params: P; result: R; NAME_IMCOMPATIBLE: [N, K] }
    : never
};

type CustomCommandMapFromFGCustomCommands<
  FGC extends NormalizedFunctionalGroup["customCommands"]
> = {
  [K in keyof FGC]: FGC[K] extends CustomCommandDefinition<
    infer N,
    infer P,
    infer R
  >
    ? N extends K
      ? { params: P; result: R }
      : { params: P; result: R; NAME_IMCOMPATIBLE: [N, K] }
    : never
};

type AuthCommandMapFromFGUsers<
  FGU extends NormalizedFunctionalGroup["users"]
> = {
  [K in keyof FGU]: FGU[K] extends UserDefinition<
    infer N,
    any,
    infer C,
    infer O
  >
    ? N extends K
      ? { credentials: C; session: O }
      : { credentials: C; session: O; NAME_IMCOMPATIBLE: [N, K] }
    : never
};
