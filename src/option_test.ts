import { O } from "../mod.ts";
import {
    assert,
    assertArrayIncludes,
    assertFalse,
    assertStrictEquals,
} from "../test_deps.ts";

Deno.test("isSome", async (t) => {
    await t.step("nullish", () => {
        assertFalse(O.isSome(undefined));
        assertFalse(O.isSome(null));
    });

    await t.step("falsy", () => {
        assert(O.isSome(false));
        assert(O.isSome(NaN));
        assert(O.isSome(0));
        assert(O.isSome(-0));
        assert(O.isSome(0n));
        assert(O.isSome(""));
    });

    await t.step("truthy", () => {
        assert(O.isSome(true));
        assert(O.isSome(Infinity));
        assert(O.isSome(123));
        assert(O.isSome(-123));
        assert(O.isSome(123n));
        assert(O.isSome("hello, world!"));
    });
});

Deno.test("isNone", async (t) => {
    await t.step("nullish", () => {
        assert(O.isNone(undefined));
        assert(O.isNone(null));
    });

    await t.step("falsy", () => {
        assertFalse(O.isNone(false));
        assertFalse(O.isNone(NaN));
        assertFalse(O.isNone(0));
        assertFalse(O.isNone(-0));
        assertFalse(O.isNone(0n));
        assertFalse(O.isNone(""));
    });

    await t.step("truthy", () => {
        assertFalse(O.isNone(true));
        assertFalse(O.isNone(Infinity));
        assertFalse(O.isNone(123));
        assertFalse(O.isNone(-123));
        assertFalse(O.isNone(123n));
        assertFalse(O.isNone("hello, world!"));
    });
});

Deno.test("map", async (t) => {
    await t.step("none", () => {
        assertStrictEquals(O.map(undefined, String), undefined);
        assertStrictEquals(O.map(123, () => null), null);
    });

    await t.step("some", () => {
        assertStrictEquals(O.map(123, String), "123");
    });
});

Deno.test("zip", async (t) => {
    await t.step("none", () => {
        assertStrictEquals(O.zip(undefined, null), undefined);
        assertStrictEquals(O.zip(undefined, 123), undefined);
        assertStrictEquals(O.zip(123, null), null);
    });

    await t.step("some", () => {
        assertArrayIncludes(O.zip(123, "hello"), [123, "hello"]);
    });
});
Deno.test("unzip", async (t) => {
    await t.step("none", () => {
        assertArrayIncludes(O.unzip(undefined), [undefined, undefined]);
        assertArrayIncludes(O.unzip(null), [null, null]);
    });

    await t.step("some", () => {
        assertArrayIncludes(O.unzip([123, "hello"]), [123, "hello"]);
    });
});
