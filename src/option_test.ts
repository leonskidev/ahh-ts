import { assertEquals, assertThrows } from "../deps.ts";
import {
  and,
  expect,
  flatten,
  isNone,
  isSome,
  map,
  None,
  or,
  Some,
  unwrap,
  xor,
} from "./option.ts";

Deno.test(
  "some",
  () => assertEquals(Some(1), { _tag: "some", value: 1 }),
);

Deno.test(
  "none",
  () => assertEquals(None, { _tag: "none" }),
);

Deno.test(
  "is_some",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(isSome(Some(1)), true),
    );

    await t.step(
      "none",
      () => assertEquals(isSome(None), false),
    );
  },
);

Deno.test(
  "is_none",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(isNone(Some(1)), false),
    );

    await t.step(
      "none",
      () => assertEquals(isNone(None), true),
    );
  },
);

Deno.test(
  "expect",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(expect(Some(1), "ok"), 1),
    );

    await t.step(
      "none",
      () => assertThrows(() => expect(None, "failed"), TypeError, "failed"),
    );
  },
);

Deno.test(
  "unwrap",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(unwrap(Some(1)), 1),
    );

    await t.step(
      "none",
      () =>
        assertThrows(
          () => unwrap(None),
          TypeError,
          "called `unwrap()` on a `None`",
        ),
    );
  },
);

Deno.test(
  "and",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(and(Some(1), Some(2)), Some(2)),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(and(Some(1), None), None),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(and(None, Some(2)), None),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(and(None, None), None),
    );
  },
);

Deno.test(
  "or",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(or(Some(1), Some(2)), Some(1)),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(or(Some(1), None), Some(1)),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(or(None, Some(2)), Some(2)),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(or(None, None), None),
    );
  },
);

Deno.test(
  "xor",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(xor(Some(1), Some(2)), None),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(xor(Some(1), None), Some(1)),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(xor(None, Some(2)), Some(2)),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(xor(None, None), None),
    );
  },
);

Deno.test(
  "flatten",
  async (t) => {
    await t.step(
      "two_deep",
      () => assertEquals(flatten(Some(Some(1))), Some(1)),
    );

    await t.step(
      "three_deep",
      () => assertEquals(flatten(Some(Some(Some(1)))), Some(Some(1))),
    );
  },
);

Deno.test(
  "map",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(map(Some(1), (num) => num + 1), Some(2)),
    );

    await t.step(
      "none",
      () => assertEquals(map(None, (num) => num + 1), None),
    );
  },
);
