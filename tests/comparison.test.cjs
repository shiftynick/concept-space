const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const THREE = require("../vendor/three/three.min.js");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(require.resolve("../src/comparison.js"), "utf8"),
  context,
);
const candidates = [];
for (let x = -0.85; x <= 0.85; x += 0.055)
  for (let y = -0.85; y <= 0.85; y += 0.055)
    for (let z = -0.85; z <= 0.85; z += 0.055) candidates.push(x, y, z, 0.4);
const comparison = context.window.createComparison({
  THREE,
  world: new THREE.Group(),
  candidates,
  dpr: 1,
  extractSurface() {
    throw Error("Point interactions should not extract a surface");
  },
});
test("smaller model has both shared and unique territory", () => {
  const c = comparison.getState().counts;
  assert.ok(c.aOnly > 0 && c.bOnly > 0 && c.shared > 0);
  assert.ok(c.bTotal < c.aTotal);
  assert.equal(c.aTotal, c.aOnly + c.shared);
  assert.equal(c.bTotal, c.bOnly + c.shared);
  assert.ok(comparison.fieldB(0.68, -0.44, 0.07) < 0);
  assert.ok(comparison.fieldA(0.68, -0.44, 0.07) > 0);
});
test("density contrast reverses across shared territory", () => {
  for (const p of [
    [-0.2, 0.15, 0.04],
    [0.19, -0.13, 0.04],
  ]) {
    assert.ok(comparison.fieldA(...p) < 0);
    assert.ok(comparison.fieldB(...p) < 0);
  }
  assert.ok(
    comparison.densityA(-0.2, 0.15, 0.04) >
      comparison.densityB(-0.2, 0.15, 0.04),
  );
  assert.ok(
    comparison.densityA(0.19, -0.13, 0.04) <
      comparison.densityB(0.19, -0.13, 0.04),
  );
});
test("selection and filtering preserve the shared samples", () => {
  const before = JSON.stringify(comparison.getState().counts);
  comparison.update({ active: true, selection: "a" });
  assert.equal(comparison.getState().visibleCategories.join(","), "0,2");
  comparison.update({ selection: "b" });
  assert.equal(comparison.getState().visibleCategories.join(","), "1,2");
  comparison.update({ selection: "both", filter: "2" });
  assert.equal(comparison.getState().visibleCategories.join(","), "2");
  comparison.update({ filter: "1" });
  assert.equal(comparison.getState().visibleCategories.join(","), "1");
  assert.equal(JSON.stringify(comparison.getState().counts), before);
});
