import { assert, assertEquals, assertThrows } from "../../test_deps.ts";
import { NONE, None, O, SOME, Some } from "./mod.ts";
import { Err, Ok } from "../result/mod.ts";

Deno.test("some", () => assertEquals(Some(1), { [SOME]: 1 }));
Deno.test("none", () => assertEquals(None, { [NONE]: true }));

Deno.test("is_some", async (t) => {
  await t.step("some", () => assert(O.isSome(Some(1))));
  await t.step("none", () => assert(!O.isSome(None)));
});

Deno.test("is_none", async (t) => {
  await t.step("some", () => assert(!O.isNone(Some(1))));
  await t.step("none", () => assert(O.isNone(None)));
});

Deno.test("expect", async (t) => {
  await t.step(
    "some",
    () => assertEquals(O.expect(Some(1), "returns"), 1),
  );
  await t.step(
    "none",
    () => assertThrows(() => O.expect(None, "throws"), Error, "throws"),
  );
});

Deno.test("unwrap", async (t) => {
  await t.step("some", () => assertEquals(O.unwrap(Some(1)), 1));
  await t.step(
    "none",
    () =>
      assertThrows(
        () => O.unwrap(None),
        Error,
        "called `unwrap()` on a `None` value",
      ),
  );
});

Deno.test("unwrap_or", async (t) => {
  await t.step("some", () => assertEquals(O.unwrapOr(Some(1), 0), 1));
  await t.step("none", () => assertEquals(O.unwrapOr(None, 0), 0));
});

Deno.test("map", async (t) => {
  await t.step(
    "some",
    () => assertEquals(O.map(Some(1), (v) => ++v), Some(2)),
  );
  await t.step(
    "none",
    () => assertEquals(O.map(None, (v) => ++v), None),
  );
});

Deno.test("contains", async (t) => {
  await t.step(
    "some_true",
    () => assert(O.contains(Some(1), 1)),
  );
  await t.step(
    "some_false",
    () => assert(!O.contains(Some(1), 0)),
  );
  await t.step(
    "none",
    () => assert(!O.contains(None, 0)),
  );
});

Deno.test("flatten", async (t) => {
  await t.step(
    "some_some",
    () => assertEquals(O.flatten(Some(Some(1))), Some(1)),
  );
  await t.step("some_none", () => assertEquals(O.flatten(Some(None)), None));
  await t.step("none", () => assertEquals(O.flatten(None), None));
});

Deno.test("transpose", async (t) => {
  await t.step(
    "some_ok",
    () => assertEquals(O.transpose(Some(Ok(1))), Ok(Some(1))),
  );
  await t.step(
    "some_err",
    () => assertEquals(O.transpose(Some(Err(1))), Err(1)),
  );
  await t.step("none", () => assertEquals(O.transpose(None), Ok(None)));
});
