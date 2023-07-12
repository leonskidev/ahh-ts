import { assertEquals } from "../test_deps.ts";
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

Deno.test("def", () => assertEquals(D.def(Vec2), new Vec2()));
