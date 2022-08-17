import { assert, assertEquals, assertThrows } from "../../test_deps.ts";
import { E, Left, Right } from "./mod.ts";
import { None, Some } from "../option/mod.ts";

Deno.test("left", () => assertEquals(Left(1), { [Symbol.for("left")]: 1 }));
Deno.test("right", () => assertEquals(Right(1), { [Symbol.for("right")]: 1 }));

Deno.test("is_left", async (t) => {
  await t.step("left", () => assert(E.isLeft(Left(1))));
  await t.step("right", () => assert(!E.isLeft(Right(1))));
});

Deno.test("is_right", async (t) => {
  await t.step("left", () => assert(!E.isRight(Left(1))));
  await t.step("right", () => assert(E.isRight(Right(1))));
});

Deno.test("expect_left", async (t) => {
  await t.step("left", () => assertEquals(E.expectLeft(Left(1), "returns"), 1));
  await t.step(
    "right",
    () => assertThrows(() => E.expectLeft(Right(1), "throws"), Error, "throws"),
  );
});

Deno.test("expect_right", async (t) => {
  await t.step(
    "left",
    () => assertThrows(() => E.expectRight(Left(1), "throws"), Error, "throws"),
  );
  await t.step(
    "right",
    () => assertEquals(E.expectRight(Right(1), "returns"), 1),
  );
});

Deno.test("unwrap_left", async (t) => {
  await t.step("left", () => assertEquals(E.unwrapLeft(Left(1)), 1));
  await t.step(
    "right",
    () =>
      assertThrows(
        () => E.unwrapLeft(Right(1)),
        Error,
        "called `unwrapLeft()` on a `Right` value: 1",
      ),
  );
});

Deno.test("unwrap_right", async (t) => {
  await t.step(
    "left",
    () =>
      assertThrows(
        () => E.unwrapRight(Left(1)),
        Error,
        "called `unwrapRight()` on a `Left` value: 1",
      ),
  );
  await t.step("right", () => assertEquals(E.unwrapRight(Right(1)), 1));
});

Deno.test("map", async (t) => {
  await t.step(
    "left",
    () => assertEquals(E.map(Left<number, number>(1), (i) => i + 1), Left(2)),
  );
  await t.step(
    "right",
    () => assertEquals(E.map(Right<number, number>(1), (i) => i + 1), Right(2)),
  );
});

Deno.test("map_left", async (t) => {
  await t.step(
    "left",
    () =>
      assertEquals(E.mapLeft(Left<number, number>(1), (i) => i + 1), Left(2)),
  );
  await t.step(
    "right",
    () =>
      assertEquals(E.mapLeft(Right<number, number>(1), (i) => i + 1), Right(1)),
  );
});

Deno.test("map_right", async (t) => {
  await t.step(
    "left",
    () =>
      assertEquals(E.mapRight(Left<number, number>(1), (i) => i + 1), Left(1)),
  );
  await t.step(
    "right",
    () =>
      assertEquals(
        E.mapRight(Right<number, number>(1), (i) => i + 1),
        Right(2),
      ),
  );
});

Deno.test("either", async (t) => {
  await t.step(
    "left",
    () =>
      assertEquals(
        E.either(Left<number, number>(1), (i) => i + 1, (i) => i - 1),
        2,
      ),
  );
  await t.step(
    "right",
    () =>
      assertEquals(
        E.either(Right<number, number>(1), (i) => i + 1, (i) => i - 1),
        0,
      ),
  );
});

Deno.test("contains", async (t) => {
  await t.step("left_true", () => assert(E.contains(Left(1), 1)));
  await t.step("left_false", () => assert(!E.contains(Left(1), 0)));
  await t.step("right_true", () => assert(E.contains(Right(1), 1)));
  await t.step("right_false", () => assert(!E.contains(Right(1), 0)));
});

Deno.test("contains_left", async (t) => {
  await t.step("left_true", () => assert(E.containsLeft(Left(1), 1)));
  await t.step("left_false", () => assert(!E.containsLeft(Left(1), 0)));
  await t.step("right", () => assert(!E.containsLeft(Right(1), 1)));
});

Deno.test("contains_right", async (t) => {
  await t.step("right_true", () => assert(E.containsRight(Right(1), 1)));
  await t.step("right_false", () => assert(!E.containsRight(Right(1), 0)));
  await t.step("left", () => assert(!E.containsRight(Left(1), 1)));
});

Deno.test("flatten_left", async (t) => {
  await t.step(
    "left_left",
    () => assertEquals(E.flattenLeft(Left(Left(1))), Left(1)),
  );
  await t.step(
    "left_right",
    () => assertEquals(E.flattenLeft(Left(Right(0))), Right(0)),
  );
  await t.step("right", () => assertEquals(E.flattenLeft(Right(0)), Right(0)));
});

Deno.test("flatten_right", async (t) => {
  await t.step(
    "right_right",
    () => assertEquals(E.flattenRight(Right(Right(1))), Right(1)),
  );
  await t.step(
    "right_left",
    () => assertEquals(E.flattenRight(Right(Left(0))), Left(0)),
  );
  await t.step("left", () => assertEquals(E.flattenRight(Left(0)), Left(0)));
});

Deno.test("into_left", () => assertEquals(E.intoLeft(Left(1)), 1));

Deno.test("into_right", () => assertEquals(E.intoRight(Right(1)), 1));

Deno.test("left", async (t) => {
  await t.step("left", () => assertEquals(E.left(Left(1)), Some(1)));
  await t.step("right", () => assertEquals(E.left(Right(1)), None));
});

Deno.test("right", async (t) => {
  await t.step("left", () => assertEquals(E.right(Left(1)), None));
  await t.step("right", () => assertEquals(E.right(Right(1)), Some(1)));
});

Deno.test("filp", async (t) => {
  await t.step("left", () => assertEquals(E.flip(Left(1)), Right(1)));
  await t.step("right", () => assertEquals(E.flip(Right(1)), Left(1)));
});
