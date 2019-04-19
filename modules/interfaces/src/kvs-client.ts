import { Entity, PreEntity } from "./entity";

export interface KvsClient<T extends Entity> {
  get(id?: string): Promise<T | undefined>;
  create(value: PreEntity<T>): Promise<T>;
  set(value: T): Promise<T>;
  delete(id?: string): Promise<boolean>;
}
