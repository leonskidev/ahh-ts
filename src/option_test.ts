import {
  assert,
  assertArrayIncludes,
  assertFalse,
  assertStrictEquals,
} from "../test_deps.ts";
import O from "./option.ts";

const toString = (i: number): string => i.toString();

Deno.test("isSome", async (t) => {
  await t.step("truthy", async (t) => {
    await t.step("true", () => assert(O.isSome(true)));
    await t.step("Infinity", () => assert(O.isSome(Infinity)));
    await t.step("12.3", () => assert(O.isSome(12.3)));
    await t.step("-12.3", () => assert(O.isSome(-12.3)));
    await t.step("123n", () => assert(O.isSome(123n)));
    await t.step("-123n", () => assert(O.isSome(-123n)));
    await t.step("{}", () => assert(O.isSome({})));
  });

  await t.step("falsy", async (t) => {
    await t.step("false", () => assert(O.isSome(false)));
    await t.step("NaN", () => assert(O.isSome(NaN)));
    await t.step("0", () => assert(O.isSome(0)));
    await t.step("-0", () => assert(O.isSome(-0)));
    await t.step("0n", () => assert(O.isSome(0n)));
    await t.step('""', () => assert(O.isSome("")));

    await t.step("nullish", async (t) => {
      await t.step("undefined", () => assertFalse(O.isSome(undefined)));
      await t.step("null", () => assertFalse(O.isSome(null)));
    });
  });
});

Deno.test("isNone", async (t) => {
  await t.step("truthy", async (t) => {
    await t.step("true", () => assertFalse(O.isNone(true)));
    await t.step("Infinity", () => assertFalse(O.isNone(Infinity)));
    await t.step("12.3", () => assertFalse(O.isNone(12.3)));
    await t.step("-12.3", () => assertFalse(O.isNone(-12.3)));
    await t.step("123n", () => assertFalse(O.isNone(123n)));
    await t.step("-123n", () => assertFalse(O.isNone(-123n)));
    await t.step("{}", () => assertFalse(O.isNone({})));
  });

  await t.step("falsy", async (t) => {
    await t.step("false", () => assertFalse(O.isNone(false)));
    await t.step("NaN", () => assertFalse(O.isNone(NaN)));
    await t.step("0", () => assertFalse(O.isNone(0)));
    await t.step("-0", () => assertFalse(O.isNone(-0)));
    await t.step("0n", () => assertFalse(O.isNone(0n)));
    await t.step('""', () => assertFalse(O.isNone("")));

    await t.step("nullish", async (t) => {
      await t.step("undefined", () => assert(O.isNone(undefined)));
      await t.step("null", () => assert(O.isNone(null)));
    });
  });
});

Deno.test("map", async (t) => {
  await t.step("none", async (t) => {
    await t.step(
      "undefined",
      () => assert(O.isNone(O.map(undefined, toString))),
    );
    await t.step("null", () => assert(O.isNone(O.map(null, toString))));
  });
  await t.step("some", () => assertStrictEquals(O.map(2, toString), "2"));
});

Deno.test("zip", async (t) => {
  await t.step("none none", async (t) => {
    await t.step(
      "undefined undefined",
      () => assertStrictEquals(O.zip(undefined, undefined), undefined),
    );
    await t.step(
      "null undefined",
      () => assertStrictEquals(O.zip(null, undefined), null),
    );
    await t.step(
      "undefined null",
      () => assertStrictEquals(O.zip(undefined, null), undefined),
    );
    await t.step(
      "null null",
      () => assertStrictEquals(O.zip(null, null), null),
    );
  });

  await t.step("none some", async (t) => {
    await t.step(
      "undefined",
      () => assertStrictEquals(O.zip(undefined, 2), undefined),
    );
    await t.step(
      "null",
      () => assertStrictEquals(O.zip(null, 2), null),
    );
  });

  await t.step("some none", async (t) => {
    await t.step(
      "undefined",
      () => assertStrictEquals(O.zip(2, undefined), undefined),
    );
    await t.step(
      "null",
      () => assertStrictEquals(O.zip(2, null), null),
    );
  });

  await t.step("some some", () => {
    const zipped = O.zip(2, 4);

    assert(O.isSome(zipped));
    assertArrayIncludes(zipped, [2, 4]);
  });
});

Deno.test("unzip", async (t) => {
  await t.step("none", async (t) => {
    await t.step(
      "undefined",
      () => assertArrayIncludes(O.unzip(undefined), [undefined, undefined]),
    );
    await t.step(
      "null",
      () => assertArrayIncludes(O.unzip(null), [null, null]),
    );
  });
  await t.step("some", () => assertArrayIncludes(O.unzip([2, 4]), [2, 4]));
});
