import {
  Broad,
  Broader,
  BroaderEntity,
  GeneralEntityMap,
  Narrow
} from "./type-map";
import { EntityRequestData, GeneralEntityRequestData } from "./request-data";

import { Entity } from "./entity";
import { Key } from "./key";
import { ResponseData } from "./response-data";
import { Session } from "./session";

export interface EntityDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity]
> {
  authorization?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Session
  ) => Promise<boolean>;

  normalization?: (
    reqData: EntityRequestData<EN, Broad<Ebroader>>,
    session?: Session
  ) => Promise<EntityRequestData<EN, Broad<Ebroader>>>;

  validation?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Session
  ) => Promise<void>;

  wrapExecution?: (
    reqData: EntityRequestData<EN, Narrow<Ebroader>>,
    session: Session | null,
    execution: (
      reqData: EntityRequestData<EN, Narrow<Ebroader>>,
      session?: Session
    ) => Promise<ResponseData>
  ) => Promise<ResponseData>;
}

export type EntityDefinitions<M extends GeneralEntityMap> = {
  [EN in Key<M>]: EntityDefinition<EN, BroaderEntity<M, EN>>
};
