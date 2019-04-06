import { Entity, KvsClient, PreEntity } from "@phenyl/interfaces";

import { randomString } from "@phenyl/utils";
import { updateAndRestore } from "sp2";

interface KeyValuePool<T> {
  [id: string]: T;
}

type MemoryKvsClientParams<T> = {
  pool?: KeyValuePool<T>;
};

export default class MemoryKvsClient<T extends Entity> implements KvsClient<T> {
  pool: KeyValuePool<T>;

  constructor(params: MemoryKvsClientParams<T> = {}) {
    // $FlowIssue(empty-object-is-object-as-a-map)
    this.pool = params.pool || {};
  }

  async get(id?: string | null): Promise<T | null> {
    if (id == null) {
      return null;
    }
    return this.pool[id];
  }

  async create(value: PreEntity<T>): Promise<T> {
    if (value.id != null) {
      if (this.pool[value.id] != null) {
        throw new Error(
          `The given id "${value.id}" already exists in memory pool.`
        );
      }
      // @ts-ignore value.id exists
      return this.set(value);
    }

    const newValue = updateAndRestore(value, { id: randomString() });
    // @ts-ignore value.id exists
    return this.set(newValue);
  }

  async set(value: T): Promise<T> {
    this.pool = updateAndRestore(this.pool, { $set: { [value.id]: value } });
    return value;
  }

  async delete(id?: string | null): Promise<boolean> {
    if (id == null || this.pool[id] == null) {
      return false;
    }
    this.pool = updateAndRestore(this.pool, { $unset: { [id]: "" } });
    return true;
  }
}
