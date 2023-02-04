/** An unknown placholder type. */
export type _<N extends number = 0> = N;

/** Recursively replaces {@linkcode _}s in `T` with their concrete type in `S`. */
export type $<T, S extends unknown[]> = T extends _<infer N> ? S[N]
  : T extends [infer A, ...infer Z] ? [$<A, S>, ...$<Z, S>]
  : T extends Record<PropertyKey, unknown> ? { [K in keyof T]: $<T[K], S> }
  : T extends (..._: infer A) => infer R ? (..._: $<A, S>) => $<R, S>
  : T;
