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
