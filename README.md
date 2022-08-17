# Ahh

A collection of mostly rust-inspired stuff to help make TypeScript a litte
easier to work with &mdash; if you don't mind a little verbosity.

## Example

This is an example on how you might use results:

```ts
import { Err, Ok, R, Result } from "./mod.ts";

function mustStartWith(s: string, start: string): Result<string, string> {
  if (s.startsWith(start)) {
    return Ok(s);
  } else {
    return Err(`string must start with "${start}"`);
  }
}

console.log(R.contains(mustStartWith("abc", "a"), "abc"));
console.log(
  R.containsErr(mustStartWith("bca", "a"), `string must start with "a"`),
);
```

## Licence

This is licenced under the ISC Licence, see the [`LICENCE`](`./LICENCE`) file
for more information.

<!-- _Safe code in [deno] made simple._

## Usage

Depending on which feature(s) you are looking for, import the files that you
need. For example, if we were looking to use `Result`s depending on whether a
string started with `"a"`, we could do.

```ts
// you'll want to add a version to this
import { Result, Ok, Err } from "https://deno.land/x/ahh@vX.Y.Z/result.ts";

function mustStartWithA(str: string): Result<string, string> {
  if (str.startsWith("a")) {
    return Ok(str);
  } else {
    return Err("string must start with `\"a\"`".);
  }
}

const ok = mustStartWithA("abc");
const err = mustStartWithA("cba");
```

## Licence

This is licenced under **MIT**; you can find out more in the provided
[`LICENCE`] file.

[Deno]: https://github.com/denoland/deno
[documentation]: https://doc.deno.land/https/deno.land/x/ahh/mod.ts
[`LICENCE`]: ./LICENCE -->
