import { None, O, Option, Some } from "../option/mod.ts";

/** An interface for dealing with iterators. */
export type Iterator<T> = {
  /**
   * Advances the iterator and returns the next item.
   *
   * Normally returns {@linkcode None} when iteration has finished, although
   * implementations may start returning {@linkcode Some} again at some point.
   */
  next: () => Option<T>;
} & Iterable<T>;

/** An {@linkcode Iterator} that can peek the next item. */
export type Peekable<T> = {
  /**
   * Returns the {@linkcode Iterator.next} item without advancing the
   * {@linkcode Iterator}.
   */
  peek: () => Option<T>;
};

/** Functionality for {@linkcode Iterator}. */
export const I = {
  /**
   * Creates an {@linkcode Iterator} where each iteration calls `f`.
   *
   * ## Examples
   *
   * Let's re-implement {@linkcode I.repeat} over `1`:
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some } from "../../mod.ts";
   *
   * const iter = I.fn(() => Some(1));
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), Some(1));
   * // ...
   * ```
   */
  fn: <T>(f: Iterator<T>["next"]): Iterator<T> => ({
    next: () => f(),
    [Symbol.iterator](): globalThis.Iterator<T> {
      return {
        next: () => {
          const next = this.next();
          return {
            done: O.isNone(next),
            value: O.unwrapOr(next, undefined!),
          };
        },
      };
    },
  }),

  /**
   * Converts an {@linkcode Iterable} into an {@linkcode Iterator}.
   *
   * ## Examples
   *
   * Let's re-implement {@linkcode I.once} over `1`:
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.iter([1]);
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), None);
   * ```
   */
  iter: <T>(iter: Iterable<T>): Iterator<T> => {
    const iter_ = iter[Symbol.iterator]();
    return I.fn(() => {
      const next = iter_.next();
      return (next.done ? None : Some(next.value));
    });
  },

  /**
   * Creates an {@linkcode Iterator} that yields nothing.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, None } from "../../mod.ts";
   *
   * const iter = I.empty();
   *
   * assertEquals(iter.next(), None);
   * ```
   */
  empty: (): Iterator<never> => I.fn(() => None),

  /**
   * Creates an {@linkcode Iterator} that yields exactly one item.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.once(1);
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), None);
   * ```
   */
  once: <T>(item: T): Iterator<T> => I.iter([item]),

  /**
   * Creates an {@linkcode Iterator} that endlessly repeats a single item.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some } from "../../mod.ts";
   *
   * const iter = I.repeat(1);
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), Some(1));
   * // ...
   * ```
   */
  repeat: <T>(item: T): Iterator<T> => I.fn(() => Some(item)),

  /**
   * Creates an {@linkcode Iterator} where each successive item is computed
   * based on the preceding one.
   *
   * ## Examples
   *
   * Let's implement a counter from `0`:
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some } from "../../mod.ts";
   *
   * const iter = I.successors(Some(0), (i) => Some(i + 1));
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), Some(3));
   * // ...
   * ```
   */
  successors: <T>(first: Option<T>, f: (_: T) => Option<T>) => {
    let next = first;
    return I.fn(() => {
      if (O.isSome(next)) {
        const item = next;
        next = f(item.some);
        return item;
      } else {
        return None;
      }
    });
  },

  /**
   * Creates an {@linkcode Iterator} that will iterate over two other
   * {@linkcode Iterator}s simultaneously.
   *
   * If either {@linkcode Iterator} returns {@linkcode None}, so will this
   * {@linkcode Iterator}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.zip(I.iter([1, 2]), I.iter([3, 4]));
   *
   * assertEquals(iter.next(), Some([1, 3]));
   * assertEquals(iter.next(), Some([2, 4]));
   * assertEquals(iter.next(), None);
   * ```
   */
  zip: <T>(iterA: Iterator<T>, iterB: Iterator<T>): Iterator<[T, T]> =>
    I.fn(() => {
      const nextA = iterA.next();
      const nextB = iterB.next();
      if (O.isSome(nextA) && O.isSome(nextB)) {
        return Some([O.unwrap(nextA), O.unwrap(nextB)]);
      } else {
        return None;
      }
    }),

  /**
   * Creates an {@linkcode Iterator} that will iterate over two other
   * {@linkcode Iterator}s sequentially.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.chain(I.iter([1, 2]), I.iter([3, 4]));
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), Some(3));
   * assertEquals(iter.next(), Some(4));
   * assertEquals(iter.next(), None);
   * ```
   */
  chain: <T>(iterA: Iterator<T>, iterB: Iterator<T>): Iterator<T> =>
    I.fn(() => {
      const next = iterA.next();
      if (O.isSome(next)) {
        return next;
      } else {
        return iterB.next();
      }
    }),

  /**
   * Creates an {@linkcode Iterator} that maps `f` on each item.
   *
   * Prefer a `for` loop if there are side-effects.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.map(I.iter([1, 2, 3]), (i) => i * 2);
   *
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), Some(4));
   * assertEquals(iter.next(), Some(6));
   * assertEquals(iter.next(), None);
   * ```
   */
  map: <T, U>(iter: Iterator<T>, f: (_: T) => U): Iterator<U> =>
    I.fn(() => O.map(iter.next(), f)),

  /**
   * Creates an {@linkcode Iterator} which gives the current iteration as well
   * the next value.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.enumerate(I.iter([1, 2, 3]));
   *
   * assertEquals(iter.next(), Some([0, 2]));
   * assertEquals(iter.next(), Some([1, 4]));
   * assertEquals(iter.next(), Some([2, 6]));
   * assertEquals(iter.next(), None);
   * ```
   */
  enumerate: <T>(iter: Iterator<T>): Iterator<[number, T]> => {
    let i = 0;
    return I.map(iter, (item) => [i++, item]);
  },

  /**
   * Creates an {@linkcode Iterator} that skips the first `n` items.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.skip(I.iter([1, 2, 3]), 1);
   *
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), Some(3));
   * assertEquals(iter.next(), None);
   * ```
   */
  skip: <T>(iter: Iterator<T>, n: number): Iterator<T> =>
    I.fn(() => {
      while (n-- > 0) {
        iter.next();
      }
      return iter.next();
    }),

  /**
   * Creates an {@linkcode Iterator} that skips items while `f` returns `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.skipWhile(I.iter([1, 2, 3]), (i) => i % 2 === 0);
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), Some(3));
   * assertEquals(iter.next(), None);
   * ```
   */
  skipWhile: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> =>
    I.fn(() => {
      let next = iter.next();
      while (O.isSome(next) && f(next.some)) {
        next = iter.next();
      }
      return next;
    }),

  /**
   * Creates an {@linkcode Iterator} than yields the first `n` items.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.take(I.iter([1, 2, 3]), 2);
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), None);
   * ```
   */
  take: <T>(iter: Iterator<T>, n: number): Iterator<T> =>
    I.fn(() => {
      if (n-- > 0) {
        return iter.next();
      }
      return None;
    }),

  /**
   * Creates an {@linkcode Iterator} than yields items while `f` returns `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.takeWhile(I.iter([1, 2, 3]), (i) => i % 2 === 0);
   *
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), None);
   * ```
   */
  takeWhile: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> =>
    I.fn(() => {
      const next = iter.next();
      if (O.isSome(next) && f(next.some)) {
        return next;
      }
      return None;
    }),

  /**
   * Creates an {@linkcode Iterator} that yields items when `f` returns `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.filter(I.iter([1, 2, 3]), (i) => i < 1);
   *
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), Some(3));
   * assertEquals(iter.next(), None);
   * ```
   */
  filter: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> =>
    I.fn(() => I.find(iter, f)),

  /**
   * Creates an {@linkcode Iterator} that is also {@linkcode Peekable}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.peekable(I.iter([1, 2, 3]));
   *
   * assertEquals(iter.next(), Some(1));
   * assertEquals(iter.peek(), Some(2));
   * assertEquals(iter.next(), Some(2));
   * assertEquals(iter.next(), Some(3));
   * assertEquals(iter.next(), None);
   * ```
   */
  peekable: <T>(iter: Iterator<T>): Iterator<T> & Peekable<T> => {
    let peeked: Option<T> = None;
    return {
      next: () => {
        if (O.isSome(peeked)) {
          const tmp = peeked;
          peeked = None;
          return tmp;
        } else {
          return iter.next();
        }
      },
      peek: () => {
        if (O.isSome(peeked)) {
          return peeked;
        } else {
          peeked = iter.next();
          return peeked;
        }
      },
      [Symbol.iterator](): globalThis.Iterator<T> {
        return {
          next: () => {
            const next = this.next();
            return {
              done: O.isNone(next),
              value: O.unwrapOr(next, undefined!),
            };
          },
        };
      },
    };
  },

  /**
   * Consumes an {@linkcode Iterator} and runs `f` on each item.
   *
   * Prefer a `for` loop if there are side-effects.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I } from "../../mod.ts";
   *
   * let j = 1;
   *
   * I.forEach(I.iter([1, 2, 3]), (i) => {
   *   assertEquals(i, j++);
   * });
   * ```
   */
  forEach: <T>(iter: Iterator<T>, f: (_: T) => void): void => {
    while (true) {
      const next = iter.next();
      if (O.isSome(next)) {
        f(next.some);
      } else {
        break;
      }
    }
  },

  /**
   * Consumes an {@linkcode Iterator} and folds every item with the next into an
   * accumulator using  `f`.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I } from "../../mod.ts";
   *
   * const i = I.fold(I.iter([1, 2, 3]), 0, (a, i) => a + i);
   *
   * assertEquals(i, 6);
   * ```
   */
  fold: <T, U>(iter: Iterator<T>, init: U, f: (_: U, _1: T) => U): U => {
    let next = init;
    I.forEach(iter, (item) => {
      next = f(next, item);
    });
    return next;
  },

  /**
   * Consumes an {@linkcode Iterator} and returns the number of iterations.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I } from "../../mod.ts";
   *
   * const i = I.count(I.iter([1, 2, 3]));
   *
   * assertEquals(i, 3);
   * ```
   */
  count: <T>(iter: Iterator<T>): number =>
    I.fold(iter, 0, (count, _) => count + 1),

  /**
   * Consumes an {@linkcode Iterator} and returns the last item.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const i = I.last(I.iter([1, 2, 3]));
   *
   * assertEquals(i, Some(3));
   * ```
   */
  last: <T>(iter: Iterator<T>): Option<T> =>
    I.fold(iter, None as Option<T>, (_, item) => Some(item)),

  /**
   * Returns the `n` item from an {@linkcode Iterator}.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const iter = I.iter([1, 2, 3, 4]);
   *
   * assertEquals(I.nth(iter, 0), Some(1));
   * assertEquals(I.nth(iter, 0), Some(2));
   * assertEquals(I.nth(iter, 1), Some(4));
   * assertEquals(I.nth(iter, 0), None);
   * ```
   */
  nth: <T>(iter: Iterator<T>, n: number): Option<T> => I.skip(iter, n).next(),

  /**
   * Returns the first item in an {@linkcode Iterator} that `f` returns `true`
   * for.
   *
   * ## Examples
   *
   * ```ts
   * import { assertEquals } from "../../test_deps.ts";
   * import { I, Some, None } from "../../mod.ts";
   *
   * const i = I.find(I.iter([1, 2, 3, 4]), (i) => i % 2 === 0);
   *
   * assertEquals(i, Some(2));
   * ```
   */
  find: <T>(iter: Iterator<T>, f: (_: T) => boolean): Option<T> => {
    let next = iter.next();
    while (O.isSome(next) && !f(next.some)) {
      next = iter.next();
    }
    return next;
  },
};
