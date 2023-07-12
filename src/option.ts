/**
 * Optionals.
 *
 * The {@linkcode Option} type defined here is nothing special, it's the same as
 * what the rest of the ecosystem already uses. Thanks to this, we still benefit
 * from the built-in language features for [nullish] types, such as:
 *
 * - [nullish coalescing] (`??` and `??=`); and,
 * - [optional chaining] (`?.`).
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 * [nullish coalescing]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
 * [optional chaining]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining
 *
 * @module
 */

/**
 * Returns whether `option` is a {@linkcode Some} value.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import O from "./option.ts";
 *
 * assert(O.isSome(0));
 * assert(O.isSome(2));
 * ```
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return !isNone(option);
}

/**
 * Returns whether `option` is a {@linkcode None} value.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import O from "./option.ts";
 *
 * assert(O.isNone(undefined));
 * assert(O.isNone(null));
 * ```
 */
export function isNone<T>(option: Option<T>): option is None {
  return typeof (option) === "undefined" || option === null;
}

/**
 * Returns the result of `fn` appied to the value of `option`, if it is a
 * {@linkcode Some}.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import O from "./option.ts";
 *
 * const toString = (i: number): string => i.toString();
 *
 * assert(O.map(2, toString) === "2");
 * assert(O.map(undefined, toString) === undefined);
 * assert(O.map(null, toString) === null);
 * ```
 */
export function map<T, U extends Some<unknown>>(
  option: Option<T>,
  fn: (value: T) => U | Option<U>,
): Option<U> {
  return isSome(option) ? fn(option) : option;
}

/**
 * Returns the values of `option` and `other` as a tuple if both are
 * {@linkcode Some}s.
 *
 * @example
 * ```ts
 * import { assert, assertArrayIncludes } from "../test_deps.ts";
 * import O from "./option.ts";
 *
 * const zipped = O.zip(2, "hello");
 *
 * assert(O.isSome(zipped));
 * assertArrayIncludes(zipped, [2, "hello"]);
 * ```
 */
export function zip<T, U>(
  option: Option<T>,
  other: Option<U>,
): Option<[T, U]> {
  return isSome(option) ? (isSome(other) ? [option, other] : other) : option;
}

/**
 * Returns the values of `option` as a tuple of {@linkcode Option}s.
 *
 * @example
 * ```ts
 * import { assertArrayIncludes } from "../test_deps.ts";
 * import O from "./option.ts";
 *
 * const unzipped = O.unzip([2, 4]);
 *
 * assertArrayIncludes(unzipped, [2, 4]);
 * ```
 */
export function unzip<T extends Some<unknown>, U extends Some<unknown>>(
  option: Option<[T, U]>,
): [Option<T>, Option<U>] {
  return isSome(option) ? [option[0], option[1]] : [option, option];
}

export default { isSome, isNone, map, zip, unzip };

/**
 * A value that is [nullish]; either `undefined` or `null`.
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 */
export type None = undefined | null;

/**
 * A value that is non-[nullish].
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 */
export type Some<T> = NonNullable<T>;

/** A value that is either {@linkcode None} or {@linkcode Some}. */
export type Option<T> = None | Some<T>;
