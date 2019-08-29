import {
  EntityDefinition,
  GeneralRequestData,
  Session
} from "@phenyl/interfaces";

/**
 * [deprecated] Standard entity definition.
 * You don't need to extend this almost-doing-nothing class.
 * Instead, implements `EntityDefinition`.
 */
export class StandardEntityDefinition implements EntityDefinition {
  async authorize(
    reqData: GeneralRequestData,
    session?: Session
  ): Promise<boolean> {
    return false;
  }
}
