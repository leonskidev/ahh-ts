/**
 * Optional values.
 *
 * {@linkcode Option} defines a (non-)[nullish] value, exactly the same as how
 * we conventionally denote optional values. This means we still have access to
 * all off the built-in functionality that comes with [nullish] values, such as:
 *
 * - [nullish coalescing] — `??` and `??=`,
 * - [optional chaining] — `?.`,
 * - and more.
 *
 * This module adds onto those features. As such, you are safe to expose these
 * types to dependencies without them having to adapt to some new pattern.
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 * [nullish coalescing]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
 * [optional chaining]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining
 *
 * @module
 */

/**
 * Returns `false`.
 *
 * It is known that `option` is a {@linkcode None} value.
 */
export function isSome(option: None): false;

/**
 * Returns `true`.
 *
 * It is known that `option` is a {@linkcode Some} value.
 */
export function isSome<T>(option: Some<T>): true;

/**
 * Returns whether `option` is a {@linkcode Some} value.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.isSome("hello");
 * O.isSome(NaN);
 * ```
 */
export function isSome<T>(option: Option<T>): option is Some<T>;

export function isSome<T>(option: Option<T>): option is Some<T> {
    return typeof (option) !== "undefined" && option !== null;
}

/**
 * Returns `true`.
 *
 * It is known that `option` is a {@linkcode None} value.
 */
export function isNone(option: None): true;

/**
 * Returns `false`.
 *
 * It is known that `option` is a {@linkcode Some} value.
 */
export function isNone<T>(option: Some<T>): false;

/**
 * Returns whether `option` is a {@linkcode None} value.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.isNone(undefined);
 * O.isNone(null);
 * ```
 */
export function isNone<T>(option: Option<T>): option is None;

export function isNone<T>(option: Option<T>): option is Some<T> {
    return typeof (option) === "undefined" || option === null;
}

/**
 * Returns `option` as-is.
 *
 * It is known that `option` is a {@linkcode None} value.
 */
export function map<T, U>(
    option: None,
    fn: (value: Some<T>) => Some<U> | Option<U>,
): None;

/**
 * Returns `fn` applied to `option`.
 *
 * It is known that `option` is a {@linkcode Some} value and that `fn` returns a
 * {@linkcode Some} value.
 */
export function map<T, U>(option: Some<T>, fn: (value: Some<T>) => Some<U>): Some<U>;

/**
 * Returns `fn` applied to `option`.
 *
 * It is known that `option` is a {@linkcode Some} value.
 */
export function map<T, U>(
    option: Some<T>,
    fn: (value: Some<T>) => Option<U>,
): Option<U>;

/**
 * Returns `fn` applied to `option` if it is a {@linkcode Some} value.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.map(undefined, (i) => String(i));
 * O.map(1, (i) => String(i));
 * O.map(1, (i) => Math.random() > 0.5 ? String(i) : undefined);
 * ```
 */
export function map<T, U>(
    option: Option<T>,
    fn: (value: Some<T>) => Some<U> | Option<U>,
): Option<U>;

export function map<T, U>(
    option: Option<T>,
    fn: (value: Some<T>) => Some<U> | Option<U>,
): Option<U> {
    return isSome(option) ? fn(option) : option;
}

export default { isSome, isNone, map };

/**
 * A value that is [nullish]; either `undefined` or `null`.
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 */
export type None = undefined | null;

/**
 * A value that is non-[nullish]; it can be [falsy].
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 * [falsy]: https://developer.mozilla.org/docs/Glossary/Falsy
 */
export type Some<T> = NonNullable<T>;

/** A value that is either {@linkcode None} or {@linkcode Some}. */
export type Option<T> = None | Some<T>;
