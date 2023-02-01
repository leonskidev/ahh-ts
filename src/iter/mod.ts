// NOTE: we need this to keep `Some` in scope for documentation
// deno-lint-ignore no-unused-vars
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
} & Iterator<T>;

/** Functionality for {@linkcode Iterator}. */
export const I = {
  /**
   * Creates an {@linkcode Iterator} where each iteration calls `f`.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.fn(() => 1);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 1
   * // ...
   * ```
   */
  fn: <T>(f: Iterator<T>["next"]): Iterator<T> => ({
    next: f,
    [Symbol.iterator](): globalThis.Iterator<T> {
      return {
        next: () => {
          const next = this.next();
          return {
            done: O.isNone(next) as true,
            value: next,
          };
        },
      };
    },
  }),

  /**
   * Creates an {@linkcode Iterator} from an {@linkcode Iterable}.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2]);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // undefined
   * ```
   */
  iter: <T>(iter: Iterable<T>): Iterator<T> => {
    const iter_ = iter[Symbol.iterator]();
    return I.fn(() => {
      const next = iter_.next();
      return next.done ? None : next.value;
    });
  },

  /**
   * Creates an {@linkcode Iterator} that returns nothing.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.empty();
   *
   * console.log(iter.next()); // undefined
   * console.log(iter.next()); // undefined
   * ```
   */
  empty: <T>(): Iterator<T> => I.fn(() => None as T),

  /**
   * Creates an {@linkcode Iterator} that returns exactly one item.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.once(1);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // undefined
   * ```
   */
  once: <T>(item: T): Iterator<T> => I.iter([item]),

  /**
   * Creates an {@linkcode Iterator} that endlessly returns an item.
   *
   * ## Example
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.repeat(1);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 1
   * ```
   */
  repeat: <T>(item: T): Iterator<T> => I.fn(() => item),

  /**
   * Creates an {@linkcode Iterator} where each successive item is computed from
   * the preceding one.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.successors(0, (i) => i + 1);
   *
   * console.log(iter.next()); // 0
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * ```
   */
  successors: <T>(first: Option<T>, f: (_: T) => Option<T>) => {
    let next = first;
    return I.fn(() => {
      if (O.isSome(next)) {
        const item = next;
        next = f(item);
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
   * import { I } from "./mod.ts"
   *
   * const iter = I.zip(I.iter([1, 2]), I.iter(["3", "4", "5"]));
   *
   * console.log(iter.next()); // [1, "3"]
   * console.log(iter.next()); // [2, "4"]
   * console.log(iter.next()); // undefined
   * ```
   */
  zip: <T, U>(iterA: Iterator<T>, iterB: Iterator<U>): Iterator<[T, U]> =>
    I.fn(() => {
      const nextA = iterA.next();
      const nextB = iterB.next();
      return O.isSome(nextA) && O.isSome(nextB) ? [nextA, nextB] : None;
    }),

  /**
   * Creates an {@linkcode Iterator} that will iterate over two other
   * {@linkcode Iterator}s sequentially.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.chain(I.iter([1, 2]), I.once(3));
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  chain: <T>(iterA: Iterator<T>, iterB: Iterator<T>): Iterator<T> =>
    I.fn(() => {
      const next = iterA.next();
      return O.isSome(next) ? next : iterB.next();
    }),

  /**
   * Creates an {@linkcode Iterator} that calls `f` on each item.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.map(I.iter([1, 2, 3]), (i) => i * i);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 4
   * console.log(iter.next()); // 9
   * console.log(iter.next()); // undefined
   * ```
   */
  map: <T, U>(iter: Iterator<T>, f: (_: T) => U): Iterator<U> =>
    I.fn(() => O.map(iter.next(), f)),

  /**
   * Creates an {@linkcode Iterator} which returns the current iteration as well
   * as the next value.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.enumerate(I.iter(["hello", "there", "world"]));
   *
   * console.log(iter.next()); // [0, "hello"]
   * console.log(iter.next()); // [1, "there"]
   * console.log(iter.next()); // [2, "world"]
   * console.log(iter.next()); // undefined
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
   * import { I } from "./mod.ts";
   *
   * const iter = I.skip(I.iter([1, 2, 3]), 1);
   *
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  skip: <T>(iter: Iterator<T>, n: number): Iterator<T> => {
    while (n-- > 0) iter.next();
    return iter;
  },

  /**
   * Creates an {@linkcode Iterator} that skips items while `f` return `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.skipWhile(I.iter([1, 3, 2, 3]), (i) => i % 2 !== 0);
   *
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  skipWhile: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> => {
    let next = iter.next();
    while (O.isSome(next) && f(next)) next = iter.next();
    return O.isSome(next) ? I.chain(I.once(next), iter) : iter;
  },

  /**
   * Creates an {@linkcode Iterator} that returns the first `n` items.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.take(I.iter([1, 2, 3]), 2);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // undefined
   * ```
   */
  take: <T>(iter: Iterator<T>, n: number): Iterator<T> =>
    I.fn(() => n-- > 0 ? iter.next() : None),

  /**
   * Creates an {@linkcode Iterator} that returns items while `f` returns
   * `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.takeWhile(I.iter([4, 2, 3, 4]), (i) => i % 2 === 0);
   *
   * console.log(iter.next()); // 4
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // undefined
   * console.log(iter.next()); // undefined
   * ```
   */
  takeWhile: <T>(iter: Iterator<T>, f: (_: T) => boolean) => {
    let done = false;
    return I.fn(() => {
      const next = iter.next();
      if (!done && O.isSome(next) && f(next)) return next;
      done = true;
      return None;
    });
  },

  /**
   * Creates an {@linkcode Iterator} that is {@linkcode Peekable}.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.peekable(I.iter([1, 2, 3]));
   *
   * console.log(iter.next()); // 1
   * console.log(iter.peek()); // 2
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.peek()); // undefined
   * console.log(iter.next()); // undefined
   * ```
   */
  peekable: <T>(iter: Iterator<T>): Peekable<T> => {
    let peeked: Option<T> = None;
    return {
      ...I.fn(() => {
        if (O.isSome(peeked)) {
          const tmp = peeked;
          peeked = None;
          return tmp;
        }
        return iter.next();
      }),
      peek: () => {
        if (O.isNone(peeked)) {
          peeked = iter.next();
        }
        return peeked;
      },
    };
  },

  /**
   * Consumes an {@linkcode Iterator} and runs `f` on each item.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * I.forEach(iter, (i) => console.log(i));
   * console.log(iter.next()); // undefined
   * ```
   */
  forEach: <T>(iter: Iterator<T>, f: (_: T) => void): void => {
    while (true) {
      const next = iter.next();
      if (O.isNone(next)) break;
      f(next);
    }
  },

  /**
   * Consumes an {@linkcode Iterator} and folds every item into an accumulator
   * using `f`.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(I.fold(iter, 0, (a, b) => a + b)); // 6
   * console.log(iter.next()); // undefined
   * ```
   */
  fold: <T, U>(iter: Iterator<T>, init: U, f: (_: U, _1: T) => U): U => {
    let next = init;
    I.forEach(iter, (item) => next = f(next, item));
    return next;
  },

  /**
   * Consumes an {@linkcode Iterator} and returns the number of iterations.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter(["hello", "there", "world"]);
   *
   * console.log(I.count(iter)); // 3
   * console.log(iter.next()); // undefined
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
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(I.last(iter)); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  last: <T>(iter: Iterator<T>): Option<T> =>
    I.fold(iter, None as Option<T>, (_, item) => item),

  /**
   * Consumes an {@linkcode Iterator} up to `n` and returns the item.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(I.nth(iter, 1)); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  nth: <T>(iter: Iterator<T>, n: number): Option<T> => I.skip(iter, n).next(),

  /**
   * Consumes an {@linkcode Iterator} until `f` returns `true` and returns the
   * item.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(I.find(iter, (i) => i > 1)); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  find: <T>(iter: Iterator<T>, f: (_: T) => boolean): Option<T> => {
    let next = iter.next();
    while (O.isSome(next) && !f(next)) next = iter.next();
    return next;
  },

  /**
   * Creates an {@linkcode Iterator} that returns items when `f` returns `true`.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.filter(I.iter([1, 2, 3, 4]), (i) => i % 2 === 0);
   *
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 4
   * console.log(iter.next()); // undefined
   * ```
   */
  filter: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> =>
    I.fn(() => I.find(iter, f)),

  /**
   * Creates an {@linkcode Iterator} that flattens a layer of nested
   * {@linkcode Iterator}s.
   *
   * ## Examples
   *
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.flatten(I.iter([I.once(1), I.empty(), I.iter([2, 3])]));
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  flatten: <T>(iter: Iterator<Iterator<T>>): Iterator<T> =>
    I.fold(
      iter,
      O.unwrapOr(iter.next(), I.empty()),
      (iterA, iterB) => I.chain(iterA, iterB),
    ),
};
