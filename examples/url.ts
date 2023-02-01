// Let's read a URL from the command-line, and check whether it is valid.

import { O, R } from "../mod.ts";

const url = O.map(prompt("URL:"), (url) => R.fn(() => new URL(url)));

if (O.isSome(url) && R.isOk(url)) {
  console.log(`We got a valid URL: ${url.toString()}`);
} else {
  console.error("ERROR: the provided URL is invalid");
}
