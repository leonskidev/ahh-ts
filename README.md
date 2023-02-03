# Ahh

**Ahh** is a collection of idiomatic type-safety functions that are borrowed
from other languages. While it can make your code more verbose in certain areas,
it also helps to keep it working as intended.

## Demystification

While it may look like it from that outside, `Option` and `Result` are nothing
*special*, at least compared to how you would normally handle such cases. A
quick look at the types for both of them shows how bland they really are:

```ts
type None = undefined | null;
type Some<T> = T;
type Option<T> = None | Some<T>;

// this is the most exciting it gets folks
type Err<E extends Error> = E;
type Ok<T> = T;
type Result<T, E extends Error> = Err<E> | Ok<T>;
```

When you compare that to how everything else handles optional values, there's no
difference. The biggest departure is with how `Result` works, and that's due to
TS having no concept of it to begin with; but even then it still sticks to using
the built-in `Error` type.

So let's take a look at some `Option`s and `Result`s in actual code:

```ts
import { Option, Result } from "./mod.ts";

// `prompt` returns a `string` or `null`
const input: Option<string> = prompt("URL:");
if (input === null) Deno.exit(1);

// `new URL` returns a `URL` or throws an `Error`
const url: Result<URL, Error> = () => {
  try {
    return new URL(input);
  } catch(e) {
    return e;
  }
};
```

As you can see, the most convoluted part is dealing with errors, which we need
to explicitly catch. And that's all **Ahh** does, fill in those gaps to make
this much easier:

```ts
import { Option, Result, O, R } from "./mod.ts";

// no changes here; apart from removing the unnecessary typing
const input = prompt("URL:");
if (input === null) Deno.exit(1);

// so much easier
const url = R.fn(() => new URL(input));

// we can even go a step further
const url2 = O.map(prompt("URL:"), (url) => R.fn(() => new URL(url)));

// the "actual" types of these are just the bare types; no class weirdness
input; // string
url; // URL
url2; // URL | null
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
