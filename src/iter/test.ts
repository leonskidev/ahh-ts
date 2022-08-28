import { assertEquals } from "../../test_deps.ts";
import { I } from "./mod.ts";
import { None, Some } from "../option/mod.ts";

Deno.test("next", () => {
  const iter = I.iter([0, 1, 2]);

  assertEquals(iter.next(), Some(0));
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), None);
});

Deno.test("iter", async (t) => {
  await t.step("empty", () => {
    const iter = I.iter([]);
    assertEquals(iter.next(), None);
  });
  await t.step("full", () => {
    const iter = I.iter([1, 2, 3]);
    assertEquals(iter.next(), Some(1));
    assertEquals(iter.next(), Some(2));
    assertEquals(iter.next(), Some(3));
    assertEquals(iter.next(), None);
  });
});

Deno.test("iterable", () => {
  const iter = I.iter([0, 1, 2, 3]);
  let next = 0;

  for (const i of iter) {
    assertEquals(i, next++);
  }
});

Deno.test("empty", () => {
  const iter = I.empty();
  assertEquals(iter.next(), None);
});

Deno.test("once", () => {
  const iter = I.once(1);

  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), None);
});

// NOTE: there's no way to really test this as it will go infinitely
Deno.test("repeat", () => {
  const iter = I.repeat(1);

  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(1));
});

Deno.test("successors", () => {
  const iter = I.successors(Some(0), (item) => Some(item + 1));

  assertEquals(iter.next(), Some(0));
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.next(), Some(4));
});

Deno.test("zip", () => {
  const iterA = I.iter([1, 2, 3]);
  const iterB = I.iter([4, 5, 6]);
  const iter = I.zip(iterA, iterB);

  assertEquals(iter.next(), Some([1, 4]));
  assertEquals(iter.next(), Some([2, 5]));
  assertEquals(iter.next(), Some([3, 6]));
  assertEquals(iter.next(), None);
});

Deno.test("chain", () => {
  const iterA = I.iter([1, 2, 3]);
  const iterB = I.iter([4, 5, 6]);
  const iter = I.chain(iterA, iterB);

  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.next(), Some(4));
  assertEquals(iter.next(), Some(5));
  assertEquals(iter.next(), Some(6));
  assertEquals(iter.next(), None);
});

Deno.test("map", () => {
  const iter = I.map(I.iter([1, 2, 3]), (item) => item * 2);

  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), Some(4));
  assertEquals(iter.next(), Some(6));
  assertEquals(iter.next(), None);
});

Deno.test("enumerate", () => {
  const iter = I.enumerate(I.iter([1, 2, 3]));

  assertEquals(iter.next(), Some([0, 1]));
  assertEquals(iter.next(), Some([1, 2]));
  assertEquals(iter.next(), Some([2, 3]));
  assertEquals(iter.next(), None);
});

Deno.test("flatten", () => {
  const iter = I.flatten(I.iter([I.iter([1, 2]), I.iter([3, 4])]));

  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.next(), Some(4));
  assertEquals(iter.next(), None);
});

Deno.test("skip", () => {
  const iter = I.skip(I.iter([1, 2, 3]), 2);
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.next(), None);
});

Deno.test("skip_while", () => {
  const iter = I.skipWhile(I.iter([1, 2, 3]), (item) => item < 3);
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.next(), None);
});

Deno.test("take", () => {
  const iter = I.take(I.iter([1, 2, 3]), 2);
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), None);
});

Deno.test("take_while", () => {
  const iter = I.takeWhile(I.iter([1, 2, 3]), (item) => item < 3);
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), None);
});

Deno.test("filter", () => {
  const iter = I.filter(I.iter([1, 2, 3]), (item) => item !== 2);

  assertEquals(iter.next(), Some(1));
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.next(), None);
});

Deno.test("peekable", () => {
  const iter = I.peekable(I.iter([1, 2, 3]));

  assertEquals(iter.peek(), Some(1));
  assertEquals(iter.peek(), Some(1));
  assertEquals(iter.next(), Some(1));
  assertEquals(iter.peek(), Some(2));
  assertEquals(iter.next(), Some(2));
  assertEquals(iter.next(), Some(3));
  assertEquals(iter.peek(), None);
  assertEquals(iter.next(), None);
});

Deno.test("for_each", () => {
  const iter = I.iter([0, 1, 2]);

  I.forEach(iter, () => void (0));
  assertEquals(iter.next(), None);
});

Deno.test("fold", () => {
  const iter = I.iter([1, 2, 3]);
  assertEquals(I.fold(iter, 0, (a, b) => a + b), 6);
});

Deno.test("count", () => {
  const iter = I.iter([1, 2, 3]);
  assertEquals(I.count(iter), 3);
});

Deno.test("last", () => {
  const iter = I.iter([1, 2, 3]);
  assertEquals(I.last(iter), Some(3));
});

Deno.test("nth", () => {
  const iter = I.iter([1, 2, 3]);
  assertEquals(I.nth(iter, 1), Some(2));
  assertEquals(I.nth(iter, 2), None);
});

Deno.test("find", () => {
  const iter = I.iter([1, 2, 3]);
  assertEquals(I.find(iter, (item) => item === 2), Some(2));
  assertEquals(I.find(iter, (item) => item === 2), None);
});
