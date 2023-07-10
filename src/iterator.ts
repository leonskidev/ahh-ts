/**
 * Contains an idiomatic {@linkcode Iterator} type and related functions.
 *
 * Unlike the `Iterator` built into JavaScript, this {@linkcode Iterator} is
 * lazy. This is useful since items are only evaluated once you call
 * {@linkcode Iterator.next} on the {@linkcode Iterator}, not up-front.
 *
 * Since {@linkcode Iterator}s implement the [iteration protocols], we still
 * have access to features built into the language, such as:
 *
 * - [`for..of`] loops
 * - \[[`...`]iter\]
 *
 * [iteration protocols]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols
 * [`for..of`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for...of
 * [`...`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 *
 * @module
 */

import { default as O, Option } from "./option.ts";

/** An interface for types that can be iterated over. */
export abstract class Iterator<T> implements Iterable<T> {
  /** Advances the iterator and returns the next item. */
  abstract next(): Option<T>;

  /**
   * Creates an {@linkcode Iterator} that yields each item mapped via
   * {@linkcode fn}.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).map((i) => i * 2);
   *
   * console.log(iter.next());
   * ```
   */
  map<U>(fn: (_: T) => U): Map<T, U> {
    return new Map(this, fn);
  }

  /**
   * Consumes an {@linkcode Iterator} until {@linkcode fn} returns `true` and
   * returns the item.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(iter.find((i) => i % 2 !== 0));
   * ```
   */
  find(fn: (_: T) => boolean): Option<T> {
    let value = this.next();

    while (O.isSome(value) && !fn(value)) {
      value = this.next();
    }

    return value;
  }

  /**
   * Creates an {@linkcode Iterator} that yields items for which {@linkcode fn}
   * returns `true`.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).filter((i) => i % 2 !== 0);
   *
   * console.log(iter.next());
   */
  filter(fn: (_: T) => boolean): Filter<T> {
    return new Filter(this, fn);
  }

  /**
   * Creates an {@linkcode Iterator} over two {@linkcode Iterator}s
   * simultaneously.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).zip(I.iter(["hello", "world"]));
   *
   * console.log(iter.next());
   * ```
   */
  zip<U>(other: Iterator<U>): Zip<T, U> {
    return new Zip(this, other);
  }

  /**
   * Creates an {@linkcode Iterator} over two {@linkcode Iterator}s
   * sequentially.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).chain(I.iter([4, 5]));
   *
   * console.log(iter.next());
   * ```
   */
  chain(other: Iterator<T>): Chain<T> {
    return new Chain(this, other);
  }

  /**
   * Creates an {@linkcode Iterator} that yields the iteration count as well as
   * the next value.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter(["hello", "world"]).enumerate();
   *
   * console.log(iter.next());
   * ```
   */
  enumerate(): Enumerate<T> {
    return new Enumerate(this);
  }

  /**
   * Creates an {@linkcode Iterator} that can be return the next item without
   * consuming it.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter(["hello", "world"]).peekable();
   *
   * console.log(iter.peek());
   * ```
   */
  peekable(): Peekable<T> {
    return new Peekable(this);
  }

  /**
   * Consumes an {@linkcode Iterator} and calls {@linkcode fn} on each item.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * iter.forEach((value) => console.log(value));
   * ```
   */
  forEach(fn: (_: T) => unknown): void {
    let value = this.next();

    while (O.isSome(value)) {
      fn(value);
      value = this.next();
    }
  }

  /**
   * Consumes an {@linkcode Iterator} and calls {@linkcode fn} on each item to
   * collect them into {@linkcode init}.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * const arr = iter.fold<number[]>([], (arr, i) => {
   *   arr.push(i);
   *   return arr;
   * });
   *
   * console.log(arr);
   * ```
   */
  fold<U>(init: U, fn: (init: U, _: T) => U): U {
    this.forEach((value) => init = fn(init, value));
    return init;
  }

  /**
   * Consumes an {@linkcode Iterator} and returns the number of iterations.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(iter.count());
   * ```
   */
  count(): number {
    return this.fold(0, (init, _) => ++init);
  }

  /**
   * Consumes an {@linkcode Iterator} and returns the last item.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(iter.last());
   * ```
   */
  last(): Option<T> {
    return this.fold<Option<T>>(undefined, (_, item) => item);
  }

  /**
   * Creates an {@linkcode Iterator} that skips the first {@linkcode n} items.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).skip(2);
   *
   * console.log(iter.next());
   * ```
   */
  skip(n: number): Skip<T> {
    return new Skip(this, n);
  }

  /**
   * Creates an {@linkcode Iterator} that takes the first {@linkcode n} items.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).take(2);
   *
   * console.log(iter.next());
   * ```
   */
  take(n: number): Take<T> {
    return new Take(this, n);
  }

  /**
   * Creates an {@linkcode Iterator} that skips items while {@linkcode fn}
   * returns `true`.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 3, 2]).skipWhile((i) => i % 2 !== 0);
   *
   * console.log(iter.next());
   * ```
   */
  skipWhile(fn: (_: T) => boolean): SkipWhile<T> {
    return new SkipWhile(this, fn);
  }

