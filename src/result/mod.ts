import { None, Option } from "../option/mod.ts";
// NOTE: this is needed for documentation
// deno-lint-ignore no-unused-vars
import type { Some } from "../option/mod.ts";

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
export class R {
  /**
   * Returns whether `res` is an {@linkcode Ok}.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.isOk(1)); // true
   * console.log(R.isOk(Error())); // false
   * ```
   */
  static isOk<T, E extends Error>(res: Result<T, E>): res is Ok<T> {
    return !R.isErr(res);
  }

  /**
   * Returns whether `res` is an {@linkcode Err}.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.isErr(1)); // false
   * console.log(R.isErr(Error())); // true
   * ```
   */
  static isErr<T, E extends Error>(res: Result<T, E>): res is Err<E> {
    return res instanceof Error;
  }

  /**
   * Returns whether `res` strictly equals `value`, or `false` if it is an
   * {@linkcode Err}.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.contains(1, 1)); // true
   * console.log(R.contains(1, 2)); // false
   * console.log(R.contains(Error(), 1)); // false
   * ```
   */
  static contains<T, E extends Error>(res: Result<T, E>, value: T): boolean {
    return R.isOk(res) ? res === value : false;
  }

  /**
   * Returns whether `res` strictly equals `value`, or `false` if it is an
   * {@linkcode Ok}.
   *
   * This only checks whether `res` and `value` have the
   * same `name` and `message`.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.containsErr(1, Error())); // false
   * console.log(R.containsErr(Error(), Error())); // true
   * console.log(R.containsErr(Error(), Error("nope"))); // false
   * ```
   */
  static containsErr<T, E extends Error>(res: Result<T, E>, value: E): boolean {
    return R.isErr(res)
      ? res.name === value.name && res.message === value.message
      : false;
  }

  /**
   * Calls `f` with `res`, and returns the original `res`.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.inspect(1, (i) => i + 1)); // 1
   * console.log(R.inspect(Error(), (i: number) => i + 1)); // Error()
   * ```
   */
  static inspect<T, E extends Error>(
    res: Result<T, E>,
    f: (_: T) => unknown,
  ): Result<T, E> {
    if (R.isOk(res)) f(res);
    return res;
  }

  /**
   * Calls `f` with `res`, and returns the original `res`.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.inspectErr(1, () => Error("nope"))); // 1
   * console.log(R.inspectErr(Error(), () => Error("nope"))); // Error()
   * ```
   */
  static inspectErr<T, E extends Error>(
    res: Result<T, E>,
    f: (_: E) => unknown,
  ): Result<T, E> {
    if (R.isErr(res)) f(res);
    return res;
  }

  /**
   * Calls `f` with `res`, and returns the result.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.map(1, (i) => i + 1)); // 2
   * console.log(R.map(Error(), (i: number) => i + 1)); // Error()
   * ```
   */
  static map<T, U, E extends Error>(
    res: Result<T, E>,
    f: (_: T) => U,
  ): Result<U, E> {
    return R.isOk(res) ? f(res) : res;
  }

  /**
   * Calls `f` with `res`, and returns the result.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.map(1, (_) => Error("new"))); // 1
   * console.log(R.map(Error(), (_) => Error("new"))); // Error("new")
   * ```
   */
  static mapErr<T, E extends Error, F extends Error>(
    res: Result<T, E>,
    f: (_: E) => F,
  ): Result<T, F> {
    return R.isErr(res) ? f(res) : res;
  }

  /**
   * Returns `res` if it is an {@linkcode Ok}, or throws.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.unwrap(1)); // 1
   * R.unwrap(Error()); // throws
   * ```
   */
  static unwrap<T, E extends Error>(
    res: Result<T, E>,
  ): typeof res extends Ok<T> ? T : never {
    if (R.isOk(res)) return res as never;
    throw Error(`attempted to unwrap an \`Err\` value: ${res.message}`);
  }

  /**
   * Returns `res` if it is an {@linkcode Ok}, or returns `default_`.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.unwrapOr<number, Error>(1, 2)); // 1
   * console.log(R.unwrapOr(Error(), 2)); // 2
   * ```
   */
  static unwrapOr<T, E extends Error>(res: Result<T, E>, default_: T): T {
    return R.isOk(res) ? res : default_;
  }

  /**
   * Return `res` if it is an {@linkcode Ok}, or `other`.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.or(1, 2)); // 1
   * console.log(R.or<number, Error, Error>(Error(), 2)); // 2
   * console.log(R.or(2, Error())); // 2
   * console.log(R.or(Error("a"), Error("b"))); // Error("b")
   * ```
   */
  static or<T, E extends Error, F extends Error>(
    res: Result<T, E>,
    other: Result<T, F>,
  ): Result<T, F> {
    return R.isOk(res) ? res : other;
  }

  /**
   * Return `other` if `res` is {@linkcode Ok}, or `res`.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.and(1, 2)); // 2
   * console.log(R.and(Error(), 2)); // Error()
   * console.log(R.and(2, Error())); // Error()
   * console.log(R.and(Error("a"), Error("b"))); // Error("a")
   * ```
   */
  static and<T, U, E extends Error>(
    res: Result<T, E>,
    other: Result<U, E>,
  ): Result<U, E> {
    return R.isOk(res) ? other : res;
  }

  /**
   * Converts `res` into a {@linkcode Some} if it is an {@linkcode Ok}.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.ok(1)); // 1
   * console.log(R.ok(Error())); // undefined
   * ```
   */
  static ok<T, E extends Error>(res: Result<T, E>): Option<T> {
    return R.isOk(res) ? res : None;
  }

  /**
   * Converts `res` into a {@linkcode Some} if it is an {@linkcode Err}.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.err(1)); // undefined
   * console.log(R.err(Error())); // Error()
   * ```
   */
  static err<T, E extends Error>(res: Result<T, E>): Option<E> {
    return R.isErr(res) ? res : None;
  }

  /**
   * Calls `f` and returns the result as an {@linkcode Ok}, or returns an
   * {@linkcode Err} if it throws.
   *
   * @example
   * ```ts
   * import { R } from "./mod.ts";
   *
   * console.log(R.fn(() => 1)); // 1
   * console.log(R.fn(() => { throw Error(); })); // Error()
   * ```
   */
  static fn<T, E extends Error>(f: () => T): Result<T, E> {
    try {
      return f();
    } catch (e) {
      return e;
    }
  }
}
