# JIN2 ambient backgrounds

Run the site with `python3 -m http.server 8000`. The terminal stays interactive
while JIN2 art plays in a fixed canvas behind it. JIN2, critters and the
oneko cursor cat use one ambient selection: JIN2 hides and pauses both other
engines; selecting critters suspends JIN2 and restores oneko alongside critters.

- `background` lists the choices and current selection.
- `background blackhole|nighttide|catknight|rose|snowman|goodluck` selects a piece.
- `background off` removes JIN2 and resumes the saved critters choice (including
  off) and oneko. Neither engine's saved preference is overwritten by suspension.
- `critters <species>` selects critters and suspends JIN2 without changing the
  saved JIN2 choice. A later `background <piece>` takes the slot back.
- The choice persists in `localStorage["kraterm-background"]`. A valid saved
  choice wins; the first-visit default is **nighttide**. Invalid saved values
  fall back to nighttide. Storage failure still allows a session selection.
- `birthday` remains an undocumented easter egg, now selecting a background.
  It is absent from the command registry, autocomplete and help. The six old
  standalone art commands are removed; `background` replaces them.
- Reduced motion renders one still at 13 seconds, with a small note beside
  the signature. There are no overlay keyboard controls, dialogs or tap-to-exit.
  Typing q, r, Space or Escape does not control or dismiss the background.

Every use of `background` prints the JIN2 personal-use credit. Each active
background retains a small `@jin_22ee · 2026` signature; Cat Knight also says
`photo belongs to its creator`. The signature sits above mobile audio controls.
The credit occupies an opaque non-scrolling footer cell outside the clipped
terminal scrollport. Audio controls occupy separate cells beside it on desktop
and below it on mobile; wrapped credits reserve their full height.

## Readability and layers

The art canvas has `pointer-events: none`, no focus target, and 60% opacity.
The sea and disk use proportional cover scaling. On wide screens the other
five pieces keep their complete subjects with proportional fit scaling; a
deterministic ASCII star field extends their black background to the viewport
edges. Portrait screens fill their height and crop outer horizontal edges.
This avoids letterbox bars, stretched glyphs, cropped heads and clipped birthday
text on laptops, while keeping the art large on mobile. The
extension is presentation-only; source frame generation and data are unchanged.
It paints at z-index 0 and the terminal at 2; critters and oneko are hidden
and have no scheduled animation while JIN2 owns the slot. The credit footer
is at 3. Boot, pixel effects and sound/music controls keep their existing layers.

The terminal has a 35% theme-colored scrim. Inline text, autocomplete suggestions
and the input line have opaque backplates using `--background-color`. Output
blocks, pre elements and profile column wrappers stay transparent. The logo and portrait are explicitly
decorative ASCII: their entire subtrees have transparent backgrounds, including
all whitespace. Only readable profile lines and command output get inline
backing with `box-decoration-break: clone`, including wrapped field values;
there is no opaque profile slab or banner strip. Theme foreground colors, fonts, commands and controls
are preserved. With JIN2 off, these additional terminal styles are absent.
The original width-change reload behavior is restored; saved choices survive it.

A 30 fps timeline scan selected bright frames for every piece. Desktop and
mobile readability screenshots were captured at those frames, plus the Black
Hole flash at 7.8s and a synthetic all-white canvas stress case. The default
theme's normal/command/active/error/entered text retains contrast ratios of
5.80/6.26/6.26/4.85/4.91 against its opaque #211d1b backplate, independent of
art brightness. The handoff contains the images and exact scan criterion/results.

## Loading and ambient performance

New JIN2 requests on a normal first visit: **jin2.js only**, for nighttide's
first paint. Night Tide's grid and wave math are generated locally. The critters
module is not requested until critters actually take the slot, either through a
command or `background off`. A suspended, already-loaded critters engine keeps
its flock and tuning and cancels its rAF; oneko keeps its position and idle state.
Selection generations prevent delayed loaders from stealing a newer selection.

| Selection | Additional first-use work |
| --- | --- |
| `off` on reload | No JIN2 script or data requests |
| `blackhole`, `nighttide` | No piece-data fetches |
| `catknight` | Fetch/decompress `catknight_frames.bin.gz` once per page session |
| `rose`, `snowman`, `birthday` | Lazy `jin2-scenes.js`; procedural geometry; Birthday uses browser canvas text |
| `goodluck` | Lazy `jin2-scenes.js`, then `jin2/goodluck-sprites/phrases.json` and 77 PNGs |

The scene module, decoded Cat Knight data, and successfully initialized scene
factories/textures are cached for the page session. Failed data loads can be
retried. Selecting off or switching pieces cancels old timers/listeners;
late results cannot reopen a stopped background. No extra assets are fetched
for an unselected piece. A valid saved selection loads only what it needs.

Frame generation stops completely while `document.hidden` is true. Returning
resumes from the prior art time, without a hidden-time jump. Reduced-motion
and paused debug views schedule no animation callbacks after their still.

The maximum is **30 fps**. Ambient duty additionally targets about 20% of
synchronous renderer time: the frame interval is at least five times the
smoothed frame cost. A timer waits until the next due frame, then uses rAF;
there is no busy rAF polling between expensive frames. Animation time advances
by visible wall time, so lower sampling does not turn a 20s loop into minutes.
This leaves room for typing. Critters do not run concurrently with JIN2.

Historical task-3 measurements (before exclusivity/full-screen cover):
headless Chromium, 1280x960, default butterflies active, audio disabled to
isolate rendering; five warmup frames then 25 live frames per piece:

