/**
 * Object containing id.
 */
export type Entity = { id: string };

/**
 * Object with or without id.
 * If "id" property exists, it must be a string.
 */
export type ProEntity = { id?: string; [key: string]: any };

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * T(Entity) with or without id.
 * If "id" property exists, it must be a string.
 */
export type PreEntity<T extends Entity> = T | (Omit<T, "id"> & { id?: string });

/**
 * Pair of entity and its entityName.
 */
export type EntityInfo<N extends string, T extends Entity> = {
  entityName: N;
  entity: T;
  versionId: string;
};

/**
 * Pair of entities and its entityName.
 */
export type EntitiesInfo<N extends string, T extends Entity> = {
  entityName: N;
  entities: T[];
  versionsById: { [entityId: string]: string };
};

export type GeneralT = {
  [key: string]: string;
};

type CondName<T extends GeneralT, K extends string> = K extends keyof T
  ? T[K]
  : "foo";

interface FooHandler<T extends GeneralT> {
  handleFoo<K extends string>(key: K, name: string): void;
}

export type GeneralFooHandler = FooHandler<GeneralT>;

export class RealFooHandler<T extends GeneralT> implements GeneralFooHandler {
  handleFoo<K extends string>(key: K, name: CondName<T, K>): void {
    return;
  }
}
