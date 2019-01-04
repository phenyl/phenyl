import { CustomQuery } from "./query";
import { CustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { Session } from "./session";

export interface CustomQueryDefinition<
  QN extends string = string,
  QP extends Object = Object,
  QR extends Object = Object
> {
  authorize?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Session
  ) => Promise<boolean>;

  normalize?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Session
  ) => Promise<GeneralCustomQueryRequestData<QN>>;

  validate?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Session
  ) => Promise<void>;

  execute(
    query: CustomQuery<QN, QP>,
    session?: Session
  ): Promise<CustomQueryResult<QR>>;
}
