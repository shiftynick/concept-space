const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const THREE = require("../vendor/three/three.min.js");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(require.resolve("../src/society.js"), "utf8"),
  context,
);
const candidates = [];
for (let x = -0.85; x <= 0.85; x += 0.055)
  for (let y = -0.85; y <= 0.85; y += 0.055)
    for (let z = -0.85; z <= 0.85; z += 0.055) candidates.push(x, y, z, 0.3);
const s = context.window.createSociety({
  THREE,
  world: new THREE.Group(),
  candidates,
  dpr: 1,
  extractSurface() {
    throw Error("Points should not need surface extraction");
  },
});
test("the person is included in the living collective", () => {
  let n = 0;
  for (let i = 0; i < candidates.length; i += 4) {
    const p = candidates.slice(i, i + 3);
    if (s.person(...p) < 0) {
      n++;
      assert.ok(s.living(...p) < 0);
    }
  }
  assert.ok(n > 0);
});
test("external-memory territory is separate from the living collective", () => {
  let n = 0;
  for (let i = 0; i < candidates.length; i += 4) {
    const p = candidates.slice(i, i + 3);
    if (s.archive(...p) < 0) {
      n++;
      assert.ok(s.living(...p) > 0);
    }
  }
  assert.ok(n > 0);
});
test("scope and memory reveal only the requested layers", () => {
  assert.ok(s.getState().counts.every((n) => n > 0));
  s.update({ active: true, scope: "person", memory: true });
  assert.equal(s.getState().visibleLayers.join(","), "0");
  s.update({ scope: "both", memory: false });
  assert.equal(s.getState().visibleLayers.join(","), "0,1");
  s.update({ memory: true });
  assert.equal(s.getState().visibleLayers.join(","), "0,1,2");
  s.update({ scope: "society" });
  assert.equal(s.getState().scope, "society");
});
