/**
 * Better alternative to "keyof" in TypeScript.
 * Key of T and it's all strings.
 */
export type Key<T> = Extract<keyof T, string>;

export type Diff<T, U> = T extends U ? never : T;

export type NonNullable<T> = Diff<T, null | undefined>;

export type Nullable<T> = T | null | undefined;
