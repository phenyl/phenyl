import { CustomQuery } from "./query";
import { CustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { Session } from "./session";

export interface CustomQueryDefinition<
  QN extends string = string,
  QP extends Object = Object,
  QR extends Object = Object,
  SS extends Session<string, Object> = Session<string, Object>
> {
  authorize?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: SS
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: SS
  ) => Promise<GeneralCustomQueryRequestData<QN>>;

  validate?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: SS
  ) => Promise<void>;

  execute(
    query: CustomQuery<QN, QP>,
    session?: SS
  ): Promise<CustomQueryResult<QR>>;
}
