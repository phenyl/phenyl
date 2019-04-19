import { FindOperation, SortNotation } from "@sp2/format";

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

export interface CustomQuery<
  CQ extends string = string,
  QP extends Object = Object
> {
  name: CQ;
  params: QP;
}
