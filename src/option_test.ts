import { assertEquals, assertThrows } from "../deps.ts";
import { None, Option, Some } from "./option.ts";

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
      () => assertEquals(Option.isSome(Some(1)), true),
    );

    await t.step(
      "none",
      () => assertEquals(Option.isSome(None), false),
    );
  },
);

Deno.test(
  "is_none",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(Option.isNone(Some(1)), false),
    );

    await t.step(
      "none",
      () => assertEquals(Option.isNone(None), true),
    );
  },
);

Deno.test(
  "expect",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(Option.expect(Some(1), "ok"), 1),
    );

    await t.step(
      "none",
      () =>
        assertThrows(() => Option.expect(None, "failed"), TypeError, "failed"),
    );
  },
);

Deno.test(
  "unwrap",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(Option.unwrap(Some(1)), 1),
    );

    await t.step(
      "none",
      () =>
        assertThrows(
          () => Option.unwrap(None),
          TypeError,
          "called `Option.unwrap()` on a `None`",
        ),
    );
  },
);

Deno.test(
  "and",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(Option.and(Some(1), Some(2)), Some(2)),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(Option.and(Some(1), None), None),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(Option.and(None, Some(2)), None),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(Option.and(None, None), None),
    );
  },
);

Deno.test(
  "or",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(Option.or(Some(1), Some(2)), Some(1)),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(Option.or(Some(1), None), Some(1)),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(Option.or(None, Some(2)), Some(2)),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(Option.or(None, None), None),
    );
  },
);

Deno.test(
  "xor",
  async (t) => {
    await t.step(
      "a_b",
      () => assertEquals(Option.xor(Some(1), Some(2)), None),
    );

    await t.step(
      "a_not_b",
      () => assertEquals(Option.xor(Some(1), None), Some(1)),
    );

    await t.step(
      "not_a_b",
      () => assertEquals(Option.xor(None, Some(2)), Some(2)),
    );

    await t.step(
      "not_a_not_b",
      () => assertEquals(Option.xor(None, None), None),
    );
  },
);

Deno.test(
  "flatten",
  async (t) => {
    await t.step(
      "two_deep",
      () => assertEquals(Option.flatten(Some(Some(1))), Some(1)),
    );

    await t.step(
      "three_deep",
      () => assertEquals(Option.flatten(Some(Some(Some(1)))), Some(Some(1))),
    );
  },
);

Deno.test(
  "map",
  async (t) => {
    await t.step(
      "some",
      () => assertEquals(Option.map(Some(1), (num) => num + 1), Some(2)),
    );

    await t.step(
      "none",
      () => assertEquals(Option.map(None, (num) => num + 1), None),
    );
  },
);
