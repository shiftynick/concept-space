(() => {
  "use strict";
  const root = document.getElementById("idea-study"),
    holder = root.querySelector("#scene"),
    slider = root.querySelector("#training"),
    play = root.querySelector("#play"),
    rotate = root.querySelector("#rotate"),
    chapter = root.querySelector("#chapter"),
    event = root.querySelector("#event"),
    phase = root.querySelector("#phase"),
    pointButton = root.querySelector("#points-view"),
    surfaceButton = root.querySelector("#surface-view"),
    legend = root.querySelector("#view-legend"),
    labels = [root.querySelector("#label-a"), root.querySelector("#label-b")],
    chapterButtons = [...root.querySelectorAll("[data-chapter]")];
  try {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 0.16,
      playing = false,
      mode = "comparison",
      view = "points",
      yaw = 0.08,
      pitch = 0.06,
      zoom = 3.7,
      drag = false,
      lastX = 0,
      lastY = 0,
      lastFrame = 0,
      lastBuild = 0,
      fieldKey = "",
      surfaceKey = "",
      frames = 0;
    if (reduced) rotate.checked = false;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    holder.prepend(renderer.domElement);
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive concept space with surface and point views",
    );
    renderer.domElement.setAttribute("aria-describedby", "description");
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(37, 1, 0.1, 30),
      world = new THREE.Group();
    scene.add(world);
    function line(p, alpha) {
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(p),
        new THREE.LineBasicMaterial({
          color: 0x8ba9c2,
          transparent: true,
          opacity: alpha,
          depthWrite: false,
        }),
      );
    }
    for (let j = -2; j <= 2; j++) {
      const a = (j * Math.PI) / 6,
        p = [];
      for (let k = 0; k <= 128; k++) {
        const q = (k / 128) * Math.PI * 2;
        p.push(
          new THREE.Vector3(
            Math.cos(a) * Math.cos(q),
            Math.sin(a),
            Math.cos(a) * Math.sin(q),
          ),
        );
      }
      world.add(line(p, j === 0 ? 0.2 : 0.1));
    }
    for (let j = 0; j < 5; j++) {
      const a = (j * Math.PI) / 5,
        p = [];
      for (let k = 0; k <= 128; k++) {
        const q = (k / 128) * Math.PI * 2;
        p.push(
          new THREE.Vector3(
            Math.cos(q) * Math.cos(a),
            Math.sin(q),
            Math.cos(q) * Math.sin(a),
          ),
        );
      }
      world.add(line(p, 0.1));
    }
    const rp = [];
    for (let k = 0; k <= 160; k++) {
      const a = (k / 160) * Math.PI * 2;
      rp.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
    }
    const ring = line(rp, 0.42);
    scene.add(ring);
    function smooth(a, b, x) {
      const q = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return q * q * (3 - 2 * q);
    }
    const lobes = [
      [-0.34, 0.13, 0.04, 0.33],
      [0.3, -0.17, 0.035, 0.34],
      [0.1, 0.43, -0.1, 0.23],
      [-0.55, -0.4, 0.06, 0.12],
      [0.56, 0.3, 0.1, 0.105],
      [-0.02, -0.015, 0.05, 0.145],
    ];
    let current = [],
      fill = 0,
      enrich = 0,
      fine = 0;
    function configure(v) {
      const emerge = smooth(0, 0.18, v),
        connect = smooth(0.2, 0.38, v);
      enrich = smooth(0.4, 0.58, v);
      fill = smooth(0.62, 0.78, v);
      fine = smooth(0.82, 1, v);
      current = lobes.map((b, i) => {
        let r;
        if (i === 5) r = 0.001 + connect * b[3];
        else r = b[3] * (0.13 + 0.43 * emerge + 0.44 * connect);
        if (i === 4) r += fine * 0.14;
        if (i === 3) r *= 1 - 0.88 * fine;
        return [b[0], b[1], b[2], r];
      });
      return (
        current.map((b) => b[3].toFixed(5)).join(",") + "|" + fill.toFixed(5)
      );
    }
    function field(x, y, z) {
      const wx = x + 0.035 * Math.sin(y * 15 + z * 7),
        wy = y + 0.03 * Math.sin(z * 13 - x * 7),
        wz = z + 0.04 * Math.sin(x * 13 + y * 9);
      let d = 9;
      for (const b of current) {
        const q = Math.hypot(wx - b[0], wy - b[1], wz - b[2]) - b[3];
        const h = Math.max(0.032 - Math.abs(d - q), 0) / 0.032;
        d = Math.min(d, q) - h * h * 0.008;
      }
      d += 0.01 * Math.sin(x * 37 + y * 17) * Math.cos(z * 29 - y * 23);
      const closes =
          0.112 * Math.min(1, current[0][3] / 0.2) * (1 - fill) -
          0.012 * fill -
          Math.hypot(x + 0.34, y - 0.13),
        stays =
          0.103 * Math.min(1, current[1][3] / 0.2) -
          Math.hypot(x - 0.3, y + 0.17);
      return Math.max(d, closes, stays, Math.hypot(x, y, z) - 0.94);
    }
    const uniforms = {
      uEnrich: { value: 0 },
      uFine: { value: 0 },
      uDpr: { value: renderer.getPixelRatio() },
    };
    const meshMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `varying vec3 vN;varying vec3 vP;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 p=modelViewMatrix*vec4(position,1.);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
      fragmentShader: `uniform float uEnrich;uniform float uFine;varying vec3 vN;varying vec3 vP;varying vec3 vV;void main(){vec3 n=normalize(vN);float diffuse=max(dot(n,normalize(vec3(-.7,1.,1.))),0.);float rim=pow(1.-abs(dot(n,normalize(vV))),3.);float focus=exp(-dot(vP-vec3(-.34,.13,.04),vP-vec3(-.34,.13,.04))*16.);vec3 base=mix(vec3(.12,.32,.49),vec3(.15,.67,.67),clamp(.5+vP.y,0.,1.));base*=.45+diffuse*.9;base+=vec3(.15,.5,.45)*uEnrich*focus*.58;gl_FragColor=vec4(base+rim*vec3(.15,.28,.35),1.);}`,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), meshMaterial);
    mesh.visible = false;
    world.add(mesh);
    let seed = 711;
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    const candidates = [];
    for (let i = 0; i < 160000; i++) {
      const x = rand() * 1.8 - 0.9,
        y = rand() * 1.8 - 0.9,
        z = rand() * 1.8 - 0.9;
      if (x * x + y * y + z * z < 0.88) candidates.push(x, y, z, rand());
    }
    const points = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `attribute float aSeed;attribute float aFocus;attribute float aCore;uniform float uEnrich;uniform float uFine;uniform float uDpr;varying float vA;void main(){float density=.16+.12*aCore+.72*uEnrich*aFocus;float visible=smoothstep(aSeed-.025,aSeed+.025,density);vA=visible*.8;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(1.9*uDpr*4./(-p.z),1.,9.);}`,
        fragmentShader: `varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=vA*(1.-smoothstep(.35,1.,r));if(a<.002)discard;gl_FragColor=vec4(.38,.89,.94,a);}`,
      }),
    );
    world.add(points);
    function buildParticles() {
      const p = [],
        seeds = [],
        focus = [],
        core = [];
      for (let i = 0; i < candidates.length; i += 4) {
        const x = candidates[i],
          y = candidates[i + 1],
          z = candidates[i + 2];
        if (field(x, y, z) >= -0.004) continue;
        p.push(x, y, z);
        seeds.push(candidates[i + 3]);
        focus.push(
          Math.exp(-((x + 0.34) ** 2 + (y - 0.13) ** 2 + (z - 0.04) ** 2) * 16),
        );
        core.push(
          0.5 + 0.5 * Math.sin(x * 25 + y * 14) * Math.cos(z * 21 - y * 9),
        );
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
      g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
      g.setAttribute("aFocus", new THREE.Float32BufferAttribute(focus, 1));
      g.setAttribute("aCore", new THREE.Float32BufferAttribute(core, 1));
      points.geometry.dispose();
      points.geometry = g;
    }
    const N = 31,
      side = N + 1,
      lo = -0.95,
      step = 1.9 / N,
      count = side ** 3,
      values = new Float32Array(count),
      gradients = new Float32Array(count * 3),
      coords = new Float32Array(count * 3);
    let ii = 0;
    for (let z = 0; z <= N; z++)
      for (let y = 0; y <= N; y++)
        for (let x = 0; x <= N; x++) {
          coords[ii * 3] = lo + x * step;
          coords[ii * 3 + 1] = lo + y * step;
          coords[ii * 3 + 2] = lo + z * step;
          ii++;
        }
    const tetra = [
        [0, 5, 1, 6],
        [0, 1, 2, 6],
        [0, 2, 3, 6],
        [0, 3, 7, 6],
        [0, 7, 4, 6],
        [0, 4, 5, 6],
      ],
      offs = [
        0,
        1,
        1 + side,
        side,
        side * side,
        side * side + 1,
        side * side + 1 + side,
        side * side + side,
      ];
    const teal = new THREE.Color(0x42cfc2),
      blue = new THREE.Color(0x637cce),
      gold = new THREE.Color(0xffce91);
    function buildSurface(sample = field) {
      for (let i = 0; i < count; i++)
        values[i] = sample(coords[i * 3], coords[i * 3 + 1], coords[i * 3 + 2]);
      for (let z = 0; z <= N; z++)
        for (let y = 0; y <= N; y++)
          for (let x = 0; x <= N; x++) {
            const i = x + y * side + z * side * side;
            gradients[i * 3] =
              values[i + (x < N ? 1 : 0)] - values[i - (x > 0 ? 1 : 0)];
            gradients[i * 3 + 1] =
              values[i + (y < N ? side : 0)] - values[i - (y > 0 ? side : 0)];
            gradients[i * 3 + 2] =
              values[i + (z < N ? side * side : 0)] -
              values[i - (z > 0 ? side * side : 0)];
          }
      const verts = [],
        cols = [],
        normals = [];
      function edge(a, b) {
        const u = values[a] / (values[a] - values[b]);
        const nx = gradients[a * 3] + u * (gradients[b * 3] - gradients[a * 3]),
          ny =
            gradients[a * 3 + 1] +
            u * (gradients[b * 3 + 1] - gradients[a * 3 + 1]),
          nz =
            gradients[a * 3 + 2] +
            u * (gradients[b * 3 + 2] - gradients[a * 3 + 2]),
          len = Math.hypot(nx, ny, nz) || 1;
        return [
          coords[a * 3] + u * (coords[b * 3] - coords[a * 3]),
          coords[a * 3 + 1] + u * (coords[b * 3 + 1] - coords[a * 3 + 1]),
          coords[a * 3 + 2] + u * (coords[b * 3 + 2] - coords[a * 3 + 2]),
          nx / len,
          ny / len,
          nz / len,
        ];
      }
      function tri(a, b, c) {
        const ux = b[0] - a[0],
          uy = b[1] - a[1],
          uz = b[2] - a[2],
          vx = c[0] - a[0],
          vy = c[1] - a[1],
          vz = c[2] - a[2],
          nx = uy * vz - uz * vy,
          ny = uz * vx - ux * vz,
          nz = ux * vy - uy * vx,
          cx = (a[0] + b[0] + c[0]) / 3,
          cy = (a[1] + b[1] + c[1]) / 3,
          cz = (a[2] + b[2] + c[2]) / 3;
        if (nx * a[3] + ny * a[4] + nz * a[5] < 0) {
          const q = b;
          b = c;
          c = q;
        }
        for (const p of [a, b, c]) {
          verts.push(p[0], p[1], p[2]);
          normals.push(p[3], p[4], p[5]);
        }
      }
      for (let z = 0; z < N; z++)
        for (let y = 0; y < N; y++)
          for (let x = 0; x < N; x++) {
            const base = x + y * side + z * side * side,
              ids = offs.map((o) => base + o);
            let mask = 0;
            for (let j = 0; j < 8; j++) if (values[ids[j]] < 0) mask++;
            if (mask === 0 || mask === 8) continue;
            for (const tt of tetra) {
              const inside = [],
                outside = [];
              for (const j of tt)
                (values[ids[j]] < 0 ? inside : outside).push(ids[j]);
              if (inside.length === 1)
                tri(
                  edge(inside[0], outside[0]),
                  edge(inside[0], outside[1]),
                  edge(inside[0], outside[2]),
                );
              else if (inside.length === 3)
                tri(
                  edge(outside[0], inside[0]),
                  edge(outside[0], inside[1]),
                  edge(outside[0], inside[2]),
                );
              else if (inside.length === 2) {
                const a = edge(inside[0], outside[0]),
                  b = edge(inside[0], outside[1]),
                  c = edge(inside[1], outside[0]),
                  d = edge(inside[1], outside[1]);
                tri(a, b, c);
                tri(b, d, c);
              }
            }
          }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
      return g;
    }
    const comparison = window.createComparison({
      THREE,
      world,
      candidates,
      extractSurface: buildSurface,
      dpr: renderer.getPixelRatio(),
    });
    const society = window.createSociety({
      THREE,
      world,
      candidates,
      extractSurface: buildSurface,
      dpr: renderer.getPixelRatio(),
    });
    const encounter = window.createEncounter({
      THREE,
      world,
      candidates,
      extractSurface: buildSurface,
      dpr: renderer.getPixelRatio(),
    });
    let sceneNote = null;
    const noteElement = root.querySelector("#scene-note"),
      noteLeader = root.querySelector(".note-leader"),
      notesToggle = root.querySelector("#scene-notes");
    function setSceneNote(note) {
      sceneNote = note;
      noteElement.hidden = !note;
      noteLeader.toggleAttribute("hidden", !note);
      if (note) {
        noteElement.querySelector("strong").textContent = note.title;
        noteElement.querySelector("span").textContent = note.text;
      }
    }
    const densityDetail = document.createElement('div');
    densityDetail.className = 'density-detail';
    densityDetail.hidden = true;
    densityDetail.innerHTML = '<strong>Same reach · richer within</strong><div class="density-pair"><figure><svg viewBox="0 0 120 100" role="img" aria-label="Left region before enrichment"></svg><figcaption>Before</figcaption></figure><figure><svg viewBox="0 0 120 100" role="img" aria-label="Same region with richer representation"></svg><figcaption>Now</figcaption></figure></div><small>Fixed view of the left region · same sampled territory</small>';
    // Keep the comparison near the narrative even if its markup changes.
    document.querySelector('#story-notice').after(densityDetail);
    let detailKey = '';
    function updateDensityDetail() {
      densityDetail.hidden = mode !== 'training' || t < .4 || t >= .6;
      if (densityDetail.hidden) return;
      const key = enrich.toFixed(2);
      if (key === detailKey) return;
      detailKey = key;
      const g = points.geometry, before = [], after = [];
      for (let i=0; i<g.attributes.position.count; i++) {
        const x=g.attributes.position.getX(i), y=g.attributes.position.getY(i), z=g.attributes.position.getZ(i);
        if (x < -.66 || x > -.03 || y < -.18 || y > .46 || Math.abs(z-.04) > .07) continue;
        const seed=g.attributes.aSeed.array[i], base=.16+.12*g.attributes.aCore.array[i];
        const dot='<circle cx="'+((x+.66)/.63*110+5).toFixed(1)+'" cy="'+(95-(y+.18)/.64*90).toFixed(1)+'" r=".8" />';
        if(seed<base) before.push(dot);
        if(seed<base+.72*enrich*g.attributes.aFocus.array[i]) after.push(dot);
      }
      const panes=densityDetail.querySelectorAll('svg');
      panes[0].innerHTML=before.join(''); panes[1].innerHTML=after.join('');
    }
    function syncGeometry(force = false) {
      const key = configure(t);
      uniforms.uEnrich.value = enrich;
      uniforms.uFine.value = fine;
      if (key !== fieldKey) {
        buildParticles();
        fieldKey = key;
      }
      if (
        mode === "training" &&
        view === "surface" &&
        (key !== surfaceKey || force)
      ) {
        mesh.geometry.dispose();
        mesh.geometry = buildSurface();
        surfaceKey = key;
      }
      updateDensityDetail();
    }
    const titles = [
      "Islands emerge",
      "Regions connect",
      "Richer, without larger",
      "One gap fills; one stays",
      "Fine-tuning redirects reach",
    ];
    const notes = [
      "Separate regions form inside the larger space.",
      "Expansion creates a bridge between previously separate regions.",
      "The left region gains density; every boundary stays fixed.",
      "The left opening closes while the right opening remains.",
      "The upper-right region expands; the lower-left island recedes.",
    ];
    function chapterIndex() {
      return Math.min(4, Math.floor(t * 5));
    }
    function updateUI() {
      if (mode === "encounter") {
        legend.parentElement.hidden = true;
        const ml = root.querySelector("#model-legend");
        ml.hidden = false;
        ml.innerHTML =
          '<span><i class="swatch-mara"></i>Mara’s reach</span><span><i class="swatch-eli"></i>Eli’s reach</span><span><i class="swatch-together"></i>Shared reach</span>';
        return;
      }
      if (mode === "society") {
        societyUI();
        return;
      }
      root.querySelector("#model-legend").hidden = mode !== "comparison";
      legend.parentElement.hidden = mode === "comparison";
      if (mode === "comparison") {
        comparisonUI();
        return;
      }
      const idx = chapterIndex();
      chapter.textContent = titles[idx];
      event.textContent = notes[idx];
      const p = idx + 1 + " / 5";
      if (phase.textContent !== p) phase.textContent = p;
      slider.value = Math.round(t * 1000);
      slider.setAttribute("aria-valuetext", titles[idx]);
      play.textContent = playing ? "Pause" : t === 1 ? "Replay" : "Play";
      chapterButtons.forEach((b, i) =>
        b.setAttribute("aria-pressed", String(i === idx)),
      );
      legend.textContent =
        view === "points"
          ? "Point concentration = illustrative richness"
          : "Surface = extent of reach · lighting shows shape";
    }
    const modelButtons = [...root.querySelectorAll("[data-model]")];
    const filterSelect = root.querySelector("#region-filter");
    function comparisonUI() {
      const state = comparison.getState();
      const names = {
        a: "Model A · broader reach",
        b: "Model B · focused reach",
        both: "Shared territory, different reach",
      };
      chapter.textContent = names[state.selection];
      event.textContent =
        state.selection === "both"
          ? "Model B is smaller overall, with a unique lower-right specialty."
          : "Switch models to compare density at the same coordinates.";
      const modelLegend = root.querySelector("#model-legend");
      modelLegend.hidden = false;
      modelLegend.innerHTML =
        state.selection === "both"
          ? (view === "surface" && state.filter === "all"
            ? '<span><i class="swatch-a"></i>A envelope</span><span><i class="swatch-b"></i>B envelope</span><span><i class="swatch-shared"></i>Shared interior</span>'
            : '<span><i class="swatch-a"></i>A only</span><span><i class="swatch-b"></i>B only</span><span><i class="swatch-shared"></i>Shared</span>')
          : state.selection === "a"
            ? '<span><i class="swatch-a"></i>Model A</span>'
            : '<span><i class="swatch-b"></i>Model B</span>';
      filterSelect.querySelector('option[value="0"]').disabled =
        state.selection === "b";
      filterSelect.querySelector('option[value="1"]').disabled =
        state.selection === "a";
      legend.parentElement.hidden = true;
      modelButtons.forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.model === state.selection),
        ),
      );
      filterSelect.value = state.filter;
    }
    const scopeButtons = [...root.querySelectorAll("[data-scope]")],
      memoryInput = root.querySelector("#external-memory");
    function societyUI() {
      const state = society.getState();
      legend.parentElement.hidden = true;
      const ml = root.querySelector("#model-legend");
      ml.hidden = false;
      ml.innerHTML =
        state.scope === "person"
          ? '<span><i class="swatch-b"></i>One person</span>'
          : state.scope === "society"
            ? '<span><i class="swatch-a"></i>Living collective</span>'
            : '<span><i class="swatch-b"></i>One person</span><span><i class="swatch-a"></i>Living collective</span>';
      if (state.memory && state.scope !== "person")
        ml.innerHTML +=
          '<span><i class="swatch-shared"></i>External memory</span>';
      chapter.textContent =
        state.scope === "person"
          ? "A personal constellation"
          : state.memory
            ? "Beyond living memory"
            : "No one carries it all";
      event.textContent =
        state.scope === "person"
          ? "A small, uneven collection of concepts and connections."
          : state.memory
            ? "Records and tools preserve concepts beyond any one mind."
            : "Knowledge is distributed across many people.";
      scopeButtons.forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.scope === state.scope)),
      );
      memoryInput.checked = state.memory;
      memoryInput.disabled = state.scope === "person";
    }
    function setSociety(next) {
      society.update(next);
      updateUI();
    }
    scopeButtons.forEach(
      (b) => (b.onclick = () => setSociety({ scope: b.dataset.scope })),
    );
    memoryInput.onchange = () => setSociety({ memory: memoryInput.checked });
    function setMode(next) {
      if (!["training", "comparison", "society", "encounter"].includes(next))
        return;
      mode = next;
      playing = false;
      points.visible = mode === "training" && view === "points";
      mesh.visible = mode === "training" && view === "surface";
      root.querySelector("#society-controls").hidden = mode !== "society";
      root.querySelector("#training-controls").hidden = mode !== "training";
      root.querySelector("#comparison-controls").hidden = mode !== "comparison";
      root
        .querySelector("#training-mode")
        .setAttribute("aria-pressed", String(mode === "training"));
      root
        .querySelector("#comparison-mode")
        .setAttribute("aria-pressed", String(mode === "comparison"));
      root.querySelector(".eyebrow").textContent =
        "Concept Space / " +
        (mode === "comparison"
          ? "model comparison"
          : mode === "encounter"
            ? "when two minds meet"
            : mode === "society"
              ? "people & collective knowledge"
              : "training story");
      comparison.update({ active: mode === "comparison", view });
      society.update({ active: mode === "society", view });
      encounter.update({ active: mode === "encounter", view });
      syncGeometry();
      updateUI();
    }
    function setModel(selection) {
      if (!["a", "b", "both"].includes(selection)) return;
      const previousFilter = comparison.getState().filter;
      const invalid =
        (selection === "a" && previousFilter === "1") ||
        (selection === "b" && previousFilter === "0");
      comparison.update({
        selection,
        filter: invalid ? "all" : previousFilter,
      });
      updateUI();
    }
    root.querySelector("#training-mode").onclick = () => setMode("training");
    root.querySelector("#comparison-mode").onclick = () =>
      setMode("comparison");
    modelButtons.forEach((b) => (b.onclick = () => setModel(b.dataset.model)));
    filterSelect.onchange = () => {
      comparison.update({ filter: filterSelect.value });
      updateUI();
    };
    function setView(next) {
      view = next;
      points.visible = mode === "training" && view === "points";
      mesh.visible = mode === "training" && view === "surface";
      comparison.update({ view });
      society.update({ view });
      encounter.update({ view });
      pointButton.setAttribute("aria-pressed", String(view === "points"));
      surfaceButton.setAttribute("aria-pressed", String(view === "surface"));
      syncGeometry();
      updateUI();
    }
    pointButton.onclick = () => setView("points");
    surfaceButton.onclick = () => setView("surface");
    function seek(v) {
      t = Math.max(0, Math.min(1, v));
      playing = false;
      syncGeometry();
      updateUI();
    }
    slider.oninput = () => seek(Number(slider.value) / 1000);
    chapterButtons.forEach((b, i) => (b.onclick = () => seek(i * 0.2 + 0.1)));
    play.onclick = () => {
      if (t >= 1) t = 0;
      playing = !playing;
      syncGeometry();
      updateUI();
    };
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", (e) => {
      drag = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!drag) return;
      yaw += (e.clientX - lastX) * 0.008;
      pitch = Math.max(
        -1.3,
        Math.min(1.3, pitch + (e.clientY - lastY) * 0.008),
      );
      lastX = e.clientX;
      lastY = e.clientY;
    });
    canvas.addEventListener("pointerup", () => (drag = false));
    canvas.addEventListener("pointercancel", () => (drag = false));
    canvas.addEventListener("lostpointercapture", () => (drag = false));
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        zoom = Math.max(2.7, Math.min(6.8, zoom + e.deltaY * 0.003));
      },
      { passive: false },
    );
    function resize() {
      if (!holder.clientWidth || !holder.clientHeight) return;
      renderer.setSize(holder.clientWidth, holder.clientHeight);
      camera.aspect = holder.clientWidth / holder.clientHeight;
      // On phones, leave the lower part of the world available for the story overlay.
      const lift =
        holder.clientWidth <= 600 &&
        !document
          .querySelector(".cinematic-story")
          .classList.contains("is-collapsed")
          ? 0.14
          : 0;
      camera.setViewOffset(
        holder.clientWidth,
        holder.clientHeight,
        0,
        holder.clientHeight * lift,
        holder.clientWidth,
        holder.clientHeight,
      );
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(holder);
    resize();
    syncGeometry();
    setMode("comparison");
    updateUI();
    function drawLabels() {
      // A single contextual note follows its actual point in the rotating world.
      labels.forEach((label) => {
        label.hidden = true;
      });
      if (!sceneNote || !notesToggle.checked) {
        noteElement.hidden = true; noteLeader.setAttribute("hidden", "");
        return;
      }
      const target = new THREE.Vector3(...sceneNote.p).applyMatrix4(
        world.matrixWorld,
      );
      const p = target.clone().project(camera);
      const visible =
        target.z > -0.2 &&
        Math.abs(p.x) < 0.98 &&
        Math.abs(p.y) < 0.95 &&
        p.z < 1;
      noteElement.hidden = !visible; noteLeader.toggleAttribute("hidden", !visible);
      if (!visible) return;
      const w = holder.clientWidth,
        h = holder.clientHeight;
      const x = (p.x * 0.5 + 0.5) * w,
        y = (-p.y * 0.5 + 0.5) * h;
      const nw = noteElement.offsetWidth,
        nh = noteElement.offsetHeight;
      const bounds = holder.getBoundingClientRect();
      const blockers = [...root.querySelectorAll('.model-legend, .legend'),
        document.querySelector('.cinematic-story'), document.querySelector('.scene-tools')]
        .filter(el => el && !el.hidden && el.getClientRects().length)
        .map(el => { const r = el.getBoundingClientRect(); return {left:r.left-bounds.left,top:r.top-bounds.top,right:r.right-bounds.left,bottom:r.bottom-bounds.top}; });
      const candidates = [[x+48,y+34],[x-nw-48,y+34],[x+48,y-nh-34],[x-nw-48,y-nh-34]]
        .map(([l,t]) => ({left:Math.max(12,Math.min(w-nw-12,l)),top:Math.max(170,Math.min(h-nh-24,t))}));
      const placement = candidates.find(p => !blockers.some(r => p.left < r.right+12 && p.left+nw > r.left-12 && p.top < r.bottom+12 && p.top+nh > r.top-12));
      if (!placement) { noteElement.hidden = true; noteLeader.setAttribute("hidden", ""); return; }
      const {left, top} = placement;
      noteElement.style.left = left + "px";
      noteElement.style.top = top + "px";
      noteLeader.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const line = noteLeader.querySelector("line"),
        dot = noteLeader.querySelector("circle");
      line.setAttribute("x1", x);
      line.setAttribute("y1", y);
      line.setAttribute("x2", Math.max(left, Math.min(left + nw, x)));
      line.setAttribute("y2", Math.max(top, Math.min(top + nh, y)));
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
    }
    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min((now - lastFrame) / 1000, 0.08);
      lastFrame = now;
      if (document.hidden || document.getElementById("viewer-screen")?.hidden)
        return;
      if (playing && mode === "training") {
        t = Math.min(1, t + dt / 50);
        if (t === 1) playing = false;
        configure(t);
        uniforms.uEnrich.value = enrich;
        uniforms.uFine.value = fine;
        updateUI();
      }
      if (now - lastBuild > 180) {
        syncGeometry();
        lastBuild = performance.now();
      }
      // One revolution in roughly 90 seconds: visible motion without rushing.
      if (rotate.checked && !drag) yaw += dt * ((Math.PI * 2) / 90);
      world.rotation.set(pitch, yaw, 0);
      camera.position.set(
        0,
        0,
        zoom * (camera.aspect < 1 ? 0.9 / camera.aspect : 1),
      );
      camera.lookAt(0, 0, 0);
      ring.quaternion.copy(camera.quaternion);
      renderer.render(scene, camera);
      drawLabels();
      frames++;
    }
    requestAnimationFrame(animate);
    window.ideaStudy = {
      setProgress: seek,
      setView,
      setMode,
      setModel,
      setSociety,
      society,
      setEncounter: (next) => encounter.update(next),
      encounter,
      setSceneNote,
      resize,
      pause() {
        playing = false;
        updateUI();
      },
      comparison,
      getState() {
        let active = 0;
        const g = points.geometry;
        for (let i = 0; i < g.attributes.aSeed.count; i++) {
          const d =
            0.16 +
            0.12 * g.attributes.aCore.array[i] +
            0.72 * enrich * g.attributes.aFocus.array[i];
          if (g.attributes.aSeed.array[i] < d) active++;
        }
        return {
          mode,
          comparison: comparison.getState(),
          society: society.getState(),
          encounter: encounter.getState(),
          progress: t,
          chapter: chapterIndex(),
          view,
          playing,
          camera: [yaw, pitch, zoom],
          fieldKey,
          particles: g.attributes.position.count,
          activePoints: active,
          enrich,
          fill,
          fine,
          radii: current.map((b) => b[3]),
          holes: [field(-0.34, 0.13, 0.04), field(0.3, -0.17, 0.035)],
          bridge: field(-0.02, -0.015, 0.05),
          frames,
          surfaceTriangles: mesh.geometry.attributes.position?.count / 3 || 0,
        };
      },
      sampleField: field,
    };
    console.log(
      "Shared training story ready. Surface and points use one field and timeline.",
    );
  } catch (e) {
    const p = document.createElement("p");
    p.className = "error";
    p.setAttribute("role", "alert");
    p.textContent = "The study could not start: " + e.message;
    holder.append(p);
    console.error(e);
  }
})();
