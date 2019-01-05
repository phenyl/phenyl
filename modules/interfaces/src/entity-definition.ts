import { Broad, Broader, Narrow } from "./type-map";
import { EntityRequestData, GeneralEntityRequestData } from "./request-data";

import { Entity } from "./entity";
import { ResponseData } from "./response-data";
import { Session } from "./session";
import { TypeOnly } from "./type-only";

export type TypeProp<T> = TypeOnly<
  T extends string ? T : T extends [any, any] ? T : [T, T]
>;

export interface EntityDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  SS extends Session<string, Object> = Session<string, Object>
> {
  entityName: TypeProp<EN>;
  entity: TypeProp<Ebroader>;
  authorize?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: SS
  ) => Promise<boolean>;

  normalize?: (
    reqData: EntityRequestData<EN, Broad<Ebroader>>,
    session?: SS
  ) => Promise<EntityRequestData<EN, Narrow<Ebroader>>>;

  validate?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: SS
  ) => Promise<void>;

  wrapExecution?: (
    reqData: EntityRequestData<EN, Narrow<Ebroader>>,
    session: SS | null | undefined,
    executeFn: (
      reqData: EntityRequestData<EN, Narrow<Ebroader>>,
      session?: SS
    ) => Promise<ResponseData>
  ) => Promise<ResponseData>;
}
