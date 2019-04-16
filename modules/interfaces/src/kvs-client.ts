import { Entity, PreEntity } from "./entity";

export interface KvsClient<T extends Entity> {
  get(id: string | null): Promise<T | null>;
  create(value: PreEntity<T>): Promise<T>;
  set(value: T): Promise<T>;
  delete(id: string | null): Promise<boolean>;
}
