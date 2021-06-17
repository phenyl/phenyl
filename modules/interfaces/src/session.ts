import { PreEntity } from "./entity";

export type Session<
  EN extends string = string,
  S extends Object | undefined = Object
> = {
  id: string;
  expiredAt: string;
  entityName: EN;
  userId: string;
} & S;

export type PreSession<
  EN extends string = string,
  S extends Object | undefined = Object
> = PreEntity<Session<EN, S>>;
