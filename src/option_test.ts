import { assert, assertFalse, assertStrictEquals } from "../test_deps.ts";
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
