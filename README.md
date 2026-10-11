# Idea Space

An interactive 3D visual language for exploring ideas, model reach, and training.

The enclosing sphere represents the space of all possible ideas. An irregular subset represents a model’s conceptual reach, including possibilities it has never actually produced. The same space can be viewed as a surface or as a point cloud, with a shared camera and training timeline.

**This is a teaching metaphor, not a measurement of any real model.** Geometry, density, positions, and training behavior are illustrative. Density is an exploratory representation of internal richness; it does not measure confidence or prompt history.

## Run locally

No build step, package installation, or API keys are required. From the project directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. A browser with WebGL support is required. Three.js is vendored, so the prototype makes no external runtime requests.

## Compare models

The prototype opens in **Compare models** mode. Model A has broader overall reach. Model B is smaller, with a lower-right specialty beyond A’s reach. These are fictional models on the same coordinate system.

- Select **Model A**, **Model B**, or **Both** while retaining the camera and representation.
- In **Both**, cyan means A-only, amber means B-only, and lavender means shared reach. Shared samples are counted once rather than overlaid twice. Both uses the higher of the two illustrative density values at each shared sample.
- Use **Show** to isolate shared reach or either model’s unique territory.
- Switch A/B while showing **Shared reach** to compare internal density in the same territory. The Shared reach filter stays selected when switching models. An incompatible exclusive-region filter resets to All regions.
- Surface mode shows the exterior of the selected region. Interior overlap can be hidden in the combined exterior; the Shared reach filter reveals that overlap directly.
- Choose **Training story** to return to the original five-chapter sequence. Training position and camera survive mode changes; switching experiences pauses playback.

## Explore

- Switch between **Points** and **Surface** without changing the camera or training position.
- Drag to orbit; scroll to zoom. Toggle auto-orbit to hold the view still.
- Play, pause, scrub the training timeline, or jump to a chapter. The training story starts partway through emergence; scrub to the beginning to watch from initialization.
- Use the keyboard to operate buttons and the timeline. Reduced-motion preferences disable auto-orbit on load. Training playback starts on request.

The five training chapters are deliberately distinct:

1. **Emerge:** separate regions appear.
2. **Connect:** expansion connects previously separate regions.
3. **Enrich:** one region becomes denser while every boundary remains fixed.
4. **Fill gaps:** one opening closes while another remains open.
5. **Fine-tune:** one region expands while another recedes.

Point concentration conveys illustrative density directly; surface brightness provides a corresponding visual cue. These are two renderings of the same procedural field.

## Project layout

```text
index.html                  Main prototype
src/app.js                  Shared field, rendering, interaction, and training story
src/styles.css              Standalone presentation and responsive layout
src/comparison.js           Fictional model fields, overlap, and density comparison
tests/comparison.test.cjs    Comparison behavior checks
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
node --test tests/comparison.test.cjs
```

The main scene samples one signed field for both point occupancy and surface extraction. A seeded point distribution keeps samples stable across training states. Surface geometry is rebuilt only when needed; the enrichment chapter changes density without rebuilding the boundary.

The browser exposes `window.ideaStudy` for inspection, with `setProgress(0…1)`, `setView('points' | 'surface')`, `setMode('training' | 'comparison')`, `setModel('a' | 'b' | 'both')`, `getState()`, and `sampleField(x, y, z)`. Comparison fields and density functions are available through `ideaStudy.comparison`.

## Directions to explore

- More expressive geometry, transitions, and an opening reveal.
- More comparison narratives, with semantic examples for shared and specialized regions.
- Explored versus unexplored possibilities within a model’s reachable space.
- Prompting techniques as journeys or distributed activations through that space.
- Illustrative semantic labels where they help explain a particular concept.

The current prototype intentionally focuses on the visual metaphor. There is no model integration, measured dataset, backend, or telemetry.

## Third-party code

Three.js is included under its [MIT license](vendor/three/LICENSE). No project-wide license has been selected yet.
