import { assertEquals, assertStrictEquals } from "../test_deps.ts";
import D from "./default.ts";

class Vec2 {
  x: number;
  y: number;

  constructor();
  constructor(v: number);
  constructor(x?: number, y?: number);
  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? x ?? 0;
  }
}

Deno.test("def", async (t) => {
  await t.step("default", () => assertEquals(D.def(Vec2), new Vec2()));
  await t.step(
    "undefined",
    () => assertStrictEquals(D.def("undefined"), undefined),
  );
  await t.step("null", () => assertStrictEquals(D.def("null"), null));
  await t.step("boolean", () => assertStrictEquals(D.def("boolean"), false));
  await t.step("number", () => assertStrictEquals(D.def("number"), 0));
  await t.step("bigint", () => assertStrictEquals(D.def("bigint"), 0n));
  await t.step("string", () => assertStrictEquals(D.def("string"), ""));
});
