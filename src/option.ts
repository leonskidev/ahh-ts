/** Represents a value that exists. */
export function Some<T>(value: T): Option<T> {
  return new SomeImpl<T>(value);
}

/** Represents a value that does not exist. */
export function None<T>(): Option<T> {
  return new NoneImpl<T>();
}

/**
 * Represents an optional value that either exists ({@linkcode Some}) or does
 * not exist ({@linkcode None}).
 */
export interface Option<T> {
  /** Returns `true` if the `Option` is {@linkcode Some}. */
  isSome(): boolean;

  /** Returns `true` if the `Option` is {@linkcode None}. */
  isNone(): boolean;

  /**
   * Returns `true` if the `Option` is a {@linkcode Some} containing `value`.
   */
  contains<U extends T>(value: U): boolean;

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * Throws if the `Option` is a {@linkcode None} with the provided `message`.
   */
  expect(message: string): T;

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * Throws if the `Option` is a {@linkcode None}.
   */
  unwrap(): T;

  /** Returns a new `Option` where the value is mapped with `fn`. */
  map<U>(fn: ((_: T) => U)): Option<U>;

  /** Returns `other` if this and `other` are {@linkcode Some}. */
  and<U>(other: Option<U>): Option<U>;

  /** Returns this or `other` if either is {@linkcode Some}. */
  or(other: Option<T>): Option<T>;

  /** Returns this or `other` if only one is {@linkcode Some}. */
  xor(other: Option<T>): Option<T>;
}

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
    if (other.isNone()) {
      return this;
    } else {
      return None<T>();
    }
  }
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
    if (other.isSome()) {
      return other;
    } else {
      return None<T>();
    }
  }

  xor(other: Option<T>): Option<T> {
    if (other.isSome()) {
      return other;
    } else {
      return None<T>();
    }
  }
}
