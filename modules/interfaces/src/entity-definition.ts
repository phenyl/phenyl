import { EntityRequestData, GeneralEntityRequestData } from "./request-data";

import { Entity } from "./entity";
import { GeneralEntityMap } from "./type-map";
import { Key } from "./key";
import { ResponseData } from "./response-data";
import { Session } from "./session";

export interface EntityDefinition<
  EN extends string = string,
  E extends Entity = Entity
> {
  authorization?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Session
  ) => Promise<boolean>;

  normalization?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Session
  ) => Promise<GeneralEntityRequestData<EN>>;

  validation?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Session
  ) => Promise<void>;

  wrapExecution?: (
    reqData: EntityRequestData<EN, E>,
    session: Session | null,
    execution: (
      reqData: EntityRequestData<EN, E>,
      session?: Session
    ) => Promise<ResponseData>
  ) => Promise<ResponseData>;
}

export type EntityDefinitions<M extends GeneralEntityMap> = {
  [EN in Key<M>]: EntityDefinition<EN, M[EN]>
};
