# SunoFlow

SunoFlow is a Suno v6 music + YouTube monthly release planner. You give it a
monthly theme, it builds a full month of release-ready Suno v6 prompts, and it
tracks each track from idea to published video.

A month is organized as 4 weeks, and each week produces a fixed rhythm:

- **Wednesday**: a full track, emotional style (the "Deep & Narrative" pool).
- **Thursday**: shorts derived from the Wednesday track.
- **Friday**: a full track, energetic style (the "Weekend Upbeat & Viral" pool).
- **Saturday**: shorts derived from the Friday track.

That works out to **8 full tracks + 8 shorts per month** (2 full tracks and 2
shorts sets each week, across 4 weeks).

## No build, no install, no dependencies

SunoFlow is a 100% static app. There is deliberately:

- **NO** `npm install`
- **NO** build step or bundler
- **NO** framework (no React, Vue, Next, etc.)
- **NO** CDN or external network request

It is plain HTML, hand-written CSS, and vanilla JavaScript ES modules. Everything
it needs is committed in this repository, so it runs fully offline and works when
opened straight from disk via `file://`.

## Running it locally

Either option works:

1. **Open directly**: open `index.html` in any modern browser.
2. **Serve the folder** (recommended for a clean module load), from the repo root:

   ```sh
   python3 -m http.server 8080
   ```

   Then visit [http://localhost:8080](http://localhost:8080).

## The Suno v6 workflow

SunoFlow does not talk to Suno AI. It generates the exact text you paste into
Suno v6 so that you stay in control of the actual song generation. For every
track it produces:

- **Title**: a release title for the track.
- **Style Prompt**: the concise, comma-keyword style description (genre, BPM,
  key, production, instrumentation, lead vocal characterization, dynamic curve,
  finishing tags).
- **Exclude (Negative) Prompt**: traits to keep out (degradation tokens plus
  genre-contrast tokens).
- **Mood**: a dedicated Suno v6 Mood descriptor. In v6 the Mood field is a
  separate input, so SunoFlow delivers Mood **separately** from the style tags
  rather than folding it into the style string.
- **Lyrics guidance**: section-by-section structure hints to shape the lyrics.

You copy these out of the app (each field has its own copy button, and there is
a **Copy All Settings** action for the whole track) and paste them into Suno AI
to generate the real song. The prompts are intentionally concise comma keywords,
because Suno v6 responds best to concise comma-separated keywords rather than
long prose.

## Features

- **1-click monthly batch generation** from a single theme, producing the full
  4-week plan.
- **Calendar / timeline view** of the month's Wednesday / Thursday / Friday /
  Saturday releases.
- **Per-track status toggle**: Planned -> Generated -> Published.
- **Full / Shorts filter** to focus the track list.
- **Clipboard with toast feedback**: per-field copy buttons plus a Copy All
  Settings action, each confirmed with an on-screen toast.
- **localStorage persistence**: your plan is saved per browser, so it is still
  there when you return.
- **JSON export / import** to move a plan between browsers or back it up.
- **CSV export** for spreadsheets.
- **Markdown table export** for docs and notes.
- **YouTube description generator** that builds a copy-ready video description
  per track.

## GitHub Pages hosting

SunoFlow is a public web app that anyone can visit, and a first-time anonymous
visitor needs zero setup. It is designed to be served by
[GitHub Pages](https://pages.github.com/):

- The entry point is `index.html` at the repository root.
- A `.nojekyll` file is present at the root so the `assets/` folder is served
  as-is, without Jekyll processing.

Because there is no build step, whatever is committed is exactly what is served.

## Extending the genre library

The user keeps sending real Suno prompt examples, and each one becomes a new
preset. This is an ongoing process, so this section is meant to make folding in
new examples easy.

All genres live in [`assets/js/genrePresets.js`](assets/js/genrePresets.js) as
plain data objects in one of two pools:

- **`EMOTIONAL`**: Wednesday "Deep & Narrative" tracks.
- **`ENERGETIC`**: Friday "Weekend Upbeat & Viral" tracks.

To add a genre from a new ground-truth example, copy an existing object in the
matching pool and fill in every field. The preset schema (documented in full at
the top of that file) is:

- `genre`: the label placed after `K-Pop ` in the style prompt.
- `bpmRange`: `[min, max]` inclusive BPM band.
- `keys`: compatible musical keys.
- `productionPhrase`: the mastering / production quality clause.
- `instruments`: instrumentation tags, comma-joined in the prompt.
- `vocalCharacterizations`: full lead-vocal phrases including mix position.
- `dynamicCurve`: the arrangement / dynamics clause.
- `finishingTags`: closing quality tags (for example "zero volume pumping").
- `moodWords`: curated keywords for the v6 Mood field, kept distinct from the
  style tags.
- `excludeExtra`: genre-contrast exclude tokens specific to the genre.
- `vocalGender`: `Female`, `Male`, `Duet`, or `Instrumental`.
- `weirdnessRange`: `[min, max]`, 0-100.
- `styleInfluenceRange`: `[min, max]`, 0-100.
- `lyricStructure`: section hints for the Lyrics guidance.

Keep the wording in each field concise and comma-safe, so the prompt engine
assembles the same ground-truth structure the examples follow. Once a new preset
object is added to the right pool, it is automatically eligible for monthly
batch generation. No other changes are required.

## Running the logic tests

The pure-logic modules under `assets/js/` are unit-tested with Node's built-in
test runner. From the repo root:

```sh
env -u NODE_OPTIONS node --test
```

The `env -u NODE_OPTIONS` prefix is a sandbox-specific quirk (this environment
points `NODE_OPTIONS` at a missing preload file). In a normal user environment
you can simply run:

```sh
node --test
```
