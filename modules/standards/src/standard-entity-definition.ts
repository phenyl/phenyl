import {
  EntityRestApiDefinition,
  GeneralRequestData,
  Session
} from "@phenyl/interfaces";

/**
 * [deprecated] Standard entity definition.
 * You don't need to extend this almost-doing-nothing class.
 * Instead, implements `EntityRestApiDefinition`.
 */
export class StandardEntityRestApiDefinition
  implements EntityRestApiDefinition {
  async authorize(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<boolean> {
    return false;
  }
}

// alias for backward compatibility.
export const StandardEntityDefinition = StandardEntityRestApiDefinition;
