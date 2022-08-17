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

All code in this repository is dual-licenced under either:

- MIT Licence ([LICENCE](./LICENCE-MIT) or https://opensource.org/licenses/MIT)
- Apache Licence, Version 2.0 ([LICENCE](./LICENCE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)

at your ption. This means you can select the licence you prefer!
