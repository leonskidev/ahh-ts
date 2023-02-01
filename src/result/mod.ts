import { None, Option } from "../option/mod.ts";

/** Represents a {@linkcode Result} that was erroneous. */
export type Err<E extends Error> = E;
/** Represents a {@linkcode Result} that was successful. */
export type Ok<T> = T;
/**
 * Represents a value that is either successful ({@linkcode Ok}) or erroneous
 * ({@linkcode Err}).
 */
export type Result<T, E extends Error> = Err<E> | Ok<T>;

/** Functionality for {@linkcode Result}. */
export const R = {
  /**
   * Creates an {@linkcode Ok} from the return value of `f`, otherwise an
   * {@linkcode Err} if it throws.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.fn(() => 1)); // 1
   * console.log(R.fn(() => { throw Error(); })); // Error()
   * ```
   */
  fn: <T, E extends Error>(f: () => T): Result<T, E> => {
    try {
      return f();
    } catch (e) {
      return e;
    }
  },

  /**
   * Returns whether a {@linkcode Result} is an {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.isOk(1)); // true
   * console.log(R.isOk(Error())); // false
   * ```
   */
  isOk: <T, E extends Error>(r: Result<T, E>): r is Ok<T> =>
    !(r instanceof Error),

  /**
   * Returns whether a {@linkcode Result} is an {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.isErr(1)); // false
   * console.log(R.isErr(Error())); // true
   * ```
   */
  isErr: <T, E extends Error>(r: Result<T, E>): r is Err<E> =>
    r instanceof Error,

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Err} with the provided
   * `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.expect(1, "returns")); // 1
   * R.expect(Error("whoops"), "throws"); // throws
   * ```
   */
  expect: <T, E extends Error>(
    r: Result<T, E>,
    message: string,
  ): typeof r extends Ok<T> ? T : never => {
    if (R.isErr(r)) throw Error(message);
    // TODO: why? also fix this
    return r as never;
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
   * import { R } from "./mod.ts";
   *
   * console.log(R.expectErr(Error("whoops"), "returns")); // Error("whoops")
   * R.expectErr(1, "throws"); // throws
   * ```
   */
  expectErr: <T, E extends Error>(
    r: Result<T, E>,
    message: string,
  ): typeof r extends Err<E> ? E : never => {
    if (R.isOk(r)) throw Error(message);
    // TODO: why? also fix this
    return r as never;
  },

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.unwrap(1)); // 1
   * R.unwrap(Error("whoops")); // throws
   * ```
   */
  unwrap: <T, E extends Error>(
    r: Result<T, E>,
  ): typeof r extends Ok<T> ? T : never =>
    R.expect(
      r,
      `called \`unwrap()\` on an \`Err\` value: ${(r as Err<E>).message}`,
    ),

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the {@linkcode Result} is an {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.unwrapErr(Error("whoops"))); // Error("whoops")
   * R.unwrapErr(1); // throws
   * ```
   */
  unwrapErr: <T, E extends Error>(
    r: Result<T, E>,
  ): typeof r extends Err<E> ? E : never =>
    R.expectErr(
      r,
      `called \`unwrapErr()\` on an \`Ok\` value: ${(r as Ok<T>)}`,
    ),

  /**
   * Returns the contained {@linkcode Ok} value or the provided `default`.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.unwrapOr<number, Error>(1, 5)); // 1
   * console.log(R.unwrapOr(Error("whoops"), 5)); // 5
   * ```
   */
  unwrapOr: <T, E extends Error>(r: Result<T, E>, v: T): T => R.isOk(r) ? r : v,

  /**
   * Maps the contained {@linkcode Ok} value with `f`, otherwise
   * {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.map(1, (i) => i + 1)); // 2
   * console.log(R.map<number, Error, number>(Error("whoops"), (i) => i + 1)); // Error("whoops")
   * ```
   */
  map: <T, E extends Error, U>(r: Result<T, E>, f: (_: T) => U): Result<U, E> =>
    R.isOk(r) ? f(r) : r,

  /**
   * Maps the contained {@linkcode Err} value with `f`, otherwise
   * {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.mapErr(1, (i) => Error(i.message + "bar"))); // 1
   * console.log(R.mapErr(Error("foo"), (i) => Error(i.message + "bar"))); // Error("foobar")
   * ```
   */
  mapErr: <T, E extends Error, F extends Error>(
    r: Result<T, E>,
    f: (_: E) => F,
  ): Result<T, F> => R.isErr(r) ? f(r) : r,

  /**
   * Returns whether the contained {@linkcode Ok} value strictly equals `v`.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.contains(1, 1)); // true
   * console.log(R.contains(1, 2)); // false
   * console.log(R.contains(Error("whoops"), 1)); // false
   * ```
   */
  contains: <T, E extends Error>(r: Result<T, E>, v: T): boolean =>
    R.isOk(r) ? r === v : false,

  /**
   * Returns whether the contained {@linkcode Err} value strictly equals `v`.
   *
   * This checks all fields except for `stack` which is usually the desired
   * behaviour.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.containsErr(Error("whoops"), Error("whoops"))); // true
   * console.log(R.containsErr(Error("whoops"), Error("spoohw"))); // false
   * console.log(R.containsErr(1, Error("whoops"))); // false
   * ```
   */
  containsErr: <T, E extends Error>(r: Result<T, E>, v: E): boolean =>
    R.isErr(r)
      ? r.name === v.name && r.cause === v.cause && r.message === v.message
      : false,

  /**
   * Converts an {@linkcode Ok} into an {@linkcode Option}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.ok(1)); // 1
   * console.log(R.ok(Error("whoops"))); // undefined
   * ```
   */
  ok: <T, E extends Error>(r: Result<T, E>): Option<T> => R.isOk(r) ? r : None,

  /**
   * Converts an {@linkcode Err} into an {@linkcode Option}.
   *
   * ## Examples
   *
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.err(Error("whoops"))); // Error("whoops")
   * console.log(R.err(1)); // undefined
   * ```
   */
  err: <T, E extends Error>(r: Result<T, E>): Option<E> =>
    R.isErr(r) ? r : None,
};
