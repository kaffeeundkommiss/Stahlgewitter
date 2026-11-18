/* 3D-Modell des Gewehrs 98 für die Seite sturmtruppen.html.
   Geometrie übernommen aus dem claude.ai-Entwurf „Gewehr 98 – 3D-Modell“ (18.11.2026),
   Steuerung und Farben nach dem Muster der Modelle Fokker Dr.I (Repo erster-Weltkrieg)
   und Mark II (Repo bullecourt).
   Benötigt modell/vendor/three-0.159.0.min.js (MIT-Lizenz, siehe three-LICENSE.txt). */
(function () {
  "use strict";
  const box = document.getElementById("g98");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const msg = box.querySelector(".g98-msg");
  const labelRear = box.querySelector("[data-label=kimme]");
  const labelFront = box.querySelector("[data-label=korn]");
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { spin: !reduce, sight: false, bayo: false, range: 400, view: "drei" };
  const VIEWS = {
    drei: { theta: 0.6, phi: 1.2, dist: 1.6, tx: 0.01 },
    seite: { theta: 0.0, phi: 1.55, dist: 1.6, tx: 0.01 },
    oben: { theta: 0.0, phi: 0.06, dist: 1.9, tx: 0.01 },
    unten: { theta: 0.3, phi: 2.6, dist: 1.9, tx: 0.01 },
    muendung: { theta: 1.25, phi: 1.4, dist: 0.6, tx: 0.53 },
    verschluss: { theta: 0.5, phi: 1.15, dist: 0.6, tx: -0.22 }
  };
  const RANGES = { 400: 0.0, 1000: 0.07, 2000: 0.16 };
  const c = { theta: 0.6, phi: 1.2, dist: 1.6, tTheta: 0.6, tPhi: 1.2, tDist: 1.6, tx: 0.01, ty: -0.03, ttx: 0.01, tty: -0.03 };
  function fail(text) { if (msg) { msg.textContent = text; msg.hidden = false; } }
  const T = window.THREE;
  if (!T) { fail("Das 3D-Modell konnte nicht geladen werden."); return; }
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true }); }
  catch (e) { fail("WebGL ist in diesem Browser nicht verfügbar."); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new T.Scene();
  scene.background = new T.Color(0x15181c);
  scene.fog = new T.Fog(0x15181c, 3.5, 8);
  const cam = new T.PerspectiveCamera(32, 1, 0.01, 30);

  const hemi = new T.HemisphereLight(0xdfe8f5, 0x3a2f28, 1.0);
  scene.add(hemi);
  const key = new T.DirectionalLight(0xfff1dc, 2.6);
  key.position.set(0.8, 2.2, 1.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const sc = key.shadow.camera;
  sc.left = -1.1; sc.right = 1.1; sc.top = 1.1; sc.bottom = -1.1; sc.near = 0.1; sc.far = 6;
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.002;
  scene.add(key);
  const fill = new T.DirectionalLight(0x9fb4d0, 0.6);
  fill.position.set(-1.2, 0.6, -1);
  scene.add(fill);

  const FLOOR = -0.24;
  const groundMat = new T.MeshStandardMaterial({ color: 0x22272d, roughness: 1 });
  const ground = new T.Mesh(new T.CircleGeometry(3.5, 72), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = FLOOR;
  ground.receiveShadow = true;
  scene.add(ground);
  const ringMat = new T.MeshBasicMaterial({ color: 0x353b43 });
  const ring = new T.Mesh(new T.RingGeometry(0.92, 0.925, 128), ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.y = FLOOR + 0.001;
  scene.add(ring);

  const std = (col, r, m) => new T.MeshStandardMaterial({ color: col, roughness: r, metalness: m || 0, transparent: true });
  const mats = {
    wood: std(0x7a4a26, 0.55, 0),
    steel: std(0x2a2c30, 0.32, 0.75),
    steelLight: std(0x6d6f73, 0.3, 0.85),
    dark: std(0x0b0b0c, 0.9, 0)
  };
  const sightMats = {
    steel: new T.MeshStandardMaterial({ color: 0x34373c, roughness: 0.3, metalness: 0.75 }),
    bright: new T.MeshStandardMaterial({ color: 0x8a8d92, roughness: 0.28, metalness: 0.85 })
  };
  const bayoMats = {
    blade: new T.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.22, metalness: 0.9, transparent: true }),
    steel: new T.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.32, metalness: 0.75, transparent: true }),
    wood: new T.MeshStandardMaterial({ color: 0x6a3f20, roughness: 0.6, transparent: true })
  };

  const add = (parent, geo, mat) => {
    const m = new T.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const tubeX = (parent, r0, r1, x0, x1, mat, y, z, seg) => {
    const m = add(parent, new T.CylinderGeometry(r1, r0, x1 - x0, seg || 24), mat);
    m.rotation.z = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y || 0, z || 0);
    return m;
  };
  const rod = (parent, a, b, r, mat) => {
    const A = new T.Vector3(a[0], a[1], a[2]);
    const B = new T.Vector3(b[0], b[1], b[2]);
    const d = B.clone().sub(A);
    const m = add(parent, new T.CylinderGeometry(r, r, d.length(), 10), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
    return m;
  };

  const rifle = new T.Group();
  scene.add(rifle);

  // Schaft mit Pistolengriff (x: Mündung +, Laufachse y = 0), Gesamtlänge 1,25 m
  {
    const sh = new T.Shape();
    sh.moveTo(-0.613, -0.016);
    sh.lineTo(-0.613, -0.152);
    sh.lineTo(-0.38, -0.078);
    sh.quadraticCurveTo(-0.335, -0.07, -0.318, -0.102);
    sh.lineTo(-0.292, -0.1);
    sh.quadraticCurveTo(-0.272, -0.066, -0.25, -0.06);
    sh.lineTo(-0.08, -0.052);
    sh.lineTo(0.35, -0.03);
    sh.lineTo(0.555, -0.022);
    sh.lineTo(0.555, 0.003);
    sh.lineTo(-0.07, 0.003);
    sh.lineTo(-0.07, -0.009);
    sh.lineTo(-0.29, -0.009);
    sh.quadraticCurveTo(-0.34, -0.009, -0.37, -0.03);
    sh.lineTo(-0.45, -0.024);
    sh.lineTo(-0.613, -0.016);
    const g = new T.ExtrudeGeometry(sh, { depth: 0.034, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.006, bevelSegments: 4, curveSegments: 12 });
    g.translate(0, 0, -0.017);
    add(rifle, g, mats.wood);
  }
  // Kolbenkappe, unterer Riemenbügel am Kolben
  const bp = add(rifle, new T.BoxGeometry(0.006, 0.148, 0.05), mats.steel);
  bp.position.set(-0.619, -0.084, 0);
  {
    const plate = add(rifle, new T.BoxGeometry(0.03, 0.004, 0.012), mats.steel);
    plate.position.set(-0.46, -0.112, 0);
    plate.rotation.z = 0.34;
    const sw = add(rifle, new T.TorusGeometry(0.012, 0.002, 6, 16), mats.steel);
    sw.position.set(-0.46, -0.126, 0);
    sw.rotation.z = 0.34;
  }

  // Handschutz oben
  {
    const g = new T.CylinderGeometry(0.0158, 0.0158, 0.28, 24, 1, false, Math.PI, Math.PI);
    const hg = add(rifle, g, mats.wood);
    hg.rotation.z = -Math.PI / 2;
    hg.position.set(0.215, 0.0, 0);
  }

  // Lauf
  tubeX(rifle, 0.0145, 0.0085, -0.08, 0.635, mats.steel);
  const muzzle = add(rifle, new T.CircleGeometry(0.004, 16), mats.dark);
  muzzle.rotation.y = Math.PI / 2;
  muzzle.position.set(0.6352, 0, 0);

  // Hülse mit Verschluss
  tubeX(rifle, 0.0185, 0.0185, -0.13, -0.075, mats.steel);
  tubeX(rifle, 0.017, 0.017, -0.275, -0.228, mats.steel);
  const recLow = add(rifle, new T.BoxGeometry(0.1, 0.017, 0.034), mats.steel);
  recLow.position.set(-0.18, -0.009, 0);
  const charger = add(rifle, new T.BoxGeometry(0.014, 0.008, 0.026), mats.steel);
  charger.position.set(-0.235, 0.019, 0);
  tubeX(rifle, 0.0115, 0.0115, -0.27, -0.13, mats.steelLight, 0.002);
  tubeX(rifle, 0.0135, 0.012, -0.315, -0.275, mats.steel);
  tubeX(rifle, 0.008, 0.009, -0.338, -0.315, mats.steel);
  const safety = add(rifle, new T.BoxGeometry(0.01, 0.016, 0.004), mats.steel);
  safety.position.set(-0.3, 0.018, 0);
  // gerader Kammerstängel
  rod(rifle, [-0.262, 0.002, 0.01], [-0.262, 0.002, 0.062], 0.0045, mats.steelLight);
  const knob = add(rifle, new T.SphereGeometry(0.0105, 16, 12), mats.steelLight);
  knob.position.set(-0.262, 0.002, 0.068);

  // Abzugsbügel, Abzug, Magazinboden
  {
    const tg = add(rifle, new T.TorusGeometry(0.022, 0.0032, 8, 28, Math.PI), mats.steel);
    tg.rotation.z = Math.PI;
    tg.position.set(-0.212, -0.058, 0);
    const tr = add(rifle, new T.BoxGeometry(0.004, 0.026, 0.006), mats.steel);
    tr.position.set(-0.218, -0.066, 0);
    tr.rotation.z = -0.25;
    const fp = add(rifle, new T.BoxGeometry(0.09, 0.004, 0.024), mats.steel);
    fp.position.set(-0.135, -0.055, 0);
  }

  // Unterring mit Riemenbügel
  {
    const b = add(rifle, new T.BoxGeometry(0.012, 0.054, 0.054), mats.steel);
    b.position.set(0.36, -0.01, 0);
    const sw = add(rifle, new T.TorusGeometry(0.012, 0.002, 6, 16), mats.steel);
    sw.position.set(0.36, -0.05, 0);
  }
  // Oberring / Nasenkappe mit Seitengewehrhalter und Zusammensetzhaken
  {
    const nc = add(rifle, new T.BoxGeometry(0.045, 0.034, 0.05), mats.steel);
    nc.position.set(0.578, -0.009, 0);
    const lug = add(rifle, new T.BoxGeometry(0.06, 0.008, 0.012), mats.steel);
    lug.position.set(0.575, -0.031, 0);
    rod(rifle, [0.56, -0.004, 0.026], [0.56, -0.004, 0.04], 0.002, mats.steel);
    rod(rifle, [0.56, -0.004, 0.04], [0.575, -0.004, 0.04], 0.002, mats.steel);
  }

  // Lange-Visier (eigene Gruppe, separat darstellbar)
  const rearSight = new T.Group();
  const RS = new T.Vector3(0.005, 0.0, 0);
  rearSight.position.copy(RS);
  rifle.add(rearSight);
  {
    const base = add(rearSight, new T.BoxGeometry(0.13, 0.008, 0.026), sightMats.steel);
    base.position.set(0.0, 0.016, 0);
    [-0.045, 0.045].forEach((x) => {
      const rg = add(rearSight, new T.CylinderGeometry(0.0165, 0.0165, 0.018, 20), sightMats.steel);
      rg.rotation.z = -Math.PI / 2;
      rg.position.set(x, 0, 0);
    });
    // geschwungene Seitenbahnen
    const sh = new T.Shape();
    sh.moveTo(0.062, 0.019);
    sh.lineTo(-0.058, 0.019);
    sh.lineTo(-0.058, 0.03);
    sh.bezierCurveTo(-0.04, 0.042, -0.02, 0.022, 0.0, 0.031);
    sh.bezierCurveTo(0.02, 0.038, 0.04, 0.026, 0.062, 0.025);
    sh.closePath();
    const g = new T.ExtrudeGeometry(sh, { depth: 0.002, bevelEnabled: false, curveSegments: 16 });
    [1, -1].forEach((s) => {
      const m = add(rearSight, g, sightMats.steel);
      m.position.z = s > 0 ? 0.011 : -0.013;
    });
  }
  const leaf = new T.Group();
  leaf.position.set(0.066, 0.027, 0);
  rearSight.add(leaf);
  {
    const plate = add(leaf, new T.BoxGeometry(0.115, 0.003, 0.02), sightMats.bright);
    plate.position.set(-0.0575, 0.0, 0);
    [1, -1].forEach((s) => {
      const ear = add(leaf, new T.BoxGeometry(0.004, 0.011, 0.008), sightMats.steel);
      ear.position.set(-0.113, 0.006, s * 0.006);
    });
    const slider = add(leaf, new T.BoxGeometry(0.014, 0.007, 0.03), sightMats.steel);
    slider.position.set(-0.06, 0.0, 0);
  }
  const notch = new T.Object3D();
  notch.position.set(-0.113, 0.008, 0);
  leaf.add(notch);

  // Korn ohne Schutzhaube
  const frontSight = new T.Group();
  const FS = new T.Vector3(0.62, 0, 0);
  frontSight.position.copy(FS);
  rifle.add(frontSight);
  {
    const base = add(frontSight, new T.CylinderGeometry(0.0105, 0.0105, 0.02, 20), sightMats.steel);
    base.rotation.z = -Math.PI / 2;
    const foot = add(frontSight, new T.BoxGeometry(0.014, 0.006, 0.008), sightMats.steel);
    foot.position.set(0, 0.012, 0);
    const blade = add(frontSight, new T.ConeGeometry(0.0045, 0.012, 4), sightMats.bright);
    blade.rotation.y = Math.PI / 4;
    blade.position.set(0, 0.021, 0);
  }
  const bladeTop = new T.Object3D();
  bladeTop.position.set(0, 0.027, 0);
  frontSight.add(bladeTop);

  // Visierlinie
  const lineGeo = new T.BufferGeometry();
  lineGeo.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
  const lineMat = new T.LineBasicMaterial({ color: 0xd9a86e, transparent: true, opacity: 0 });
  scene.add(new T.Line(lineGeo, lineMat));

  // Seitengewehr (Form angenähert)
  const bayo = new T.Group();
  rifle.add(bayo);
  {
    const sh = new T.Shape();
    sh.moveTo(0, -0.012);
    sh.lineTo(0.22, -0.018);
    sh.quadraticCurveTo(0.34, -0.024, 0.37, 0.004);
    sh.lineTo(0.35, 0.012);
    sh.lineTo(0, 0.012);
    sh.closePath();
    const g = new T.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1, curveSegments: 12 });
    g.translate(0, 0, -0.0015);
    const blade = add(bayo, g, bayoMats.blade);
    blade.position.set(0.61, -0.047, 0);
    [1, -1].forEach((s) => {
      const fuller = add(bayo, new T.BoxGeometry(0.24, 0.003, 0.0006), bayoMats.steel);
      fuller.position.set(0.75, -0.043, s * 0.0028);
    });
    const guard = add(bayo, new T.BoxGeometry(0.006, 0.042, 0.022), bayoMats.steel);
    guard.position.set(0.606, -0.047, 0);
    const grip = add(bayo, new T.BoxGeometry(0.09, 0.026, 0.022), bayoMats.wood);
    grip.position.set(0.558, -0.05, 0);
    const pommel = add(bayo, new T.BoxGeometry(0.016, 0.03, 0.024), bayoMats.steel);
    pommel.position.set(0.507, -0.049, 0);
    [0.537, 0.577].forEach((x) => {
      [1, -1].forEach((s) => {
        const rv = add(bayo, new T.CylinderGeometry(0.003, 0.003, 0.002, 10), bayoMats.steel);
        rv.rotation.x = Math.PI / 2;
        rv.position.set(x, -0.05, s * 0.0115);
      });
    });
  }
  bayo.visible = false;
  rifle.position.y = 0.02;
  const target = new T.Vector3();

  /* Farben aus dem Seitenschema (hell/dunkel) übernehmen */
  let dirty = true;
  function applyTheme() {
    const cs = getComputedStyle(box);
    const bg = (cs.getPropertyValue("--g98-bg") || "#15181c").trim();
    const gr = (cs.getPropertyValue("--g98-ground") || "#22272d").trim();
    const rl = (cs.getPropertyValue("--g98-ring") || "#353b43").trim();
    const dark = (cs.getPropertyValue("--g98-dark") || "1").trim() === "1";
    scene.background.set(bg);
    scene.fog.color.set(bg);
    groundMat.color.set(gr);
    ringMat.color.set(rl);
    hemi.intensity = dark ? 1.0 : 1.2;
    renderer.toneMappingExposure = dark ? 1.1 : 0.95;
    dirty = true;
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    (mq.addEventListener ? mq.addEventListener("change", applyTheme) : mq.addListener(applyTheme));
  }

  /* Größe an den Kasten anpassen */
  let W = 1, H = 1;
  function resize() {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    W = w; H = h;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    dirty = true;
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(cv); else window.addEventListener("resize", resize);

  /* Steuerung: Ziehen dreht, Strg/⌘ + Mausrad oder Schaltflächen zoomen; die Seite scrollt normal weiter */
  let drag = null;
  cv.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY };
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    cv.classList.add("grab");
  });
  cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = { x: e.clientX, y: e.clientY };
    c.tTheta -= dx * 0.008; c.theta -= dx * 0.008;
    c.tPhi = Math.min(2.9, Math.max(0.05, c.tPhi - dy * 0.006));
    c.phi = c.tPhi;
    dirty = true;
  });
  const up = (e) => { drag = null; try { cv.releasePointerCapture(e.pointerId); } catch (x) {} cv.classList.remove("grab"); };
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom(1 + e.deltaY * 0.0012);
  }, { passive: false });
  function zoom(f) { c.tDist = Math.min(3.6, Math.max(0.3, c.tDist * f)); dirty = true; }

  function goTo(v) {
    let t = v.theta;
    while (t - c.theta > Math.PI) t -= Math.PI * 2;
    while (c.theta - t > Math.PI) t += Math.PI * 2;
    c.tTheta = t; c.tPhi = v.phi; c.tDist = v.dist; c.ttx = v.tx; c.tty = v.ty == null ? -0.03 : v.ty;
    dirty = true;
  }
  function setPressed(btn, on) { btn.setAttribute("aria-pressed", on ? "true" : "false"); }
  function sync() {
    box.querySelectorAll("[data-view]").forEach((b) => setPressed(b, !state.spin && !state.sight && b.dataset.view === state.view));
    box.querySelectorAll("[data-toggle]").forEach((b) => setPressed(b, state[b.dataset.toggle]));
    box.querySelectorAll("[data-range]").forEach((b) => setPressed(b, Number(b.dataset.range) === state.range));
    dirty = true;
  }
  box.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    state.view = btn.dataset.view; state.spin = false; state.sight = false;
    goTo(VIEWS[state.view]);
    sync();
  }));
  box.querySelectorAll("[data-zoom]").forEach((btn) => btn.addEventListener("click", () => zoom(btn.dataset.zoom === "in" ? 0.85 : 1.18)));
  box.querySelectorAll("[data-range]").forEach((btn) => btn.addEventListener("click", () => { state.range = Number(btn.dataset.range); sync(); }));
  box.querySelectorAll("[data-toggle]").forEach((btn) => btn.addEventListener("click", () => {
    const k = btn.dataset.toggle;
    state[k] = !state[k];
    if (k === "sight") {
      state.spin = false;
      if (state.sight) goTo({ theta: 0.35, phi: 1.32, dist: 1.75, tx: 0.3, ty: 0.05 });
      else goTo(VIEWS[state.view]);
    }
    if (k === "bayo") {
      state.spin = false;
      if (state.bayo && !state.sight) goTo({ theta: 0.55, phi: 1.3, dist: 1.55, tx: 0.45, ty: -0.04 });
    }
    sync();
  }));
  sync();

  /* Nur zeichnen, wenn das Modell sichtbar ist */
  let visible = true;
  if (window.IntersectionObserver) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) dirty = true; }).observe(cv);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) dirty = true; });

  let sightK = 0, bayoK = 0, leafA = 0;
  const tmpA = new T.Vector3(), tmpB = new T.Vector3();
  function place(el, v, dy) {
    if (!el) return;
    const p = v.clone().project(cam);
    const half = (el.offsetWidth || 80) / 2 + 4;
    const x = Math.min(W - half - 44, Math.max(half, (p.x * 0.5 + 0.5) * W)), y = Math.max(28, (-p.y * 0.5 + 0.5) * H + dy);
    el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%, -100%)";
    el.style.opacity = sightK > 0.6 ? String(Math.min(1, (sightK - 0.6) * 2.5)) : "0";
  }
  const near = (a, b, e) => Math.abs(a - b) < e;

  function loop() {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    const sightT = state.sight ? 1 : 0, bayoT = state.bayo ? 1 : 0, leafT = RANGES[state.range] || 0;
    const moving = state.spin || drag ||
      !near(c.tTheta, c.theta, 1e-4) || !near(c.tPhi, c.phi, 1e-4) || !near(c.tDist, c.dist, 1e-3) ||
      !near(c.ttx, c.tx, 1e-4) || !near(c.tty, c.ty, 1e-4) ||
      !near(sightT, sightK, 1e-3) || !near(bayoT, bayoK, 1e-3) || !near(leafT, leafA, 1e-4);
    if (!moving && !dirty) return;
    dirty = false;
    if (state.spin && !drag) { c.tTheta += 0.003; c.theta += 0.003; }
    c.theta += (c.tTheta - c.theta) * 0.08;
    c.phi += (c.tPhi - c.phi) * 0.08;
    c.dist += (c.tDist - c.dist) * 0.1;
    c.tx += (c.ttx - c.tx) * 0.08;
    c.ty += (c.tty - c.ty) * 0.08;
    target.set(c.tx, c.ty, 0);
    const sp = Math.sin(c.phi);
    /* schmale Kästen: Abstand vergrößern, damit das Gewehr nicht abgeschnitten wird */
    const d = c.dist * Math.max(1, 1.5 / cam.aspect);
    cam.position.set(target.x + d * sp * Math.sin(c.theta), target.y + d * Math.cos(c.phi), target.z + d * sp * Math.cos(c.theta));
    if (cam.position.y < FLOOR + 0.02) cam.position.y = FLOOR + 0.02;
    cam.lookAt(target);
    ground.visible = c.phi < 1.62;
    ring.visible = ground.visible;

    // Visier separat: Teile heben sich ab, Rest wird transparent
    sightK += (sightT - sightK) * 0.08;
    const lift = sightK * 0.09, s2 = 1 + sightK * 1.6;
    rearSight.position.set(RS.x, RS.y + lift, RS.z);
    rearSight.scale.setScalar(s2);
    frontSight.position.set(FS.x, FS.y + lift, FS.z);
    frontSight.scale.setScalar(s2);
    const op = 1 - sightK * 0.86;
    Object.keys(mats).forEach((k) => { mats[k].opacity = op; mats[k].depthWrite = op > 0.95; });

    // Kimme: Visierstellung (schematisch)
    leafA += (leafT - leafA) * 0.1;
    leaf.rotation.z = -leafA;

    notch.getWorldPosition(tmpA);
    bladeTop.getWorldPosition(tmpB);
    const pa = lineGeo.attributes.position;
    pa.setXYZ(0, tmpA.x - (tmpB.x - tmpA.x) * 0.15, tmpA.y - (tmpB.y - tmpA.y) * 0.15, tmpA.z);
    pa.setXYZ(1, tmpB.x + (tmpB.x - tmpA.x) * 0.25, tmpB.y + (tmpB.y - tmpA.y) * 0.25, tmpB.z);
    pa.needsUpdate = true;
    lineMat.opacity = Math.max(0, sightK - 0.3);
    place(labelRear, tmpA, -20);
    place(labelFront, tmpB, -24);

    // Seitengewehr aufpflanzen
    bayoK += (bayoT - bayoK) * 0.07;
    bayo.visible = bayoK > 0.01;
    const e = 1 - bayoK;
    bayo.position.set(e * 0.35, -e * 0.05, 0);
    const bo = Math.min(1, bayoK * 3) * op;
    Object.keys(bayoMats).forEach((k) => { bayoMats[k].opacity = bo; bayoMats[k].depthWrite = bo > 0.95; });

    renderer.render(scene, cam);
  }
  loop();
  box.classList.add("ready");
})();
