<!-- deno-fmt-ignore-file -->

# Ahh

**Ahh** is a collection of idiomatic type-safety functions that are borrowed
from other languages. While it can make your code more verbose in certain areas,
it also helps to keep it working as intended.

## Demystification

Unakin to how some other modules handle options and results, the ones provided
here likely follow how you may deal with such cases yourself. A quick look at
the types for both shows how simple they are:

```ts
type Option<T> = undefined | null | T;
type Result<T, E extends Error> = E | T;
```

Almost all built-in and external modules handle options as above. The most
aberrant departure is with how results work, which is due to JS/TS having no
such concept, and instead opting to throw exceptions.

With that in mind, let's see some working code with these types in use:

```ts
import type { Option, Result } from "./mod.ts";

const input: Option<string> = prompt("URL:");
const url: Option<Result<URL, Error>> = input
  ? (() => {
    try {
      return new URL(input);
    } catch (e) {
      return e;
    }
  })()
  : null;
```

It starts well with the option pairing nicely with the prompt function's return
type. However, the result requires we handle that the URL constructor may throw.

All **Ahh** seeks to do is make such cases more straightforward to manage, as
seen in the rewritten code:

```ts
import { None, O, R } from "./mod.ts";

const url = O.map(prompt("URL:"), (input) => R.fn(() => new URL(input)));
```

## Licence

All code in this project is dual-licenced under either:

- MIT Licence ([LICENCE-MIT](./LICENCE-MIT) or
  https://opensource.org/licenses/MIT)
- Apache Licence, Version 2.0 ([LICENCE-APACHE](./LICENCE-APACHE) or
  https://www.apache.org/licenses/LICENSE-2.0)

at your option.

### Contributions

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 licence, shall be
dual licenced as above, without any additional terms or conditions.
