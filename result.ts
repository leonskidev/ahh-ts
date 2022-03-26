/**
 * Represents a value that is successful.
 *
 * ## Examples
 *
 * ```ts
 * import { Ok } from "./result.ts";
 *
 * const unk = Ok(1);
 * const num = Ok<number, string>(1);
 * ```
 */
export function Ok<T, E>(value: T): Result<T, E> {
  return new OkImpl<T, E>(value);
}

/**
 * Represents a value that is erroneous.
 *
 * ## Examples
 *
 * ```ts
 * import { Err } from "./result.ts";
 *
 * const unk = Err(1);
 * const num = Err<string, number>(1);
 * ```
 */
export function Err<T, E>(value: E): Result<T, E> {
  return new ErrImpl<T, E>(value);
}

/**
 * Represents a result value that is either successful ({@linkcode Ok}) or
 * erroneous ({@linkcode Err}).
 */
export type Result<T, E> = {
  /**
   * Returns `true` if the `Result` is {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).isOk() === true;
   * Err(1).isOk() === false;
   * ```
   */
  isOk(): boolean;

  /**
   * Returns `true` if the `Result` is {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).isErr() === false;
   * Err(1).isErr() === true;
   * ```
   */
  isErr(): boolean;

  /**
   * Returns `true` of the `Result` is an {@linkcode Ok} containing `value`.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).contains(1) === true;
   * Err(1).contains(1) === false;
   * ```
   */
  contains<U extends T>(value: U): boolean;

  /**
   * Returns `true` of the `Result` is an {@linkcode Err} containing `value`.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).containsErr(1) === false;
   * Err(1).containsErr(1) === true;
   * ```
   */
  containsErr<F extends E>(value: F): boolean;

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * ## Throws
   *
   * Throws if the `Result` is an {@linkcode Err} with the provided `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).expect("returns") === 1;
   * Err(1).expect("throws") === 1;
   * ```
   */
  expect(message: string): T;

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * ## Throws
   *
   * Throws if the `Result` is an {@linkcode Ok} with the provided `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).expect("throws") === 1;
   * Err(1).expect("returns") === 1;
   * ```
   */
  expectErr(message: string): E;

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * ## Throws
   *
   * Throws if the `Result` is an {@linkcode Err}.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).unwrap() === 1;
   * Err(1).unwrap() === 1; // throws
   * ```
   */
  unwrap(): T;

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * ## Throws
   *
   * Throws if the `Result` is an {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).unwrap() === 1; // throws
   * Err(1).unwrap() === 1;
   * ```
   */
  unwrapErr(): E;

  /**
   * Returns a new `Result` where the {@linkcode Ok} value is mapped with `fn`.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok(1).map((v) => v + 1).contains(2) === true;
   * Err<number, number>(1).map((v) => v + 1).contains(2) === false;
   * ```
   */
  map<U>(fn: ((_: T) => U)): Result<U, E>;

  /**
   * Returns a new `Result` where the {@linkcode Err} value is mapped with `fn`.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * Ok<number, number>(1).mapErr((v) => v + 1).containsErr(2) === false;
   * Err(1).mapErr((v) => v + 1).containsErr(2) === true;
   * ```
   */
  mapErr<F>(fn: ((_: E) => F)): Result<T, F>;

  /**
   * Returns `other` if this and `other` are {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * const one = Ok<number, number>(1);
   * const two = Ok<number, number>(2);
   * const err = Err(1);
   *
   * one.and(two) === two;
   * one.and(err).isErr() === true;
   * err.and(two).isErr() === true;
   * err.and(err).isErr() === true;
   * ```
   */
  and<U>(other: Result<U, E>): Result<U, E>;

  /**
   * Returns this or `other` if either is {@linkcode Ok}.
   *
   * ## Examples
   *
   * ```ts
   * import { Err, Ok } from "./result.ts";
   *
   * const one = Ok(1);
   * const two = Ok(2);
   * const err = Err<number, number>(1);
   *
   * one.or(two) === one;
   * one.or(err) === one;
   * err.or(two) === two;
   * err.or(err).isErr() === true;
   * ```
   */
  or<F>(other: Result<T, F>): Result<T, F>;
};

class OkImpl<T, E> implements Result<T, E> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }

  contains<U extends T>(value: U): boolean {
    return this.#value === value;
  }

  containsErr<F extends E>(): boolean {
    return false;
  }

  expect(): T {
    return this.#value;
  }

  expectErr(message: string): E {
    throw new Error(`${message}: ${this.#value}`);
  }

  unwrap(): T {
    return this.expect();
  }

  unwrapErr(): E {
    return this.expectErr("called `Result.unwrapErr()` on an `Ok` value");
  }

  map<U>(fn: ((_: T) => U)): Result<U, E> {
    return Ok<U, E>(fn(this.#value));
  }

  mapErr<F>(): Result<T, F> {
    return Ok<T, F>(this.#value);
  }

  and<U>(other: Result<U, E>): Result<U, E> {
    if (other.isOk()) {
      return other;
    } else {
      // NOTE: this is safe since we check above that `other` is not `Ok`
      // FIXME: this might not be exactly what should happen
      return Err<U, E>(other.unwrapErr());
    }
  }

  or<F>(): Result<T, F> {
    return Ok<T, F>(this.#value);
  }
}

class ErrImpl<T, E> implements Result<T, E> {
  #value: E;

  constructor(value: E) {
    this.#value = value;
  }

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return true;
  }

  contains(): boolean {
    return false;
  }

  containsErr<F extends E>(value: F): boolean {
    return this.#value === value;
  }

  expect(message: string): T {
    throw new Error(`${message}: ${this.#value}`);
  }

  expectErr(): E {
    return this.#value;
  }

  unwrap(): T {
    return this.expect("called `Result.unwrap()` on an `Err` value");
  }

  unwrapErr(): E {
    return this.expectErr();
  }

  map<U>(): Result<U, E> {
    return Err<U, E>(this.#value);
  }

  mapErr<F>(fn: ((_: E) => F)): Result<T, F> {
    return Err<T, F>(fn(this.#value));
  }

  and<U>(): Result<U, E> {
    return Err<U, E>(this.#value);
  }

  or<F>(other: Result<T, F>): Result<T, F> {
    if (other.isOk()) {
      return other;
    } else {
      // NOTE: this is safe since we check above that `other` is not `Ok`
      // FIXME: this might not be exactly what should happen
      return Err<T, F>(other.unwrapErr());
    }
  }
}
