import { PreEntity } from "./entity";

export type Session = {
  id: string;
  expiredAt: string;
  entityName: string;
  userId: string;
};

export type PreSession = PreEntity<Session>;
