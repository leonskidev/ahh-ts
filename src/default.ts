/**
 * Defaults.
 *
 * The {@linkcode Default} type defined here simply reflects a common pattern,
 * wherein objects with a default value normally have a [nullary] constructor
 * variant. This pairs nicely with [`Object.assign`], where the target can be
 * the default value of an object.
 *
 * [nullary]: https://wikipedia.org/wiki/Arity#Nullary
 * [`Object.assign`]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 *
 * @module
 */

/**
 * Returns the default value for a {@linkcode Default} object.
 *
 * @example
 * ```ts
 * import { assertEquals } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * class Vec2 {
 *   x: number;
 *   y: number;
 *
 *   constructor();
 *   constructor(v: number);
 *   constructor(x?: number, y?: number) {
 *     this.x = x ?? 0;
 *     this.y = y ?? x ?? 0;
 *   }
 * }
 *
 * assertEquals(def(Vec2), new Vec2());
 * ```
 */
export function def<T>(object: Default<T>): T;

/**
 * Returns the default value for the `undefined` primitive.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * assert(def("undefined") === undefined);
 * ```
 */
export function def(primitive: "undefined"): undefined;

/**
 * Returns the default value for the `null` object.
 *
 * @example
 * ```ts
 * import { assertEquals } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * assertEquals(def("null"), null);
 * ```
 */
export function def(object: "null"): null;

/**
 * Returns the default value for the `boolean` primitive.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * assert(def("boolean") === false);
 * ```
 */
export function def(primitive: "boolean"): false;

/**
 * Returns the default value for the `number` primitive.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * assert(def("number") === 0);
 * ```
 */
export function def(primitive: "number"): 0;

/**
 * Returns the default value for the `bigint` primitive.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * assert(def("bigint") === 0n);
 * ```
 */
export function def(primitive: "bigint"): 0n;

/**
 * Returns the default value for the `string` primitive.
 *
 * @example
 * ```ts
 * import { assert } from "../test_deps.ts";
 * import { def } from "./default.ts";
 *
 * assert(def("string") === "");
 * ```
 */
export function def(primitive: "string"): "";

export function def<T>(
  object:
    | Default<T>
    | "undefined"
    | "null"
    | "boolean"
    | "number"
    | "bigint"
    | "string",
): T | undefined | null | false | 0 | 0n | "" {
  // deno-fmt-ignore
  switch (object) {
    case "undefined": { return undefined; }
    case "null": { return null; }
    case "boolean": { return false; }
    case "number": { return 0; }
    case "bigint": { return 0n; }
    case "string": { return ""; }
    default: { return new object(); }
  }
}

export default { def };

/** A object with a constructor that returns a default value. */
export type Default<T> = new () => T;
