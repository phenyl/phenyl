// Thanks to https://qiita.com/kgtkr/items/2a8290d1b1314063a524

type And<A extends boolean, B extends boolean> = A extends true
  ? (B extends true ? true : false)
  : false;

type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : (B extends true ? true : false);

type Not<X extends boolean> = X extends true ? false : true;

export type IsExtends<A, B> = A extends B ? true : false;
type TypeEqNotUnion<A, B> = And<IsExtends<A, B>, IsExtends<B, A>>;
type ComparableType<T> = [T];
type TypeEqNotAny<A, B> = TypeEqNotUnion<ComparableType<A>, ComparableType<B>>;
type IsAny<T> = And<TypeEqNotAny<T, 1>, TypeEqNotAny<T, 2>>;
type IsNotAny<T> = Not<IsAny<T>>;

export type TypeEq<A, B> = Or<
  And<IsAny<A>, IsAny<B>>,
  And<And<IsNotAny<A>, IsNotAny<B>>, TypeEqNotAny<A, B>>
>;

export function assertType<_T extends true>() {}
export function assertNotType<_T extends false>() {}
