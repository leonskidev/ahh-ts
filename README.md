_Safe code in [deno] made simple._

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
[`LICENCE`]: ./LICENCE
