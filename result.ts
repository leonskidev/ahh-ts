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
export interface Result<T, E> {
  /** Returns `true` if the `Result` is {@linkcode Ok}. */
  isOk(): boolean;

  /** Returns `true` if the `Result` is {@linkcode Err}. */
  isErr(): boolean;

  /**
   * Returns `true` of the `Result` is an {@linkcode Ok} containing `value`.
   */
  contains<U extends T>(value: U): boolean;

  /**
   * Returns `true` of the `Result` is an {@linkcode Err} containing `value`.
   */
  containsErr<F extends E>(value: F): boolean;

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the `Result` is an {@linkcode Err} with the provided `message`.
   */
  expect(message: string): T;

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the `Result` is an {@linkcode Ok} with the provided `message`.
   */
  expectErr(message: string): E;

  /**
   * Returns the contained {@linkcode Ok} value.
   *
   * Throws if the `Result` is an {@linkcode Err}.
   */
  unwrap(): T;

  /**
   * Returns the contained {@linkcode Err} value.
   *
   * Throws if the `Result` is an {@linkcode Ok}.
   */
  unwrapErr(): E;

  /**
   * Returns a new `Result` where the {@linkcode Ok} value is mapped with `fn`.
   */
  map<U>(fn: ((_: T) => U)): Result<U, E>;

  /**
   * Returns a new `Result` where the {@linkcode Err} value is mapped with `fn`.
   */
  mapErr<F>(fn: ((_: E) => F)): Result<T, F>;

  /** Returns `other` if this and `other` are {@linkcode Ok}. */
  and<U>(other: Result<U, E>): Result<U, E>;

  /** Returns this or `other` if either is {@linkcode Ok}. */
  or<F>(other: Result<T, F>): Result<T, F>;
}

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
