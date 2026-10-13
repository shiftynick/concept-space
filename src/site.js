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
          "Compare the left region before and after: more points, exactly the same reach.",
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
        "Both fictional models use the same conceptual geography. Cyan, amber, and pale green distinguish A-only, B-only, and shared reach. In Surface, translucent model envelopes expose the solid shared interior.",
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
  scenarios.encounter = {
    title: "When two minds meet",
    category: "PEOPLE & CULTURE / HUMAN CONNECTION",
    assumptions:
      "Mara and Eli are fictional people in a shared conceptual geography. Teal and violet distinguish their unique reach; pale green marks shared reach. A new connection changes what Eli can reach. Rings mark attention without removing reachable territory. Discovery is an authored possibility, not a claim that every conversation expands knowledge.",
    steps: [
      [
        "Understanding starts with shared ground.",
        "Mara and Eli can both reach some of the same concepts. That overlap gives them a place to begin—even though much of their experience is different.",
        "The pale green region where both spaces overlap.",
      ],
      [
        "An explanation opens a new path.",
        "Mara connects an unfamiliar idea to something Eli already understands. Eli gains access to part of Mara’s territory, turning it into shared ground.",
        "A path reaches into Mara’s space; teal points become shared pale green.",
      ],
      [
        "The same words can land elsewhere.",
        "Eli connects the explanation to a different part of his experience. Two attention rings mark different destinations: both people are engaged, but they are following different meanings.",
        "Follow the fork from the same words to two different attention rings. Their reach stays in place.",
      ],
      [
        "Together, they find another possibility.",
        "A connection between their perspectives opens a new idea. In this imagined encounter, neither person’s original space included this region.",
        "Two paths converge on a new constellation above both original spaces.",
      ],
    ],
  };
  const annotations = {
    training: [
      null,
      {
        title: "A connection forms",
        text: "Two previously separate regions become reachable together.",
        p: [-0.02, -0.015, 0.12],
      },
      null, // The fixed density detail already supplies the comparison here.
      {
        title: "This gap remains",
        text: "Still outside this model’s reach.",
        p: [0.3, -0.17, 0.12],
      },
      {
        title: "A new emphasis",
        text: "Growing here; receding at lower left.",
        p: [0.52, 0.33, 0.13],
      },
    ],
    comparison: [
      null,
      {
        title: "B’s distinct strength",
        text: "This specialty lies outside Model A’s reach.",
        p: [0.58, -0.5, 0.1],
      },
      {
        title: "Reachable by both",
        text: "Shared territory can still have different internal density.",
        p: [-0.08, 0.15, 0.15],
      },
      null,
    ],
    society: [
      null,
      null,
      {
        title: "Beyond living memory",
        text: "Preserved in records, not currently carried by living people.",
        p: [0.49, 0.37, 0.05],
      },
    ],
    encounter: [
      {
        title: "Common ground",
        text: "Both minds can reach this part of the space.",
        p: [0, -0.08, 0.16],
      },
      {
        title: "Now shared",
        text: "Eli gains access to a region Mara already carried.",
        p: [-0.22, 0.24, 0.08],
      },
      null,
      {
        title: "A new possibility",
        text: "New ground, reachable by both.",
        p: [0, 0.65, 0.04],
      },
    ],
  };
  const shortNames = {
    training: ["Emerge", "Connect", "Enrich", "Fill gaps", "Fine-tune"],
    comparison: [
      "Broader reach",
      "Distinct strength",
      "Shared ground",
      "Together",
    ],
    society: ["One person", "Living collective", "External memory"],
    encounter: ["Shared ground", "Teaching", "Misunderstanding", "Discovery"],
  };
  let scenario = "training",
    step = 0,
    guided = false,
    free = false,
    applying = false,
    completed = true;
  const play = document.getElementById("story-play"),
    title = document.getElementById("story-title"),
    copy = document.getElementById("story-copy"),
    notice = document.getElementById("story-notice"),
    stepsEl = document.getElementById("story-steps"),
    status = document.getElementById("story-status"),
    auto = document.getElementById("story-auto"),
    progressFill = document.getElementById("story-progress-fill");
  function idleLabel() {
    return scenario === "comparison" || scenario === "society"
      ? "Read moment"
      : "Play moment";
  }
  function buttonLabel(text, symbol = "▶") {
    play.textContent = text + " " + symbol;
  }
  function stop() {
    guided = false;
    clock.pause();
    readingClock.reset();
    api?.pause();
    buttonLabel(completed ? "Replay moment" : idleLabel());
    status.textContent = "Paused · take your time";
  }
  function setNote(progress = 1) {
    const note = annotations[scenario][step];
    api?.setSceneNote(free || progress < 0.5 ? null : note);
  }
  function paintGuide() {
    const data = scenarios[scenario],
      s = data.steps[step];
    document.getElementById("story-context").textContent = "THE STORY SO FAR";
    title.textContent = s[0];
    document.getElementById("collapsed-story-title").textContent = s[0];
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
    document.getElementById("story-prev").disabled = step === 0;
    setNote();
  }
  function regionFilter(value) {
    const f = document.getElementById("region-filter");
    f.value = value;
    f.dispatchEvent(new Event("change"));
  }
  function renderMoment(progress) {
    applying = true;
    if (scenario === "training")
      api.setProgress(step * 0.2 + 0.002 + progress * 0.196);
    if (scenario === "encounter") api.setEncounter({ step, progress });
    progressFill.style.width = progress * 100 + "%";
    setNote(progress);
    applying = false;
  }
  const readingClock = window.createStoryClock({
    duration: 3500,
    onProgress() {},
    onComplete() {
      if (auto.checked && step < scenarios[scenario].steps.length - 1) {
        applyStep(step + 1);
        start();
      } else stop();
    },
  });
  const clock = window.createStoryClock({
    duration: 7000,
    onProgress: renderMoment,
    onComplete() {
      completed = true;
      api?.pause();
      buttonLabel("Replay moment");
      status.textContent = "Moment complete · take a closer look";
      if (auto.checked && step < scenarios[scenario].steps.length - 1) {
        status.textContent = "Reading pause · next moment follows";
        readingClock.play(true);
      } else guided = false;
    },
  });
  function applyStep(index) {
    stop();
    clock.reset();
    free = false;
    completed = true;
    step = Math.max(0, Math.min(scenarios[scenario].steps.length - 1, index));
    applying = true;
    if (scenario === "comparison") {
      api.setModel(step === 0 ? "a" : step === 1 ? "b" : "both");
      regionFilter(step === 2 ? "2" : "all");
    }
    if (scenario === "society")
      api.setSociety({
        scope: step === 0 ? "person" : "both",
        memory: step === 2,
      });
    applying = false;
    paintGuide();
    renderMoment(1);
    buttonLabel(idleLabel());
  }
  function start() {
    if (free) applyStep(step);
    const restart = completed;
    completed = false;
    guided = true;
    readingClock.reset();
    clock.play(restart);
    if (restart) renderMoment(0);
    buttonLabel("Pause moment", "Ⅱ");
    status.textContent =
      scenario === "comparison" || scenario === "society"
        ? "Reading time · inspect the scene"
        : "Watch the scene · pause whenever you like";
  }
  function openScenario(name) {
    if (!scenarios[name]) return;
    stop();
    scenario = name;
    step = 0;
    explore.hidden = true;
    viewer.hidden = false;
    document.body.classList.add("viewer-open");
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
      b.setAttribute("aria-label", `Moment ${i + 1}: ${s[0]}`);
      const num = document.createElement("span");
      num.textContent = String(i + 1).padStart(2, "0");
      b.append(num, document.createTextNode(shortNames[name][i]));
      b.onclick = () => applyStep(i);
      stepsEl.append(b);
    });
    if (api) {
      api.setMode(name);
      applyStep(0);
      api.resize();
    } else {
      title.textContent = "The 3D viewer could not start";
      copy.textContent = "Please use a browser with WebGL support.";
      play.disabled = true;
    }
    document.getElementById("explore-nav").removeAttribute("aria-current");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function route() {
    const hash = location.hash.slice(1);
    if (scenarios[hash]) openScenario(hash);
    else {
      stop();
      explore.hidden = false;
      viewer.hidden = true;
      document.body.classList.remove("viewer-open");
      document.title = "Concept Space — explore the shape of understanding";
      document
        .getElementById("explore-nav")
        .setAttribute("aria-current", "page");
      if (hash === "about" || hash === "scenarios")
        requestAnimationFrame(() =>
          document.getElementById(hash).scrollIntoView({ behavior: "smooth" }),
        );
      else window.scrollTo({ top: 0, behavior: "instant" });
    }
  }
  const toolsPanel = document.getElementById("scene-tools");
  toolsPanel.open = matchMedia("(min-width: 1000px)").matches;
  document.getElementById("story-collapse").onclick = () => {
    const button = document.getElementById("story-collapse"),
      expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.textContent = expanded ? "Show story +" : "Hide story −";
    document.getElementById("story-detail").hidden = expanded;
    document.getElementById("collapsed-story-title").hidden = !expanded;
    document
      .querySelector(".cinematic-story")
      .classList.toggle("is-collapsed", expanded);
    api?.resize();
  };
  document.getElementById("scenario-picker").onchange = (e) =>
    (location.hash = e.target.value);
  window.addEventListener("hashchange", route);
  play.onclick = () => (guided ? stop() : start());
  document.getElementById("story-next").onclick = () => applyStep(step + 1);
  document.getElementById("story-prev").onclick = () => applyStep(step - 1);
  auto.onchange = () => {
    if (!auto.checked && readingClock.getState().running) stop();
  };
  function exploreFreely() {
    stop();
    free = true;
    setNote();
    document.getElementById("story-context").textContent = "YOUR EXPLORATION";
    title.textContent =
      scenario === "encounter"
        ? scenarios.encounter.steps[step][0]
        : document.getElementById("chapter").textContent;
    document.getElementById("collapsed-story-title").textContent =
      title.textContent;
    copy.textContent =
      scenario === "encounter"
        ? "Orbit the encounter and switch between Points and Surface. Choose any story moment to return to its explanation."
        : document.getElementById("event").textContent;
    if (scenario === "comparison") {
      const state = api.comparison.getState(),
        who =
          state.selection === "both"
            ? "Both models"
            : state.selection === "a"
              ? "Model A"
              : "Model B";
      if (state.filter === "2") {
        title.textContent = who + " · shared reach";
        copy.textContent =
          "Only territory both models can reach is visible. " +
          (state.selection === "both"
            ? "At each point, density reflects the richer of the two illustrative representations."
            : "The density shown belongs to " + who + ".");
      } else if (state.filter === "0" || state.filter === "1") {
        const owner = state.filter === "0" ? "A" : "B";
        title.textContent = "Model " + owner + " · unique territory";
        copy.textContent =
          "Only concepts reachable by Model " +
          owner +
          " and outside the other model’s reach are visible.";
      }
      document.getElementById("collapsed-story-title").textContent =
        title.textContent;
    }
    notice.textContent =
      "Choose a story moment below to return to the guided perspective.";
    for (const b of stepsEl.children) b.setAttribute("aria-pressed", "false");
  }
  document.getElementById("free-explore").onclick = () => {
    exploreFreely();
    toolsPanel.open = true;
    document.getElementById("points-view").focus({ preventScroll: true });
  };
  // Click/change events cover keyboard and pointer input. Programmatic guide changes are excluded.
  for (const selector of [
    "[data-model]",
    "#region-filter",
    "[data-scope]",
    "#external-memory",
  ])
    document.querySelectorAll(selector).forEach((el) =>
      el.addEventListener(el.tagName === "BUTTON" ? "click" : "change", () => {
        if (!applying) exploreFreely();
      }),
    );
  document.getElementById("training").addEventListener("input", () => {
    stop();
    free = false;
    completed = true;
    step = api.getState().chapter;
    paintGuide();
    progressFill.style.width = "0%";
  });
  document.getElementById("play").addEventListener("click", () => {
    // Native training playback owns its clock; do not pause it from the story controller.
    guided = false;
    clock.pause();
    readingClock.reset();
    free = false;
    buttonLabel("Play moment");
    status.textContent = "Exploring the training timeline";
  });
  document.getElementById("scene").addEventListener("pointerdown", () => {
    if (guided) stop();
  });
  setInterval(() => {
    const visible = !document.hidden && !viewer.hidden;
    const now = performance.now();
    if (readingClock.getState().running) readingClock.tick(now, visible);
    else clock.tick(now, visible);
    if (
      visible &&
      api &&
      scenario === "training" &&
      !guided &&
      api.getState().playing
    ) {
      const c = api.getState().chapter;
      if (c !== step) {
        step = c;
        paintGuide();
      }
    }
  }, 60);
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
      if (type === "comparison" || type === "encounter") {
        const a = Math.hypot(x + 0.23, y - 0.08, z) < 0.64,
          b = Math.hypot(x - 0.28, y + 0.1, z) < 0.46;
        keep = a || b;
        color =
          type === "encounter"
            ? a && b
              ? [220, 235, 177]
              : a
                ? [98, 217, 203]
                : [181, 160, 243]
            : a && b
              ? [199, 194, 241]
              : a
                ? [87, 202, 204]
                : [248, 174, 110];
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
      free,
      playback: clock.getState(),
      screen: viewer.hidden ? "explore" : "viewer",
    }),
  };
})();
