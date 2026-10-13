# Concept Space

An interactive visual language for exploring concepts, model reach, and learning.

An exhibit-style Explore page leads into four guided perspectives: **When Two Minds Meet**, **How a Model Learns**, **Different Minds, Shared Ground**, and **One Person / Society**. Each scene can be viewed as a surface or as a point cloud. Guided stories and direct controls share the same scene and camera.

**This is a teaching metaphor, not a measurement of any real model, person, or society.** Geometry, density, positions, and training behavior are illustrative. Density is an exploratory representation of internal richness; it does not measure confidence or prompt history.

## Run locally

No build step, package installation, or API keys are required. From the project directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. A browser with WebGL support is required. Three.js is vendored, so the prototype makes no external runtime requests.

## When two minds meet

Open `/#encounter` for a fictional encounter between Mara and Eli. Teal is Mara-only reach, violet is Eli-only reach, and pale green is shared reach.

- **Shared ground:** an overlap gives them a place to begin.
- **Teaching:** Eli gains access to a part of Mara’s existing territory. The region becomes shared; Mara does not lose it.
- **Misunderstanding:** attention moves to two different regions. A common utterance forks toward separate attention rings; the surrounding reach remains visible.
- **Discovery:** paths converge on a region outside both original spaces. This is an illustrative outcome, not a prediction about conversations.

Points and Surface use the same fields and preserve the current moment. In landscape, the story and scene controls occupy vertical glass panels on the left and right, keeping the middle open from top to bottom. Collapse either panel to clear the view. On narrow screens, the camera composition leaves room for the narrative; the panels remain independently scrollable. Scene notes track world coordinates during orbit, hide when the target rotates behind the scene, and can be toggled off.

## Compare models

Choose **Different minds, shared ground** from Explore, or open `/#comparison`. Model A has broader overall reach. Model B is smaller, with a lower-right specialty beyond A’s reach. These are fictional models on the same coordinate system.

- Select **Model A**, **Model B**, or **Both** while retaining the camera and representation.
- In **Both**, cyan means A-only, amber means B-only, and pale green means shared reach. Shared samples are counted once rather than overlaid twice. Both uses the higher of the two illustrative density values at each shared sample.
- Use **Show** to isolate shared reach or either model’s unique territory.
- Switch A/B while showing **Shared reach** to compare internal density in the same territory. The Shared reach filter stays selected when switching models. An incompatible exclusive-region filter resets to All regions.
- In Both / All regions, surface mode shows translucent model envelopes around a solid pale-green shared interior. Region filters isolate the exact shared or unique territory.
- Use **Change perspective** or **All perspectives** to choose another scenario. Switching scenarios pauses playback and starts its guide at the first moment. The camera and representation are preserved.

## One person / society

Open `/#society` for three moments: one person’s reach, knowledge distributed across living people, and external memory in records, tools, and institutions.

- The depicted person is included within the living collective.
- **One person**, **Society**, and **Together** change which perspective is emphasized.
- **Include external memory** reveals an optional violet layer, separate from the living collective.
- Society does not imply one mind that can access everything. Retaining a concept in a record does not guarantee retrieval or understanding.
- Surface mode uses a translucent collective boundary to keep the person visible inside it.

## Guided and free exploration

The site opens on Explore. All four scenarios have a full-screen visualizer with frosted, collapsible narrative and control panels, a specific “watch for” cue, and occasional notes anchored to locations in the 3D world. Previous/next and selectable moments keep the text and scene together. Play a moment to watch its change, then inspect it at a reading pause. **Auto-advance** is optional and adds reading time between moments. Playback freezes while the tab is hidden. **Explore freely** pauses the story and focuses the scene controls. Direct links use `/#encounter`, `/#training`, `/#comparison`, and `/#society`. The About section explains the visual metaphor.


