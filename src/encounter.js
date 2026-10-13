/* Fictional minds share one geography. Geometry expresses reach; light expresses attention. */
window.createEncounter = function ({
  THREE,
  world,
  candidates,
  extractSurface,
  dpr,
}) {
  const group = new THREE.Group();
  group.visible = false;
  world.add(group);
  const maraLobes = [
      [-0.3, 0.12, 0.02, 0.32],
      [-0.48, -0.25, 0.04, 0.18],
      [-0.06, -0.08, 0.06, 0.24],
      [-0.35, 0.43, -0.04, 0.12],
    ],
    eliLobes = [
      [0.27, 0.04, 0.015, 0.31],
      [0.48, -0.29, 0.025, 0.17],
      [0.04, -0.12, 0.02, 0.23],
      [0.4, 0.36, -0.08, 0.14],
    ];
  function shape(lobes, x, y, z) {
    const wx = x + 0.025 * Math.sin(y * 18 + z * 11),
      wy = y + 0.027 * Math.sin(z * 15 - x * 9),
      wz = z + 0.027 * Math.sin(x * 16 + y * 12);
    let d = 10;
    for (const [a, b, c, r] of lobes)
      d = Math.min(d, Math.hypot(wx - a, wy - b, wz - c) - r);
    return Math.max(
      d + 0.009 * Math.sin(x * 31 + y * 18) * Math.cos(z * 27),
      Math.hypot(x, y, z) - 0.92,
    );
  }
  function mara(x, y, z) {
    return Math.max(
      shape(maraLobes, x, y, z),
      0.074 - Math.hypot(x + 0.34, y - 0.16),
    );
  }
  function eli(x, y, z) {
    return Math.max(
      shape(eliLobes, x, y, z),
      0.067 - Math.hypot(x - 0.29, y - 0.07),
    );
  }
  function taught(x, y, z) {
    return Math.max(
      mara(x, y, z),
      -eli(x, y, z),
      Math.hypot(x + 0.23, y - 0.23, z - 0.015) - 0.2,
    );
  }
  function discovery(x, y, z) {
    return Math.max(
      shape(
        [
          [0, 0.64, 0.01, 0.135],
          [0.15, 0.69, -0.035, 0.067],
        ],
        x,
        y,
        z,
      ),
      -mara(x, y, z),
      -eli(x, y, z),
    );
  }
  const fields = [
    (x, y, z) => Math.max(mara(x, y, z), -eli(x, y, z), -taught(x, y, z)),
    (x, y, z) => Math.max(eli(x, y, z), -mara(x, y, z)),
    (x, y, z) => Math.max(mara(x, y, z), eli(x, y, z)),
    taught,
    discovery,
  ];
  const colors = ["#62d9cb", "#b5a0f3", "#dcebb1", "#62d9cb", "#e4edb5"].map(
    (c) => new THREE.Color(c),
  );
  const buckets = fields.map(() => []);
  for (let i = 0; i < candidates.length; i += 4) {
    const p = candidates.slice(i, i + 3);
    if (candidates[i + 3] > 0.72) continue;
    for (let k = 0; k < fields.length; k++)
      if (fields[k](...p) < -0.002) {
        buckets[k].push(...p);
        break;
      }
  }
  const shared = {
    uLearn: { value: 0 },
    uDiscover: { value: 0 },
  };
  const shade = `uniform vec3 uColor;uniform float uLayer;uniform float uLearn;uniform float uDiscover;varying vec3 vP;
    vec4 appearance(){vec3 col=uColor;float a=.64;
    if(uLayer>2.5&&uLayer<3.5){float learned=smoothstep(0.,.12,uLearn-clamp((-vP.x+.02)/.48,0.,1.));col=mix(col,vec3(.86,.92,.69),learned);a+=learned*.35;}
    if(uLayer>3.5){float reveal=smoothstep(0.,.1,uDiscover-clamp((vP.y-.49)/.32,0.,1.));a*=reveal;}
    if(uLayer>1.5&&uLayer<2.5)a+=.32;
    return vec4(col,a);}`;
  function material(layer, surface = false) {
    return new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        uLayer: { value: layer },
        uColor: { value: colors[layer] },
        uDpr: { value: dpr },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: surface ? THREE.NormalBlending : THREE.AdditiveBlending,
      vertexShader: surface
        ? `varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`
        : `varying vec3 vP;uniform float uDpr;void main(){vP=position;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(2.05*uDpr*4./(-p.z),1.,9.);}`,
      fragmentShader: surface
        ? shade +
          `varying vec3 vN;varying vec3 vV;void main(){vec4 c=appearance();if(c.a<.01)discard;float light=.35+.6*max(dot(normalize(vN),normalize(vec3(-.6,1.,1.))),0.);float rim=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.);gl_FragColor=vec4(c.rgb*(light+.35*rim),c.a*.84);}`
        : shade +
          `void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;vec4 c=appearance();gl_FragColor=vec4(c.rgb,c.a*(1.-smoothstep(.3,1.,r)));}`,
    });
  }
  const clouds = buckets.map((p, i) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    const o = new THREE.Points(g, material(i));
    group.add(o);
    return o;
  });
  const paths = [
    [
      [0.13, -0.12, 0.12],
      [0.04, 0.13, 0.28],
      [-0.22, 0.24, 0.08],
    ],
    [
      [-0.04, -0.06, 0.15],
      [-0.48, 0.15, 0.28],
      [-0.45, -0.24, 0.1],
    ],
    [
      [-0.04, -0.06, 0.15],
      [0.08, 0.48, 0.3],
      [0.47, 0.34, 0.04],
    ],
    [
      [-0.3, 0.25, 0.06],
      [-0.25, 0.5, 0.04],
      [0, 0.65, 0.04],
    ],
    [
      [0.3, 0.3, 0.02],
      [0.23, 0.56, 0.12],
      [0, 0.65, 0.04],
    ],
  ].map((p, i) => {
    const curve = new THREE.QuadraticBezierCurve3(
      ...p.map((a) => new THREE.Vector3(...a)),
    );
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
    const m = new THREE.LineBasicMaterial({
      color: i === 1 ? colors[0] : i === 2 ? colors[1] : colors[2],
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const o = new THREE.Line(g, m);
    group.add(o);
    return o;
  });
  // A shared utterance forks toward separate attention targets; reach stays visible.
  const attention = [[-.04,-.06,.15],[-.45,-.24,.1],[.47,.34,.04]].map((p,i) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(i ? .047 : .019, i ? .054 : .026, 48),
      new THREE.MeshBasicMaterial({color: i === 1 ? colors[0] : i === 2 ? colors[1] : colors[2], side: THREE.DoubleSide, transparent:true, depthWrite:false}));
    ring.position.set(...p);
    group.add(ring);
    return ring;
  });
  let step = 0,
    progress = 1,
    view = "points",
    meshes = null;
  function update(next = {}) {
    step = next.step ?? step;
    progress = Math.max(0, Math.min(1, next.progress ?? progress));
    view = next.view ?? view;
    if (next.active !== undefined) group.visible = next.active;
    shared.uLearn.value = step === 0 ? 0 : step === 1 ? progress * 1.15 : 1.15;
    shared.uDiscover.value = step === 3 ? progress * 1.15 : 0;
    if (view === "surface" && group.visible && !meshes)
      meshes = fields.map((f, i) => {
        const o = new THREE.Mesh(extractSurface(f), material(i, true));
        group.add(o);
        return o;
      });
    clouds.forEach((o, i) => {
      o.visible = view === "points" && (i !== 4 || step === 3);
    });
    meshes?.forEach((o, i) => {
      o.visible = view === "surface" && (i !== 4 || step === 3);
    });
    attention.forEach((o) => { o.visible = step === 2; o.material.opacity = progress; });
    paths.forEach((o, i) => {
      o.visible =
        (i === 0 && step === 1) ||
        (i >= 1 && i <= 2 && step === 2) ||
        (i >= 3 && step === 3);
      o.geometry.setDrawRange(0, Math.max(0, Math.round(65 * progress)));
    });
  }
  update();
  return {
    update,
    mara,
    eli,
    taught,
    discovery,
    getState: () => ({
      active: group.visible,
      step,
      progress,
      view,
      counts: buckets.map((p) => p.length / 3),
      surfaces:
        meshes?.map((m) => m.geometry.attributes.position.count / 3) ?? [],
    }),
  };
};