  /**
   * Creates an {@linkcode Iterator} that takes items while {@linkcode fn}
   * returns `true`.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 3, 2]).takeWhile((i) => i % 2 !== 0);
   *
   * console.log(iter.next());
   * ```
   */
  takeWhile(fn: (_: T) => boolean): TakeWhile<T> {
    return new TakeWhile(this, fn);
  }

  /**
   * Consumes {@linkcode n} items from the {@linkcode Iterator} and returns the
   * next item.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]);
   *
   * console.log(iter.nth(1));
   * ```
   */
  nth(n: number): Option<T> {
    return this.skip(n).next();
  }

  [Symbol.iterator](): globalThis.Iterator<T> {
    return {
      next: () => {
        const value = this.next();
        return { done: O.isNone(value) as true, value };
      },
    };
  }
}

/**
 * Creates an {@linkcode Iterator} that calls {@linkcode fn} each iteration.
 *
 * @example
 * ```ts
 * import { default as I } from "./iterator.ts";
 *
 * let i = 0;
 * const iter = I.fn(() => ++i);
 *
 * console.log(iter.next());
 * ```
 */
export function fn<T>(fn: Iterator<T>["next"]): FromFn<T> {
  return new FromFn(fn);
}

/**
 * Creates an {@linkcode Iterator} that yields items from an `Iterable`.
 *
 * @example
 * ```ts
 * import { default as I } from "./iterator.ts";
 *
 * const iter = I.iter([1, false]);
 *
 * console.log(iter.next());
 * ```
 */
export function iter<T>(iter: Iterable<T>): FromIter<T> {
  return new FromIter(iter);
}

/**
 * Creates an {@linkcode Iterator} that yields nothing.
 *
 * @example
 * ```ts
 * import { default as I } from "./iterator.ts";
 *
 * const iter = I.empty();
 *
 * console.log(iter.next());
 * ```
 */
export function empty<T>(): Empty<T> {
  return new Empty();
}

/**
 * Creates an {@linkcode Iterator} that yields exactly one item.
 *
 * @example
 * ```ts
 * import { default as I } from "./iterator.ts";
 *
 * const iter = I.once("hello");
 *
 * console.log(iter.next());
 * ```
 */
export function once<T>(item: T): Once<T> {
  return new Once(item);
}

/**
 * Creates an {@linkcode Iterator} that endlessly yields an item.
 *
 * @example
 * ```ts
 * import { default as I } from "./iterator.ts";
 *
 * const iter = I.repeat("hello");
 *
 * console.log(iter.next());
 * ```
 */
export function repeat<T>(item: T): Repeat<T> {
  return new Repeat(item);
}

/**
 * Creates an {@linkcode Iterator} where each successive item is computed from
 * the previous one.
 *
 * @example
 * ```ts
 * import { default as I } from "./iterator.ts";
 *
 * const iter = I.repeat("hello");
 *
 * console.log(iter.next());
 * ```
 */
export function successors<T>(
  init: Option<T>,
  fn: (_: T) => Option<T>,
): Successors<T> {
  return new Successors(init, fn);
}

/** See {@linkcode fn}. */
export class FromFn<T> extends Iterator<T> {
  #next: Iterator<T>["next"];

  constructor(fn: Iterator<T>["next"]) {
    super();
    this.#next = fn;
  }

  next(): Option<T> {
    return this.#next();
  }
}

/** See {@linkcode iter}. */
export class FromIter<T> extends Iterator<T> {
  #iter: globalThis.Iterator<T>;

  constructor(iter: Iterable<T>) {
    super();
    this.#iter = iter[Symbol.iterator]();
  }

  next(): Option<T> {
    const value = this.#iter.next();
    return value.done ? undefined : value.value;
  }
}

/** See {@linkcode empty}. */
export class Empty<T> extends Iterator<T> {
  next(): Option<T> {
    return undefined;
  }
}

/** See {@linkcode once}. */
export class Once<T> extends Iterator<T> {
  #item: Option<T>;

  constructor(item: T) {
    super();
    this.#item = item;
  }

  next(): Option<T> {
    if (O.isSome(this.#item)) {
      const item = this.#item;
      this.#item = undefined;
      return item;
    } else {
      return undefined;
    }
  }
}

/** See {@linkcode repeat}. */
export class Repeat<T> extends Iterator<T> {
  #item: T;

  constructor(item: T) {
    super();
    this.#item = item;
  }

  next(): Option<T> {
    return this.#item;
  }
}

/** See {@linkcode successors}. */
export class Successors<T> extends Iterator<T> {
  #item: Option<T>;
  #fn: (_: T) => Option<T>;

  constructor(item: Option<T>, fn: (_: T) => Option<T>) {
    super();
    this.#item = item;
    this.#fn = fn;
  }

  next(): Option<T> {
    const value = this.#item;

    if (O.isSome(value)) {
      this.#item = this.#fn(value);
    }

    return value;
  }
}

/** See {@linkcode Iterator.map}. */
export class Map<T, U> extends Iterator<U> {
  #iter: Iterator<T>;
  #fn: (_: T) => U;

