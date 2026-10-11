/* A person is part of the living collective. External memory is a separate layer,
   not the same thing as what any living individual understands or can retrieve. */
window.createSociety = function ({
  THREE,
  world,
  candidates,
  extractSurface,
  dpr,
}) {
  const group = new THREE.Group();
  group.visible = false;
  world.add(group);
  const colors = [
    new THREE.Color("#ffc17f"),
    new THREE.Color("#53bcb5"),
    new THREE.Color("#bca7ed"),
  ];
  const personLobes = [
    [-0.3, 0.12, 0.09, 0.17],
    [-0.13, -0.08, 0.1, 0.155],
    [-0.39, -0.19, 0.03, 0.095],
    [-0.13, 0.21, 0.05, 0.09],
  ];
  const livingLobes = [
    [-0.3, 0.12, 0.04, 0.31],
    [0.19, 0.12, -0.01, 0.29],
    [-0.07, -0.29, 0.02, 0.31],
    [0.12, 0.47, -0.1, 0.16],
    [0.43, -0.23, 0.06, 0.21],
    [-0.51, -0.26, 0.03, 0.17],
  ];
  const archiveLobes = [
    [0.49, 0.37, 0.0, 0.19],
    [0.35, -0.51, 0.015, 0.17],
    [-0.42, 0.48, -0.06, 0.17],
    [-0.58, 0.03, -0.34, 0.14],
  ];
  function shape(lobes, x, y, z) {
    const wx = x + 0.027 * Math.sin(y * 15 + z * 9),
      wy = y + 0.03 * Math.sin(z * 14 - x * 9),
      wz = z + 0.033 * Math.sin(x * 14 + y * 10);
    let d = 10;
    for (const l of lobes) {
      const q = Math.hypot(wx - l[0], wy - l[1], wz - l[2]) - l[3],
        h = Math.max(0.04 - Math.abs(d - q), 0) / 0.04;
      d = Math.min(q, d) - h * h * 0.01;
    }
    return Math.max(
      d + 0.008 * Math.sin(x * 29 + y * 31) * Math.cos(z * 27),
      Math.hypot(x, y, z) - 0.94,
    );
  }
  const person = (x, y, z) => shape(personLobes, x, y, z),
    living = (x, y, z) =>
      Math.min(shape(livingLobes, x, y, z), person(x, y, z) - 0.07),
    archive = (x, y, z) =>
      Math.max(shape(archiveLobes, x, y, z), -living(x, y, z));
  const fields = [person, living, archive],
    bucket = [[], [], []];
  for (let i = 0; i < candidates.length; i += 4) {
    const x = candidates[i],
      y = candidates[i + 1],
      z = candidates[i + 2];
    if (person(x, y, z) < -0.003) bucket[0].push(x, y, z);
    else if (living(x, y, z) < -0.003 && candidates[i + 3] < 0.44)
      bucket[1].push(x, y, z);
    else if (archive(x, y, z) < -0.003 && candidates[i + 3] < 0.65)
      bucket[2].push(x, y, z);
  }
  const points = bucket.map((p, i) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: colors[i] },
        uSize: { value: i === 0 ? 2.5 : 1.7 },
        uAlpha: { value: i === 0 ? 0.95 : i === 1 ? 0.65 : 0.7 },
        uDpr: { value: dpr },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `uniform float uSize;uniform float uDpr;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(uSize*uDpr*4./(-p.z),1.,10.);}`,
      fragmentShader: `uniform vec3 uColor;uniform float uAlpha;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(uColor,uAlpha*(1.-smoothstep(.35,1.,r)));}`,
    });
    const cloud = new THREE.Points(g, m);
    group.add(cloud);
    return cloud;
  });
  let scope = "person",
    memory = false,
    view = "points",
    meshes = null;
  function ensureMeshes() {
    if (meshes) return;
    meshes = fields.map((f, i) => {
      const m = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: colors[i] },
          uAlpha: { value: i === 1 ? 0.3 : 1 },
        },
        transparent: i === 1,
        depthWrite: i !== 1,
        side: i === 1 ? THREE.FrontSide : THREE.DoubleSide,
        vertexShader: `varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
        fragmentShader: `uniform vec3 uColor;uniform float uAlpha;varying vec3 vN;varying vec3 vV;void main(){float diffuse=.38+.68*max(dot(normalize(vN),normalize(vec3(-.5,1.,1.))),0.);float rim=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.);gl_FragColor=vec4(sqrt(uColor*diffuse),uAlpha<.5?uAlpha*(.7+1.2*rim):uAlpha);}`,
      });
      const mesh = new THREE.Mesh(extractSurface(f), m);
      mesh.renderOrder = i === 1 ? 2 : 0;
      group.add(mesh);
      return mesh;
    });
  }
  function update(next = {}) {
    scope = next.scope ?? scope;
    memory = next.memory ?? memory;
    view = next.view ?? view;
    if (next.active !== undefined) group.visible = next.active;
    if (view === "surface" && group.visible) ensureMeshes();
    for (let i = 0; i < 3; i++) {
      const visible =
        i === 0
          ? true
          : i === 1
            ? scope !== "person"
            : memory && scope !== "person";
      points[i].visible = visible && view === "points";
      points[i].material.uniforms.uColor.value =
        scope === "society" && i === 0 ? colors[1] : colors[i];
      if (meshes) {
        meshes[i].visible = visible && view === "surface";
        meshes[i].material.uniforms.uColor.value =
          scope === "society" && i === 0 ? colors[1] : colors[i];
      }
    }
  }
  return {
    update,
    person,
    living,
    archive,
    getState() {
      return {
        active: group.visible,
        scope,
        memory,
        view,
        counts: bucket.map((b) => b.length / 3),
        visibleLayers: [
          0,
          ...(scope !== "person" ? [1] : []),
          ...(memory && scope !== "person" ? [2] : []),
        ],
        surfaces:
          meshes?.map((m) => m.geometry.attributes.position.count / 3) ?? [],
      };
    },
  };
};
