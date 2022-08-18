# Ahh

A collection of mostly rust-inspired stuff to help make TypeScript a litte
easier to work with &mdash; if you don't mind a little verbosity.

## Example

Here's a quick example of how you might use a few of this module's goodies:

```ts
import { I, Some } from "./mod.ts";

const len = 5;
const iter = I.map(I.successors(Some(0), (n) => Some(n + 1)), (n) => n * 2);

for (const n of I.take(iter, len)) {
  console.log(n);
}
```

## Licence

All code in this repository is dual-licenced under either:

- MIT Licence ([LICENCE](./LICENCE-MIT) or https://opensource.org/licenses/MIT)
- Apache Licence, Version 2.0 ([LICENCE](./LICENCE-APACHE) or
  http://www.apache.org/licenses/LICENSE-2.0)

at your ption. This means you can select the licence you prefer!
