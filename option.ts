/**
 * Represents a value that exists.
 *
 * ## Examples
 *
 * ```ts
 * import { Some } from "./option.ts";
 *
 * const num = Some(1);
 * ```
 */
export function Some<T>(value: T): Option<T> {
  return new SomeImpl<T>(value);
}

/**
 * Represents a value that does not exist.
 *
 * ## Examples
 *
 * ```ts
 * import { None } from "./option.ts";
 *
 * const unk = None();
 * const num = None<number>();
 * ```
 */
export function None<T>(): Option<T> {
  return new NoneImpl<T>();
}

/**
 * Represents an optional value that either exists ({@linkcode Some}) or does
 * not exist ({@linkcode None}).
 */
export type Option<T> = {
  /**
   * Returns `true` if the `Option` is {@linkcode Some}.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * Some(1).isSome() === true;
   * None().isSome() === false;
   * ```
   */
  isSome(): boolean;

  /**
   * Returns `true` if the `Option` is {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * Some(1).isNone() === false;
   * None().isNone() === true;
   * ```
   */
  isNone(): boolean;

  /**
   * Returns `true` of the `Option` is a {@linkcode Some} containing `value`.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * Some(1).contains(1) === true;
   * None().contains(1) === false;
   * ```
   */
  contains<U extends T>(value: U): boolean;

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * ## Throws
   *
   * Throws if the `Option` is a {@linkcode None} with the provided `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * Some(1).expect("returns") === 1;
   * None().expect("throws") === 1;
   * ```
   */
  expect(message: string): T;

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * ## Throws
   *
   * Throws if the `Option` is a {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * Some(1).unwrap() === 1;
   * None().unwrap() === 1; // throws
   * ```
   */
  unwrap(): T;

  /**
   * Returns a new `Option` where the value is mapped with `fn`.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * Some(1).map((v) => v + 1).contains(2) === true;
   * None<number>().map((v) => v + 1).contains(2) === false;
   * ```
   */
  map<U>(fn: ((_: T) => U)): Option<U>;

  /**
   * Returns `other` if this and `other` are {@linkcode Some}.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * const one = Some(1);
   * const two = Some(2);
   * const none = None<number>();
   *
   * one.and(two) === two;
   * one.and(none).isNone() === true;
   * none.and(two).isNone() === true;
   * none.and(none).isNone() === true;
   * ```
   */
  and<U>(other: Option<U>): Option<U>;

  /**
   * Returns this or `other` if either is {@linkcode Some}.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * const one = Some(1);
   * const two = Some(2);
   * const none = None<number>();
   *
   * one.or(two) === one;
   * one.or(none) === one;
   * none.or(two) === two;
   * none.or(none).isNone() === true;
   * ```
   */
  or(other: Option<T>): Option<T>;

  /**
   * Returns this or `other` if only one is {@linkcode Some}.
   *
   * ## Examples
   *
   * ```ts
   * import { None, Some } from "./option.ts";
   *
   * const one = Some(1);
   * const two = Some(2);
   * const none = None<number>();
   *
   * one.or(two).isNone === true;
   * one.or(none) === one;
   * none.or(two) === two;
   * none.or(none).isNone() === true;
   */
  xor(other: Option<T>): Option<T>;
  // /**
  //  * Returns the nested `Option`.
  //  *
  //  * ## Examples
  //  *
  //  * ```ts
  //  * import { None, Some, type Option } from "./option.ts";
  //  *
  //  * const one = Some(1);
  //  *
  //  * Some(one).flatten() === one;
  //  * None<Option<number>>().flatten().isNone() === true;
  //  * ```
  //  */
  // flatten(this: Option<Option<T>>): Option<T>;
};

class SomeImpl<T> implements Option<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  contains<U extends T>(value: U): boolean {
    return this.#value === value;
  }

  expect(): T {
    return this.#value;
  }

  unwrap(): T {
    return this.#value;
  }

  map<U>(fn: ((_: T) => U)): Option<U> {
    return Some(fn(this.#value));
  }

  and<U>(other: Option<U>): Option<U> {
    if (other.isSome()) {
      return other;
    } else {
      return None<U>();
    }
  }

  or(): Option<T> {
    return this;
  }

  xor(other: Option<T>): Option<T> {
    if (!(other instanceof SomeImpl)) {
      return this;
    } else {
      return None<T>();
    }
  }

  // flatten(this: SomeImpl<Option<T>>): Option<T> {
  //   return this.#value;
  // }
}

class NoneImpl<T> implements Option<T> {
  isSome(): boolean {
    return false;
  }

  isNone(): boolean {
    return true;
  }

  contains(): boolean {
    return false;
  }

  expect(message: string): T {
    throw new Error(message);
  }

  unwrap(): T {
    return this.expect("called `Option.unwrap()` on a `None` value");
  }

  map<U>(): Option<U> {
    return None();
  }

  and<U>(): Option<U> {
    return None<U>();
  }

  or(other: Option<T>): Option<T> {
    if (other instanceof SomeImpl) {
      return other;
    } else {
      return None<T>();
    }
  }

  xor(other: Option<T>): Option<T> {
    if (other instanceof SomeImpl) {
      return other;
    } else {
      return None<T>();
    }
  }

  // flatten(): Option<T> {
  //   return None<T>();
  // }
}
