/** Represents an {@linkcode Option} that does not exist. */
export type None = undefined | null;
/** Represents an {@linkcode Option} that does exist. */
export type Some<T> = T;
/**
 * Represents an optional value that either exists ({@linkcode Some}) or does
 * not exist ({@linkcode None}).
 */
export type Option<T> = None | Some<T>;

export const None = undefined;

/** Functionality for {@linkcode Option}. */
export class O {
  /**
   * Returns whether {@linkcode opt} is a {@linkcode Some}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.isSome(1)); // true
   * console.log(O.isSome(None)); // false
   * ```
   */
  static isSome<T>(opt: Option<T>): opt is Some<T> {
    return typeof (opt) !== "undefined" && opt !== null;
  }

  /**
   * Returns whether {@linkcode opt} is a {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.isNone(1)); // false
   * console.log(O.isNone(None)); // true
   * ```
   */
  static isNone<T>(opt: Option<T>): opt is None {
    return !O.isSome(opt);
  }

  /**
   * Returns whether {@linkcode opt} strictly equals {@linkcode value}, or
   * `false` if it is {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.contains(1, 1)); // true
   * console.log(O.contains(1, 2)); // false
   * console.log(O.contains(None, 1)); // false
   * ```
   */
  static contains<T>(opt: Option<T>, value: T): boolean {
    return O.isSome(opt) ? opt === value : false;
  }

  /**
   * Calls {@linkcode f} with {@linkcode opt}, and returns the original
   * {@linkcode opt}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.inspect(1, (i) => i + 1)); // 1
   * console.log(O.inspect(None, (i: number) => i + 1)); // undefined
   * ```
   */
  static inspect<T>(opt: Option<T>, f: (_: T) => void): Option<T> {
    if (O.isSome(opt)) f(opt);
    return opt;
  }

  /**
   * Calls {@linkcode f} with {@linkcode opt}, and returns the result.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.map(1, (i) => i + 1)); // 2
   * console.log(O.map(None, (i: number) => i + 1)); // undefined
   * ```
   */
  static map<T, U>(opt: Option<T>, f: (_: T) => U): Option<U> {
    return O.isSome(opt) ? f(opt) : None;
  }

  /**
   * Calls {@linkcode f} with {@linkcode opt}, and returns it if the result is
   * `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.filter(2, (i) => i % 2 === 0)); // 2
   * console.log(O.filter(1, (i) => i % 2 === 0)); // None
   * console.log(O.filter(None, (i: number) => i % 2 === 0)); // None
   * ```
   */
  static filter<T>(opt: Option<T>, f: (_: T) => boolean): Option<T> {
    return O.isSome(opt) && f(opt) ? opt : None;
  }

  /**
   * Returns {@linkcode opt} if it is a {@linkcode Some}, or throws with
   * {@linkcode message} if provided.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.unwrap(1)); // 1
   * O.unwrap(None); // throws "Error: attempted to unwrap a `None` value"
   * ```
   */
  static unwrap<T>(opt: Option<T>): typeof opt extends Some<T> ? T : never {
    if (O.isSome(opt)) return opt as never;
    throw Error("attempted to unwrap a \`None\` value");
  }

  /**
   * Returns {@linkcode opt} if it is a {@linkcode Some}, or returns
   * {@linkcode default_}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.unwrapOr(1, 2)); // 1
   * console.log(O.unwrapOr(None, 2)); // 2
   * ```
   */
  static unwrapOr<T>(opt: Option<T>, default_: T): T {
    return O.isSome(opt) ? opt : default_;
  }

  /**
   * Return {@linkcode opt} if it is {@linkcode Some}, or {@linkcode other}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.or(1, 2)); // 1
   * console.log(O.or(None, 2)); // 2
   * ```
   */
  static or<T>(opt: Option<T>, other: Option<T>): Option<T> {
    return O.isSome(opt) ? opt : other;
  }

  /**
   * Return {@linkcode other} if {@linkcode opt} is {@linkcode Some}, or
   * {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.or(1, 2)); // 2
   * console.log(O.or(None, 2)); // None
   * ```
   */
  static and<T, U>(opt: Option<T>, other: Option<U>): Option<U> {
    return O.isNone(opt) ? None : other;
  }
}
