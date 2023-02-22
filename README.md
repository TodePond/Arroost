# PondPad

These are my templates for new javascript projects.<br>
There are a few different types:

| Template   | How to use it                                                     | Status       |
| ---------- | ----------------------------------------------------------------- | ------------ |
| Embed      | Double-click `index.html`.                                        | Ready        |
| Import     | Run [`file_server`](#how-to-install-file_server) in the terminal. | Ready |
| Library    | Run [`frogasaurus`](#how-to-install-frogasaurus) in the terminal. | Coming soon™ |
| Standalone | Run [`frogasaurus`](#how-to-install-frogasaurus) in the terminal. | Coming soon™ |

# Template: Embed

The Embed template is enabled by default.<br>
To run it, double-click `index.html`.

## Code

Write your code in `source/main.js`.<br>

`source/main.js`

```js
print("Hello world!")
```

You can add more files by adding them to `index.html`.<br>

`index.html`

```html
...
<script src="source/main.js"></script>
<script src="source/other.js"></script>
```

# Template: Import

To enable the Import template:

1. Delete (or rename) `index.html`
2. Rename `index-import.html` to `index.html`.

To run it, run [`file_server`](#how-to-install-file_server) in the terminal.<br>

## Code

Write your code in `source/main.js`.<br>

`source/main.js`

```js
import { print } from "../libraries/habitat-import.js"
print("Hello world!")
```

## Testing

Write your tests in the `test` folder.<br>
Make sure all your test files end with `.test.js`.

`test/main.test.js`

```js
import { add } from "../libraries/habitat-import.js"
Deno.test("add", () => {
	assertEquals(add(3, 2), 5)
})
```

# How to install things

## How to install Deno

Follow the instructions on the [Deno website](https://deno.land/manual/getting_started/installation).

## How to install `file_server`

First, install [Deno](#how-to-install-deno).<br>
Then, run install `file_server`:

```sh
deno install --allow-read --allow-net --reload --force https://deno.land/std/http/file_server.ts
```

## How to install `frogasaurus`

First, install [Deno](#how-to-install-deno).<br>
Then, run install `frogasaurus`:

```sh
deno install --allow-write=. --allow-read=. --reload --force https://deno.land/x/frogasaurus/frogasaurus.js
```
