/**
 * Contains an idiomatic {@linkcode Option} type and related functions.
 *
 * The types and functions provided in this module likely follow how you already
 * handle optional values yourself. A quick look at what the {@linkcode Option}
 * type boils down to shows how simple it is:
 *
 * ```ts
 * type Option<T> = (undefined | null) | T;
 * ```
 *
 * Almost all built-in and external modules handle the *none* side as
 * `undefined` or `null`, and the *some* side as the value itself. This is
 * exactly the same as what the type above defines.
 *
 * Since optionals are not special, we still have access to the features built
 * into the language:
 *
 * - [Nullish coalescing] (`??` and `??=`)
 * - [Optional chaining] (`?.`)
 *
 * This module simply provides extra functionality on-top of these.
 *
 * @example
 * ```ts
 * import { default as O } from "./option.ts";
 *
 * const url = O.map(prompt("URL:"), (url) => new URL(url));
 *
 * console.log(url ?? "no url was provided");
 * ```
 *
 * [Nullish coalescing]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
 * [Optional chaining]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining
 *
 * @module
 */

/** A value that is either `undefined` or `null`. */
export type None = undefined | null;
/** A value this is neither `undefined` nor `null`. */
export type Some<T> = T;
/** A value that is either {@linkcode Some} or {@linkcode None}. */
export type Option<T> = None | Some<T>;

/**
 * Returns whether {@linkcode option} is a {@linkcode Some}.
 *
 * @example
 * ```ts
 * import { default as O, Option } from "./option.ts";
 *
 * const num: Option<number> = 8;
 *
 * if (O.isSome(num)) {
 *   console.log(num * 2);
 * }
 * ```
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return typeof (option) !== "undefined" && option !== null;
}

/**
 * Returns whether {@linkcode option} is a {@linkcode None}.
 *
 * @example
 * ```ts
 * import { default as O, Option } from "./option.ts";
 *
 * const num: Option<number> = undefined;
 *
 * if (O.isNone(num)) {
 *   console.log("the number is a lie");
 * }
 * ```
 */
export function isNone<T>(option: Option<T>): option is None {
  return !isSome(option);
}

/**
 * Returns {@linkcode option} with its value mapped via {@linkcode fn}.
 *
 * @example
 * ```ts
 * import { default as O, Option } from "./option.ts";
 *
 * const num: Option<number> = 8;
 * const double = O.map(num, (i) => i * 2);
 *
 * if (O.isSome(double)) {
 *   console.log(num, "doubled is", double);
 * }
 * ```
 */
export function map<T, U>(
  option: Option<T>,
  fn: (_: T) => Option<U> | U,
): Option<U> {
  return isSome(option) ? fn(option) : option;
}

/**
 * Returns {@linkcode option} if {@linkcode fn} returns `true`, otherwise it
 * returns a {@linkcode None}.
 *
 * @example
 * ```ts
 * import { default as O, Option } from "./option.ts";
 *
 * const num: Option<number> = 8;
 * const even = O.filter(num, (i) => i % 2 === 0);
 *
 * console.log(even ?? "num is odd");
 * ```
 */
export function filter<T>(option: Option<T>, fn: (_: T) => boolean): Option<T> {
  return (isSome(option) && fn(option)) ? option : undefined;
}

export default { isSome, isNone, map, filter };
