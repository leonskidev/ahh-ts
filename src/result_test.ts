import { assertEquals, assertThrows } from "../deps.ts";
import {
  and,
  Err,
  expect,
  flatten,
  isErr,
  isOk,
  map,
  Ok,
  or,
  unwrap,
} from "./result.ts";

Deno.test(
  "ok",
  () => assertEquals(Ok(1), { _tag: "ok", value: 1 }),
);

Deno.test(
  "err",
  () => assertEquals(Err(1), { _tag: "err", value: 1 }),
);

Deno.test(
  "is_ok",
  async (t) => {
    await t.step(
      "ok",
      () => assertEquals(isOk(Ok(1)), true),
    );

    await t.step(
      "err",
      () => assertEquals(isOk(Err(1)), false),
    );
  },
);

Deno.test(
  "is_err",
  async (t) => {
    await t.step(
      "ok",
      () => assertEquals(isErr(Ok(1)), false),
    );

    await t.step(
      "err",
      () => assertEquals(isErr(Err(1)), true),
    );
  },
);

Deno.test(
  "expect",
  async (t) => {
    await t.step(
      "ok",
      () => assertEquals(expect(Ok(1), "failed"), 1),
    );

    await t.step(
      "err",
      () =>
        assertThrows(() => expect(Err(1), "failed"), TypeError, "failed: 1"),
    );
  },
);

Deno.test(
  "unwrap",
  async (t) => {
    await t.step(
      "ok",
      () => assertEquals(unwrap(Ok(1)), 1),
    );

    await t.step(
      "err",
      () =>
        assertThrows(
          () => unwrap(Err(1)),
          TypeError,
          "called `unwrap()` on an `Err`: 1",
        ),
    );
  },
);

Deno.test(
  "and",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(and(Ok(1), Ok(2)), Ok(2)),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(and(Ok(1), Err(2)), Err(2)),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(and(Err(1), Ok(2)), Err(1)),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(and(Err(1), Err(2)), Err(1)),
    );
  },
);

Deno.test(
  "or",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(or(Ok(1), Ok(2)), Ok(1)),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(or(Ok(1), Err(2)), Ok(1)),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(or(Err(1), Ok(2)), Ok(2)),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(or(Err(1), Err(2)), Err(2)),
    );
  },
);

Deno.test(
  "flatten",
  async (t) => {
    await t.step(
      "two_deep_ok",
      () => assertEquals(flatten(Ok(Ok(1))), Ok(1)),
    );

    await t.step(
      "two_deep_err",
      () => assertEquals(flatten(Ok(Err(1))), Err(1)),
    );

    await t.step(
      "three_deep_ok",
      () => assertEquals(flatten(Ok(Ok(Ok(1)))), Ok(Ok(1))),
    );

    await t.step(
      "three_deep_err",
      () => assertEquals(flatten(Ok(Ok(Err(1)))), Ok(Err(1))),
    );
  },
);

Deno.test(
  "map",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(map(Ok(1), (num) => num + 1), Ok(2)),
    );

    await t.step(
      "none",
      () => assertEquals(map(Err<number, number>(1), (num) => num + 1), Err(1)),
    );
  },
);
