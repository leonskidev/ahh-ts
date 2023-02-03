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
  next(): Option<T>;
} & Iterable<T>;

/** An {@linkcode Iterator} that can peek the next item. */
export type Peekable<T> = {
  /**
   * Returns the {@linkcode Iterator.next} item without advancing the
   * {@linkcode Iterator}.
   */
  peek(): Option<T>;
} & Iterator<T>;

/** Functionality for {@linkcode Iterator}. */
export class I {
  /**
   * Creates an {@linkcode Iterator} where each iteration calls `f`.
   *
   * @example
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
  static fn<T>(f: Iterator<T>["next"]): Iterator<T> {
    return {
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
    };
  }

  /**
   * Creates an {@linkcode Iterator} from an {@linkcode Iterable}.
   *
   * @example
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
  static iter<T>(iter: Iterable<T>): Iterator<T> {
    const iter_ = iter[Symbol.iterator]();
    return I.fn(() => {
      const next = iter_.next();
      return next.done ? None : next.value;
    });
  }

  /**
   * Creates an {@linkcode Iterator} that yields nothing.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.empty();
   *
   * console.log(iter.next()); // undefined
   * console.log(iter.next()); // undefined
   * ```
   */
  static empty<T>(): Iterator<T> {
    return I.fn(() => None as T);
  }

  /**
   * Creates an {@linkcode Iterator} that yields exactly one item.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.once(1);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // undefined
   * ```
   */
  static once<T>(item: T): Iterator<T> {
    return I.iter([item]);
  }

  /**
   * Creates an {@linkcode Iterator} that endlessly yields an item.
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
  static repeat<T>(item: T): Iterator<T> {
    return I.fn(() => item);
  }

  /**
   * Creates an {@linkcode Iterator} where each successive item is computed from
   * the preceding one.
   *
   * @example
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
  static successors<T>(first: Option<T>, f: (_: T) => Option<T>) {
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
  }

  /**
   * Creates an {@linkcode Iterator} that iterates over two other
   * {@linkcode Iterator}s simultaneously.
   *
   * If either {@linkcode Iterator} returns {@linkcode None}, so will this
   * {@linkcode Iterator}.
   *
   * @example
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
  static zip<T, U>(iterA: Iterator<T>, iterB: Iterator<U>): Iterator<[T, U]> {
    return I.fn(() => {
      const nextA = iterA.next();
      const nextB = iterB.next();
      return O.isSome(nextA) && O.isSome(nextB) ? [nextA, nextB] : None;
    });
  }

  /**
   * Creates an {@linkcode Iterator} that iterates over two other
   * {@linkcode Iterator}s sequentially.
   *
   * @example
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
  static chain<T>(iterA: Iterator<T>, iterB: Iterator<T>): Iterator<T> {
    return I.fn(() => {
      const next = iterA.next();
      return O.isSome(next) ? next : iterB.next();
    });
  }

  /**
   * Creates an {@linkcode Iterator} that calls `f` on each item and yeilds the
   * original item.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.inspect(I.iter([1, 2, 3]), (i) => i * i);
   *
   * console.log(iter.next()); // 1
   * console.log(iter.next()); // 2
   * console.log(iter.next()); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  static inspect<T>(iter: Iterator<T>, f: (_: T) => unknown): Iterator<T> {
    return I.fn(() => O.inspect(iter.next(), f));
  }

  /**
   * Creates an {@linkcode Iterator} that calls `f` on each item and yeilds the
   * result.
   *
   * @example
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
  static map<T, U>(iter: Iterator<T>, f: (_: T) => U): Iterator<U> {
    return I.fn(() => O.map(iter.next(), f));
  }

  /**
   * Creates an {@linkcode Iterator} which yields the current iteration as well
   * as the next value.
   *
   * @example
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
  static enumerate<T>(iter: Iterator<T>): Iterator<[number, T]> {
    let i = 0;
    return I.map(iter, (item) => [i++, item]);
  }

  /**
   * Creates an {@linkcode Iterator} that skips the first `n` items.
   *
   * @example
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
  static skip<T>(iter: Iterator<T>, n: number): Iterator<T> {
    while (n-- > 0) iter.next();
    return iter;
  }

  /**
   * Creates an {@linkcode Iterator} that skips items while `f` returns `true`.
   *
   * @example
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
  static skipWhile<T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> {
    let next = iter.next();
    while (O.isSome(next) && f(next)) next = iter.next();
    return O.isSome(next) ? I.chain(I.once(next), iter) : iter;
  }

  /**
   * Creates an {@linkcode Iterator} that yields the first `n` items.
   *
   * @example
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
  static take<T>(iter: Iterator<T>, n: number): Iterator<T> {
    return I.fn(() => n-- > 0 ? iter.next() : None);
  }

  /**
   * Creates an {@linkcode Iterator} that yields items while `f` returns `true`.
   *
   * @example
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
  static takeWhile<T>(iter: Iterator<T>, f: (_: T) => boolean) {
    let done = false;
    return I.fn(() => {
      const next = iter.next();
      if (!done && O.isSome(next) && f(next)) return next;
      done = true;
      return None;
    });
  }

  /**
   * Creates an {@linkcode Iterator} that is {@linkcode Peekable}.
   *
   * @example
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
  static peekable<T>(iter: Iterator<T>): Peekable<T> {
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
  }

  /**
   * Consumes an {@linkcode Iterator} and calls `f` on each item.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * I.forEach(iter, (i) => console.log(i));
   * console.log(iter.next()); // undefined
   * ```
   */
  static forEach<T>(iter: Iterator<T>, f: (_: T) => void): void {
    while (true) {
      const next = iter.next();
      if (O.isNone(next)) break;
      f(next);
    }
  }

