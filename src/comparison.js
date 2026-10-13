/* Illustrative models share coordinates and seeded samples. No real model data. */
window.createComparison = function ({
  THREE,
  world,
  candidates,
  extractSurface,
  dpr,
}) {
  const group = new THREE.Group();
  group.visible = false;
  world.add(group);
  const palette = [
    new THREE.Color("#59dbe8"),
    new THREE.Color("#ffb66e"),
    new THREE.Color("#dcebb1"),
  ];
  const aLobes = [
    [-0.34, 0.13, 0.04, 0.33],
    [0.3, -0.17, 0.035, 0.34],
    [0.1, 0.43, -0.1, 0.23],
    [-0.55, -0.4, 0.06, 0.12],
    [0.56, 0.3, 0.1, 0.105],
    [-0.02, -0.015, 0.05, 0.146],
  ];
  const bLobes = [
    [-0.22, 0.13, 0.03, 0.235],
    [0.23, -0.12, 0.04, 0.25],
    [0.04, 0.3, -0.07, 0.15],
    [0.44, -0.28, 0.055, 0.15],
    [0.65, -0.39, 0.07, 0.195],
  ];
  function modelField(lobes, x, y, z) {
    const wx = x + 0.035 * Math.sin(y * 15 + z * 7),
      wy = y + 0.03 * Math.sin(z * 13 - x * 7),
      wz = z + 0.04 * Math.sin(x * 13 + y * 9);
    let d = 9;
    for (const b of lobes) {
      const q = Math.hypot(wx - b[0], wy - b[1], wz - b[2]) - b[3],
        h = Math.max(0.032 - Math.abs(d - q), 0) / 0.032;
      d = Math.min(d, q) - h * h * 0.008;
    }
    return Math.max(
      d + 0.01 * Math.sin(x * 37 + y * 17) * Math.cos(z * 29 - y * 23),
      Math.hypot(x, y, z) - 0.94,
    );
  }
  const fieldA = (x, y, z) =>
    Math.max(
      modelField(aLobes, x, y, z),
      0.103 - Math.hypot(x - 0.3, y + 0.17),
    );
  const fieldB = (x, y, z) => modelField(bLobes, x, y, z);
  const fields = [
    (x, y, z) => Math.max(fieldA(x, y, z), -fieldB(x, y, z)),
    (x, y, z) => Math.max(fieldB(x, y, z), -fieldA(x, y, z)),
    (x, y, z) => Math.max(fieldA(x, y, z), fieldB(x, y, z)),
  ];
  function densityA(x, y, z) {
    return (
      0.25 +
      0.65 *
        Math.exp(-((x + 0.25) ** 2 + (y - 0.14) ** 2 + (z - 0.04) ** 2) * 16)
    );
  }
  function densityB(x, y, z) {
    return (
      0.28 +
      0.65 * Math.exp(-((x - 0.2) ** 2 + (y + 0.1) ** 2 + (z - 0.04) ** 2) * 20)
    );
  }
  const buckets = fields.map(() => ({
    position: [],
    seed: [],
    da: [],
    db: [],
  }));
  for (let i = 0; i < candidates.length; i += 4) {
    const x = candidates[i],
      y = candidates[i + 1],
      z = candidates[i + 2],
      a = fieldA(x, y, z) < -0.004,
      b = fieldB(x, y, z) < -0.004;
    if (!a && !b) continue;
    const q = buckets[a && b ? 2 : a ? 0 : 1];
    q.position.push(x, y, z);
    q.seed.push(candidates[i + 3]);
    q.da.push(densityA(x, y, z));
    q.db.push(densityB(x, y, z));
  }
  const clouds = buckets.map((b, i) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(b.position, 3));
    g.setAttribute("aSeed", new THREE.Float32BufferAttribute(b.seed, 1));
    g.setAttribute("aDA", new THREE.Float32BufferAttribute(b.da, 1));
    g.setAttribute("aDB", new THREE.Float32BufferAttribute(b.db, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: palette[i].clone() },
        uModel: { value: 2 },
        uDpr: { value: dpr },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSeed;attribute float aDA;attribute float aDB;uniform float uModel;uniform float uDpr;varying float vA;void main(){float density=uModel<.5?aDA:uModel<1.5?aDB:max(aDA,aDB);vA=smoothstep(aSeed-.025,aSeed+.025,density)*.9;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(2.0*uDpr*4./(-p.z),1.,9.);}`,
      fragmentShader: `uniform vec3 uColor;varying float vA;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=vA*(1.-smoothstep(.35,1.,r));if(a<.002)discard;gl_FragColor=vec4(uColor,a);}`,
    });
    const p = new THREE.Points(g, material);
    group.add(p);
    return p;
  });
  let meshes = null,
    fullMeshes = null,
    selection = "both",
    filter = "all",
    view = "points";
  function surfaceMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: palette[0].clone() },
        uModel: { value: 2 },
        uCategorical: { value: 0 },
        uOpacity: { value: 1 },
      },
      vertexShader: `attribute vec3 aColor;varying vec3 vColor;varying vec3 vN;varying vec3 vP;void main(){vColor=aColor;vN=normalize(normalMatrix*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 uColor;uniform float uModel;uniform float uCategorical;uniform float uOpacity;varying vec3 vColor;varying vec3 vN;varying vec3 vP;void main(){float a=.25+.65*exp(-dot(vP-vec3(-.25,.14,.04),vP-vec3(-.25,.14,.04))*16.);float b=.28+.65*exp(-dot(vP-vec3(.2,-.1,.04),vP-vec3(.2,-.1,.04))*20.);float d=uModel<.5?a:uModel<1.5?b:max(a,b);float light=.42+.75*max(dot(normalize(vN),normalize(vec3(-.7,1.,1.))),0.);gl_FragColor=vec4(mix(uColor,vColor,uCategorical)*light,uOpacity);}`,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }
  function makeSurface(field, categorical = false) {
    const g = extractSurface(field),
      colors = [],
      pos = g.attributes.position,
      norm = g.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) - norm.getX(i) * 0.012,
        y = pos.getY(i) - norm.getY(i) * 0.012,
        z = pos.getZ(i) - norm.getZ(i) * 0.012,
        a = fieldA(x, y, z) < 0,
        b = fieldB(x, y, z) < 0,
        c = palette[a && b ? 2 : b ? 1 : 0];
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
    const mesh = new THREE.Mesh(g, surfaceMaterial());
    mesh.material.uniforms.uCategorical.value = categorical ? 1 : 0;
    group.add(mesh);
    return mesh;
  }
  function ensureSurfaces() {
    if (meshes) return;
    meshes = fields.map((f) => makeSurface(f));
    fullMeshes = [
      makeSurface(fieldA),
      makeSurface(fieldB),
      makeSurface(
        (x, y, z) => Math.min(fieldA(x, y, z), fieldB(x, y, z)),
        true,
      ),
    ];
  }
  function update(next = {}) {
    selection = next.selection ?? selection;
    filter = next.filter ?? filter;
    view = next.view ?? view;
    if (next.active !== undefined) group.visible = next.active;
    if (view === "surface" && group.visible) ensureSurfaces();
    const m = selection === "a" ? 0 : selection === "b" ? 1 : 2;
    for (let i = 0; i < 3; i++) {
      const included =
        (selection === "both" || i === 2 || i === m) &&
        (filter === "all" || i === Number(filter));
      const color = selection === "both" ? palette[i] : palette[m];
      clouds[i].visible = included && view === "points";
      clouds[i].material.uniforms.uModel.value = m;
      clouds[i].material.uniforms.uColor.value.copy(color);
      if (meshes) {
        meshes[i].visible = included && view === "surface" && (filter !== "all" || (selection === "both" && i === 2));
        meshes[i].material.uniforms.uOpacity.value = filter === "all" && selection === "both" && i !== 2 ? .18 : 1;
        meshes[i].renderOrder = 1;
        meshes[i].material.depthWrite = true;
        meshes[i].material.uniforms.uColor.value.copy(color);
        meshes[i].material.uniforms.uModel.value = m;
      }
    }
    if (fullMeshes)
      fullMeshes.forEach((mesh, i) => {
        mesh.visible = view === "surface" && filter === "all" && (selection === "both" ? i < 2 : i === m);
        mesh.material.uniforms.uOpacity.value = selection === "both" ? .16 : 1;
        mesh.material.depthWrite = selection !== "both";
        mesh.material.polygonOffset = true;
        mesh.material.polygonOffsetFactor = 2;
        mesh.material.polygonOffsetUnits = 2;
        mesh.renderOrder = 2;
        mesh.material.uniforms.uModel.value = m;
        if (i !== 2) mesh.material.uniforms.uColor.value.copy(palette[i]);
      });
  }
  return {
    update,
    fieldA,
    fieldB,
    densityA,
    densityB,
    getState() {
      const counts = buckets.map((b) => b.seed.length);
      return {
        selection,
        filter,
        view,
        active: group.visible,
        counts: {
          aOnly: counts[0],
          bOnly: counts[1],
          shared: counts[2],
          aTotal: counts[0] + counts[2],
          bTotal: counts[1] + counts[2],
        },
        visibleCategories: [0, 1, 2].filter(
          (i) =>
            (selection === "both" ||
              i === 2 ||
              i === (selection === "a" ? 0 : 1)) &&
            (filter === "all" || i === Number(filter)),
        ),
        surfaces:
          meshes?.map((m) => m.geometry.attributes.position.count / 3) ?? [],
      };
    },
  };
};
