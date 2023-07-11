/**
 * Composable iteration.
 *
 * The {@linkcode Iterator} abstract class defined here builds on-top of
 * [iteration protocols], which specifies how lazy iteration works. This also
 * allows us to benefit from built-in language features, such as:
 *
 * - [`for..of`] loops; and,
 * - [spread syntax] (`...`).
 *
 * [iteration protocols]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols
 * [`for..of`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for...of
 * [spread syntax]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 *
 * @module
 */

// NOTE: these are usef for documentation
// deno-lint-ignore no-unused-vars
import type { None } from "./option.ts";
import { default as O, Option, Some } from "./option.ts";

/**
 * Creates an {@linkcode Iterator} that yields the result of `fn` each
 * iteration.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import I from "./iterator.ts";
 *
 * let i = 0;
 * const iter = I.fromFn(() => i++);
 *
 * assert(iter.next() === 0);
 * assert(iter.next() === 1);
 * assert(iter.next() === 2);
 * ```
 */
export function fromFn<T extends Some<unknown>>(
  fn: () => Option<T>,
): Iterator<T> {
  return new FromFnIter(fn);
}

/**
 * Creates an {@linkcode Iterator} that yields the next item from an `iter` that
 * conforms to the [iteration protocols].
 *
 * [iteration protocols]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import I from "./iterator.ts";
 *
 * let i = 0;
 * const iter = I.fromIter([1, 2]);
 *
 * assert(iter.next() === 1);
 * assert(iter.next() === 2);
 * assert(iter.next() === undefined);
 * ```
 */
export function fromIter<T extends Some<unknown>>(
  iter: Iterable<T>,
): Iterator<T> {
  const iter_ = iter[Symbol.iterator]();

  return new FromFnIter(() => {
    const { done, value } = iter_.next();
    return done ? undefined : value;
  });
}

/**
 * Creates an {@linkcode Iterator} where each successive item is computed from
 * the previous one.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import I from "./iterator.ts";
 *
 * const iter = I.successors<number>(0, (i) => i + 1);
 *
 * assert(iter.next() === 0);
 * assert(iter.next() === 1);
 * assert(iter.next() === 2);
 * ```
 */
export function successors<T extends Some<unknown>>(
  init: Option<T>,
  fn: (item: T) => Option<T>,
) {
  return new FromFnIter(() =>
    O.map(init, (item: T): Option<T> => {
      init = fn(item);
      return item;
    })
  );
}

/**
 * Creates an {@linkcode Iterator} that yields nothing.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import I from "./iterator.ts";
 *
 * const iter = I.empty();
 *
 * assert(iter.next() === undefined);
 * ```
 */
export function empty<T extends Some<unknown>>(): Iterator<T> {
  return new FromFnIter<T>(() => undefined);
}

/**
 * Creates an {@linkcode Iterator} that endlessly yields `item`.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import I from "./iterator.ts";
 *
 * const iter = I.repeat(() => 2);
 *
 * assert(iter.next() === 2);
 * assert(iter.next() === 2);
 * assert(iter.next() === 2);
 * ```
 */
export function repeat<T extends Some<unknown>>(item: () => T): Iterator<T> {
  return new FromFnIter(item);
}

/**
 * Creates an {@linkcode Iterator} that yields exactly one `item`.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import I from "./iterator.ts";
 *
 * const iter = I.once(2);
 *
 * assert(iter.next() === 2);
 * assert(iter.next() === undefined);
 * ```
 */
export function once<T extends Some<unknown>>(item: T): Iterator<T> {
  return successors<T>(item, () => undefined);
}

export default { fromFn, fromIter, successors, empty, repeat, once };

/** Implemented by classes that can be iterated. */
export abstract class Iterator<T extends Some<unknown>> implements Iterable<T> {
  /** Advances the {@linkcode Iterator} and yields the next item. */
  abstract next(): Option<T>;

  [Symbol.iterator](): globalThis.Iterator<T> {
    return {
      next: () => {
        const item = this.next();
        return { done: O.isNone(item) as true, value: item };
      },
    };
  }

  /**
   * Creates an {@linkcode Iterator} that calls `fn` one each item of `this`.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const toString = (i: number): string => i.toString();
   * const iter = I.fromIter([1, 2, 3]).map(toString);
   *
   * assert(iter.next() === "1");
   * assert(iter.next() === "2");
   * assert(iter.next() === "3");
   * ```
   */
  map<U extends Some<unknown>>(fn: (item: T) => U): Iterator<U> {
    return new FromFnIter(() => O.map(this.next(), fn));
  }

