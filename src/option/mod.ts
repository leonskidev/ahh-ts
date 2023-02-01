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
   * Returns whether an {@linkcode Option} is a {@linkcode Some}.
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
  static isSome<T>(o: Option<T>): o is Some<T> {
    return o !== undefined && o !== null;
  }

  /**
   * Returns whether an {@linkcode Option} is a {@linkcode None}.
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
  static isNone<T>(o: Option<T>): o is None {
    return o === undefined || o === null;
  }

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * Throws if the {@linkcode Option} is a {@linkcode None} with the provided
   * `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.expect(1, "returns")); // 1
   * O.expect(None, "throws"); // throws
   * ```
   */
  static expect<T>(
    o: Option<T>,
    message: string,
  ): typeof o extends Some<T> ? T : never {
    if (O.isNone(o)) throw Error(message);
    // TODO: why? also fix this
    return o as never;
  }

  /**
   * Returns the contained {@linkcode Some} value.
   *
   * Throws if the {@linkcode Option} is a {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.unwrap(1)); // 1
   * O.unwrap(None); // throws
   * ```
   */
  static unwrap<T>(o: Option<T>): typeof o extends Some<T> ? T : never {
    return O.expect(o, "called `unwrap()` on a `None` value");
  }

  /**
   * Returns the contained {@linkcode Some} value or the provided `default`.
   *
   * ## Examples
   *
   * ```ts
   * import { O, None } from "./mod.ts";
   *
   * console.log(O.unwrapOr(1, 5)); // 1
   * console.log(O.unwrapOr(None, 5)); // 5
   * ```
   */
  static unwrapOr<T>(o: Option<T>, default_: T): T {
    return O.isSome(o) ? o : default_;
  }

  /**
   * Maps the contained {@linkcode Some} value with `f`, otherwise
   * {@linkcode None}.
   *
   * ## Examples
   *
   * ```ts
   * import { O, Some, None } from "./mod.ts";
   *
   * console.log(O.map(1, (i) => i + 1)); // 2
   * console.log(O.map<number, number>(None, (i) => i + 1)); // undefined
   * ```
   */
  static map<T, U>(o: Option<T>, f: (_: T) => U): Option<U> {
    return O.isSome(o) ? f(o) : o;
  }

  /**
   * Returns whether the contained {@linkcode Some} value strictly equals `v`.
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
  static contains<T>(o: Option<T>, v: T): boolean {
    return o === v;
  }
}
