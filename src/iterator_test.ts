// import {
//   assert,
//   assertArrayIncludes,
//   assertStrictEquals,
// } from "../test_deps.ts";
// import { default as I } from "./iterator.ts";
// import { default as O } from "./option.ts";

// Deno.test("iter", () => {
//   const iter = I.iter([1, "hello", 3]);

//   assertStrictEquals(iter.next(), 1);
//   assertStrictEquals(iter.next(), "hello");
//   assertStrictEquals(iter.next(), 3);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("empty", () => {
//   const iter = I.empty();

//   assert(O.isNone(iter.next()));
//   assert(O.isNone(iter.next()));
//   assert(O.isNone(iter.next()));
// });

// Deno.test("once", () => {
//   const iter = I.once("hello");

//   assertStrictEquals(iter.next(), "hello");
//   assert(O.isNone(iter.next()));
//   assert(O.isNone(iter.next()));
// });

// Deno.test("repeat", () => {
//   const iter = I.repeat(8);

//   assertStrictEquals(iter.next(), 8);
//   assertStrictEquals(iter.next(), 8);
//   assertStrictEquals(iter.next(), 8);
// });

// Deno.test("successors", () => {
//   const iter = I.successors(0, (i) => i + 1);

//   assertStrictEquals(iter.next(), 0);
//   assertStrictEquals(iter.next(), 1);
//   assertStrictEquals(iter.next(), 2);
// });

// Deno.test("map", () => {
//   const iter = I.iter([1, 2, 3]).map((i) => i * 2);

//   assertStrictEquals(iter.next(), 2);
//   assertStrictEquals(iter.next(), 4);
//   assertStrictEquals(iter.next(), 6);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("find", () => {
//   const odd = (i: number): boolean => i % 2 !== 0;

//   const iter = I.iter([1, 2, 3]);

//   assertStrictEquals(iter.find(odd), 1);
//   assertStrictEquals(iter.find(odd), 3);
//   assert(O.isNone(iter.find(odd)));
// });

// Deno.test("filter", () => {
//   const iter = I.iter([1, 2, 3]).filter((i) => i % 2 !== 0);

//   assertStrictEquals(iter.next(), 1);
//   assertStrictEquals(iter.next(), 3);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("zip", () => {
//   const iter = I.iter([1, 2, 3]).zip(I.iter(["hello", "world"]));

//   let value = iter.next();
//   assert(O.isSome(value));
//   assertArrayIncludes(value, [1, "hello"]);

//   value = iter.next();
//   assert(O.isSome(value));
//   assertArrayIncludes(value, [2, "world"]);

//   assert(O.isNone(iter.next()));
// });

// Deno.test("chain", () => {
//   const iter = I.iter([1]).chain(I.iter([2, 3]));

//   assertStrictEquals(iter.next(), 1);
//   assertStrictEquals(iter.next(), 2);
//   assertStrictEquals(iter.next(), 3);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("enumerate", () => {
//   const iter = I.iter(["hello", "world"]).enumerate();

//   let value = iter.next();
//   assert(O.isSome(value));
//   assertArrayIncludes(value, [0, "hello"]);

//   value = iter.next();
//   assert(O.isSome(value));
//   assertArrayIncludes(value, [1, "world"]);

//   assert(O.isNone(iter.next()));
// });

// Deno.test("peekable", async (t) => {
//   await t.step("peek", () => {
//     const iter = I.iter([1, 2, 3]).peekable();

//     assertStrictEquals(iter.peek(), 1);
//     assertStrictEquals(iter.next(), 1);
//     assertStrictEquals(iter.next(), 2);
//     assertStrictEquals(iter.peek(), 3);
//     assertStrictEquals(iter.peek(), 3);
//     assertStrictEquals(iter.next(), 3);
//     assert(O.isNone(iter.next()));
//   });

//   await t.step("next_if", () => {
//     const odd = (i: number): boolean => i % 2 !== 0;
//     const iter = I.iter([1, 2, 3]).peekable();

//     assertStrictEquals(iter.nextIf(odd), 1);
//     assert(O.isNone(iter.nextIf(odd)));
//     assertStrictEquals(iter.next(), 2);
//     assertStrictEquals(iter.nextIf(odd), 3);
//     assert(O.isNone(iter.nextIf(odd)));
//     assert(O.isNone(iter.next()));
//   });
// });

// Deno.test("for_each", () => {
//   const iter = I.iter([1, 2, 3]);
//   let count = 1;

//   iter.forEach((value) => assertStrictEquals(value, count++));
//   assert(O.isNone(iter.next()));
// });

// Deno.test("fold", () => {
//   const iter = I.iter([1, 2, 3]);

//   const arr = iter.fold<number[]>([], (init, i) => {
//     init.push(i);
//     return init;
//   });

//   assertArrayIncludes(arr, [1, 2, 3]);
// });

// Deno.test("count", () => {
//   const iter = I.iter([1, 2, 3]);

//   assertStrictEquals(iter.count(), 3);
// });

// Deno.test("last", () => {
//   const iter = I.iter([1, 2, 3]);

//   assertStrictEquals(iter.last(), 3);
// });

// Deno.test("skip", () => {
//   const iter = I.iter([1, 2, 3]).skip(2);

//   assertStrictEquals(iter.next(), 3);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("take", () => {
//   const iter = I.iter([1, 2, 3]).take(2);

//   assertStrictEquals(iter.next(), 1);
//   assertStrictEquals(iter.next(), 2);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("skip_while", () => {
//   const iter = I.iter([1, 3, 2]).skipWhile((i) => i % 2 !== 0);

//   assertStrictEquals(iter.next(), 2);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("take_while", () => {
//   const iter = I.iter([1, 3, 2]).takeWhile((i) => i % 2 !== 0);

//   assertStrictEquals(iter.next(), 1);
//   assertStrictEquals(iter.next(), 3);
//   assert(O.isNone(iter.next()));
// });

// Deno.test("nth", () => {
//   const iter = I.iter([1, 2, 3, 4, 5]);

//   assertStrictEquals(iter.nth(0), 1);
//   assertStrictEquals(iter.next(), 2);
//   assertStrictEquals(iter.nth(2), 5);
//   assert(O.isNone(iter.next()));
// });
