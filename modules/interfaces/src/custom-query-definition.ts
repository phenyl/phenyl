import { CustomQuery } from "./query";
import { CustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { Nullable } from "./utils";
import { Session } from "./session";

export interface CustomQueryDefinition<
  QN extends string = string,
  QP extends Object = Object,
  QR extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> {
  authorize?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Nullable<SS>
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Nullable<SS>
  ) => Promise<GeneralCustomQueryRequestData<QN>>;

  validate?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Nullable<SS>
  ) => Promise<void>;

  execute(
    query: CustomQuery<QN, QP>,
    session?: Nullable<SS>
  ): Promise<CustomQueryResult<QR>>;
}
