import {
  EntityDefinition,
} from "@phenyl/interfaces";

/**
 * [deprecated] Standard entity definition.
 * You don't need to extend this almost-doing-nothing class.
 * Instead, implements `EntityDefinition`.
 */
export class StandardEntityDefinition implements EntityDefinition {
  async authorize(
  ): Promise<boolean> {
    return false;
  }
}