  /**
   * Creates an {@linkcode Iterator} that yields items for which `fn` returns
   * `true`.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const odd = (i: number): boolean => i % 2 !== 0;
   * const iter = I.fromIter([1, 2, 3]).filter(odd);
   *
   * assert(iter.next() === 1);
   * assert(iter.next() === 3);
   * ```
   */
  filter(fn: (item: T) => boolean): Iterator<T> {
    return new FromFnIter(() => this.find(fn));
  }

  /**
   * Creates an {@linkcode Iterator} that yields items from `this` and `other`
   * sequentially.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1]).chain(I.fromIter([2, 3]));
   *
   * assert(iter.next() === 1);
   * assert(iter.next() === 2);
   * assert(iter.next() === 3);
   * ```
   */
  chain(other: Iterator<T>): Iterator<T> {
    return new FromFnIter(() => this.next() ?? other.next());
  }

  /**
   * Creates an {@linkcode Iterator} that yields items from `this` and `other`
   * simultaneously.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1]).chain(I.fromIter([2, 3]));
   *
   * assert(iter.next() === 1);
   * assert(iter.next() === 2);
   * assert(iter.next() === 3);
   * ```
   */
  zip<U extends Some<unknown>>(other: Iterator<U>): Iterator<[T, U]> {
    return new FromFnIter(() => O.zip(this.next(), other.next()));
  }

  /**
   * Creates an {@linkcode Iterator} that yields items from `this` and `other`
   * interspersedly.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 3, 5]).intersperse(I.fromIter([2, 4]));
   *
   * assert(iter.next() === 1);
   * assert(iter.next() === 2);
   * assert(iter.next() === 3);
   * assert(iter.next() === 4);
   * assert(iter.next() === 5);
   * ```
   */
  intersperse(other: Iterator<T>): Iterator<T> {
    let intersperse = false;

    return new FromFnIter(() => {
      if (intersperse) {
        intersperse = false;
        return other.next();
      } else {
        intersperse = true;
        return this.next();
      }
    });
  }

  /**
   * Creates an {@linkcode Iterator} that yields the iteration count and next
   * item.
   *
   * @example
   * ```ts
   * import { assert, assertArrayIncludes } from "../test_deps.ts";
   * import O from "./option.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter(["hello", "world"]).enumerate();
   *
   * let item = iter.next();
   * assert(O.isSome(item));
   * assertArrayIncludes(item, [0, "hello"]);
   *
   * item = iter.next();
   * assert(O.isSome(item));
   * assertArrayIncludes(item, [1, "world"]);
   * ```
   */
  enumerate(): Iterator<[number, T]> {
    return successors<number>(0, (i) => i + 1).zip(this);
  }

  /**
   * Creates an {@linkcode Iterator} that can return the next item without
   * consuming it.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2, 3]).peekable();
   *
   * assert(iter.peek() === 1);
   * assert(iter.peek() === 1);
   * assert(iter.next() === 1);
   * ```
   */
  peekable(): Peekable<T> {
    return new Peekable(this);
  }

  /**
   * Creates an {@linkcode Iterator} that exclusively returns {@linkcode None}
   * after the first {@linkcode None}.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import O from "./option.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2]).fuse();
   *
   * assert(iter.next() === 1);
   * assert(iter.next() === 2);
   * assert(O.isNone(iter.next()));
   * ```
   */
  fuse(): Fuse<T> {
    return new Fuse(this);
  }

  /**
   * Creates an {@linkcode Iterator} that skips the first `n` items.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2, 3]).skip(2);
   *
   * assert(iter.next() === 3);
   * ```
   */
  skip(n: number): Iterator<T> {
    return new FromFnIter(() => {
      while (n-- > 0 && O.isSome(this.next()));
      return this.next();
    });
  }

  /**
   * Creates an {@linkcode Iterator} that takes the first `n` items.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2, 3]).take(2);
   *
   * assert(iter.next() === 1);
   * assert(iter.next() === 2);
   * ```
   */
  take(n: number): Iterator<T> {
    return new FromFnIter(() => n-- > 0 ? this.next() : undefined);
  }