| Piece | Mean frame ms | Median ms | P95 ms | Observed ambient fps |
| --- | ---: | ---: | ---: | ---: |
| blackhole | 23.0 | 22.0 | 26.2 | 7.0 |
| nighttide | 42.3 | 40.5 | 55.7 | 3.6 |
| catknight | 11.3 | 10.5 | 16.0 | 14.4 |
| rose | 36.1 | 31.1 | 76.1 | 5.0 |
| snowman | 15.6 | 13.8 | 25.9 | 9.0 |
| goodluck | 67.7 | 67.0 | 86.8 | 2.7 |
| birthday | 17.4 | 16.6 | 20.3 | 7.5 |

These are generation + raster + trail + canvas/glow submission costs, excluding
asynchronous compositor work and startup fetch/decode. They are measurements,
not a promise of 30 fps. **Night Tide, Rose and especially Good Luck are too
heavy for unbudgeted 30 fps background use in this environment.** They remain
available at the adaptive cadence; Night Tide remains the requested calm default.
Cat Knight keeps its full 87x154 grid (13,398 cells): 10.5ms median/16.0ms P95
is nontrivial background work, but it was not the bottleneck and was not dropped
or downsampled. Hardware/browser performance varies.

## Screenshot and measurement aids

`?art=<piece>&t=<seconds>` opens a **paused background** for any of the seven
pieces. It does not overwrite the saved choice. For example:

- `http://localhost:8000/?art=blackhole&t=7.8`
- `http://localhost:8000/?art=catknight&t=2.63337`
- `http://localhost:8000/?art=snowman&t=21.36667`

`KraJin2.getState()` reports the active piece/time, frame count, synchronous
cost, smoothed cost, budget interval, grid and original HUD values for review.
`KraJin2.seek(seconds)` draws a representative frame without carrying trails
between seeks. These are developer aids, not terminal keyboard bindings.

## Source, license and exact data reconstruction

Original artwork and Python algorithms: **JIN2 (@jin_22ee), 2026**.
Source: https://github.com/JIN2-ASCII/-JIN2-ASCII at
`04119e6e1eec5043cb108a8996eddc84e37d1f87`.
See `LICENSE-jin2-ascii` for the personal/noncommercial terms and photo credit.

| Piece | Upstream source | Loop |
| --- | --- | --- |
| blackhole | BLACK-HOLE/black_hole.py | 20s |
| nighttide | NIGHT-TIDE/night_tide.py | 20s |
| catknight | CAT-KNIGHT/cat_knight.py and cat_knight_frames.npz | 20s |
| rose | ROSE/rose.py | 20s |
| snowman | SNOWMAN/snowman.py | 22s |
| goodluck | GOOD-LUCK/good_luck.py and sprites/ | 20s |
| birthday | BIRTHDAY-CAKE/birthday_cake.py | 18s |

Geometry, letter pools, palettes, shading, projection, trails and glow follow
the Python pieces. Static random fields use a deterministic JS generator.
Good Luck retains its original phrase-image raster, glass normals, front/back/
side textures, RTL typing, rotation, light sweep and stars. Canvas edges,
resampling and Birthday fonts can differ slightly from OpenCV/PIL. The source's
phrase fitting can omit longer phrases; a small coverage pass replaces three
duplicate slots so all 77 languages appear.

The 77 phrase PNGs and phrases.json were **copied from the shipped runtime
sprites, not regenerated**, and match the source byte for byte. No demonstration
images/videos or Cat Knight photo are included. Task 3 changes no binary assets.

`jin2-data-manifest.json` records SHA-256 and exact byte sizes for all 79 runtime
data files: the Cat Knight gzip plus the 78 files in the phrase directory. It
also records expanded Cat Knight bytes/hash and the original gzip header/zlib.
The handoff includes the actual unchanged data at the same relative paths.

- Verify: `python3 tools/rebuild-jin2-data.py`
- Reconstruct into a new directory from an external pinned checkout:
  `python3 tools/rebuild-jin2-data.py --rebuild --source /tmp/jin2 --target-dir /tmp/jin2-rebuilt`
- With NumPy installed, omit `--source` to clone into a temporary directory
  outside the destination. No substitute art is used if that clone fails.

The reconstruction uses the task 1 NumPy conversion and freezes the original
mtime/filename to reproduce gzip bytes. Verification and a fresh reconstruction
passed for every file using zlib 1.3.2. Different deflate versions may produce
different gzip bytes; the expanded-data digest verifies the actual ASCII data.

## Verification

Serve the site with `python3 -m http.server 8000`. With Playwright installed:
`CHROMIUM_EXECUTABLE=/usr/bin/chromium node tests/jin2-art.cjs`.
`ART_TEST_URL` can override the server URL. No test dependency or build step is
needed to use the site.

The browser test covers default loading, persistence/off, registry/help,
autocomplete, hidden Birthday, all seven selections, input and focus, one-time
assets, reduced-motion stills, hidden-tab cancellation/resume (simulated
visibility events), adaptive budget, selection races, exclusive ambient ownership,
oneko suspension/resume, transparent decorative ASCII with backed readable lines,
debug overrides, failure/retry, and mobile credit placement/touch-through.
It enumerates visible/running engines at 1429x804, 1280x960 and 390x844, and
checks full-viewport presentation bounds, unchanged terminal width/origin, and reserved
credit/control cells through top, middle and bottom scroll positions. Set
`ART_REVIEW_DIR` to save each state and all seven scene renders.
The handoff also includes benchmark/brightness scripts, raw measurements,
readability screenshots, full final file contents, data manifest and patch/bundle.
`critters.js`, the scene algorithms, source assets and license are unchanged in
this fix. Boot, sounds, image conversion and other command implementations are
retained. oneko gains a small suspend/resume/state hook; its existing movement,
idle and persistence code is preserved. Critters composite over the plain page
with their original 0.4 opacity and screen blend when JIN2 is off.
