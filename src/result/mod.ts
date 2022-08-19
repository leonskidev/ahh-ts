import { None, O, Option, Some } from "../option/mod.ts";

/** Represents a {@linkcode Result} that was erroneous. */
export type Err<E> = Readonly<{ err: E }>;
/** Represents a {@linkcode Result} that was successful. */
export type Ok<T> = Readonly<{ ok: T }>;
/**
 * Represents a value that is either successful ({@linkcode Ok}) or erroneous
 * ({@linkcode Err}).
 */
export type Result<T, E> = Err<E> | Ok<T>;

export function Err<T, E>(v: E): Result<T, E> {
  return Object.defineProperties({ err: v }, {
    toString: { value: (): string => `Err(${v})` },
  });
}

export function Ok<T, E>(v: T): Result<T, E> {
  return Object.defineProperties({ ok: v }, {
    toString: { value: (): string => `Ok(${v})` },
  });
}

/** Functionality for {@linkcode Result}. */
export const R = {
  /**
   * Returns whether a {@linkcode Result} is an {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assert(R.isOk(Ok(1)));
   * assert(!R.isOk(Err(0)));
   * ```
   */
  isOk: <T, E>(r: Result<T, E>): r is Ok<T> => Object.hasOwn(r, "ok"),

  /**
   * Returns whether a {@linkcode Result} is an {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assert(!R.isErr(Ok(1)));
   * assert(R.isErr(Err(0)));
   * ```
   */
  isErr: <T, E>(r: Result<T, E>): r is Err<E> => Object.hasOwn(r, "err"),

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Err} with the provided
   * `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.expect(Ok(1), "fine"), 1);
   * assertThrows(R.expect(Err(0), "whoops"));
   * ```
   */
  expect: <T, E>(
    r: Result<T, E>,
    message: string,
  ): (typeof r) extends Err<E> ? never : T => {
    if (R.isOk(r)) return r.ok;
    throw Error(message);
  },

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Ok} with the provided
   * `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertThrows(R.expectErr(Ok(1), "whoops"));
   * assertEquals(R.expectErr(Err(0), "fine"), 0);
   * ```
   */
  expectErr: <T, E>(
    r: Result<T, E>,
    message: string,
  ): (typeof r) extends Ok<T> ? never : E => {
    if (R.isErr(r)) return r.err;
    throw Error(`${message}: ${r.ok}`);
  },

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.unwrap(Ok(1)), 1);
   * assertThrows(R.unwrap(Err(0)));
   * ```
   */
  unwrap: <T, E>(r: Result<T, E>): (typeof r) extends Err<E> ? never : T =>
    R.expect(
      r,
      `called \`unwrap()\` on an \`Err\` value: ${(r as Err<E>).err}`,
    ),

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertThrows(R.unwrapErr(Ok(1)));
   * assertEquals(R.unwrapErr(Err(0)), 0);
   * ```
   */
  unwrapErr: <T, E>(r: Result<T, E>): (typeof r) extends Ok<T> ? never : E =>
    R.expectErr(
      r,
      `called \`unwrapErr()\` on an \`Ok\` value: ${(r as Ok<T>).ok}`,
    ),

  /**
   * Returns the contained {@linkcode Ok} value or the provided `default`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.unwrapOr(Ok(1), 5), 1);
   * assertEquals(R.unwrapOr(Err(0), 5), 5);
   * ```
   */
  unwrapOr: <T, E>(r: Result<T, E>, default_: T): T =>
    R.isOk(r) ? r.ok : default_,

  /**
   * Returns the contained {@linkcode Err} value or the provided `default`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.unwrapErrOr(Ok(1), 5), 5);
   * assertEquals(R.unwrapErrOr(Err(0), 5), 0);
   * ```
   */
  unwrapErrOr: <T, E>(r: Result<T, E>, default_: E): E =>
    R.isErr(r) ? r.err : default_,

  /**
   * Maps the contained {@linkcode Ok} value with `f`, or returns
   * {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.map(Ok<number, number>(1), (i) => i + 1), Ok(2));
   * assertEquals(R.map(Err<number, number>(0), (i) => i + 1), Err(0));
   * ```
   */
  map: <T, E, U>(r: Result<T, E>, f: (_: T) => U): Result<U, E> =>
    R.isOk(r) ? Ok(f(r.ok)) : r,

  /**
   * Maps the contained {@linkcode Err} value with `f`, or returns
   * {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.mapErr(Ok<number, number>(1), (i) => i + 1), Ok(1));
   * assertEquals(R.mapErr(Err<number, number>(0), (i) => i + 1), Err(1));
   * ```
   */
  mapErr: <T, E, F>(r: Result<T, E>, f: (_: E) => F): Result<T, F> =>
    R.isErr(r) ? Err(f(r.err)) : r,

  /**
   * Returns whether the contained {@linkcode Ok} value strictly equals `cmp`.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assert(R.contains(Ok(1), 1));
   * assert(!R.contains(Ok(1), 5));
   * assert(!R.contains(Err(0), 0));
   * ```
   */
  contains: <T, E>(r: Result<T, E>, cmp: T): boolean =>
    R.isOk(r) ? r.ok === cmp : false,

  /**
   * Returns whether the contained {@linkcode Err} value strictly equals `cmp`.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assert(!R.contains(Ok(1), 1));
   * assert(R.contains(Err(0), 0));
   * assert(!R.contains(Err(0), 5));
   * ```
   */
  containsErr: <T, E>(r: Result<T, E>, cmp: E): boolean =>
    R.isErr(r) ? r.err === cmp : false,

  /**
   * Returns the contained {@linkcode Result} value of an {@linkcode Ok}, or
   * returns {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err } from "../../mod.ts";
   *
   * assertEquals(R.flatten(Ok(Ok(1))), Ok(1));
   * assertEquals(R.flatten(Ok(Err(1))), Err(1));
   * assertEquals(R.flatten(Err(0)), Err(0));
   * ```
   */
  flatten: <T, E>(r: Result<Result<T, E>, E>): Result<T, E> =>
    R.isOk(r) ? r.ok : r,

  /**
   * Returns the contained {@linkcode Ok} value, but never throws.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok } from "../../mod.ts";
   *
   * assertEquals(R.intoOk(Ok(1)), 1);
   * ```
   */
  intoOk: <T>(r: Result<T, never>): T => (r as Ok<T>).ok,

  /**
   * Returns the contained {@linkcode Err} value, but never throws.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Err } from "../../mod.ts";
   *
   * assertEquals(R.intoErr(Err(1)), 1);
   * ```
   */
  intoErr: <E>(r: Result<never, E>): E => (r as Err<E>).err,

  /**
   * Converts an {@linkcode Ok} into an {@linkcode Option}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err, Some, None } from "../../mod.ts";
   *
   * assertEquals(R.ok(Ok(1)), Some(1));
   * assertEquals(R.ok(Err(0)), None);
   * ```
   */
  ok: <T, E>(r: Result<T, E>): Option<T> => R.isOk(r) ? Some(r.ok) : None,

  /**
   * Converts an {@linkcode Err} into an {@linkcode Option}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err, Some, None } from "../../mod.ts";
   *
   * assertEquals(R.err(Ok(1)), None);
   * assertEquals(R.err(Err(0)), Some(0));
   * ```
   */
  err: <T, E>(r: Result<T, E>): Option<E> => R.isErr(r) ? Some(r.err) : None,

  /**
   * Transposes a {@linkcode Result} of an {@linkcode Option} into an
   * {@linkcode Option} of a {@linkcode Result}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { R, Ok, Err, Some, None } from "../../mod.ts";
   *
   * assertEquals(R.transpose(Ok(Some(1))), Some(Ok(1)));
   * assertEquals(R.transpose(Ok(None)), None);
   * assertEquals(R.transpose(Err(Some(0))), Some(Err(0)));
   * assertEquals(R.transpose(Err(None)), None);
   * ```
   */
  transpose: <T, E>(r: Result<Option<T>, E>): Option<Result<T, E>> =>
    R.isOk(r) ? (O.isSome(r.ok) ? Some(Ok(r.ok.some)) : r.ok) : Some(r),
};
