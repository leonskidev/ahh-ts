import { assert, assertStrictEquals, assertThrows } from "../../test_deps.ts";
import { None } from "../option/mod.ts";
import { R } from "./mod.ts";

const ERROR = Error("whoops");

Deno.test("is_ok", async (t) => {
  await t.step("ok", () => assert(R.isOk(1)));
  await t.step("err", () => assert(!R.isOk(ERROR)));
});

Deno.test("is_err", async (t) => {
  await t.step("ok", () => assert(!R.isErr(1)));
  await t.step("err", () => assert(R.isErr(ERROR)));
});

Deno.test("contains", async (t) => {
  await t.step("ok_equals", () => assert(R.contains(1, 1)));
  await t.step("ok_not_equals", () => assert(!R.contains(1, 2)));
  await t.step("err", () => assert(!R.contains(ERROR, 1)));
});

Deno.test("contains_err", async (t) => {
  await t.step("ok", () => assert(!R.containsErr(1, ERROR)));
  await t.step("err_equals", () => assert(R.containsErr(ERROR, ERROR)));
  await t.step(
    "err_not_equals",
    () => assert(!R.containsErr(ERROR, Error("nope"))),
  );
});

Deno.test("inspect", async (t) => {
  await t.step(
    "ok",
    () => assertStrictEquals(R.inspect(1, (i) => i + 1), 1),
  );
  await t.step(
    "err",
    () => assertStrictEquals(R.inspect(ERROR, (i: number) => i + 1), ERROR),
  );
});

Deno.test("inspect_err", async (t) => {
  await t.step(
    "ok",
    () => assertStrictEquals(R.inspectErr(1, (_) => Error("nope")), 1),
  );
  await t.step(
    "err",
    () => assertStrictEquals(R.inspectErr(ERROR, (_) => Error("nope")), ERROR),
  );
});

Deno.test("map", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.map(1, (i) => i + 1), 2));
  await t.step(
    "err",
    () => assertStrictEquals(R.map(ERROR, (i: number) => i + 1), ERROR),
  );
});

Deno.test("map_err", async (t) => {
  const ERROR_NEW = Error("new");
  await t.step(
    "ok",
    () => assertStrictEquals(R.mapErr(1, (_) => ERROR_NEW), 1),
  );
  await t.step(
    "err",
    () => assertStrictEquals(R.mapErr(ERROR, (_) => ERROR_NEW), ERROR_NEW),
  );
});

Deno.test("unwrap", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.unwrap(1), 1));
  await t.step(
    "err",
    () =>
      void assertThrows(
        () => R.unwrap(ERROR),
        Error,
        `attempted to unwrap an \`Err\` value: ${ERROR.message}`,
      ),
  );
});

Deno.test("unwrap_or", async (t) => {
  await t.step(
    "ok",
    () => assertStrictEquals(R.unwrapOr<number, Error>(1, 2), 1),
  );
  await t.step("err", () => assertStrictEquals(R.unwrapOr(ERROR, 2), 2));
});

Deno.test("or", async (t) => {
  await t.step("ok_ok", () => assertStrictEquals(R.or(1, 2), 1));
  await t.step("ok_err", () => assertStrictEquals(R.or(1, ERROR), 1));
  await t.step(
    "err_ok",
    () => assertStrictEquals(R.or<number, Error, Error>(ERROR, 2), 2),
  );
  await t.step("err_err", () => assertStrictEquals(R.or(ERROR, ERROR), ERROR));
});

Deno.test("or", async (t) => {
  await t.step("ok_ok", () => assertStrictEquals(R.and(1, 2), 2));
  await t.step("ok_err", () => assertStrictEquals(R.and(1, ERROR), ERROR));
  await t.step(
    "err_ok",
    () => assertStrictEquals(R.and(ERROR, 2), ERROR),
  );
  await t.step("err_err", () => assertStrictEquals(R.and(ERROR, ERROR), ERROR));
});

Deno.test("ok", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.ok(1), 1));
  await t.step("err", () => assertStrictEquals(R.ok(ERROR), None));
});

Deno.test("err", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.err(1), None));
  await t.step("err", () => assertStrictEquals(R.err(ERROR), ERROR));
});

Deno.test("fn", async (t) => {
  await t.step("ok", () => assertStrictEquals(R.fn(() => 1), 1));
  await t.step("err", () =>
    assertStrictEquals(
      R.fn(() => {
        throw ERROR;
      }),
      ERROR,
    ));
});

