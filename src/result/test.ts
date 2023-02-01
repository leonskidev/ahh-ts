import {
  assert,
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "../../test_deps.ts";
import { None } from "../option/mod.ts";
import { R } from "./mod.ts";

Deno.test("fn", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.fn(() => 1), 1));
  await t.step("ok", () =>
    assertEquals(
      {
        ...R.fn(() => {
          throw Error("whoops");
        }),
        stack: undefined,
      },
      { ...Error("whoops"), stack: undefined },
    ));
});

Deno.test("is_ok", async (t) => {
  await t.step("ok", () => assert(R.isOk(1)));
  await t.step("err", () => assert(!R.isOk(Error("whoops"))));
});

Deno.test("is_err", async (t) => {
  await t.step("ok", () => assert(!R.isErr(1)));
  await t.step("err", () => assert(R.isErr(Error("whoops"))));
});

Deno.test("expect", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.expect(1, "returns"), 1));
  await t.step(
    "err",
    () =>
      void assertThrows(
        () => R.expect(Error("whoops"), "throws"),
        Error,
        "throws",
      ),
  );
});

Deno.test("expect_err", async (t) => {
  await t.step(
    "ok",
    () => void assertThrows(() => R.expectErr(1, "throws"), Error, "throws"),
  );
  await t.step(
    "err",
    () =>
      assertEquals(
        { ...R.expectErr(Error("whoops"), "returns"), stack: undefined },
        { ...Error("whoops"), stack: undefined },
      ),
  );
});

Deno.test("unwrap", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.unwrap(1), 1));
  await t.step(
    "err",
    () =>
      void assertThrows(
        () => R.unwrap(Error("whoops")),
        Error,
        "called `unwrap()` on an `Err` value: whoops",
      ),
  );
});

Deno.test("unwrap_err", async (t) => {
  await t.step(
    "ok",
    () =>
      void assertThrows(
        () => R.unwrapErr(1),
        Error,
        "called `unwrapErr()` on an `Ok` value: 1",
      ),
  );
  await t.step(
    "err",
    () =>
      assertEquals({ ...R.unwrapErr(Error("whoops")), stack: undefined }, {
        ...Error("whoops"),
        stack: undefined,
      }),
  );
});

Deno.test("unwrap_or", async (t) => {
  await t.step(
    "ok",
    () => assertStrictEquals(R.unwrapOr<number, Error>(1, 5), 1),
  );
  await t.step(
    "err",
    () => assertStrictEquals(R.unwrapOr(Error("whoops"), 5), 5),
  );
});

Deno.test("map", async (t) => {
  await t.step("ok", () => assertEquals(R.map(1, (i) => i + 1), 2));
  await t.step(
    "err",
    () =>
      assertEquals(
        R.map<number, Error, number>(Error("foo"), (i) => i + 1),
        Error("foo"),
      ),
  );
});

Deno.test("map_err", async (t) => {
  await t.step(
    "ok",
    () =>
      assertEquals(
        R.mapErr(1, (i) => Error(i.message + "bar")),
        1,
      ),
  );
  await t.step(
    "err",
    () =>
      assertEquals(
        R.mapErr(Error("foo"), (i) => Error(i.message + "bar")),
        Error("foobar"),
      ),
  );
});

Deno.test("contains", async (t) => {
  await t.step("ok_equals", () => assert(R.contains(1, 1)));
  await t.step("ok_not_equals", () => assert(!R.contains(1, 2)));
  await t.step("err", () => assert(!R.contains(Error("whoops"), 1)));
});

Deno.test("contains_err", async (t) => {
  await t.step("ok", () => assert(!R.containsErr(1, Error("whoops"))));
  await t.step(
    "err_equals",
    () => assert(R.containsErr(Error("whoops"), Error("whoops"))),
  );
  await t.step(
    "err_not_equals",
    () => assert(!R.containsErr(Error("whoops"), Error("spoohw"))),
  );
});

Deno.test("ok", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.ok(1), 1));
  await t.step("err", () => assertStrictEquals(R.ok(Error("whoops")), None));
});

Deno.test("err", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.err(1), None));
  await t.step(
    "err",
    () =>
      assertEquals({ ...R.err(Error("whoops")), stack: undefined }, {
        ...Error("whoops"),
        stack: undefined,
      }),
  );
});
