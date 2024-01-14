<img align="right" width="150" src="https://user-images.githubusercontent.com/15892272/236786183-08c68c91-8988-45b3-8554-c80962a8d57c.png">


<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<!-- noop -->
<!-- ALL-CONTRIBUTORS-BADGE:END -->


# Arroost

Arroost is a ridiculous music-making tool.

I made it for my video called [🎵 **Arrows in Arrows in Arrows**](https://www.youtube.com/watch?v=DNBKdU6XrLY).

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

## Can I contribute?

Yeah!

Check out the [issues](https://github.com/TodePond/Arroost/issues) for ideas on what to explore. I have no immediate plans to do anything marked as [stretch goal](https://github.com/TodePond/Arroost/issues?q=is%3Aopen+is%3Aissue+label%3A%22stretch+goal%22), but you're welcome to have a go at any issue!

> If you aren't sure what something means, or you want some pointers, feel free to leave a comment :)

Another way to get involved is by **testing out Arroost** on different devices, and letting me know how it goes (by [making an issue](https://github.com/TodePond/Arroost/issues/new)). If you're interested, check out the [guide](https://github.com/TodePond/Arroost/blob/main/documentation/manual-testing)!

I'm very happy to help you with any of this, as I'm actively working on Arroost! Contact me in the [fediverse](https://elk.zone/universeodon.com/@TodePond). (Sorry, I don't use X anymore).


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

## How does it all work?

It's a secret (for now).

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://jessiejs.github.io"><img src="https://avatars.githubusercontent.com/u/63984309?v=4?s=100" width="100px;" alt="jessie"/><br /><sub><b>jessie</b></sub></a><br /><a href="#design-jessiejs" title="Design">🎨</a> <a href="https://github.com/TodePond/Arroost/commits?author=jessiejs" title="Code">💻</a> <a href="#userTesting-jessiejs" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://nonnullish.pages.dev"><img src="https://avatars.githubusercontent.com/u/20538005?v=4?s=100" width="100px;" alt="nonnullish"/><br /><sub><b>nonnullish</b></sub></a><br /><a href="https://github.com/TodePond/Arroost/issues?q=author%3Anonnullish" title="Bug reports">🐛</a> <a href="https://github.com/TodePond/Arroost/commits?author=nonnullish" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mahdoosh1"><img src="https://avatars.githubusercontent.com/u/83725163?v=4?s=100" width="100px;" alt="mahdoosh1"/><br /><sub><b>mahdoosh1</b></sub></a><br /><a href="https://github.com/TodePond/Arroost/issues?q=author%3Amahdoosh1" title="Bug reports">🐛</a> <a href="#userTesting-mahdoosh1" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/loglot"><img src="https://avatars.githubusercontent.com/u/88983354?v=4?s=100" width="100px;" alt="loglot"/><br /><sub><b>loglot</b></sub></a><br /><a href="#userTesting-loglot" title="User Testing">📓</a> <a href="https://github.com/TodePond/Arroost/issues?q=author%3Aloglot" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/labbo-lab"><img src="https://avatars.githubusercontent.com/u/62490883?v=4?s=100" width="100px;" alt="Vixey"/><br /><sub><b>Vixey</b></sub></a><br /><a href="https://github.com/TodePond/Arroost/issues?q=author%3Alabbo-lab" title="Bug reports">🐛</a> <a href="#userTesting-labbo-lab" title="User Testing">📓</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://edibotopic.com"><img src="https://avatars.githubusercontent.com/u/66971213?v=4?s=100" width="100px;" alt="Shane Crowley"/><br /><sub><b>Shane Crowley</b></sub></a><br /><a href="#userTesting-edibotopic" title="User Testing">📓</a> <a href="https://github.com/TodePond/Arroost/issues?q=author%3Aedibotopic" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://thacuber2a03.github.io"><img src="https://avatars.githubusercontent.com/u/70547062?v=4?s=100" width="100px;" alt="ThaCuber"/><br /><sub><b>ThaCuber</b></sub></a><br /><a href="https://github.com/TodePond/Arroost/issues?q=author%3Athacuber2a03" title="Bug reports">🐛</a> <a href="#userTesting-thacuber2a03" title="User Testing">📓</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/anderium"><img src="https://avatars.githubusercontent.com/u/33520919?v=4?s=100" width="100px;" alt="anderium"/><br /><sub><b>anderium</b></sub></a><br /><a href="https://github.com/TodePond/Arroost/issues?q=author%3Aanderium" title="Bug reports">🐛</a> <a href="https://github.com/TodePond/Arroost/commits?author=anderium" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
