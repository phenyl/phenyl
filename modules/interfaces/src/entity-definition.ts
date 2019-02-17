import { ReqRes } from "./type-map";
import { EntityRequestData, GeneralEntityRequestData } from "./request-data";

import { Entity } from "./entity";
import { EntityResponseData } from "./response-data";
import { Nullable } from "./utils";
import { Session } from "./session";
import { TypeOnly } from "./type-only";

export interface EntityDefinition<
  EN extends string = string,
  Ereqres extends ReqRes<Entity> = ReqRes<Entity>,
  SS extends Session = Session
> {
  entityName: TypeOnly<EN>;
  entity: TypeOnly<Ereqres>;
  authorize?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<boolean>;

  normalize?: (
    reqData: EntityRequestData<EN, Ereqres['request']>,
    session?: Nullable<SS>
  ) => Promise<EntityRequestData<EN, Ereqres['response']>>;

  validate?: (
    reqData: GeneralEntityRequestData<EN>,
    session?: Nullable<SS>
  ) => Promise<void>;

  wrapExecution?: (
    reqData: EntityRequestData<EN, Ereqres['response']>,
    session: Nullable<SS>,
    executeFn: (
      reqData: EntityRequestData<EN, Ereqres['response']>,
      session?: Nullable<SS>
    ) => Promise<EntityResponseData<Ereqres['response']>>
  ) => Promise<EntityResponseData<Ereqres['response']>>;
}
