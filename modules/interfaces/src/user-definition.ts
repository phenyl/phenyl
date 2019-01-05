import { Broader, Narrow } from "./type-map";

import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { LoginCommand } from "./command";
import { PreSession } from "./session";
import { Session } from "./session";

export type AuthenticationResult<
  EN extends string,
  E extends Entity,
  S extends Object = Object
> = {
  preSession: PreSession<EN, S>;
  user: E | null;
  versionId: string | null;
};

export interface AuthDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  C extends Object = Object,
  S extends Object = Object
> {
  authenticate(
    loginCommand: LoginCommand<EN, C>,
    session?: Session<EN, S>
  ): Promise<AuthenticationResult<EN, Narrow<Ebroader>, S>>;
}

export interface UserDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  C extends Object = Object,
  S extends Object = Object
> extends AuthDefinition<EN, Ebroader, C, S>, EntityDefinition<EN, Ebroader> {}
