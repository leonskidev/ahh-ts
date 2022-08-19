import { Ok, R, Result } from "../result/mod.ts";

/** Represents an {@linkcode Option} that does not exist. */
export type None = Readonly<{ none: undefined }>;
/** Represents an {@linkcode Option} that does exist. */
export type Some<T> = Readonly<{ some: T }>;
/**
 * Represents an optional value that either exists ({@linkcode Some}) or does
 * not exist ({@linkcode None}).
 */
export type Option<T> = None | Some<T>;

export const None: Option<never> = Object.defineProperties(
  { none: undefined },
  {
    toString: { value: (): string => "None" },
    toJSON: { value: () => ({ none: null }) },
  },
);

export function Some<T>(v: T): Option<T> {
  return Object.defineProperties({ some: v }, {
    toString: { value: (): string => `Some(${v})` },
  });
}

/** Functionality for {@linkcode Option}. */
export const O = {
  /** Returns whether an {@linkcode Option} is a {@linkcode Some}. */
  isSome: <T>(o: Option<T>): o is Some<T> => Object.hasOwn(o, "some"),

  /** Returns whether an {@linkcode Option} is a {@linkcode None}. */
  isNone: <T>(o: Option<T>): o is None => Object.hasOwn(o, "none"),

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * Throws if the {@linkcode Option} is a {@linkcode None} with the provided
   * `message`.
   */
  expect: <T>(
    o: Option<T>,
    message: string,
  ): typeof o extends None ? never : T => {
    if (O.isSome(o)) return o.some;
    throw Error(message);
  },

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * Throws if the {@linkcode Option} is a {@linkcode None}.
   */
  unwrap: <T>(o: Option<T>): typeof o extends None ? never : T =>
    O.expect(o, "called `unwrap()` on a `None` value"),

  /**
   * Returns the contained {@linkcode Some} value or the provided `default`.
   */
  unwrapOr: <T>(o: Option<T>, default_: T): T =>
    O.isSome(o) ? o.some : default_,

  /**
   * Maps the contained {@linkcode Some} value with `f`, or returns
   * {@linkcode None}.
   */
  map: <T, U>(o: Option<T>, f: (_: T) => U): Option<U> =>
    O.isSome(o) ? Some(f(o.some)) : o,

  /**
   * Returns whether the contained {@linkcode Some} value strictly equals
   * `cmp`.
   */
  contains: <T>(o: Option<T>, cmp: T): boolean =>
    O.isSome(o) ? o.some === cmp : false,

  /**
   * Returns the contained {@linkcode Option} value of a {@linkcode Some}, or
   * returns {@linkcode None}.
   */
  flatten: <T>(o: Option<Option<T>>): Option<T> => O.isSome(o) ? o.some : o,

  /**
   * Transposes an {@linkcode Option} of a {@linkcode Result} into a
   * {@linkcode Result} of an {@linkcode Option}.
   */
  transpose: <T, E>(o: Option<Result<T, E>>): Result<Option<T>, E> =>
    O.isSome(o) ? (R.isOk(o.some) ? Ok(Some(o.some.ok)) : o.some) : Ok(o),
};
