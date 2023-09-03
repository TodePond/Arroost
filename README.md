<img align="right" width="150" src="https://user-images.githubusercontent.com/15892272/236786183-08c68c91-8988-45b3-8554-c80962a8d57c.png">

# Arroost

Arroost is a ridiculous music-making tool.

I'm making it for my next video called 🎵 **Arrows in Arrows in Arrows**. Watch the [teaser trailer](https://www.youtube.com/watch?v=8TFuKwdixlU)!

## What's the big idea?

Arroost is a mad all-star mix of big ideas from my previous projects:

-  [visual programming language](https://github.com/TodePond/CellPond)
-  [cellular automata](https://github.com/TodePond/SandPond)
-  [time travel](https://github.com/TodePond/TimePond)
-  [fractals](https://github.com/TodePond/ScreenPond)

## How can I use it?

It's not ready yet!<br>
But when it is, it'll be up at [arroost.com](https://arroost.com).

## What's in the code?

This repo has two parts.

1. The user-interface is in the [arroost](https://github.com/TodePond/Arroost/tree/main/source/arroost) folder.
2. The inner-engine is in the [nogan](https://github.com/TodePond/Arroost/tree/main/source/nogan) folder.

## Can I run it locally?

Yes! To run it locally, clone this repo, then run a local file server.<br>
I recommend installing [deno](https://deno.com/runtime)'s [file server](https://deno.com/manual@v1.13.2/examples/file_server):

```
deno install --allow-net --allow-read https://deno.land/std/http/file_server.ts
```

Then run it with:

```
file_server
```

To run the tests, run:

```
deno test --watch .
```

## Can I contribute?

Yeah! This project is organised a bit more than some of my others. Nogan is very clean. Arroost is quite messy, but still *mostly* organised.

Check out the [issues](https://github.com/TodePond/Arroost/issues) for ideas on what to explore. I have no immediate plans to do anything marked as [stretch goal](https://github.com/TodePond/Arroost/issues?q=is%3Aopen+is%3Aissue+label%3A%22stretch+goal%22), so feel free to dive into one of those!

Another way to get involved is by [testing out Arroost](https://github.com/TodePond/Arroost/issues?q=is%3Aopen+is%3Aissue+label%3Aqa) on different devices, and letting me know what bugs it has (by [making an issue](https://github.com/TodePond/Arroost/issues/new)).

I'm very happy to help you with any of this, as I'm actively working on Arroost! Contact me in the [fediverse](https://elk.zone/universeodon.com/@TodePond). (Sorry, I don't use X anymore).

## How does it all work?

It's a secret.
