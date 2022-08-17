import { None, O, Option, SOME, Some } from "../option/mod.ts";

/**
 * Symbol for {@linkcode Err}, the same as `Symbol.for("err")`.
 *
 * Useful for internals and testing.
 */
export const ERR = Symbol.for("err");
/**
 * Symbol for {@linkcode Ok}, the same as `Symbol.for("ok")`.
 *
 * Useful for internals and testing.
 */
export const OK = Symbol.for("ok");

/** Represents a {@linkcode Result} that was erroneous. */
export type Err<E> = Readonly<{ [ERR]: E }>;
/** Represents a {@linkcode Result} that was successful. */
export type Ok<T> = Readonly<{ [OK]: T }>;
/**
 * Represents a value that is either successful ({@linkcode Ok}) or erroneous
 * ({@linkcode Err}).
 */
export type Result<T, E> = Err<E> | Ok<T>;

export function Err<T, E>(v: E): Result<T, E> {
  return { [ERR]: v };
}

export function Ok<T, E>(v: T): Result<T, E> {
  return { [OK]: v };
}

export const R = {
  /** Returns whether a {@linkcode Result} is an {@linkcode Ok}. */
  isOk: <T, E>(r: Result<T, E>): r is Ok<T> => Object.hasOwn(r, OK),

  /** Returns whether a {@linkcode Result} is an {@linkcode Err}. */
  isErr: <T, E>(r: Result<T, E>): r is Err<E> => Object.hasOwn(r, ERR),

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Err} with the provided
   * `message`.
   */
  expect: <T, E>(
    r: Result<T, E>,
    message: string,
  ): (typeof r) extends Err<E> ? never : T => {
    if (R.isOk(r)) return r[OK];
    throw Error(message);
  },

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Ok} with the provided
   * `message`.
   */
  expectErr: <T, E>(
    r: Result<T, E>,
    message: string,
  ): (typeof r) extends Ok<T> ? never : E => {
    if (R.isErr(r)) return r[ERR];
    throw Error(`${message}: ${r[OK]}`);
  },

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Err}.
   */
  unwrap: <T, E>(r: Result<T, E>): (typeof r) extends Err<E> ? never : T =>
    R.expect(
      r,
      `called \`unwrap()\` on an \`Err\` value: ${(r as Err<E>)[ERR]}`,
    ),

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Ok}.
   */
  unwrapErr: <T, E>(r: Result<T, E>): (typeof r) extends Ok<T> ? never : E =>
    R.expectErr(
      r,
      `called \`unwrapErr()\` on an \`Ok\` value: ${(r as Ok<T>)[OK]}`,
    ),

  /**
   * Returns the contained {@linkcode Ok} value or the provided `default`.
   */
  unwrapOr: <T, E>(r: Result<T, E>, default_: T): T =>
    R.isOk(r) ? r[OK] : default_,

  /**
   * Returns the contained {@linkcode Err} value or the provided `default`.
   */
  unwrapErrOr: <T, E>(r: Result<T, E>, default_: E): E =>
    R.isErr(r) ? r[ERR] : default_,

  /**
   * Maps the contained {@linkcode Ok} value with `f`, or returns
   * {@linkcode Err}.
   */
  map: <T, E, U>(r: Result<T, E>, f: (_: T) => U): Result<U, E> =>
    R.isOk(r) ? Ok(f(r[OK])) : r,

  /**
   * Maps the contained {@linkcode Err} value with `f`, or returns
   * {@linkcode Ok}.
   */
  mapErr: <T, E, F>(r: Result<T, E>, f: (_: E) => F): Result<T, F> =>
    R.isErr(r) ? Err(f(r[ERR])) : r,

  /**
   * Returns whether the contained {@linkcode Ok} value strictly equals `cmp`.
   */
  contains: <T, E>(r: Result<T, E>, cmp: T): boolean =>
    R.isOk(r) ? r[OK] === cmp : false,

  /**
   * Returns whether the contained {@linkcode Err} value strictly equals `cmp`.
   */
  containsErr: <T, E>(r: Result<T, E>, cmp: E): boolean =>
    R.isErr(r) ? r[ERR] === cmp : false,

  /**
   * Returns the contained {@linkcode Result} value of an {@linkcode Ok}, or
   * returns {@linkcode Err}.
   */
  flatten: <T, E>(r: Result<Result<T, E>, E>): Result<T, E> =>
    R.isOk(r) ? r[OK] : r,

  /** Returns the contained {@linkcode Ok} value, but never throws. */
  intoOk: <T>(r: Result<T, never>): T => (r as Ok<T>)[OK],

  /** Returns the contained {@linkcode Err} value, but never throws. */
  intoErr: <E>(r: Result<never, E>): E => (r as Err<E>)[ERR],

  /** Converts an {@linkcode Ok} into an {@linkcode Option}. */
  ok: <T, E>(r: Result<T, E>): Option<T> => R.isOk(r) ? Some(r[OK]) : None,

  /** Converts an {@linkcode Err} into an {@linkcode Option}. */
  err: <T, E>(r: Result<T, E>): Option<E> => R.isErr(r) ? Some(r[ERR]) : None,

  /**
   * Transposes a {@linkcode Result} of an {@linkcode Option} into an
   * {@linkcode Option} of a {@linkcode Result}.
   */
  transpose: <T, E>(r: Result<Option<T>, E>): Option<Result<T, E>> =>
    R.isOk(r) ? (O.isSome(r[OK]) ? Some(Ok(r[OK][SOME])) : r[OK]) : Some(r),
};
