import { assert, assertEquals, assertStrictEquals } from "../../test_deps.ts";
import { None } from "../option/mod.ts";
import { I } from "./mod.ts";

Deno.test("from_fn", () => {
  const iter = I.fn(() => 1);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 1);
});

Deno.test("from_iter", () => {
  const iter = I.iter([1, 2]);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("empty", () => {
  const iter = I.empty();

  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("once", () => {
  const iter = I.once(1);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("repeat", () => {
  const iter = I.repeat(1);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 1);
});

Deno.test("successors", () => {
  const iter = I.successors(0, (i) => i + 1);

  assertStrictEquals(iter.next(), 0);
  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
});

Deno.test("zip", () => {
  const iter = I.zip(I.iter([1, 2, 3]), I.iter(["4", "5", "6", "7"]));

  assertEquals(iter.next(), [1, "4"]);
  assertEquals(iter.next(), [2, "5"]);
  assertEquals(iter.next(), [3, "6"]);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("chain", () => {
  const iter = I.chain(I.iter([1, 2, 3]), I.iter([4, 5]));

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), 4);
  assertStrictEquals(iter.next(), 5);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("inspect", () => {
  const iter = I.inspect(I.iter([1, 2, 3]), (i) => i * i);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("map", () => {
  const iter = I.map(I.iter([1, 2, 3]), (i) => i * i);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 4);
  assertStrictEquals(iter.next(), 9);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("enumerate", () => {
  const iter = I.enumerate(I.iter(["hello", "there", "world"]));

  assertEquals(iter.next(), [0, "hello"]);
  assertEquals(iter.next(), [1, "there"]);
  assertEquals(iter.next(), [2, "world"]);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("skip", () => {
  const iter = I.skip(I.iter([1, 2, 3]), 1);

  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("skip_while", () => {
  const iter = I.skipWhile(I.iter([1, 3, 2, 3]), (i) => i % 2 !== 0);

  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("task", () => {
  const iter = I.take(I.iter([1, 2, 3]), 2);

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("take_while", () => {
  const iter = I.takeWhile(I.iter([4, 2, 3, 4]), (i) => i % 2 === 0);

  assertStrictEquals(iter.next(), 4);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("peekable", () => {
  const iter = I.peekable(I.iter([1, 2, 3]));

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.peek(), 2);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.peek(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("for_each", () => {
  const iter = I.iter([0, 1, 2]);

  I.forEach(I.enumerate(iter), ([i, item]) => assertStrictEquals(i, item));
});

Deno.test("fold", () => {
  const iter = I.iter([1, 2, 3]);

  assertStrictEquals(I.fold(iter, 0, (a, b) => a + b), 6);
});

Deno.test("count", () => {
  const iter = I.iter(["hello", "there", "world"]);

  assertStrictEquals(I.count(iter), 3);
});

Deno.test("last", () => {
  const iter = I.iter([1, 2, 3]);

  assertStrictEquals(I.last(iter), 3);
  assertStrictEquals(I.last(I.empty()), None);
});

Deno.test("nth", () => {
  const iter = I.iter([1, 2, 3]);

  assertStrictEquals(I.nth(iter, 1), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("find", () => {
  const iter = I.iter([1, 2, 3]);

  assertStrictEquals(I.find(iter, (i) => i > 1), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("filter", () => {
  const iter = I.filter(I.iter([1, 2, 3, 4]), (i) => i % 2 === 0);

  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 4);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

Deno.test("flatten", () => {
  const iter = I.flatten(I.iter([I.once(1), I.empty(), I.iter([2, 3])]));

  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 3);
  assertStrictEquals(iter.next(), None);
  assertStrictEquals(iter.next(), None);
});

// Deno.test("all", async (t) => {
//   const iter = I.iter([2, 4, 6]);

//   await t.step("equals", () => assert(I.all(iter, (i) => i > 0)));
//   await t.step("not_equals", () => assert(!I.all(iter, (i) => i > 4)));
// });

Deno.test("any", async (t) => {
  const iter = I.iter([2, 4, 6]);

  await t.step("equals", () => assert(I.any(iter, (i) => i > 4)));
  await t.step("not_equals", () => assert(!I.any(iter, (i) => i > 6)));
});

Deno.test("next_if", async (t) => {
  const iter = I.peekable(I.iter([1, 2]));

  await t.step(
    "equals",
    () => assertStrictEquals(I.nextIf(iter, (i) => i < 2), 1),
  );
  await t.step(
    "not_equals",
    () => assertStrictEquals(I.nextIf(iter, (i) => i < 2), None),
  );
  await t.step("check_next", () => assertStrictEquals(iter.next(), 2));
  await t.step(
    "none",
    () => assertStrictEquals(I.nextIf(iter, () => true), None),
  );
});
