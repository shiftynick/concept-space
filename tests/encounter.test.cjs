const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const THREE = require("../vendor/three/three.min.js");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(require.resolve("../src/encounter.js"), "utf8"),
  context,
);
const candidates = [];
for (let x = -0.85; x <= 0.85; x += 0.05)
  for (let y = -0.85; y <= 0.85; y += 0.05)
    for (let z = -0.85; z <= 0.85; z += 0.05) candidates.push(x, y, z, 0.3);
let extractions = 0;
const world = new THREE.Group();
const e = context.window.createEncounter({
  THREE,
  world,
  candidates,
  dpr: 1,
  extractSurface() {
    extractions++;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([], 3));
    return g;
  },
});
test("teaching adds territory from Mara that Eli could not originally reach", () => {
  let n = 0;
  for (let i = 0; i < candidates.length; i += 4) {
    const p = candidates.slice(i, i + 3);
    if (e.taught(...p) < 0) {
      n++;
      assert.ok(e.mara(...p) < 0);
      assert.ok(e.eli(...p) > 0);
    }
  }
  assert.ok(n > 10);
});
test("discovery lies outside both original minds and inside the universe", () => {
  let n = 0;
  for (let i = 0; i < candidates.length; i += 4) {
    const p = candidates.slice(i, i + 3);
    if (e.discovery(...p) < 0) {
      n++;
      assert.ok(e.mara(...p) > 0);
      assert.ok(e.eli(...p) > 0);
      assert.ok(Math.hypot(...p) < 1);
    }
  }
  assert.ok(n > 10);
});
test("both representations preserve moment and progress; surfaces are cached", () => {
  assert.ok(e.getState().counts.every((n) => n > 0));
  e.update({ active: true, step: 3, progress: 0.6 });
  assert.equal(extractions, 0);
  e.update({ view: "surface" });
  assert.equal(extractions, 5);
  assert.equal(e.getState().step, 3);
  assert.equal(e.getState().progress, 0.6);
  e.update({ view: "points" });
  e.update({ view: "surface" });
  assert.equal(extractions, 5);
  e.update({ active: false });
  assert.equal(world.children[0].visible, false);
});