// Deno.test("is_ok", async (t) => {
//   await t.step("ok", () => assert(R.isOk(1)));
//   await t.step("err", () => assert(!R.isOk(Error("whoops"))));
// });

// Deno.test("is_err", async (t) => {
//   await t.step("ok", () => assert(!R.isErr(1)));
//   await t.step("err", () => assert(R.isErr(Error("whoops"))));
// });

// Deno.test("expect", async (t) => {
//   await t.step("ok", () => assertStrictEquals(R.expect(1, "returns"), 1));
//   await t.step(
//     "err",
//     () =>
//       void assertThrows(
//         () => R.expect(Error("whoops"), "throws"),
//         Error,
//         "throws",
//       ),
//   );
// });

// Deno.test("expect_err", async (t) => {
//   await t.step(
//     "ok",
//     () => void assertThrows(() => R.expectErr(1, "throws"), Error, "throws"),
//   );
//   await t.step(
//     "err",
//     () =>
//       assertEquals(
//         { ...R.expectErr(Error("whoops"), "returns"), stack: undefined },
//         { ...Error("whoops"), stack: undefined },
//       ),
//   );
// });

// Deno.test("unwrap", async (t) => {
//   await t.step("ok", () => assertStrictEquals(R.unwrap(1), 1));
//   await t.step(
//     "err",
//     () =>
//       void assertThrows(
//         () => R.unwrap(Error("whoops")),
//         Error,
//         "called `unwrap()` on an `Err` value: whoops",
//       ),
//   );
// });

// Deno.test("unwrap_err", async (t) => {
//   await t.step(
//     "ok",
//     () =>
//       void assertThrows(
//         () => R.unwrapErr(1),
//         Error,
//         "called `unwrapErr()` on an `Ok` value: 1",
//       ),
//   );
//   await t.step(
//     "err",
//     () =>
//       assertEquals({ ...R.unwrapErr(Error("whoops")), stack: undefined }, {
//         ...Error("whoops"),
//         stack: undefined,
//       }),
//   );
// });

// Deno.test("unwrap_or", async (t) => {
//   await t.step(
//     "ok",
//     () => assertStrictEquals(R.unwrapOr<number, Error>(1, 5), 1),
//   );
//   await t.step(
//     "err",
//     () => assertStrictEquals(R.unwrapOr(Error("whoops"), 5), 5),
//   );
// });

// Deno.test("map", async (t) => {
//   await t.step("ok", () => assertEquals(R.map(1, (i) => i + 1), 2));
//   await t.step(
//     "err",
//     () =>
//       assertEquals(
//         R.map<number, Error, number>(Error("foo"), (i) => i + 1),
//         Error("foo"),
//       ),
//   );
// });

// Deno.test("map_err", async (t) => {
//   await t.step(
//     "ok",
//     () =>
//       assertEquals(
//         R.mapErr(1, (i) => Error(i.message + "bar")),
//         1,
//       ),
//   );
//   await t.step(
//     "err",
//     () =>
//       assertEquals(
//         R.mapErr(Error("foo"), (i) => Error(i.message + "bar")),
//         Error("foobar"),
//       ),
//   );
// });

// Deno.test("contains", async (t) => {
//   await t.step("ok_equals", () => assert(R.contains(1, 1)));
//   await t.step("ok_not_equals", () => assert(!R.contains(1, 2)));
//   await t.step("err", () => assert(!R.contains(Error("whoops"), 1)));
// });

// Deno.test("contains_err", async (t) => {
//   await t.step("ok", () => assert(!R.containsErr(1, Error("whoops"))));
//   await t.step(
//     "err_equals",
//     () => assert(R.containsErr(Error("whoops"), Error("whoops"))),
//   );
//   await t.step(
//     "err_not_equals",
//     () => assert(!R.containsErr(Error("whoops"), Error("spoohw"))),
//   );
// });

// Deno.test("ok", async (t) => {
//   await t.step("ok", () => assertStrictEquals(R.ok(1), 1));
//   await t.step("err", () => assertStrictEquals(R.ok(Error("whoops")), None));
// });

// Deno.test("err", async (t) => {
//   await t.step("ok", () => assertStrictEquals(R.err(1), None));
//   await t.step(
//     "err",
//     () =>
//       assertEquals({ ...R.err(Error("whoops")), stack: undefined }, {
//         ...Error("whoops"),
//         stack: undefined,
//       }),
//   );
// });
