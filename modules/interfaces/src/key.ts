/**
 * Better alternative to "keyof" in TypeScript.
 * Key of T and it's all strings.
 */
export type Key<T> = Extract<keyof T, string>;
