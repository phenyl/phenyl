import {
  AuthCredentials,
  AuthOptions,
  AuthUser,
  GeneralAuthCommandMap,
  GeneralEntityMap
} from "./type-map";

import { Entity } from "./entity";
import { EntityDefinition } from "./entity-definition";
import { Key } from "./key";
import { LoginCommand } from "./command";
import { PreSession } from "./session";
import { Session } from "./session";

export type AuthenticationResult<E extends Entity> = {
  ok: 1;
  preSession: PreSession;
  user: E | null;
  versionId: string | null;
};

export interface AuthDefinition<
  EN extends string = string,
  E extends Entity = Entity,
  C extends Object = Object,
  O extends Object = Object
> {
  authentication(
    loginCommand: LoginCommand<EN, C, O>,
    session?: Session
  ): Promise<AuthenticationResult<E>>;
}

export interface UserDefinition<
  EN extends string = string,
  E extends Entity = Entity,
  C extends Object = Object,
  O extends Object = Object
> extends AuthDefinition<EN, E, C, O>, EntityDefinition<EN, E> {}

export type UserDefinitions<
  AM extends GeneralAuthCommandMap,
  EM extends GeneralEntityMap
> = {
  [EN in Key<AM>]: UserDefinition<
    EN,
    AuthUser<AM, EN, EM>,
    AuthCredentials<AM, EN>,
    AuthOptions<AM, EN>
  >
};
