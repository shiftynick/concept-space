(() => {
  "use strict";
  const api = window.ideaStudy,
    explore = document.getElementById("explore-screen"),
    viewer = document.getElementById("viewer-screen");
  const scenarios = {
    training: {
      title: "How a model learns",
      category: "MACHINE INTELLIGENCE / LEARNING",
      assumptions:
        "The boundary depicts possible conceptual reach. Density suggests richer representation within that reach. These changes are a teaching metaphor for training, not a reconstruction of model weights.",
      steps: [
        [
          "Islands emerge",
          "A model begins with separate footholds. Its reachable territory is uneven, with spaces it cannot yet enter.",
          "Look for several separate islands, not a smaller copy of the final shape.",
        ],
        [
          "Regions connect",
          "Some regions expand until they meet. A connection can matter as much as an increase in total size.",
          "Watch the bridge form between the left and right regions.",
        ],
        [
          "Richer, without larger",
          "Training can develop an existing region without extending its boundary. More is happening inside the same reach.",
          "Switch to Points to see the left region become more densely represented.",
        ],
        [
          "One gap fills; one stays",
          "Learning may address a particular gap while leaving another untouched. Growth is selective.",
          "Follow the two openings: the left closes, the right remains.",
        ],
        [
          "Fine-tuning redirects reach",
          "A new emphasis changes the shape of possibility. One region grows while another recedes.",
          "The upper-right region expands. The lower-left island diminishes.",
        ],
      ],
    },
    comparison: {
      title: "Different minds, shared ground",
      category: "MACHINE INTELLIGENCE / PERSPECTIVES",
      assumptions:
        "Both fictional models use the same conceptual geography. Cyan, amber, and lavender distinguish A-only, B-only, and shared reach. Surface view shows exterior boundaries; filtering Shared reach reveals overlap that may be hidden inside.",
      steps: [
        [
          "A broader reach",
          "Model A covers several large regions. Its broad coverage still contains holes and uneven internal density.",
          "Orbit the scene and notice the openings and isolated regions.",
        ],
        [
          "A different strength",
          "Model B is smaller overall, yet it reaches a specialty that Model A does not. Coverage alone misses this difference.",
          "The amber lower-right region lies beyond A’s reach.",
        ],
        [
          "What they share",
          "The overlap is territory both models can reach. It need not have the same internal distribution in each model.",
          "Select A and B while keeping Shared reach selected to compare density.",
        ],
        [
          "See the relationship",
          "Their combined reach includes shared ground and distinct contributions. Neither model is just a scaled copy of the other.",
          "Try A only and B only. Then switch between Points and Surface.",
        ],
      ],
    },
    society: {
      title: "One person. A whole society.",
      category: "PEOPLE & CULTURE / COLLECTIVE KNOWLEDGE",
      assumptions:
        "The person belongs to the depicted society, so their reach is included in its living collective. Collective reach is distributed across people; it does not imply one person can access it all. External memory represents concepts retained in records, tools, and institutions, including concepts not currently carried by living people.",
      steps: [
        [
          "A personal constellation",
          "One person carries an uneven collection of concepts: familiar ground, particular interests, and connections shaped by experience.",
          "The amber region represents a person’s conceptual reach, not their intelligence or value.",
        ],
        [
          "No one carries it all",
          "Across many people, the collective holds more than any individual. Different lives contribute different knowledge.",
          "The person remains visible inside the larger living collective. Society is not a single giant mind.",
        ],
        [
          "Beyond living memory",
          "Books, records, tools, and institutions can preserve concepts beyond what living individuals currently carry.",
          "The violet regions are external memory. Preservation does not guarantee easy access or understanding.",
        ],
      ],
    },
  };
  let scenario = "training",
    step = 0,
    guided = false,
    deadline = 0;
  const play = document.getElementById("story-play"),
    title = document.getElementById("story-title"),
    copy = document.getElementById("story-copy"),
    notice = document.getElementById("story-notice"),
    stepsEl = document.getElementById("story-steps");
  function stop() {
    guided = false;
    api?.pause();
    play.innerHTML = 'Play story <span aria-hidden="true">▶</span>';
  }
  function paintGuide() {
    const data = scenarios[scenario],
      s = data.steps[step];
    title.textContent = s[0];
    copy.textContent = s[1];
    notice.textContent = s[2];
    document.getElementById("story-count").textContent =
      String(step + 1).padStart(2, "0") +
      " / " +
      String(data.steps.length).padStart(2, "0");
    for (const b of stepsEl.children)
      b.setAttribute("aria-pressed", String(Number(b.dataset.step) === step));
    document.getElementById("story-next").disabled =
      step === data.steps.length - 1;
  }
  function regionFilter(value) {
    const f = document.getElementById("region-filter");
    f.value = value;
    f.dispatchEvent(new Event("change"));
  }
  function applyStep(index, keepPlaying = false) {
    step = Math.max(0, Math.min(scenarios[scenario].steps.length - 1, index));
    if (!keepPlaying) stop();
    if (scenario === "training") {
      api.setProgress(step * 0.2 + (keepPlaying ? 0.002 : 0.1));
      if (keepPlaying) document.getElementById("play").click();
    }
    if (scenario === "comparison") {
      api.setModel(step === 0 ? "a" : step === 1 ? "b" : "both");
      regionFilter(step === 2 ? "2" : "all");
    }
    if (scenario === "society")
      api.setSociety({
        scope: step === 0 ? "person" : "both",
        memory: step === 2,
      });
    paintGuide();
  }
  function openScenario(name) {
    if (!scenarios[name]) return;
    stop();
    scenario = name;
    step = 0;
    explore.hidden = true;
    viewer.hidden = false;
    document.getElementById("scenario-title").textContent =
      scenarios[name].title;
    document.getElementById("scenario-category").textContent =
      scenarios[name].category;
    document.getElementById("scenario-assumptions").textContent =
      scenarios[name].assumptions;
    document.getElementById("scenario-picker").value = name;
    document.title = scenarios[name].title + " — Concept Space";
    stepsEl.replaceChildren();
    scenarios[name].steps.forEach((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "story-step";
      b.dataset.step = i;
      const num = document.createElement("span");
      num.textContent = String(i + 1).padStart(2, "0");
      b.append(num, document.createTextNode(s[0]));
      b.onclick = () => applyStep(i);
      stepsEl.append(b);
    });
    if (api) {
      api.setMode(name);
      applyStep(0);
      api.resize();
    } else {
      copy.textContent =
        "The 3D viewer could not start. Please use a browser with WebGL support.";
      play.disabled = true;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function route() {
    const hash = location.hash.slice(1);
    if (scenarios[hash]) openScenario(hash);
    else {
      stop();
      explore.hidden = false;
      viewer.hidden = true;
      document.title = "Concept Space — explore the shape of understanding";
      if (hash === "about" || hash === "scenarios")
        requestAnimationFrame(() =>
          document.getElementById(hash).scrollIntoView({ behavior: "smooth" }),
        );
      else window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  document.getElementById("scenario-picker").onchange = (e) =>
    (location.hash = e.target.value);
  window.addEventListener("hashchange", route);
  play.onclick = () => {
    if (guided) {
      stop();
      return;
    }
    guided = true;
    applyStep(step === scenarios[scenario].steps.length - 1 ? 0 : step, true);
    play.innerHTML = 'Pause story <span aria-hidden="true">Ⅱ</span>';
    deadline = performance.now() + 6500;
  };
  document.getElementById("story-next").onclick = () => applyStep(step + 1);
  document.getElementById("free-explore").onclick = () => {
    stop();
    title.textContent = "Make your own connections";
    copy.textContent =
      "The scene is yours to explore. Rotate, change the representation, and try the controls below the visualization.";
    notice.textContent =
      scenario === "society"
        ? "Toggle external memory to distinguish knowledge carried by people from knowledge retained outside them."
        : scenario === "comparison"
          ? "Keep Shared reach selected while switching A and B to compare their density in the same territory."
          : "Move the timeline slowly through a chapter, then switch views without losing your place.";
    for (const b of stepsEl.children) b.setAttribute("aria-pressed", "false");
    document.getElementById("points-view").focus({ preventScroll: true });
  };
  for (const selector of [
    "#training",
    "#play",
    "[data-model]",
    "#region-filter",
    "[data-scope]",
    "#external-memory",
  ])
    document.querySelectorAll(selector).forEach((el) =>
      el.addEventListener("pointerdown", () => {
        if (guided) {
          if (el.id === "play") {
            guided = false;
            play.innerHTML = 'Play story <span aria-hidden="true">▶</span>';
          } else stop();
        }
      }),
    );
  setInterval(() => {
    if (!guided || document.hidden || viewer.hidden) return;
    if (scenario === "training") {
      const s = api.getState();
      if (s.chapter !== step) {
        step = s.chapter;
        paintGuide();
      }
      if (s.progress === 1) stop();
    } else if (performance.now() >= deadline) {
      if (step === scenarios[scenario].steps.length - 1) {
        stop();
        return;
      }
      applyStep(step + 1, true);
      deadline = performance.now() + 6500;
    }
  }, 150);
  route();
  /* Procedural preview art, deliberately illustrative rather than captured data. */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seed = 109;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const samples = [];
  for (let i = 0; i < 17000; i++) {
    const x = random() * 2 - 1,
      y = random() * 2 - 1,
      z = random() * 2 - 1,
      r = Math.hypot(x, y, z);
    if (r > 0.9) continue;
    const noise =
      Math.sin(x * 8 + Math.sin(y * 6)) * Math.cos(y * 7 - z * 3) +
      Math.sin(z * 8 + x * 3) * 0.45;
    if (noise > 0.12 && r < 0.84) samples.push([x, y, z, random()]);
  }
  const canvases = [
    document.getElementById("hero-cloud"),
    ...document.querySelectorAll("[data-art]"),
  ];
  function draw(canvas, angle = 0) {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    if (!w || !h) return;
    const ratio = Math.min(devicePixelRatio, 1.6);
    if (
      canvas.width !== Math.round(w * ratio) ||
      canvas.height !== Math.round(h * ratio)
    ) {
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const hero = canvas.id === "hero-cloud",
      type = hero ? "hero" : canvas.dataset.art,
      scale = Math.min(w, h) * (hero ? 0.39 : 0.41),
      cx = w * 0.5,
      cy = h * 0.5,
      ca = Math.cos(angle),
      sa = Math.sin(angle);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.2);
    glow.addColorStop(0, hero ? "#315e5428" : "#24443f20");
    glow.addColorStop(1, "#163b3500");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#719a8c35";
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.ellipse(cx, cy, scale * 1.08, scale * 1.08, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#75a8991e";
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        scale * 1.08,
        scale * (0.22 + j * 0.22),
        angle * 0.4 + j * 0.8,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    const pts = [];
    for (const p of samples) {
      let [x, y, z, s] = p;
      let color = [101, 211, 190],
        keep = true;
      if (type === "training") {
        const left = Math.hypot(x + 0.42, y - 0.08, z) < 0.36,
          mid = Math.hypot(x - 0.1, y + 0.26, z) < 0.24,
          right = Math.hypot(x - 0.42, y - 0.32, z) < 0.18;
        keep = left || mid || right;
        color = left ? [110, 224, 187] : [134, 165, 209];
      }
      if (type === "comparison") {
        const a = Math.hypot(x + 0.23, y - 0.08, z) < 0.64,
          b = Math.hypot(x - 0.28, y + 0.1, z) < 0.46;
        keep = a || b;
        color = a && b ? [199, 194, 241] : a ? [87, 202, 204] : [248, 174, 110];
      }
      if (type === "society") {
        const individual = Math.hypot(x + 0.22, y - 0.08, z) < 0.29;
        keep = Math.hypot(x, y, z) < 0.74 && (individual || s < 0.6);
        color = individual
          ? [255, 194, 125]
          : y < -0.5
            ? [181, 157, 229]
            : [84, 180, 176];
      }
      if (type === "hero") {
        color =
          x < -0.1 && y > 0.02
            ? [216, 228, 173]
            : z > 0.3
              ? [152, 188, 215]
              : [86, 191, 167];
        keep = s < 0.75;
      }
      if (!keep) continue;
      const rx = x * ca - z * sa,
        rz = x * sa + z * ca,
        persp = 3.5 / (3.5 - rz);
      pts.push([
        cx + rx * scale * persp,
        cy - y * scale * persp,
        rz,
        persp,
        color,
        s,
      ]);
    }
    pts.sort((a, b) => a[2] - b[2]);
    for (const p of pts) {
      const c = p[4],
        alpha = Math.min(0.95, 0.38 + (p[2] + 1) * 0.32);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
      const size = (hero ? 1.25 : 1.05) * p[3] * (p[5] > 0.98 ? 1.8 : 1);
      ctx.fillRect(p[0], p[1], size, size);
    }
    if (hero) {
      ctx.strokeStyle = "#a6c9a65c";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.ellipse(cx, cy, scale * 1.24, scale * 0.31, -0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#c8dfa9";
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(-0.4) * scale * 0.95,
        cy + Math.sin(-0.4) * scale * 0.54,
        2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  const observer = new ResizeObserver(() => canvases.forEach((c) => draw(c)));
  canvases.forEach((c) => observer.observe(c));
  canvases.forEach((c) => draw(c));
  let last = 0;
  function animate(now) {
    requestAnimationFrame(animate);
    if (reduce || document.hidden || explore.hidden || now - last < 45) return;
    last = now;
    draw(canvases[0], now * 0.000035);
  }
  requestAnimationFrame(animate);
  window.conceptSite = {
    openScenario,
    applyStep,
    getState: () => ({
      scenario,
      step,
      guided,
      screen: viewer.hidden ? "explore" : "viewer",
    }),
  };
})();
