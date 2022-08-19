import { None, Option, Some } from "../option/mod.ts";

/** Represents an {@linkcode Either} that is left-handed. */
export type Left<E> = Readonly<{ left: E }>;
/** Represents an {@linkcode Either} that is right-handed. */
export type Right<T> = Readonly<{ right: T }>;
/**
 * Represents a value that is either left-handed ({@linkcode Left}) or
 * right-handed ({@linkcode Right}).
 */
export type Either<L, R> = Left<L> | Right<R>;

export function Left<L, R>(v: L): Either<L, R> {
  return Object.defineProperties({ left: v }, {
    toString: { value: (): string => `Left(${v})` },
  });
}

export function Right<L, R>(v: R): Either<L, R> {
  return Object.defineProperties({ right: v }, {
    toString: { value: (): string => `Right(${v})` },
  });
}

/** Functionality for {@linkcode Either}. */
export const E = {
  /**
   * Returns whether an {@linkcode Either} is a {@linkcode Left}.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assert(E.isLeft(Left(1)));
   * assert(!E.isLeft(Right(0)));
   * ```
   */
  isLeft: <L, R>(e: Either<L, R>): e is Left<L> => Object.hasOwn(e, "left"),

  /**
   * Returns whether an {@linkcode Either} is a {@linkcode Right}.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assert(!E.isRight(Left(1)));
   * assert(E.isRight(Right(0)));
   * ```
   */
  isRight: <L, R>(e: Either<L, R>): e is Right<R> => Object.hasOwn(e, "right"),

  /**
   * Returns the contained {@linkcode Left} value.
   *
   * Throws if the {@linkcode Either} is a {@linkcode Left} with the provided
   * `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.expectLeft(Left(1), "fine"), 1);
   * assertThrows(E.expectLeft(Right(0), "whoops"));
   * ```
   */
  expectLeft: <L, R>(
    e: Either<L, R>,
    message: string,
  ): (typeof e) extends Left<L> ? never : L => {
    if (E.isLeft(e)) return e.left;
    throw Error(message);
  },

  /**
   * Returns the contained {@linkcode Right} value.
   *
   * Throws if the {@linkcode Either} is a {@linkcode Right} with the provided
   * `message`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertThrows(E.expectRight(Left(1), "whoops"));
   * assertEquals(E.expectRight(Right(0), "fine"), 0);
   * ```
   */
  expectRight: <L, R>(
    e: Either<L, R>,
    message: string,
  ): (typeof e) extends Right<R> ? never : R => {
    if (E.isRight(e)) return e.right;
    throw Error(message);
  },

  /**
   * Returns the contained {@linkcode Left} value.
   *
   * Throws if the {@linkcode Either} is a {@linkcode Left}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.unwrapLeft(Left(1)), 1);
   * assertThrows(E.unwrapLeft(Right(0)));
   * ```
   */
  unwrapLeft: <L, R>(
    e: Either<L, R>,
  ): (typeof e) extends Left<L> ? never : L =>
    E.expectLeft(
      e,
      `called \`unwrapLeft()\` on a \`Right\` value: ${(e as Right<R>).right}`,
    ),

  /**
   * Returns the contained {@linkcode Right} value.
   *
   * Throws if the {@linkcode Either} is a {@linkcode Right}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals, assertThrows } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertThrows(E.unwrapRight(Left(1)));
   * assertEquals(E.unwrapRight(Right(0)), 0);
   * ```
   */
  unwrapRight: <L, R>(
    e: Either<L, R>,
  ): (typeof e) extends Right<R> ? never : R =>
    E.expectRight(
      e,
      `called \`unwrapRight()\` on a \`Left\` value: ${(e as Left<L>).left}`,
    ),

  /**
   * Maps the contained {@linkcode Either} value with `f`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.map(Left<number, number>(1), (i) => i + 1), Left(2));
   * assertEquals(E.map(Right<number, number>(0), (i) => i + 1), Right(1));
   * ```
   */
  map: <L, U>(e: Either<L, L>, f: (_: L) => U): Either<U, U> =>
    E.isLeft(e) ? Left(f(e.left)) : Right(f(e.right)),

  /**
   * Maps the contained {@linkcode Left} value with `f`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.mapLeft(Left(1), (i) => i + 1), Left(2));
   * assertEquals(E.mapLeft(Right<number, number>(0), (i) => i + 1), Right(0));
   * ```
   */
  mapLeft: <L, R, U>(e: Either<L, R>, f: (_: L) => U): Either<U, R> =>
    E.isLeft(e) ? Left(f(e.left)) : e,

  /**
   * Maps the contained {@linkcode Right} value with `f`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.mapRight(Left<number, number>(1), (i) => i + 1), Left(1));
   * assertEquals(E.mapRight(Right(0), (i) => i + 1), Right(1));
   * ```
   */
  mapRight: <L, R, U>(e: Either<L, R>, f: (_: R) => U): Either<L, U> =>
    E.isRight(e) ? Right(f(e.right)) : e,

  /**
   * Applies either `f` or `g` depending of the handedness of
   * {@linkcode Either}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.either(Left<number, number>(1), (i) => i + 1, (i) => i - 1), Left(2));
   * assertEquals(E.either(Right<number, number>(1), (i) => i + 1, (i) => i - 1), Right(0));
   * ```
   */
  either: <L, R, U>(e: Either<L, R>, f: (_: L) => U, g: (_: R) => U): U =>
    E.isLeft(e) ? f(e.left) : g(e.right),

  /**
   * Returns whether the contained {@linkcode Either} value strictly equals
   * `cmp`.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assert(E.contains(Left<number, number>(1), 1));
   * assert(E.contains(Right<number, number>(1), 1));
   * ```
   */
  contains: <L>(e: Either<L, L>, cmp: L): boolean =>
    E.isLeft(e) ? e.left === cmp : e.right === cmp,

  /**
   * Returns whether the contained {@linkcode Left} value strictly equals `cmp`.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assert(E.containsLeft(Left(1), 1));
   * assert(!E.containsLeft(Right(1), 1));
   * ```
   */
  containsLeft: <L, R>(e: Either<L, R>, cmp: L): boolean =>
    E.isLeft(e) ? e.left === cmp : false,

  /**
   * Returns whether the contained {@linkcode Right} value strictly equals
   * `cmp`.
   *
   * ## Examples
   *
   * ```ts
   * import { assert } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assert(!E.containsLeft(Left(1), 1));
   * assert(E.containsLeft(Right(1), 1));
   * ```
   */
  containsRight: <L, R>(e: Either<L, R>, cmp: R): boolean =>
    E.isRight(e) ? e.right === cmp : false,

  /**
   * Returns the contained {@linkcode Either} value of a {@linkcode Left}, or
   * returns {@linkcode Right}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.flattenLeft(Left(Left(1))), Left(1));
   * assertEquals(E.flattenLeft(Left(Right(0))), Right(0));
   * ```
   */
  flattenLeft: <L, R>(e: Either<Either<L, R>, R>) => E.isLeft(e) ? e.left : e,

  /**
   * Returns the contained {@linkcode Either} value of a {@linkcode Right}, or
   * returns {@linkcode Left}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.flattenRight(Right(Right(0))), Right(0));
   * assertEquals(E.flattenRight(Right(Left(1))), Left(1));
   * ```
   */
  flattenRight: <L, R>(e: Either<L, Either<L, R>>) =>
    E.isRight(e) ? e.right : e,

  /**
   * Returns the contained {@linkcode Left} value, but never throws.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left } from "../../mod.ts";
   *
   * assertEquals(E.intoLeft(Left(1)), 1);
   * ```
   */
  intoLeft: <L>(e: Either<L, never>): L => (e as Left<L>).left,

  /**
   * Returns the contained {@linkcode Right} value, but never throws.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Right } from "../../mod.ts";
   *
   * assertEquals(E.intoRight(Right(1)), 1);
   * ```
   */
  intoRight: <R>(e: Either<never, R>): R => (e as Right<R>).right,

  /**
   * Converts a {@linkcode Left} into an {@linkcode Option}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right, Some, None } from "../../mod.ts";
   *
   * assertEquals(E.left(Left(1)), Some(1));
   * assertEquals(E.left(Right(0)), None);
   * ```
   */
  left: <L, R>(e: Either<L, R>): Option<L> => E.isLeft(e) ? Some(e.left) : None,

  /**
   * Converts a {@linkcode Right} into an {@linkcode Option}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right, Some, None } from "../../mod.ts";
   *
   * assertEquals(E.right(Left(1)), None);
   * assertEquals(E.right(Right(0)), Some(0));
   * ```
   */
  right: <L, R>(e: Either<L, R>): Option<R> =>
    E.isRight(e) ? Some(e.right) : None,

  /**
   * Converts an {@linkcode Either} of `<L, R>` to `<R, L>`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { E, Left, Right } from "../../mod.ts";
   *
   * assertEquals(E.flip(Left(1)), Right(1));
   * assertEquals(E.flip(Right(0)), Left(0));
   * ```
   */
  flip: <L, R>(e: Either<L, R>): Either<R, L> =>
    E.isLeft(e) ? Right(e.left) : Left(e.right),
};
