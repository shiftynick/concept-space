/* A moment ends at a reading pause. Hidden tabs never consume reading time. */
window.createStoryClock = function ({
  onProgress,
  onComplete,
  duration = 7000,
}) {
  let elapsed = 0,
    running = false,
    last = null;
  return {
    play(restart = false) {
      if (restart || elapsed >= duration) elapsed = 0;
      running = true;
      last = null;
    },
    pause() {
      running = false;
      last = null;
    },
    reset() {
      elapsed = 0;
      running = false;
      last = null;
    },
    tick(now, visible = true) {
      if (!running || !visible) {
        last = null;
        return;
      }
      if (last !== null)
        elapsed = Math.min(duration, elapsed + Math.max(0, now - last));
      last = now;
      onProgress(elapsed / duration);
      if (elapsed >= duration) {
        running = false;
        last = null;
        onComplete();
      }
    },
    getState: () => ({ running, progress: elapsed / duration }),
  };
};
