import {
  CustomQueryParams,
  CustomQueryResultValue,
  GeneralCustomQueryMap
} from "./type-map";

import { CustomQuery } from "./query";
import { CustomQueryResult } from "./query-result";
import { GeneralCustomQueryRequestData } from "./request-data";
import { Key } from "./key";
import { Session } from "./session";

export interface CustomQueryDefinition<
  QN extends string,
  QP extends Object,
  QR extends Object
> {
  authorization(
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Session
  ): Promise<boolean>;

  normalization?: (
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Session
  ) => Promise<GeneralCustomQueryRequestData<QN>>;

  validation(
    reqData: GeneralCustomQueryRequestData<QN>,
    session?: Session
  ): Promise<void>;

  execution(
    query: CustomQuery<QN, QP>,
    session?: Session
  ): Promise<CustomQueryResult<QR>>;
}

export type CustomQueryDefinitions<QM extends GeneralCustomQueryMap> = {
  [QN in Key<QM>]: CustomQueryDefinition<
    QN,
    CustomQueryParams<QM, QN>,
    CustomQueryResultValue<QM, QN>
  >
};
