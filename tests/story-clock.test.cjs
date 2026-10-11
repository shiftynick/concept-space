const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(require.resolve("../src/story-clock.js"), "utf8"),
  context,
);
function clock() {
  let finished = 0;
  const values = [];
  const c = context.window.createStoryClock({
    duration: 1000,
    onProgress: (p) => values.push(p),
    onComplete: () => finished++,
  });
  return { c, values, finished: () => finished };
}
test("a story moment stops once at its endpoint", () => {
  const { c, values, finished } = clock();
  c.play();
  c.tick(0);
  c.tick(500);
  c.tick(1200);
  c.tick(2000);
  assert.deepEqual(values, [0, 0.5, 1]);
  assert.equal(finished(), 1);
  assert.equal(c.getState().running, false);
});
test("pause and hidden-tab time do not skip the story", () => {
  const { c, finished } = clock();
  c.play();
  c.tick(0);
  c.tick(250);
  c.pause();
  c.tick(5000);
  c.play();
  c.tick(7000);
  c.tick(7250);
  assert.equal(c.getState().progress, 0.5);
  c.tick(8000, false);
  c.tick(90000);
  assert.equal(c.getState().progress, 0.5);
  c.tick(90500);
  assert.equal(finished(), 1);
});
test("replay and reset start from the beginning", () => {
  const { c } = clock();
  c.play();
  c.tick(0);
  c.tick(1000);
  c.play();
  c.tick(5000);
  assert.equal(c.getState().progress, 0);
  c.tick(5500);
  c.reset();
  assert.equal(c.getState().running, false);
  assert.equal(c.getState().progress, 0);
});