- Switch between **Points** and **Surface** without changing the camera or training position.
- Drag to orbit; scroll to zoom. Toggle auto-orbit to hold the view still.
- Play, pause, scrub the training timeline, or jump to a chapter. Each guided moment opens at its endpoint; play it to see the change unfold. Scrub the timeline to inspect intermediate states.
- Use the keyboard to operate buttons and the timeline. Reduced-motion preferences disable auto-orbit on load. Training playback starts on request.

The five training chapters are deliberately distinct:

1. **Emerge:** separate regions appear.
2. **Connect:** expansion connects previously separate regions.
3. **Enrich:** one region becomes denser while every boundary remains fixed.
4. **Fill gaps:** one opening closes while another remains open.
5. **Fine-tune:** one region expands while another recedes.

Point concentration conveys illustrative internal richness. Surface lighting describes shape, not a density measurement. Enrichment includes a fixed before/now detail sampled from the same left-region slice, making the density change inspectable without changing reach. These are two renderings of the same procedural field.

## Project layout

```text
index.html                  Explore gallery and scenario viewer
src/app.js                  Shared field, rendering, interaction, and training story
src/styles.css              Core scene controls
src/site.css                Exhibit layout, responsive gallery, and immersive glass panels
src/site.js                 Hash routes, guided stories, and procedural preview art
src/society.js              Individual, living collective, and external memory
src/encounter.js            Shared reach, teaching, misunderstanding, and discovery
src/story-clock.js          Pausable moment timing and visibility-aware reading pauses
src/comparison.js           Fictional model fields, overlap, and density comparison
tests/                      Geometry and story playback checks
scripts/build-site.cjs      Static deployment packaging
.openai/hosting.json        Sites project identity and output configuration
experiments/                Earlier surface, luminous-density, and point-cloud studies
vendor/three/               Three.js 0.160.1 and its MIT license
```

Earlier studies remain available at:

- `experiments/training-space.html`
- `experiments/density-space.html`
- `experiments/point-cloud-space.html`

## Development

Edit the files directly and refresh the browser. Check JavaScript syntax with:

```sh
node --check src/app.js
node --check src/comparison.js
node --check src/site.js
node --check src/society.js
node --test tests/*.test.cjs
```

The main scene samples one signed field for both point occupancy and surface extraction. A seeded point distribution keeps samples stable across training states. Surface geometry is rebuilt only when needed; the enrichment chapter changes density without rebuilding the boundary.

The browser exposes `window.ideaStudy` for inspection, with `setProgress(0…1)`, `setView('points' | 'surface')`, `setMode('training' | 'comparison' | 'society' | 'encounter')`, `setModel('a' | 'b' | 'both')`, `getState()`, and `sampleField(x, y, z)`. Comparison fields and density functions are available through `ideaStudy.comparison`. The society scenario exposes `setSociety({scope, memory})` and `ideaStudy.society`. The site guide exposes `window.conceptSite` for local inspection.

## Static deployment

Run `node scripts/build-site.cjs` to copy the application and experiments into `dist/`. The site remains buildless for local use; this step only assembles a hosting artifact. The managed Sites deployment is owner-private unless its audience is explicitly changed. GitHub remains the public source repository.

## Directions to explore

- Society’s conceptual reach changing over time: loss, preservation, diffusion, and rediscovery.
- More expressive geometry, transitions, and an opening reveal.
- More comparison narratives, with semantic examples for shared and specialized regions.
- Explored versus unexplored possibilities within a model’s reachable space.
- Prompting techniques as journeys or distributed activations through that space.
- Illustrative semantic labels where they help explain a particular concept.

The current prototype intentionally focuses on the visual metaphor. There is no model integration, measured dataset, backend, or telemetry.

## Third-party code

Three.js is included under its [MIT license](vendor/three/LICENSE). No project-wide license has been selected yet.

## Everything Is Search — next direction

The next concept explores the adjacent possible through tangible local changes that zoom outward into larger histories, with biological evolution, culture/society, and neural-network training as anchors. A progressive website and documentary are eventual goals; the current phase is conceptual and narrative development.

Start with the [independent-continuation handoff](docs/everything-is-search/HANDOFF.md) or the [working documents](docs/everything-is-search/README.md).
