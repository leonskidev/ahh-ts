import { assert, assertFalse, assertStrictEquals } from "../test_deps.ts";
import { default as O } from "./option.ts";

Deno.test("is_some", async (t) => {
  await t.step("0", () => assert(O.isSome(0)));
  await t.step("1", () => assert(O.isSome(1)));
  await t.step("false", () => assert(O.isSome(false)));
  await t.step("true", () => assert(O.isSome(true)));
  await t.step("undefined", () => assertFalse(O.isSome(undefined)));
  await t.step("null", () => assertFalse(O.isSome(null)));
});

Deno.test("is_none", async (t) => {
  await t.step("0", () => assertFalse(O.isNone(0)));
  await t.step("1", () => assertFalse(O.isNone(1)));
  await t.step("false", () => assertFalse(O.isNone(false)));
  await t.step("true", () => assertFalse(O.isNone(true)));
  await t.step("undefined", () => assert(O.isNone(undefined)));
  await t.step("null", () => assert(O.isNone(null)));
});

Deno.test("map", async (t) => {
  const double = (i: number): number => i * 2;
  const toString = (i: number): string => i.toString();

  await t.step("some_double", () => assertStrictEquals(O.map(8, double), 16));
  await t.step(
    "some_to_string",
    () => assertStrictEquals(O.map(8, toString), "8"),
  );
  await t.step(
    "none_double",
    () => assert(O.isNone(O.map(undefined, double))),
  );
  await t.step(
    "none_to_string",
    () => assert(O.isNone(O.map(undefined, toString))),
  );
});

Deno.test("filter", async (t) => {
  const even = (i: number): boolean => i % 2 === 0;

  await t.step("some_even", () => assertStrictEquals(O.filter(2, even), 2));
  await t.step("some_odd", () => assert(O.isNone(O.filter(1, even))));
  await t.step("none", () => assert(O.isNone(O.filter(undefined, even))));
});
