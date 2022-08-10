import { assert, assertEquals, assertThrows } from "../../test_deps.ts";
import { Err, Ok, R } from "./mod.ts";
import { None, Some } from "../option/mod.ts";

Deno.test("ok", () => assertEquals(Ok(1), { [Symbol.for("ok")]: 1 }));
Deno.test("err", () => assertEquals(Err(1), { [Symbol.for("err")]: 1 }));

Deno.test("is_ok", async (t) => {
  await t.step("ok", () => assert(R.isOk(Ok(1))));
  await t.step("err", () => assert(!R.isOk(Err(1))));
});

Deno.test("is_err", async (t) => {
  await t.step("ok", () => assert(!R.isErr(Ok(1))));
  await t.step("err", () => assert(R.isErr(Err(1))));
});

// import { None, Some } from "../option/mod.ts";

Deno.test("expect", async (t) => {
  await t.step("ok", () => assertEquals(R.expect(Ok(1), "returns"), 1));
  await t.step(
    "err",
    () => assertThrows(() => R.expect(Err(1), "throws"), Error, "throws"),
  );
});

Deno.test("expect_err", async (t) => {
  await t.step(
    "ok",
    () => assertThrows(() => R.expectErr(Ok(1), "throws"), Error, "throws"),
  );
  await t.step("err", () => assertEquals(R.expectErr(Err(1), "returns"), 1));
});

Deno.test("unwrap", async (t) => {
  await t.step("ok", () => assertEquals(R.unwrap(Ok(1)), 1));
  await t.step(
    "err",
    () =>
      assertThrows(
        () => R.unwrap(Err(1)),
        Error,
        "called `unwrap()` on an `Err` value",
      ),
  );
});

Deno.test("unwrap_err", async (t) => {
  await t.step(
    "ok",
    () =>
      assertThrows(
        () => R.unwrapErr(Ok(1)),
        Error,
        "called `unwrapErr()` on an `Ok` value",
      ),
  );
  await t.step("err", () => assertEquals(R.unwrapErr(Err(1)), 1));
});

Deno.test("unwrap_or", async (t) => {
  await t.step("ok", () => assertEquals(R.unwrapOr(Ok(1), 0), 1));
  await t.step("err", () => assertEquals(R.unwrapOr(Err(1), 0), 0));
});

Deno.test("unwrap_err_or", async (t) => {
  await t.step("ok", () => assertEquals(R.unwrapErrOr(Ok(1), 0), 0));
  await t.step("err", () => assertEquals(R.unwrapErrOr(Err(1), 0), 1));
});

Deno.test("map", async (t) => {
  await t.step(
    "ok",
    () => assertEquals(R.map(Ok(1), (v) => ++v), Ok(2)),
  );
  await t.step(
    "err",
    () => assertEquals(R.map(Err<number, number>(1), (v) => ++v), Err(1)),
  );
});

Deno.test("map_err", async (t) => {
  await t.step(
    "ok",
    () =>
      assertEquals(
        R.mapErr(Ok<number, number>(1), (v) => ++v),
        Ok(1),
      ),
  );
  await t.step(
    "err",
    () => assertEquals(R.mapErr(Err(1), (v) => ++v), Err(2)),
  );
});

Deno.test("contains", async (t) => {
  await t.step("ok_true", () => assert(R.contains(Ok(1), 1)));
  await t.step("ok_false", () => assert(!R.contains(Ok(1), 0)));
  await t.step("err", () => assert(!R.contains(Err(1), 1)));
});

Deno.test("contains_err", async (t) => {
  await t.step("ok", () => assert(!R.containsErr(Ok(1), 1)));
  await t.step("err_true", () => assert(R.containsErr(Err(1), 1)));
  await t.step("err_false", () => assert(!R.containsErr(Err(1), 0)));
});

Deno.test("flatten", async (t) => {
  await t.step(
    "ok_ok",
    () => assertEquals(R.flatten(Ok(Ok(1))), Ok(1)),
  );
  await t.step("ok_err", () => assertEquals(R.flatten(Ok(Err(0))), Err(0)));
  await t.step("err", () => assertEquals(R.flatten(Err(0)), Err(0)));
});

Deno.test("into_ok", () => assertEquals(R.intoOk(Ok(1)), 1));

Deno.test("into_err", () => assertEquals(R.intoErr(Err(1)), 1));

Deno.test("ok", async (t) => {
  await t.step("ok", () => assertEquals(R.ok(Ok(1)), Some(1)));
  await t.step("err", () => assertEquals(R.ok(Err(1)), None));
});

Deno.test("err", async (t) => {
  await t.step("ok", () => assertEquals(R.err(Ok(1)), None));
  await t.step("err", () => assertEquals(R.err(Err(1)), Some(1)));
});

Deno.test("transpose", async (t) => {
  await t.step(
    "ok_some",
    () => assertEquals(R.transpose(Ok(Some(1))), Some(Ok(1))),
  );
  await t.step("ok_none", () => assertEquals(R.transpose(Ok(None)), None));
  await t.step("err", () => assertEquals(R.transpose(Err(1)), Some(Err(1))));
});
