import { assertEquals, assertThrows } from "./test_deps.ts";
import { None, Some } from "./option.ts";

Deno.test("is_some", async (t) => {
  await t.step("some", () => assertEquals(Some(1).isSome(), true));
  await t.step("none", () => assertEquals(None().isSome(), false));
});

Deno.test("is_none", async (t) => {
  await t.step("some", () => assertEquals(Some(1).isNone(), false));
  await t.step("none", () => assertEquals(None().isNone(), true));
});

Deno.test("contains", async (t) => {
  await t.step("some", () => assertEquals(Some(1).contains(1), true));
  await t.step("none", () => assertEquals(None().contains(1), false));
});

Deno.test("expect", async (t) => {
  await t.step("some", () => assertEquals(Some(1).expect("returns"), 1));
  await t.step(
    "none",
    () => assertThrows(() => None().expect("throws"), Error, "throws"),
  );
});

Deno.test("unwrap", async (t) => {
  await t.step("some", () => assertEquals(Some(1).unwrap(), 1));
  await t.step(
    "none",
    () =>
      assertThrows(
        () => None().unwrap(),
        Error,
        "called `Option.unwrap()` on a `None` value",
      ),
  );
});

Deno.test("map", async (t) => {
  await t.step(
    "some",
    () => assertEquals(Some(1).map((v) => v + 1).contains(2), true),
  );
  await t.step(
    "none",
    () => assertEquals(None<number>().map((v) => v + 1).contains(2), false),
  );
});

Deno.test("and", async (t) => {
  const one = Some(1);
  const two = Some(2);

  await t.step("some_some", () => assertEquals(one.and(two), two));
  await t.step("some_none", () => assertEquals(one.and(None()).isNone(), true));
  await t.step("none_some", () => assertEquals(None().and(one).isNone(), true));
  await t.step(
    "none_none",
    () => assertEquals(None().and(None()).isNone(), true),
  );
});

Deno.test("or", async (t) => {
  const one = Some(1);
  const two = Some(2);

  await t.step("some_some", () => assertEquals(one.or(two), two));
  await t.step("some_none", () => assertEquals(one.or(None()), one));
  await t.step("none_some", () => assertEquals(None().or(one), one));
  await t.step(
    "none_none",
    () => assertEquals(None().or(None()).isNone(), true),
  );
});

Deno.test("xor", async (t) => {
  const one = Some(1);
  const two = Some(2);

  await t.step("some_some", () => assertEquals(one.xor(two).isNone(), true));
  await t.step("some_none", () => assertEquals(one.xor(None()), one));
  await t.step("none_some", () => assertEquals(None().xor(one), one));
  await t.step(
    "none_none",
    () => assertEquals(None().xor(None()).isNone(), true),
  );
});
