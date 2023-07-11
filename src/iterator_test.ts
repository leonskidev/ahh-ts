import {
  assert,
  assertArrayIncludes,
  assertFalse,
  assertStrictEquals,
} from "../test_deps.ts";
import I from "./iterator.ts";
import O from "./option.ts";

const toString = (i: number): string => i.toString();
const odd = (i: number): boolean => i % 2 !== 0;
const sum = (a: number, b: number): number => a + b;

Deno.test("fromFn", async (t) => {
  await t.step("empty", () => {
    const iter = I.fromFn(() => undefined);
    assert(O.isNone(iter.next()));
  });

  await t.step("increment", () => {
    let count = 0;
    const iter = I.fromFn(() => count++);

    assertStrictEquals(iter.next(), 0);
    assertStrictEquals(iter.next(), 1);
    assertStrictEquals(iter.next(), 2);
  });
});

Deno.test("fromIter", async (t) => {
  await t.step("array", async (t) => {
    await t.step("empty", () => {
      const iter = I.fromIter([]);
      assert(O.isNone(iter.next()));
    });

    await t.step("items", () => {
      const iter = I.fromIter([1, 2, 3]);

      assertStrictEquals(iter.next(), 1);
      assertStrictEquals(iter.next(), 2);
      assertStrictEquals(iter.next(), 3);
      assert(O.isNone(iter.next()));
    });
  });

  await t.step("set", async (t) => {
    await t.step("empty", () => {
      const iter = I.fromIter(new Set([]));
      assert(O.isNone(iter.next()));
    });

    await t.step("items", () => {
      const iter = I.fromIter(new Set([1, 2, 2, 3]));

      assertStrictEquals(iter.next(), 1);
      assertStrictEquals(iter.next(), 2);
      assertStrictEquals(iter.next(), 3);
      assert(O.isNone(iter.next()));
    });
  });

  await t.step("map", async (t) => {
    await t.step("empty", () => {
      const iter = I.fromIter(new Map([]));
      assert(O.isNone(iter.next()));
    });

    await t.step("items", () => {
      const iter = I.fromIter(
        new Map([[1, "a"], [2, "b"], [2, "c"], [3, "d"]]),
      );

      let item = iter.next();
      assert(O.isSome(item));
      assertArrayIncludes(item, [1, "a"]);

      item = iter.next();
      assert(O.isSome(item));
      assertArrayIncludes(item, [2, "c"]);

      item = iter.next();
      assert(O.isSome(item));
      assertArrayIncludes(item, [3, "d"]);

      assert(O.isNone(iter.next()));
    });
  });
});

Deno.test("successors", () => {
  const iter = I.successors<number>(0, (i) => i + 1);

  assertStrictEquals(iter.next(), 0);
  assertStrictEquals(iter.next(), 1);
  assertStrictEquals(iter.next(), 2);
});

Deno.test("empty", () => {
  const iter = I.empty();
  assert(O.isNone(iter.next()));
});

Deno.test("repeat", () => {
  const iter = I.repeat(() => 2);

  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 2);
  assertStrictEquals(iter.next(), 2);
});

Deno.test("once", () => {
  const iter = I.once(2);

  assertStrictEquals(iter.next(), 2);
  assert(O.isNone(iter.next()));
});

Deno.test("map", () => {
  const iter = I.fromIter([1, 2, 3]);
  const iterMapped = iter.map(toString);

  assertStrictEquals(iterMapped.next(), "1");
  assertStrictEquals(iterMapped.next(), "2");
  assertStrictEquals(iterMapped.next(), "3");
  assert(O.isNone(iterMapped.next()));
  assert(O.isNone(iter.next()));
});

Deno.test("filter", () => {
  const iter = I.fromIter([1, 2, 3]);
  const iterFiltered = iter.filter(odd);

  assertStrictEquals(iterFiltered.next(), 1);
  assertStrictEquals(iterFiltered.next(), 3);
  assert(O.isNone(iterFiltered.next()));
  assert(O.isNone(iter.next()));
});

Deno.test("chain", () => {
  const iterLhs = I.fromIter([1]);
  const iterRhs = I.fromIter([2, 3]);
  const iterChained = iterLhs.chain(iterRhs);

  assertStrictEquals(iterChained.next(), 1);
  assertStrictEquals(iterChained.next(), 2);
  assertStrictEquals(iterChained.next(), 3);
  assert(O.isNone(iterChained.next()));
  assert(O.isNone(iterLhs.next()));
  assert(O.isNone(iterRhs.next()));
});

Deno.test("zip", () => {
  const iterLhs = I.fromIter([1, 2, 3]);
  const iterRhs = I.fromIter(["hello", "world"]);
  const iterZipped = iterLhs.zip(iterRhs);

  let item = iterZipped.next();
  assert(O.isSome(item));
  assertArrayIncludes(item, [1, "hello"]);

  item = iterZipped.next();
  assert(O.isSome(item));
  assertArrayIncludes(item, [2, "world"]);

  assert(O.isNone(iterZipped.next()));
  assert(O.isNone(iterLhs.next()));
  assert(O.isNone(iterRhs.next()));
});

