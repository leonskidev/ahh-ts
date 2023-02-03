import { assert, assertStrictEquals, assertThrows } from "../../test_deps.ts";
import { default as O, None } from "./mod.ts";

Deno.test("is_some", async (t) => {
  await t.step("some", () => assert(O.isSome(1)));
  await t.step("none", () => assert(!O.isSome(None)));
});

Deno.test("is_none", async (t) => {
  await t.step("some", () => assert(!O.isNone(1)));
  await t.step("none", () => assert(O.isNone(None)));
});

Deno.test("contains", async (t) => {
  await t.step("some_equals", () => assert(O.contains(1, 1)));
  await t.step("some_not_equals", () => assert(!O.contains(1, 2)));
  await t.step("none", () => assert(!O.contains(None, 1)));
});

Deno.test("inspect", async (t) => {
  await t.step("some", () => assertStrictEquals(O.inspect(1, (i) => i + 1), 1));
  await t.step(
    "none",
    () => assertStrictEquals(O.inspect(None, (i: number) => i + 1), None),
  );
});

Deno.test("map", async (t) => {
  await t.step("some", () => assertStrictEquals(O.map(1, (i) => i + 1), 2));
  await t.step(
    "none",
    () => assertStrictEquals(O.map(None, (i: number) => i + 1), None),
  );
});

Deno.test("filter", async (t) => {
  await t.step(
    "some_equals",
    () => assertStrictEquals(O.filter(2, (i) => i % 2 === 0), 2),
  );
  await t.step(
    "some_not_equals",
    () => assertStrictEquals(O.filter(1, (i) => i % 2 === 0), None),
  );
  await t.step(
    "none",
    () => assertStrictEquals(O.filter(None, (i: number) => i % 2 === 0), None),
  );
});

Deno.test("unwrap", async (t) => {
  await t.step("some", () => assertStrictEquals(O.unwrap(1), 1));
  await t.step(
    "none",
    () =>
      void assertThrows(
        () => O.unwrap(None),
        Error,
        "attempted to unwrap a `None` value",
      ),
  );
});

Deno.test("unwrap_or", async (t) => {
  await t.step("some", () => assertStrictEquals(O.unwrapOr(1, 2), 1));
  await t.step("none", () => assertStrictEquals(O.unwrapOr(None, 2), 2));
});

Deno.test("or", async (t) => {
  await t.step("some", () => assertStrictEquals(O.or(1, 2), 1));
  await t.step("none", () => assertStrictEquals(O.or(None, 2), 2));
});

Deno.test("and", async (t) => {
  await t.step("some", () => assertStrictEquals(O.and(1, 2), 2));
  await t.step("none", () => assertStrictEquals(O.and(None, 2), None));
});

Deno.test("ok_or", async (t) => {
  const ERROR = Error();
  await t.step("some", () => assertStrictEquals(O.okOr(1, ERROR), 1));
  await t.step("none", () => assertStrictEquals(O.okOr(None, ERROR), ERROR));
});
