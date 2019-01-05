import { PreEntity } from "./entity";

export type Session<EN extends string = string, Tsession = {}> = {
  id: string;
  expiredAt: string;
  entityName: EN;
  userId: string;
} & Tsession;

export type PreSession<EN extends string = string, Tsession = {}> = PreEntity<
  Session<EN, Tsession>
>;
