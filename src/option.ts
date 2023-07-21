/**
 * Optional values.
 *
 * {@linkcode Option} defines a (non-)[nullish] value, exactly the same as how
 * we conventionally denote optional values. This means we still have access to
 * all of the built-in functionality that comes with [nullish] values, such as:
 *
 * - [nullish coalescing] (`??` and `??=`),
 * - [optional chaining] (`?.`),
 * - and more.
 *
 * This module adds onto those features. As such, you are safe to expose these
 * to dependents without them having to adapt to some new pattern.
 *
 * [nullish]: https://developer.mozilla.org/docs/Glossary/Nullish
 * [nullish coalescing]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
 * [optional chaining]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining
 *
 * @module
 */

/**
 * Returns whether `opt` is {@linkcode Some}.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.isSome(NaN);
 * O.isSome({ hello: "world" });
 * !O.isSome(undefined);
 * !O.isSome(null);
 * ```
 */
export function isSome<T>(opt: Option<T>): opt is Some<T>;
export function isSome(opt: None): false;
export function isSome<T>(opt: Some<T>): true;
export function isSome<T>(opt: Option<T>): opt is Some<T> {
    return typeof (opt) !== "undefined" && opt !== null;
}

/**
 * Returns whether `opt` is {@linkcode None}.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.isNone(undefined);
 * O.isNone(null);
 * !O.isNone(NaN);
 * !O.isNone({ hello: "world" });
 * ```
 */
export function isNone(opt: None): true;
export function isNone<T>(opt: Some<T>): false;
export function isNone<T>(opt: Option<T>): opt is Some<T>;
export function isNone<T>(opt: Option<T>): opt is Some<T> {
    return typeof (opt) === "undefined" || opt === null;
}

/**
 * Returns the result of `fn` applied to `opt`, if it is {@linkcode Some}.
 *
 * If it is {@linkcode None}, then `opt` is returned as-is.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.map(undefined, String);
 * O.map(123, () => undefined);
 * O.map(123, String);
 * O.map(prompt("age:"), Number);
 * ```
 */
export function map<T, U>(
    opt: None,
    fn: (val: Some<T>) => Some<U> | Option<U>,
): None;
export function map<T, U>(
    opt: Option<T>,
    fn: (val: Some<T>) => None,
): None;
export function map<T, U>(
    opt: Some<T>,
    fn: (val: Some<T>) => Some<U>,
): Some<U>;
export function map<T, U>(
    opt: Option<T>,
    fn: (val: Some<T>) => Some<U> | Option<U>,
): Option<U>;
export function map<T, U>(
    opt: Option<T>,
    fn: (val: Some<T>) => Some<U> | Option<U>,
): Option<U> {
    return isSome(opt) ? fn(opt) : opt;
}

/**
 * Returns `lhs` and `rhs` as a tuple, if both are {@linkcode Some}.
 *
 * If either is {@linkcode None}, that one is returned as-is.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * O.zip(undefined, 123);
 * O.zip(123, null);
 * O.zip(123, "hello");
 * O.zip(prompt("name:"), prompt("age:"));
 * ```
 */
export function zip<U>(lhs: None, rhs: Option<U>): None;
export function zip<T>(lhs: Option<T>, rhs: None): None;
export function zip<T, U>(lhs: Some<T>, rhs: Some<U>): Some<[Some<T>, Some<U>]>;
export function zip<T, U>(
    lhs: Option<T>,
    rhs: Option<U>,
): Option<[Some<T>, Some<U>]>;
export function zip<T, U>(
    lhs: Option<T>,
    rhs: Option<U>,
): Option<[Some<T>, Some<U>]> {
    return isSome(lhs) ? (isSome(rhs) ? [lhs, rhs] : rhs) : lhs;
}

/**
 * Returns `opt` as a tuple of its components, if it is {@linkcode Some}.
 *
 * If it is {@linkcode None}, it is returned as-is.
 *
 * @example
 * ```ts
 * import O from "./option.ts";
 *
 * unzip(undefined);
 * unzip([123, "hello"]);
 * ```
 */
export function unzip<T, U>(opt: None): [None, None];
export function unzip<T, U>(opt: Some<[Some<T>, Some<U>]>): [Some<T>, Some<U>];
export function unzip<T, U>(
    opt: Option<[Some<T>, Some<U>]>,
): [Option<T>, Option<U>];
export function unzip<T, U>(
    opt: Option<[Some<T>, Some<U>]>,
): [Option<T>, Option<U>] {
    return isSome(opt) ? [opt[0], opt[1]] : [opt, opt];
}

export default { isSome, isNone, map, zip, unzip };

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
