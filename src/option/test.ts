import { assert, assertStrictEquals, assertThrows } from "../../test_deps.ts";
import { None, O } from "./mod.ts";

Deno.test("is_some", async (t) => {
  await t.step("some", () => assert(O.isSome(1)));
  await t.step("none", () => assert(!O.isSome(None)));
});

Deno.test("is_none", async (t) => {
  await t.step("some", () => assert(!O.isNone(1)));
  await t.step("none", () => assert(O.isNone(None)));
});

Deno.test("expect", async (t) => {
  await t.step("some", () => assertStrictEquals(O.expect(1, "returns"), 1));
  await t.step(
    "none",
    () => void assertThrows(() => O.expect(None, "throws"), Error, "throws"),
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
        "called `unwrap()` on a `None` value",
      ),
  );
});

Deno.test("unwrap_or", async (t) => {
  await t.step("some", () => assertStrictEquals(O.unwrapOr(1, 5), 1));
  await t.step("none", () => assertStrictEquals(O.unwrapOr(None, 5), 5));
});

Deno.test("map", async (t) => {
  await t.step("some", () => assertStrictEquals(O.map(1, (i) => i + 1), 2));
  await t.step(
    "some",
    () => assertStrictEquals(O.map<number, number>(None, (i) => i + 1), None),
  );
});

Deno.test("contains", async (t) => {
  await t.step("some_equals", () => assert(O.contains(1, 1)));
  await t.step("some_not_equals", () => assert(!O.contains(1, 2)));
  await t.step("none", () => assert(!O.contains(None, 1)));
});