  /**
   * Consumes an {@linkcode Iterator} and calls `f` on each item to fold it into
   * `init`.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(I.fold(iter, 0, (a, b) => a + b)); // 6
   * console.log(iter.next()); // undefined
   * ```
   */
  static fold<T, U>(iter: Iterator<T>, init: U, f: (_: U, _1: T) => U): U {
    let next = init;
    I.forEach(iter, (item) => next = f(next, item));
    return next;
  }

  /**
   * Consumes an {@linkcode Iterator} and returns the number of iterations.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter(["hello", "there", "world"]);
   *
   * console.log(I.count(iter)); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  static count<T>(iter: Iterator<T>): number {
    return I.fold(iter, 0, (count, _) => count + 1);
  }

  /**
   * Consumes an {@linkcode Iterator} and returns the last item.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(I.last(iter)); // 3
   * console.log(iter.next()); // undefined
   * ```
   */
  static last<T>(iter: Iterator<T>): Option<T> {
    return I.fold(iter, None as Option<T>, (_, item) => item);
  }

  /**
   * Consumes an {@linkcode Iterator} up to `n` and returns the item.
   *
   * @example
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
  static nth<T>(iter: Iterator<T>, n: number): Option<T> {
    return I.skip(iter, n).next();
  }

  /**
   * Consumes an {@linkcode Iterator} until `f` returns `true` and returns the
   * item.
   *
   * @example
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
  static find<T>(iter: Iterator<T>, f: (_: T) => boolean): Option<T> {
    let next = iter.next();
    while (O.isSome(next) && !f(next)) next = iter.next();
    return next;
  }

  /**
   * Creates an {@linkcode Iterator} that returns items when `f` returns `true`.
   *
   * @example
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
  static filter<T>(iter: Iterator<T>, f: (_: T) => boolean): Iterator<T> {
    return I.fn(() => I.find(iter, f));
  }

  /**
   * Creates an {@linkcode Iterator} that flattens a layer of nested
   * {@linkcode Iterator}s.
   *
   * @example
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
  static flatten<T>(iter: Iterator<Iterator<T>>): Iterator<T> {
    return I.fold(
      iter,
      O.unwrapOr(iter.next(), I.empty()),
      (iterA, iterB) => I.chain(iterA, iterB),
    );
  }

  // /**
  //  * Consumes an {@linkcode Iterator} until `f` returns `false`, and returns
  //  * `true` if it does not.
  //  *
  //  * @example
  //  * ```ts
  //  * import { I } from "./mod.ts";
  //  *
  //  * const iter = I.iter([2, 4, 6]);
  //  *
  //  * console.log(I.all(iter, (i) => i > 0)); // true
  //  * console.log(I.all(iter, (i) => i > 4)); // false
  //  * ```
  //  */
  // static all<T>(iter: Iterator<T>, f: (_: T) => boolean): boolean {
  //   return O.isNone(I.find(iter, (i) => !f(i)));
  // }

  /**
   * Consumes an {@linkcode Iterator} until `f` returns `true`, and returns
   * `true` if it does.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.iter([2, 4, 6]);
   *
   * console.log(I.any(iter, (i) => i > 4)); // true
   * console.log(I.any(iter, (i) => i > 6)); // false
   * ```
   */
  static any<T>(iter: Iterator<T>, f: (_: T) => boolean): boolean {
    return O.isSome(I.find(iter, f));
  }

  /**
   * Consume the next value of an {@linkcode Iterator} and return it if `f`
   * returns `true`.
   *
   * @example
   * ```ts
   * import { I } from "./mod.ts";
   *
   * const iter = I.peekable(I.iter([1, 2, 3]));
   *
   * console.log(I.nextIf(iter, (i) => i < 2)); // 1
   * console.log(I.nextIf(iter, (i) => i < 2)); // undefined
   * console.log(iter.next()); // 2
   * ```
   */
  static nextIf<T>(iter: Peekable<T>, f: (_: T) => boolean): Option<T> {
    const peek = iter.peek();
    return O.isSome(peek) && f(peek) ? iter.next() : None;
  }
}