  constructor(iter: Iterator<T>, fn: (_: T) => U) {
    super();
    this.#iter = iter;
    this.#fn = fn;
  }

  next(): Option<U> {
    return O.map(this.#iter.next(), this.#fn);
  }
}

/** See {@linkcode Iterator.filter}. */
export class Filter<T> extends Iterator<T> {
  #iter: Iterator<T>;
  #fn: (_: T) => boolean;

  constructor(iter: Iterator<T>, fn: (_: T) => boolean) {
    super();
    this.#iter = iter;
    this.#fn = fn;
  }

  next(): Option<T> {
    return this.#iter.find(this.#fn);
  }
}

/** See {@linkcode Iterator.zip}. */
export class Zip<T, U> extends Iterator<[T, U]> {
  #lhs: Iterator<T>;
  #rhs: Iterator<U>;

  constructor(lhs: Iterator<T>, rhs: Iterator<U>) {
    super();
    this.#lhs = lhs;
    this.#rhs = rhs;
  }

  next(): Option<[T, U]> {
    const lhs = this.#lhs.next();
    const rhs = this.#rhs.next();

    if (O.isSome(lhs) && O.isSome(rhs)) {
      return [lhs, rhs];
    } else {
      return undefined;
    }
  }
}

/** See {@linkcode Iterator.chain}. */
export class Chain<T> extends Iterator<T> {
  #lhs: Iterator<T>;
  #rhs: Iterator<T>;

  constructor(lhs: Iterator<T>, rhs: Iterator<T>) {
    super();
    this.#lhs = lhs;
    this.#rhs = rhs;
  }

  next(): Option<T> {
    return this.#lhs.next() ?? this.#rhs.next();
  }
}

/** See {@linkcode Iterator.enumerate}. */
export class Enumerate<T> extends Iterator<[number, T]> {
  #iter: Iterator<T>;
  #count = 0;

  constructor(iter: Iterator<T>) {
    super();
    this.#iter = iter;
  }

  next(): Option<[number, T]> {
    return O.map(this.#iter.next(), (value) => [this.#count++, value]);
  }
}

/** See {@linkcode Iterator.peekable}. */
export class Peekable<T> extends Iterator<T> {
  #iter: Iterator<T>;
  #peeked: Option<T> = undefined;

  constructor(iter: Iterator<T>) {
    super();
    this.#iter = iter;
  }

  next(): Option<T> {
    if (O.isSome(this.#peeked)) {
      const value = this.#peeked;
      this.#peeked = undefined;
      return value;
    } else {
      return this.#iter.next();
    }
  }

  /**
   * Returns the next item without consuming it.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter(["hello", "world"]).peekable();
   *
   * console.log(iter.peek());
   * ```
   */
  peek(): Option<T> {
    if (O.isNone(this.#peeked)) {
      this.#peeked = this.#iter.next();
    }
    return this.#peeked;
  }

  /**
   * Returns the next item if {@linkcode fn} returns `true`.
   *
   * @example
   * ```ts
   * import { default as I } from "./iterator.ts";
   *
   * const iter = I.iter([1, 2, 3]).peekable();
   *
   * console.log(iter.nextIf((i) => i % 2 !== 0));
   * ```
   */
  nextIf(fn: (_: T) => boolean): Option<T> {
    const value = this.peek();
    return O.isSome(value) && fn(value) ? this.next() : undefined;
  }
}

/** See {@linkcode Iterator.skip}. */
export class Skip<T> extends Iterator<T> {
  #iter: Iterator<T>;

  constructor(iter: Iterator<T>, n: number) {
    super();

    while (n-- > 0 && O.isSome(iter.next()));
    this.#iter = iter;
  }

  next(): Option<T> {
    return this.#iter.next();
  }
}

/** See {@linkcode Iterator.take}. */
export class Take<T> extends Iterator<T> {
  #iter: Iterator<T>;
  #n: number;

  constructor(iter: Iterator<T>, n: number) {
    super();
    this.#iter = iter;
    this.#n = n;
  }

  next(): Option<T> {
    if (this.#n-- > 0) {
      return this.#iter.next();
    } else {
      return undefined;
    }
  }
}

/** See {@linkcode Iterator.skipWhile}. */
export class SkipWhile<T> extends Iterator<T> {
  #iter: Iterator<T>;

  constructor(iter: Iterator<T>, fn: (_: T) => boolean) {
    super();

    const iter_ = iter.peekable();
    while (O.isSome(iter_.nextIf(fn)));

    this.#iter = iter_;
  }

  next(): Option<T> {
    return this.#iter.next();
  }
}

/** See {@linkcode Iterator.takeWhile}. */
export class TakeWhile<T> extends Iterator<T> {
  #iter: Option<Iterator<T>>;
  #fn: (_: T) => boolean;

  constructor(iter: Iterator<T>, fn: (_: T) => boolean) {
    super();
    this.#iter = iter;
    this.#fn = fn;
  }

  next(): Option<T> {
    if (O.isSome(this.#iter)) {
      const value = this.#iter.next();

      if (O.isSome(value) && this.#fn(value)) {
        return value;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}

export default { fn, iter, empty, once, repeat, successors };
