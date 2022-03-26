import { assertEquals, assertThrows } from "../test_deps.ts";
import { Err, Ok } from "./result.ts";

Deno.test("is_ok", async (t) => {
  await t.step("ok", () => assertEquals(Ok(1).isOk(), true));
  await t.step("err", () => assertEquals(Err(1).isOk(), false));
});

Deno.test("is_err", async (t) => {
  await t.step("ok", () => assertEquals(Ok(1).isErr(), false));
  await t.step("err", () => assertEquals(Err(1).isErr(), true));
});

Deno.test("ok", async (t) => {
  await t.step("ok", () => assertEquals(Ok<number, never>(1).ok(), 1));
  // NOTE: `ok` cannot be used on an `Err` ever
  // await t.step("err", () => assertEquals(Err(1).ok(), true));
});

Deno.test("err", async (t) => {
  // NOTE: `err` cannot be used on an `Ok` ever
  // await t.step("ok", () => assertEquals(Ok<(1).err(), false));
  await t.step("err", () => assertEquals(Err<never, number>(1).err(), 1));
});

Deno.test("contains", async (t) => {
  await t.step("ok_true", () => assertEquals(Ok(1).contains(1), true));
  await t.step("ok_false", () => assertEquals(Ok(1).contains(0), false));
  await t.step("err", () => assertEquals(Err(1).contains(1), false));
});

Deno.test("contains_err", async (t) => {
  await t.step("ok", () => assertEquals(Ok(1).containsErr(1), false));
  await t.step("err_true", () => assertEquals(Err(1).containsErr(1), true));
  await t.step("err_false", () => assertEquals(Err(1).containsErr(0), false));
});

Deno.test("expect", async (t) => {
  await t.step("ok", () => assertEquals(Ok(1).expect("returns"), 1));
  await t.step(
    "err",
    () => assertThrows(() => Err(1).expect("throws"), Error, "throws"),
  );
});

Deno.test("expect_err", async (t) => {
  await t.step(
    "ok",
    () => assertThrows(() => Ok(1).expectErr("throws"), Error, "throws"),
  );
  await t.step("err", () => assertEquals(Err(1).expectErr("returns"), 1));
});

Deno.test("unwrap", async (t) => {
  await t.step("ok", () => assertEquals(Ok(1).unwrap(), 1));
  await t.step(
    "err",
    () =>
      assertThrows(
        () => Err(1).unwrap(),
        Error,
        "called `Result.unwrap()` on an `Err` value",
      ),
  );
});

Deno.test("unwrap_err", async (t) => {
  await t.step(
    "ok",
    () =>
      assertThrows(
        () => Ok(1).unwrapErr(),
        Error,
        "called `Result.unwrapErr()` on an `Ok` value",
      ),
  );
  await t.step("err", () => assertEquals(Err(1).unwrapErr(), 1));
});

Deno.test("map", async (t) => {
  await t.step(
    "ok",
    () => assertEquals(Ok(1).map((v) => v + 1).contains(2), true),
  );
  await t.step(
    "err",
    () =>
      assertEquals(Err<number, number>(1).map((v) => v + 1).contains(2), false),
  );
});

Deno.test("map_err", async (t) => {
  await t.step(
    "ok",
    () =>
      assertEquals(
        Ok<number, number>(1).mapErr((v) => v + 1).containsErr(2),
        false,
      ),
  );
  await t.step(
    "err",
    () => assertEquals(Err(1).mapErr((v) => v + 1).containsErr(2), true),
  );
});

Deno.test("and", async (t) => {
  const one = Ok<number, number>(1);
  const two = Ok<number, number>(2);
  const err = Err(1);

  await t.step("ok_ok", () => assertEquals(one.and(two), two));
  await t.step("ok_err", () => assertEquals(one.and(err).isErr(), true));
  await t.step("err_ok", () => assertEquals(err.and(one).isErr(), true));
  await t.step(
    "err_err",
    () => assertEquals(err.and(err).isErr(), true),
  );
});

Deno.test("or", async (t) => {
  const one = Ok(1);
  const two = Ok(2);
  const err = Err<number, number>(1);

  await t.step("ok_ok", () => assertEquals(one.or(two), two));
  await t.step("ok_err", () => assertEquals(one.or(err), one));
  await t.step("err_ok", () => assertEquals(err.or(one), one));
  await t.step(
    "err_err",
    () => assertEquals(err.or(err).isErr(), true),
  );
});
