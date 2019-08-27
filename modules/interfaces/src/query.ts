import { FindOperation, SortNotation } from "sp2";

export interface WhereQuery<EN extends string> {
  entityName: EN;
  where: FindOperation;
  skip?: number;
  limit?: number;
  sort?: SortNotation;
}

export interface IdQuery<EN extends string> {
  entityName: EN;
  id: string;
}

export interface IdsQuery<EN extends string> {
  entityName: EN;
  ids: Array<string>;
}

export interface PullQuery<EN extends string> {
  entityName: EN;
  id: string;
  versionId: string | null;
}

export interface CustomQuery<CQ extends string, QP extends Object> {
  name: CQ;
  params: QP;
}

export interface WhereQuery<EN extends string> {
  entityName: EN;
  where: FindOperation;
  skip?: number;
  limit?: number;
  sort?: SortNotation;
}

export type GeneralIdQuery = IdQuery<string>;
export type GeneralIdsQuery = IdsQuery<string>;
export type GeneralPullQuery = PullQuery<string>;
export type GeneralCustomQuery = CustomQuery<string, Object>;
export type GeneralWhereQuery = WhereQuery<string>;