  /**
   * Consumes `this` until `fn` returns `true`, and returns the item.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const odd = (i: number): boolean => i % 2 !== 0;
   * const iter = I.fromIter([1, 2, 3]);
   *
   * assert(iter.find(odd) === 1);
   * assert(iter.find(odd) === 3);
   * ```
   */
  find(fn: (item: T) => boolean): Option<T> {
    for (const item of this) {
      if (fn(item)) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Consumes `this` and calls `fn` on each item to collect them into `init`.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const sum = (a: number, b: number): number => a + b;
   * const iter = I.fromIter([1, 2, 3]);
   *
   * assert(iter.fold(0, sum) === 6);
   * ```
   */
  fold<U>(init: U, fn: (init: U, item: T) => U): U {
    for (const item of this) {
      init = fn(init, item);
    }
    return init;
  }

  /**
   * Consumes `this` until it is empty and returns the last item.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2, 3]);
   *
   * assert(iter.last() === 3);
   * ```
   */
  last(): Option<T> {
    return this.fold<Option<T>>(undefined, (_, item) => item);
  }

  /**
   * Consumes `n` items from `this` and returns the next item.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2, 3]);
   *
   * assert(iter.nth(1) === 2);
   * ```
   */
  nth(n: number): Option<T> {
    return this.skip(n).next();
  }

  /**
   * Consumes `this` and returns whether `fn` returns `true` for all items.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const odd = (i: number): boolean => i % 2 !== 0;
   * const iter = I.fromIter([1, 3, 5]);
   *
   * assert(iter.all(odd));
   * ```
   */
  all(fn: (item: T) => boolean): boolean {
    return O.isNone(this.find((item) => !fn(item)));
  }

  /**
   * Consumes `this` until `fn` returns `true` for an item.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const odd = (i: number): boolean => i % 2 !== 0;
   * const iter = I.fromIter([2, 3, 4]);
   *
   * assert(iter.any(odd));
   * ```
   */
  any(fn: (item: T) => boolean): boolean {
    return O.isSome(this.find(fn));
  }
}

/** Implemented by {@linkcode Iterator}s that can be peeked. */
export class Peekable<T extends Some<unknown>> extends Iterator<T> {
  #iter: Iterator<T>;
  #peeked: Option<T> = undefined;

  constructor(iter: Iterator<T>) {
    super();
    this.#iter = iter;
  }

  next(): Option<T> {
    if (O.isSome(this.#peeked)) {
      const item = this.#peeked;
      this.#peeked = undefined;
      return item;
    } else {
      return this.#iter.next();
    }
  }

  /**
   * Returns the next item without consuming it.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const iter = I.fromIter([1, 2, 3]).peekable();
   *
   * assert(iter.peek() === 1);
   * assert(iter.next() === 1);
   * assert(iter.next() === 2);
   * assert(iter.peek() === 3);
   * assert(iter.peek() === 3);
   * assert(iter.next() === 3);
   * ```
   */
  peek(): Option<T> {
    if (O.isNone(this.#peeked)) {
      this.#peeked = this.#iter.next();
    }
    return this.#peeked;
  }

  /**
   * Returns the next item if `fn` returns `true`.
   *
   * @example
   * ```ts
   * import { assert } from "../test_deps.ts";
   * import I from "./iterator.ts";
   *
   * const odd = (i: number): boolean => i % 2 !== 0;
   * const iter = I.fromIter([1, 2, 3]).peekable();
   *
   * assert(iter.nextIf(odd) === 1);
   * assert(iter.nextIf(odd) === undefined);
   * ```
   */
  nextIf(fn: (item: T) => boolean): Option<T> {
    const item = this.peek();
    return O.isSome(item) && fn(item) ? this.next() : undefined;
  }
}

/**
 * Implemented by {@linkcode Iterator}s that exclusively returns
 * {@linkcode None} after encountering the first {@linkcode None}.
 */
export class Fuse<T extends Some<unknown>> extends Iterator<T> {
  #iter: Option<Iterator<T>>;

  constructor(iter: Iterator<T>) {
    super();
    this.#iter = iter;
  }

  next(): Option<T> {
    if (O.isSome(this.#iter)) {
      const item = this.#iter.next();

      if (O.isNone(item)) {
        this.#iter = undefined;
      }

      return item;
    } else {
      return undefined;
    }
  }
}

class FromFnIter<T extends Some<unknown>> extends Iterator<T> {
  #fn: () => Option<T>;

  constructor(fn: () => Option<T>) {
    super();
    this.#fn = fn;
  }

  next(): Option<T> {
    return this.#fn();
  }
}
