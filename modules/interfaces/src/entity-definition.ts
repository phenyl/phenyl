import { Broad, Broader, Narrow } from "./type-map";
import { EntityRequestData, GeneralEntityRequestData } from "./request-data";

import { Entity } from "./entity";
import { EntityResponseData } from "./response-data";
import { Nullable } from "./utils";
import { Session } from "./session";
import { TypeOnly } from "./type-only";

export type TypeProp<T> = TypeOnly<
  T extends string ? T : T extends [any, any] ? T : [T, T]
>;

export interface EntityDefinition<
  EN extends string = string,
  Ebroader extends Broader<Entity, Entity> = [Entity, Entity],
  SS extends Session = Session
> {
  entityName: TypeProp<EN>;
  entity: TypeProp<Ebroader>;
  authorize?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<boolean>;

  normalize?: (
    reqData: EntityRequestData<EN, Broad<Ebroader>>,
    session?: Nullable<SS>
  ) => Promise<EntityRequestData<EN, Narrow<Ebroader>>>;

  validate?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<void>;

  wrapExecution?: (
    reqData: EntityRequestData<EN, Narrow<Ebroader>>,
    session: Nullable<SS>,
    executeFn: (
      reqData: EntityRequestData<EN, Narrow<Ebroader>>,
      session?: Nullable<SS>
    ) => Promise<EntityResponseData<Narrow<Ebroader>>>
  ) => Promise<EntityResponseData<Narrow<Ebroader>>>;
}
