import { None, O, Option, SOME, Some } from "../option/mod.ts";

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

export const I = {
  /** Creates an {@linkcode Iterator} where each iteration calls `f`. */
  fn: <T>(f: Iterator<T>["next"]): Iterator<T> => {
    return {
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
    };
  },

  /** Converts an {@linkcode Iterable} into an {@linkcode Iterator}. */
  iter: <T>(iter: Iterable<T>): Iterator<T> => {
    const iter_ = iter[Symbol.iterator]();
    return I.fn(() => {
      const next = iter_.next();
      return (next.done ? None : Some(next.value));
    });
  },

  /** Creates an {@linkcode Iterator} that yields nothing. */
  empty: (): Iterator<never> => I.fn(() => None),

  /** Creates an {@linkcode Iterator} that yields exactly one item. */
  once: <T>(item: T): Iterator<T> => I.iter([item]),

  /** Creates an {@linkcode Iterator} that endlessly repeats a single item. */
  repeat: <T>(item: T): Iterator<T> => I.fn(() => Some(item)),

  /**
   * Creates an {@linkcode Iterator} where each successive item is computed
   * based on the preceding one.
   */
  successors: <T>(first: Option<T>, f: (_: T) => Option<T>) => {
    let next = first;
    return I.fn(() => {
      if (O.isSome(next)) {
        const item = next;
        next = f(item[SOME]);
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
   */
  zip: <T>(iterA: Iterator<T>, iterB: Iterator<T>): Iterator<[T, T]> => {
    return I.fn(() => {
      const nextA = iterA.next();
      const nextB = iterB.next();
      if (O.isSome(nextA) && O.isSome(nextB)) {
        return Some([O.unwrap(nextA), O.unwrap(nextB)]);
      } else {
        return None;
      }
    });
  },

  /**
   * Creates an {@linkcode Iterator} that will iterate over two other
   * {@linkcode Iterator}s sequentially.
   */
  chain: <T>(iterA: Iterator<T>, iterB: Iterator<T>): Iterator<T> => {
    return I.fn(() => {
      const next = iterA.next();
      if (O.isSome(next)) {
        return next;
      } else {
        return iterB.next();
      }
    });
  },

  /**
   * Creates an {@linkcode Iterator} that maps `f` on each item.
   *
   * Prefer a `for` loop if there are side-effects.
   */
  map: <T, U>(iter: Iterator<T>, f: (_: T) => U): Iterator<U> => {
    return I.fn(() => O.map(iter.next(), f));
  },

  /**
   * Creates an {@linkcode Iterator} which gives the current iteration as well
   * the next value.
   */
  enumerate: <T>(iter: Iterator<T>): Iterator<[number, T]> => {
    let i = 0;
    return I.map(iter, (item) => [i++, item]);
  },

  /** Creates an {@linkcode Iterator} that skips the first `n` items. */
  skip: <T>(iter: Iterator<T>, n: number): Iterator<T> => {
    return I.fn(() => {
      while (n-- > 0) {
        iter.next();
      }
      return iter.next();
    });
  },

  /**
   * Creates an {@linkcode Iterator} that skips items while `f` returns `true`.
   */
  skipWhile: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> => {
    return I.fn(() => {
      let next = iter.next();
      while (O.isSome(next) && f(next[SOME])) {
        next = iter.next();
      }
      return next;
    });
  },

  /** Creates an {@linkcode Iterator} than yields the first `n` items. */
  take: <T>(iter: Iterator<T>, n: number): Iterator<T> => {
    return I.fn(() => {
      if (n-- > 0) {
        return iter.next();
      }
      return None;
    });
  },

  /**
   * Creates an {@linkcode Iterator} than yields items while `f` returns `true`.
   */
  takeWhile: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> => {
    return I.fn(() => {
      const next = iter.next();
      if (O.isSome(next) && f(next[SOME])) {
        return next;
      }
      return None;
    });
  },

  /**
   * Creates an {@linkcode Iterator} that yields items when `f` returns `true`.
   */
  filter: <T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> => {
    return I.fn(() => I.find(iter, f));
  },

  /** Creates an {@linkcode Iterator} that is also {@linkcode Peekable}. */
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
   */
  forEach: <T>(iter: Iterator<T>, f: (_: T) => void): void => {
    while (true) {
      const next = iter.next();
      if (O.isSome(next)) {
        f(next[SOME]);
      } else {
        break;
      }
    }
  },

  /**
   * Consumes an {@linkcode Iterator} and folds every item with the next into an
   * accumulator using  `f`.
   */
  fold: <T, U>(iter: Iterator<T>, init: U, f: (_: U, _1: T) => U): U => {
    let next = init;
    I.forEach(iter, (item) => {
      next = f(next, item);
    });
    return next;
  },

  /** Consumes an {@linkcode Iterator} and returns the number of iterations. */
  count: <T>(iter: Iterator<T>): number => {
    return I.fold(iter, 0, (count, _) => count + 1);
  },

  /** Consumes an {@linkcode Iterator} and returns the last item. */
  last: <T>(iter: Iterator<T>): Option<T> => {
    return I.fold(iter, None as Option<T>, (_, item) => Some(item));
  },

  /** Returns the `n` item from an {@linkcode Iterator}. */
  nth: <T>(iter: Iterator<T>, n: number): Option<T> => {
    return I.skip(iter, n).next();
  },

  /**
   * Returns the first item in an {@linkcode Iterator} that `f` returns `true`
   * for.
   */
  find: <T>(iter: Iterator<T>, f: (_: T) => boolean): Option<T> => {
    let next = iter.next();
    while (O.isSome(next) && !f(next[SOME])) {
      next = iter.next();
    }
    return next;
  },
};

// /**
//  * Consumes the {@linkcode Iterator}, applying `f` to each item and returning
//  * the accumulator.
//  */
// export function fold<T, A>(
//   iter: Iterator<T>,
//   init: A,
//   f: (acc: A, item: T) => A,
// ): A {
//   let next = iter.next();
//   while (isSome(next)) {
//     // SAFETY: checked in the loop condition
//     init = f(init, unwrap(next));
//     next = iter.next();
//   }
//   return init;
// }

// /**
//  * Consumes the {@linkcode Iterator}, counting the number of iterations.
//  *
//  * This will call {@linkcode next} repeatedly until {@linkcode None} is
//  * encountered, returning the number of times it saw {@linkcode Some}.
//  */
// export function count<T>(iter: Iterator<T>): number {
//   return fold(iter, 0, (c) => ++c);
// }

// /** Consumes the {@linkcode Iterator}, returning the last item. */
// export function last<T>(iter: Iterator<T>): Option<T> {
//   return fold(iter, None as Option<T>, (_, item) => Some(item));
// }

// /**
//  * Consumes the {@linkcode Iterator}, checking if every item matches a
//  * predicate.
//  */
// export function all<T>(iter: Iterator<T>, f: (item: T) => boolean): boolean {
//   return fold<T, boolean>(
//     iter,
//     true,
//     (acc, item) => (acc ? acc = f(item) : acc),
//   );
// }

// /**
//  * Consumes the {@linkcode Iterator}, checking if any item matches a
//  * predicate.
//  */
// export function any<T>(iter: Iterator<T>, f: (item: T) => boolean): boolean {
//   return fold<T, boolean>(
//     iter,
//     false,
//     (acc, item) => (!acc ? acc = f(item) : acc),
//   );
// }

// /**
//  * Creates an {@linkcode Iterator} that maps `f` on each item.
//  *
//  * Prefer a `for` loop if there are side-effects.
//  */
// export function map<T, U>(iter: Iterator<T>, f: (item: T) => U): Iterator<U> {
//   return { next: () => mapOption(iter.next(), f) };
// }

// // export function filter<T>(iter: Iterator<T>, f: (item: T) => boolean): Iterator<T> {
// //   return {};
// // }
