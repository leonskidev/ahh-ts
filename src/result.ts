/** Represents a result value that was successful. */
export type Ok<T> = {
  readonly _tag: "ok";
  /** The inner value. */
  readonly value: T;
};

/** Represents a result value that was erroneous. */
export type Err<E> = {
  readonly _tag: "err";
  /** The inner value. */
  readonly value: E;
};

/**
 * Represents a result value that is either successful ([`Ok`]) or erroneous
 * ([`Err`]).
 *
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 * [`Err`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Err
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Creates an [`Ok`].
 *
 * ## Example
 *
 * ```ts
 * import { Ok } from "./result.ts";
 *
 * const ok = Ok(1);
 * ```
 *
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 */
export function Ok<T, E>(value: T): Result<T, E> {
  return { _tag: "ok", value };
}

/**
 * Creates an [`Err`].
 *
 * ## Example
 *
 * ```ts
 * import { Err } from "./result.ts";
 *
 * const err = Err("whoops");
 * ```
 *
 * [`Err`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Err
 */
export function Err<T, E>(value: E): Result<T, E> {
  return { _tag: "err", value };
}

/**
 * Returns `true` if the [`Result`] is [`Ok`].
 *
 * ## Example
 *
 * ```ts
 * import { Ok, isOk } from "./result.ts";
 *
 * const t = isOk(Ok(1));
 * ```
 *
 * [`Result`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Result
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 */
export function isOk<T, E>(result: Result<T, E>): boolean {
  return result._tag === "ok";
}

/**
 * Returns `true` if the [`Result`] is [`Err`].
 *
 * ## Example
 *
 * ```ts
 * import { Err, isErr } from "./result.ts";
 *
 * const t = isErr(Err(1));
 * ```
 *
 * [`Result`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Result
 * [`Err`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Err
 */
export function isErr<T, E>(result: Result<T, E>): boolean {
  return result._tag === "err";
}

/**
 * Returns the contained [`Ok`] value.
 *
 * ## Throws
 *
 * Throws if the [`Result`] is an [`Err`] with the provided `message`.
 *
 * ## Example
 *
 * ```ts
 * import { Ok, expect } from "./result.ts";
 *
 * const one = expect(Ok(1), "does not throw");
 * ```
 *
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 * [`Result`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Result
 * [`Err`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Err
 */
export function expect<T, E>(result: Result<T, E>, message: string): T {
  if (result._tag === "ok") {
    return result.value;
  } else {
    throw TypeError(`${message}: ${result.value}`);
  }
}

/**
 * Returns the contained [`Ok`] value.
 *
 * ## Throws
 *
 * Throws if the [`Result`] is an [`Err`].
 *
 * ## Example
 *
 * ```ts
 * import { Ok, unwrap } from "./result.ts";
 *
 * const one = unwrap(Ok(1));
 * ```
 *
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 * [`Result`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Result
 * [`Err`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Err
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  return expect(
    result,
    "called `unwrap()` on an `Err`",
  );
}

/**
 * Returns `b` if `a` and `b` are [`Ok`].
 *
 * ## Example
 *
 * ```ts
 * import { Ok, and } from "./result.ts";
 *
 * const b = and(Ok(1), Ok(2));
 * ```
 *
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 */
export function and<T, U, E>(a: Result<T, E>, b: Result<U, E>): Result<U, E> {
  if (a._tag !== "ok") {
    return a;
  } else {
    return b;
  }
}

/**
 * Returns `a` or `b` if one of them is [`Ok`].
 *
 * ## Example
 *
 * ```ts
 * import { Ok, or } from "./result.ts";
 *
 * const a = or(Ok(1), Ok(2));
 * ```
 *
 * [`Ok`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Ok
 */
export function or<T, E, F>(a: Result<T, E>, b: Result<T, F>): Result<T, F> {
  if (a._tag === "ok") {
    return a;
  } else {
    return b;
  }
}

/**
 * Returns the nested [`Result`] in an `Result<Result<T>>`.
 *
 * ## Example
 *
 * ```ts
 * import { Ok, flatten } from "./result.ts"
 *
 * const one = flatten(Ok(Ok(1)));
 * ```
 *
 * [`Result`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Result
 */
export function flatten<T, E>(result: Result<Result<T, E>, E>): Result<T, E> {
  if (result._tag === "ok") {
    return result.value;
  } else {
    return Err(result.value);
  }
}

/**
 * Returns a new [`Result`] of the provided [`Result`]s value mapped with
 * function `f`.
 *
 * ## Example
 *
 * ```ts
 * import { Ok, map } from "./result.ts";
 *
 * const two = map(Ok(1), (num) => num + 1);
 * ```
 *
 * [`Result`]: https://doc.deno.land/https/deno.land/x/ahh/src/result.ts#Result
 */
export function map<T, U, E>(
  result: Result<T, E>,
  f: (_: T) => U,
): Result<U, E> {
  if (result._tag === "ok") {
    return Ok(f(result.value));
  } else {
    return Err(result.value);
  }
}
