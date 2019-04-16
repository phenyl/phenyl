export type TypeOnly<T> = { TYPE_ONLY: T };

export type InverseTypeOnly<T> = T extends TypeOnly<infer U> ? U : never;
