/** Represents an optional value that does exist. */
export type Some<T> = {
  readonly _tag: "some";
  /** The inner value. */
  readonly value: T;
};

/** Represents an optional value that does not exist. */
export type None = {
  readonly _tag: "none";
};

/**
 * Represents an optional value that either exists ([`Some`]) or does not
 * ([`None`]).
 *
 * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
 * [`None`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#None
 */
export type Option<T> = Some<T> | None;

/**
 * Creates a [`Some`].
 *
 * ## Example
 *
 * ```ts
 * import { Some } from "./option.ts";
 *
 * const one = Some(1);
 * ```
 *
 * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
 */
export const Some = <T>(value: T): Option<T> => ({ _tag: "some", value });
/**
 * Represents a [`None`].
 *
 * [`None`] does not need to be constructed as it represents the absence of a
 * value, and therefore, does not change.
 *
 * ## Example
 *
 * ```ts
 * import { None } from "./option.ts";
 *
 * const none = None;
 * ```
 *
 * [`None`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#None
 */
export const None: Option<never> = { _tag: "none" };

export const Option = {
  /**
   * Returns `true` if the [`Option`] is [`Some`].
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts";
   *
   * const t = Option.isSome(Some(1));
   * ```
   *
   * [`Option`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Option
   * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
   */
  isSome: <T>(option: Option<T>): boolean => option._tag === "some",

  /**
   * Returns `true` if the [`Option`] is [`None`].
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some, None } from "./option.ts";
   *
   * const t = Option.isNone(None);
   * ```
   *
   * [`Option`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Option
   * [`None`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#None
   */
  isNone: <T>(option: Option<T>): boolean => option._tag === "none",

  /**
   * Returns the contained [`Some`] value.
   *
   * ## Throws
   *
   * Throws if the [`Option`] is a [`None`] with the provided `message`.
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts";
   *
   * const one = Option.expect(Some(1), "does not throw");
   * ```
   *
   * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
   * [`Option`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Option
   * [`None`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#None
   */
  expect: <T>(option: Option<T>, message: string): T => {
    if (option._tag === "some") {
      return option.value;
    } else {
      throw TypeError(message);
    }
  },

  /**
   * Returns the contained [`Some`] value.
   *
   * Because this throws, prefer to use [`unwrapOr`] or [`unwrapOrElse`].
   *
   * ## Throws
   *
   * Throws if the [`Option`] is a [`None`].
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts";
   *
   * const one = Option.unwrap(Some(1));
   * ```
   *
   * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
   * [`Option`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Option
   * [`None`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#None
   *
   * [`unwrapOr`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#unwrapOr
   * [`unwrapOrElse`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#unwrapOrElse
   */
  unwrap: <T>(option: Option<T>): T => {
    if (option._tag === "some") {
      return option.value;
    } else {
      throw TypeError("called `Option.unwrap()` on a `None`");
    }
  },

  /**
   * Returns `b` if `a` and `b` are [`Some`].
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts";
   *
   * const b = Option.and(Some(1), Some(2));
   * ```
   *
   * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
   */
  and: <T, U>(a: Option<T>, b: Option<U>): Option<U> => {
    if (a._tag === "some" && b._tag === "some") {
      return b;
    } else {
      return None;
    }
  },

  /**
   * Returns `a` or `b` if it is [`Some`].
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts";
   *
   * const a = Option.or(Some(1), Some(2));
   * ```
   *
   * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
   */
  or: <T>(a: Option<T>, b: Option<T>): Option<T> => {
    if (a._tag === "some") {
      return a;
    } else if (b._tag === "some") {
      return b;
    } else {
      return None;
    }
  },

  /**
   * Returns `a` or `b` if only one is [`Some`].
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some, None } from "./option.ts";
   *
   * const a = Option.xor(None, Some(2));
   * ```
   *
   * [`Some`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Some
   */
  xor: <T>(a: Option<T>, b: Option<T>): Option<T> => {
    if (a._tag === "some" && b._tag === "none") {
      return a;
    } else if (a._tag === "none" && b._tag === "some") {
      return b;
    } else {
      return None;
    }
  },

  /**
   * Returns the nested [`Option`] in an `Option<Option<T>>`.
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts"
   *
   * const one = Option.flatten(Some(Some(1)));
   * ```
   *
   * [`Option`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Option
   */
  flatten: <T>(option: Option<Option<T>>): Option<T> => {
    if (option._tag === "some") {
      return option.value;
    } else {
      return None;
    }
  },

  /**
   * Returns a new [`Option`] of the provided [`Option`]s value mapped with
   * function `f`.
   *
   * ## Example
   *
   * ```ts
   * import { Option, Some } from "./option.ts";
   *
   * const two = Option.map(Some(1), (num) => num + 1);
   * ```
   *
   * [`Option`]: https://doc.deno.land/https/deno.land/x/or/src/option.ts#Option
   */
  map: <T, U>(option: Option<T>, f: (_: T) => U): Option<U> => {
    if (option._tag === "some") {
      return Some(f(option.value));
    } else {
      return None;
    }
  },
};