Deno.test("intersperse", () => {
  const iterLhs = I.fromIter([1, 2, 3, 4]);
  const iterRhs = I.fromIter([-1, -1]);
  const iterInterspersed = iterLhs.intersperse(iterRhs);

  assertStrictEquals(iterInterspersed.next(), 1);
  assertStrictEquals(iterInterspersed.next(), -1);
  assertStrictEquals(iterInterspersed.next(), 2);
  assertStrictEquals(iterInterspersed.next(), -1);
  assertStrictEquals(iterInterspersed.next(), 3);
  assert(O.isNone(iterInterspersed.next()));
  assertStrictEquals(iterLhs.next(), 4);
  assert(O.isNone(iterLhs.next()));
  assert(O.isNone(iterRhs.next()));
});

Deno.test("enumerate", () => {
  const iter = I.fromIter(["hello", "world"]);
  const iterEnumerated = iter.enumerate();

  let item = iterEnumerated.next();
  assert(O.isSome(item));
  assertArrayIncludes(item, [0, "hello"]);

  item = iterEnumerated.next();
  assert(O.isSome(item));
  assertArrayIncludes(item, [1, "world"]);

  assert(O.isNone(iterEnumerated.next()));
  assert(O.isNone(iter.next()));
});

Deno.test("peekable", async (t) => {
  await t.step("peek", () => {
    const iter = I.fromIter([1, 2, 3]);
    const iterPeekabled = iter.peekable();

    assertStrictEquals(iterPeekabled.peek(), 1);
    assertStrictEquals(iterPeekabled.next(), 1);
    assertStrictEquals(iterPeekabled.next(), 2);
    assertStrictEquals(iterPeekabled.peek(), 3);
    assertStrictEquals(iterPeekabled.peek(), 3);
    assertStrictEquals(iterPeekabled.next(), 3);
    assert(O.isNone(iterPeekabled.next()));
    assert(O.isNone(iter.next()));
  });

  await t.step("nextIf", () => {
    const iter = I.fromIter([1, 2, 3]);
    const iterPeekabled = iter.peekable();

    assertStrictEquals(iterPeekabled.nextIf(odd), 1);
    assert(O.isNone(iterPeekabled.nextIf(odd)));
    assert(O.isNone(iterPeekabled.nextIf(odd)));
    assertStrictEquals(iterPeekabled.next(), 2);
    assertStrictEquals(iterPeekabled.nextIf(odd), 3);
    assert(O.isNone(iterPeekabled.next()));
    assert(O.isNone(iter.next()));
  });
});

Deno.test("fuse", () => {
  const iter = I.fromIter([1, 2, 3]);
  const iterFused = iter.fuse();

  assertStrictEquals(iterFused.next(), 1);
  assertStrictEquals(iterFused.next(), 2);
  assertStrictEquals(iterFused.next(), 3);
  assert(O.isNone(iterFused.next()));
  assert(O.isNone(iter.next()));
});

Deno.test("skip", () => {
  const iter = I.fromIter([1, 2, 3]);
  const iterSkipped = iter.skip(1);

  assertStrictEquals(iterSkipped.next(), 2);
  assertStrictEquals(iterSkipped.next(), 3);
  assert(O.isNone(iterSkipped.next()));
  assert(O.isNone(iter.next()));
});

Deno.test("take", () => {
  const iter = I.fromIter([1, 2, 3]);
  const iterTaken = iter.take(2);

  assertStrictEquals(iterTaken.next(), 1);
  assertStrictEquals(iterTaken.next(), 2);
  assert(O.isNone(iterTaken.next()));
  assertStrictEquals(iter.next(), 3);
  assert(O.isNone(iter.next()));
});

Deno.test("find", () => {
  const iter = I.fromIter([1, 2, 3]);

  assertStrictEquals(iter.find(odd), 1);
  assertStrictEquals(iter.find(odd), 3);
  assert(O.isNone(iter.find(odd)));
});

Deno.test("fold", () => {
  const iter = I.fromIter([1, 2, 3]);

  assertStrictEquals(iter.fold(0, sum), 6);
  assert(O.isNone(iter.next()));
});

Deno.test("last", () => {
  const iter = I.fromIter([1, 2, 3]);

  assertStrictEquals(iter.last(), 3);
  assert(O.isNone(iter.next()));
});

Deno.test("nth", () => {
  const iter = I.fromIter([1, 2, 3]);

  assertStrictEquals(iter.nth(0), 1);
  assertStrictEquals(iter.nth(1), 3);
  assert(O.isNone(iter.next()));
});

Deno.test("all", async (t) => {
  await t.step("true", () => {
    const iter = I.fromIter([1, 3, 5]);
    assert(iter.all(odd));
  });

  await t.step("false", () => {
    const iter = I.fromIter([1, 2, 3]);
    assertFalse(iter.all(odd));
  });
});

Deno.test("any", async (t) => {
  await t.step("true", () => {
    const iter = I.fromIter([2, 3, 4]);
    assert(iter.any(odd));
  });

  await t.step("false", () => {
    const iter = I.fromIter([2, 4, 6]);
    assertFalse(iter.any(odd));
  });
});
