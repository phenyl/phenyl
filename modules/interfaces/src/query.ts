import { FindOperation, SortNotation } from "sp2";
import { ExtraParams } from "./extra";

export interface WhereQuery<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  where: FindOperation;
  skip?: number;
  limit?: number;
  sort?: SortNotation;
  extra?: EP;
}

export interface IdQuery<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  id: string;
  extra?: EP;
}

export interface IdsQuery<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  ids: Array<string>;
  extra?: EP;
}

export interface PullQuery<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  id: string;
  versionId: string | null;
  extra?: EP;
}

export interface CustomQuery<
  CQ extends string,
  QP extends Object,
  EP extends ExtraParams = ExtraParams
> {
  name: CQ;
  params: QP;
  extra?: EP;
}

export interface WhereQuery<
  EN extends string,
  EP extends ExtraParams = ExtraParams
> {
  entityName: EN;
  where: FindOperation;
  skip?: number;
  limit?: number;
  sort?: SortNotation;
  extra?: EP;
}

export type GeneralIdQuery = IdQuery<string>;
export type GeneralIdsQuery = IdsQuery<string>;
export type GeneralPullQuery = PullQuery<string>;
export type GeneralCustomQuery = CustomQuery<string, Object>;
export type GeneralWhereQuery = WhereQuery<string>;
