/* Lumi 3D — personagem e palco em three.js (um único renderizador que muda de tela) */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const C = THREE.Color;
const mat = {
  fur: () => new THREE.MeshPhysicalMaterial({ color: 0x2f8ff5, roughness: 0.7, sheen: 1, sheenRoughness: 0.5, sheenColor: new C(0x9fd4ff), envMapIntensity: 0.55 }),
  furDark: () => new THREE.MeshPhysicalMaterial({ color: 0x1f6fdc, roughness: 0.7, sheen: 1, sheenColor: new C(0x8cc8ff), envMapIntensity: 0.55 }),
  cream: () => new THREE.MeshPhysicalMaterial({ color: 0xfff6e8, roughness: 0.75, sheen: 1, sheenColor: new C(0xffffff), envMapIntensity: 0.5 }),
  navy: () => new THREE.MeshPhysicalMaterial({ color: 0x0c1f4d, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
  iris: () => new THREE.MeshPhysicalMaterial({ color: 0x2c8dff, emissive: 0x0b3f9a, emissiveIntensity: 0.35, roughness: 0.15, clearcoat: 1 }),
  white: () => new THREE.MeshBasicMaterial({ color: 0xffffff }),
  pink: () => new THREE.MeshPhysicalMaterial({ color: 0xff7fb8, roughness: 0.6, sheen: 0.6, sheenColor: new C(0xffd0e6), envMapIntensity: 0.5 }),
  mouth: () => new THREE.MeshStandardMaterial({ color: 0x9e1f45, roughness: 0.5 }),
  tongue: () => new THREE.MeshStandardMaterial({ color: 0xff7aa6, roughness: 0.5 }),
  gold: () => new THREE.MeshPhysicalMaterial({ color: 0xffc928, emissive: 0x7a4b00, emissiveIntensity: 0.25, metalness: 0.35, roughness: 0.25, clearcoat: 1 }),
  std: (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.5, clearcoat: 0.3, envMapIntensity: 0.7 }, o)),
};
const sph = (r, m, seg = 40) => new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m);
function shadowAll(o) { o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); }
function tube(points, r, m) { return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 40, r, 10, false), m); }
function starShape(R = 1, r = 0.45) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath(); return s;
}
function starMesh(size, m) {
  const g = new THREE.ExtrudeGeometry(starShape(size, size * 0.45), { depth: size * 0.35, bevelEnabled: true, bevelThickness: size * 0.12, bevelSize: size * 0.1, bevelSegments: 3 });
  g.center(); return new THREE.Mesh(g, m);
}
function lathe(pts, m, seg = 40) { return new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg), m); }

/* ------------------------------------------------------------------ Lumi */
export class Lumi3D {
  constructor() {
    this.root = new THREE.Group();
    this.mood = 'idle'; this.talking = false; this.mouthLevel = null; this.mouthOpen = 0;
    this.jump = null; this.excite = 0; this.waveT = 0; this.chew = 0; this.shake = 0;
    this.nextBlink = 1.5; this.blinkT = 0; this.look = { x: 0, y: 0, tx: 0, ty: 0, next: 0 }; this.earTw = { s: 0, t: 0 };
    this.build();
    shadowAll(this.root);
    this.outfit = {};
  }
  build() {
    const R = this.root, P = (this.p = {});
    const fur = mat.fur(), furD = mat.furDark(), cream = mat.cream(), navy = mat.navy();
    P.bounce = new THREE.Group(); R.add(P.bounce);
    // pés
    for (const s of [-1, 1]) { const f = sph(0.3, furD); f.scale.set(1.05, 0.62, 1.35); f.position.set(0.36 * s, 0.17, 0.12); P.bounce.add(f); (this._feet = this._feet || []).push(f);
      const pad = sph(0.12, mat.pink()); pad.scale.set(1, 0.7, 0.4); pad.position.set(0.36 * s, 0.13, 0.5); P.bounce.add(pad); }
    // corpo
    P.body = new THREE.Group(); P.body.position.y = 0.2; P.bounce.add(P.body);
    const body = sph(0.82, fur); body.scale.set(1, 1.04, 0.92); body.position.y = 0.78; P.body.add(body);
    const belly = sph(0.8, cream, 48); belly.scale.set(0.74, 0.8, 0.88); belly.position.set(0, 0.7, 0.13); P.body.add(belly); P.belly = belly;
    const bst = starMesh(0.17, mat.gold()); bst.position.set(0, 0.86, 0.84); bst.rotation.x = -0.15; P.body.add(bst); P.bellyStar = bst;
    P.feet = [];
    // rabo
    P.tail = new THREE.Group(); P.tail.position.set(0.3, 0.5, -0.62); P.bounce.add(P.tail);
    for (let i = 0; i <= 12; i++) { const k = i / 12, a = k * 2.1; const r = 0.2 + Math.sin(k * Math.PI * 0.9) * 0.16;
      const s = sph(r, k > 0.85 ? cream : fur, 24); s.position.set(Math.sin(a) * 0.55, (1 - Math.cos(a)) * 0.55 + k * 0.5, -k * 0.25); P.tail.add(s); }
    // braços
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(0.66 * s, 1.36, 0.2); P.body.add(sh);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 8, 20), fur); arm.position.y = -0.34; sh.add(arm);
      const hand = sph(0.2, cream, 28); hand.position.y = -0.62; hand.scale.set(1, 0.9, 0.95); sh.add(hand);
      sh.rotation.z = 0.45 * s; P[s < 0 ? 'armL' : 'armR'] = sh;
      const sl = new THREE.Group(); sh.add(sl); P[s < 0 ? 'sleeveL' : 'sleeveR'] = sl;
    }
    // cabeça
    P.head = new THREE.Group(); P.head.position.y = 1.75; P.bounce.add(P.head);
    const H = new THREE.Group(); H.position.y = 0.88; P.head.add(H); P.H = H;
    const head = sph(1.0, fur, 56); head.scale.set(1.13, 0.96, 0.98); H.add(head);
    for (const s of [-1, 1]) { // bochechas fofas
      const ch = sph(0.36, fur, 28); ch.scale.set(1, 0.8, 0.85); ch.position.set(0.98 * s, -0.32, 0.2); H.add(ch);
      const ch2 = sph(0.24, fur, 24); ch2.position.set(1.08 * s, -0.12, 0.05); H.add(ch2); (P.cheeks = P.cheeks || []).push(ch, ch2);
    }
    for (const [x, y, z, r, rz] of [[-0.18, 0.92, 0.1, 0.22, 0.4], [0.06, 1.0, 0.05, 0.25, -0.1], [0.28, 0.9, 0.08, 0.2, -0.5]]) { // topete
      const c = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.2, 20), fur); c.position.set(x, y, z); c.rotation.z = rz; H.add(c); (P.tufts = P.tufts || []).push(c);
    }
    const muz = sph(0.52, cream); muz.scale.set(1.18, 0.74, 0.62); muz.position.set(0, -0.36, 0.7); H.add(muz);
    const nose = sph(0.1, navy, 24); nose.scale.set(1.35, 0.9, 0.8); nose.position.set(0, -0.2, 1.02); H.add(nose);
    // boca
    P.mouth = new THREE.Group(); P.mouth.position.set(0, -0.42, 1.0); P.mouth.scale.setScalar(1.35); H.add(P.mouth);
    P.lip = tube([[-0.2, 0.02, -0.03], [-0.1, -0.07, 0.01], [0, 0.0, 0.02], [0.1, -0.07, 0.01], [0.2, 0.02, -0.03]], 0.022, navy); P.mouth.add(P.lip);
    P.mouthIn = sph(0.13, mat.mouth(), 28); P.mouthIn.scale.set(1, 0.02, 0.35); P.mouthIn.position.set(0, -0.1, -0.03); P.mouth.add(P.mouthIn);
    P.tongue = sph(0.08, mat.tongue(), 20); P.tongue.scale.set(1.1, 0.02, 0.4); P.tongue.position.set(0, -0.15, 0.0); P.mouth.add(P.tongue);
    // olhos
    P.eyes = [];
    for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(0.4 * s, 0.1, 0.83); g.rotation.y = 0.28 * s; H.add(g);
      const open = new THREE.Group(); g.add(open);
      const eb = sph(0.27, navy, 36); eb.scale.set(1, 1.18, 0.55); open.add(eb);
      const ir = sph(0.21, mat.iris(), 36); ir.scale.set(1, 1.18, 0.42); ir.position.z = 0.05; open.add(ir);
      const pupil = new THREE.Group(); open.add(pupil);
      const pu = sph(0.11, navy, 28); pu.scale.set(1, 1.2, 0.4); pu.position.z = 0.1; pupil.add(pu);
      const h1 = sph(0.07, mat.white(), 20); h1.position.set(-0.08, 0.11, 0.16); pupil.add(h1);
      const h2 = sph(0.033, mat.white(), 16); h2.position.set(0.08, -0.09, 0.15); pupil.add(h2);
      const happy = tube([[-0.18, -0.03, 0.12], [-0.09, 0.08, 0.15], [0, 0.11, 0.16], [0.09, 0.08, 0.15], [0.18, -0.03, 0.12]], 0.035, navy); happy.visible = false; g.add(happy);
      const sleep = tube([[-0.18, 0.04, 0.12], [-0.09, -0.06, 0.15], [0, -0.08, 0.16], [0.09, -0.06, 0.15], [0.18, 0.04, 0.12]], 0.035, navy); sleep.visible = false; g.add(sleep);
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.18, 6, 12), mat.std(0x2a5fb8)); brow.rotation.z = Math.PI / 2 + 0.12 * s; brow.position.set(0, 0.42, 0.06); g.add(brow);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), new THREE.MeshBasicMaterial({ color: 0xff8cc6, transparent: true, opacity: 0.45, depthWrite: false }));
      blush.scale.set(1.3, 0.75, 1); blush.position.set(0.66 * s, -0.36, 0.77); blush.rotation.y = 0.55 * s; H.add(blush);
      P.eyes.push({ g, open, pupil, happy, sleep, brow, blush, s });
    }
    // orelhas
    const earPts = [[0, 0], [0.34, 0.04], [0.33, 0.3], [0.24, 0.6], [0.1, 0.86], [0, 0.95]];
    for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(0.62 * s, 0.62, -0.05); g.rotation.z = -0.38 * s; H.add(g);
      const o = lathe(earPts, fur); o.scale.set(1, 1, 0.55); g.add(o);
      const i = lathe(earPts.map(([x, y]) => [x * 0.62, y * 0.82 + 0.05]), mat.pink()); i.scale.set(1, 1, 0.4); i.position.z = 0.09; g.add(i);
      const tip = sph(0.07, cream, 16); tip.position.y = 0.93; g.add(tip);
      P[s < 0 ? 'earL' : 'earR'] = g;
    }
    const hs = starMesh(0.13, mat.gold()); hs.position.set(0.42, 0.66, 0.66); hs.rotation.set(-0.3, 0.3, 0.2); H.add(hs); P.headStar = hs;
    // acessórios
    P.hat = new THREE.Group(); P.hat.position.set(0, 0.62, 0); H.add(P.hat);
    P.face = new THREE.Group(); H.add(P.face);
    P.neck = new THREE.Group(); P.neck.position.y = 1.72; P.bounce.add(P.neck);
    P.hood = new THREE.Group(); H.add(P.hood);
    P.wear = new THREE.Group(); P.body.add(P.wear);
    P.back = new THREE.Group(); P.body.add(P.back);
    P.extra = new THREE.Group(); P.bounce.add(P.extra);
    P.aura = makeAura(); P.aura.visible = false; R.add(P.aura);
    P.feet = this._feet;
  }
  /* ---- acessórios em 3D ---- */
  setOutfit(o) {
    this.outfit = Object.assign({}, o);
    const P = this.p;
    for (const k of ['hat', 'face', 'neck', 'hood', 'wear', 'back', 'extra', 'sleeveL', 'sleeveR']) { const g = P[k]; while (g.children.length) g.remove(g.children[0]); }
    this.anims = [];
    const costume = o.costume && o.costume !== 'none' ? o.costume : null;
    const put = (group, m) => { if (!m) return; shadowAll(m); group.add(m); m.traverse((c) => c.userData.anim && this.anims.push(c)); };
    if (costume) buildCostume(this, costume, put);
    else {
      put(P.hat, makeAccessory('head', o.head));
      if (o.body && o.body !== 'none') buildTop(this, o.body, put);
      if (o.legs && o.legs !== 'none') buildLegs(this, o.legs, put);
    }
    put(P.face, makeAccessory('face', o.face));
    put(P.neck, makeAccessory('neck', o.neck));
    if (o.back && o.back !== 'none') put(P.back, makeBack(o.back));
    const hatOn = !costume && o.head && o.head !== 'none';
    const top = costume || (o.body && o.body !== 'none');
    P.headStar.visible = !costume && (!hatOn || o.head === 'bow' || o.head === 'flowers');
    P.belly.visible = P.bellyStar.visible = !top;
    P.earL.visible = P.earR.visible = !costume && o.head !== 'astronaut';
    P.tufts.forEach((t) => (t.visible = !costume && !hatOn));
    P.cheeks.forEach((c) => (c.visible = !costume));
    P.tail.visible = !costume && o.back !== 'turtle';
  }
  /* crescimento: 0 bebê … 4 super */
  setGrowth(stage, instant) {
    const G = [{ s: 0.62, h: 1.14, e: 0.62, t: 0.65 }, { s: 0.74, h: 1.09, e: 0.78, t: 0.8 }, { s: 0.86, h: 1.04, e: 0.9, t: 0.92 }, { s: 1, h: 1, e: 1, t: 1 }, { s: 1.06, h: 1, e: 1.05, t: 1.05 }][Math.max(0, Math.min(4, stage))];
    this.growStage = stage; this.growTarget = G;
    if (instant || !this.growCur) this.growCur = Object.assign({}, G);
    this.p.aura.visible = stage >= 4;
  }
  get size() { return this.growCur ? this.growCur.s : 1; }
  setMood(m) { this.mood = m; }
  talk(on) { this.talking = on; }
  celebrate() { this.jump = { t: 0, n: 2 }; this.excite = 1.6; this.mood = 'happy'; }
  hop() { this.jump = { t: 0, n: 1 }; }
  doWave(sec = 1.6) { this.waveT = sec; }
  encourage() { this.mood = 'sad'; this.shake = 0.5; }
  eat(sec = 2.2) { this.chew = sec; this.mood = 'eat'; }
  poke() { if (this.mood === 'sleep') return; this.hop(); this.excite = 0.8; this.earTw = { s: Math.random() < 0.5 ? -1 : 1, t: 0.25 }; }
  update(t, dt) {
    const P = this.p, m = this.mood, sleeping = m === 'sleep';
    const br = Math.sin(t * (sleeping ? 1.3 : 2.2));
    // pulo com amassadinho
    let jy = 0, sq = 1;
    if (this.jump) {
      this.jump.t += dt; const D = 0.55, k = this.jump.t / D;
      if (k >= 1) { this.jump.n--; this.jump.t = 0; if (this.jump.n <= 0) this.jump = null; }
      else { jy = Math.sin(k * Math.PI) * 0.9; sq = k < 0.12 ? 0.86 + k : k > 0.88 ? 0.86 + (1 - k) : 1 + Math.sin(k * Math.PI) * 0.06; }
    }
    this.excite = Math.max(0, this.excite - dt * 0.8);
    const shx = this.shake > 0 ? Math.sin(t * 40) * 0.08 * this.shake : 0; this.shake = Math.max(0, this.shake - dt);
    P.bounce.position.set(shx, jy, 0);
    P.bounce.scale.set(1 + (1 - sq) * 0.6, sq, 1 + (1 - sq) * 0.6);
    P.body.scale.set(1 + br * 0.01, 1 + br * 0.022, 1 + br * 0.01);
    // cabeça
    let tilt = Math.sin(t * 0.7) * 0.05, nod = 0, hy = br * 0.03, turn = Math.sin(t * 0.45) * 0.12;
    if (m === 'sad') tilt = 0.2 + Math.sin(t * 2) * 0.03;
    if (m === 'listen') { tilt = -0.18; turn = 0.1; nod = -0.06; }
    if (sleeping) { tilt = 0.16 + br * 0.03; nod = 0.18; hy = -0.05 + br * 0.04; turn = 0; }
    if (m === 'happy') tilt = Math.sin(t * 7) * 0.12 * (0.4 + this.excite);
    if (this.talking) { tilt += Math.sin(t * 3.1) * 0.05; nod += Math.sin(t * 6.3) * 0.04; }
    P.head.position.y = 1.75 + hy; P.head.rotation.set(nod, turn, tilt);
    // orelhas
    let eL = Math.sin(t * 1.7) * 0.04, eR = -Math.sin(t * 1.9) * 0.04;
    if (this.earTw.t > 0) { this.earTw.t -= dt; if (this.earTw.s < 0) eL += 0.35; else eR -= 0.35; } else if (Math.random() < dt * 0.25) this.earTw = { s: Math.random() < 0.5 ? -1 : 1, t: 0.18 };
    if (m === 'sad' || sleeping) { eL -= 0.35; eR += 0.35; }
    if (m === 'listen') { eL += 0.15; eR -= 0.15; }
    P.earL.rotation.z = 0.38 + eL; P.earR.rotation.z = -0.38 + eR;
    // rabo
    const ts = sleeping ? 0.7 : m === 'happy' ? 5 : 1.7;
    P.tail.rotation.set(0, Math.sin(t * ts * 0.7) * 0.2, Math.sin(t * ts) * (m === 'happy' ? 0.3 : 0.12));
    // braços
    let aL = -0.45 - Math.sin(t * 2.2) * 0.04, aR = 0.45 + Math.sin(t * 2.2) * 0.04, fL = 0, fR = 0;
    if (this.waveT > 0) { this.waveT -= dt; aR = 2.5 + Math.sin(t * 12) * 0.3; }
    if (m === 'happy') { aL = -2.3 - Math.sin(t * 11) * 0.25 * (0.3 + this.excite); aR = 2.3 + Math.sin(t * 11) * 0.25 * (0.3 + this.excite); }
    if (this.jump) { aL = -2.6; aR = 2.6; }
    if (m === 'eat') { aL = 0.9; aR = -0.9; fL = -0.8; fR = -0.8; }
    if (m === 'listen') { aR = 0.9; }
    P.armL.rotation.set(fL, 0, aL); P.armR.rotation.set(fR, 0, aR);
    // olhos
    const happyEyes = m === 'happy' || (m === 'eat' && this.chew > 0);
    this.nextBlink -= dt; if (this.nextBlink <= 0 && !happyEyes && !sleeping) { this.blinkT = 0.13; this.nextBlink = 1.8 + Math.random() * 3.2; }
    if (this.blinkT > 0) this.blinkT -= dt;
    this.look.next -= dt; if (this.look.next <= 0) { this.look.tx = (Math.random() - 0.5) * 0.08; this.look.ty = (Math.random() - 0.5) * 0.05; this.look.next = 0.9 + Math.random() * 2.2; }
    if (m === 'listen') { this.look.tx = 0.03; this.look.ty = 0.04; }
    this.look.x += (this.look.tx - this.look.x) * Math.min(1, dt * 8); this.look.y += (this.look.ty - this.look.y) * Math.min(1, dt * 8);
    for (const e of P.eyes) {
      e.open.visible = !happyEyes && !sleeping; e.happy.visible = happyEyes; e.sleep.visible = sleeping;
      e.open.scale.y = this.blinkT > 0 ? 0.08 : m === 'sad' ? 0.85 : 1;
      e.pupil.position.set(this.look.x, this.look.y, 0);
      e.brow.position.y = 0.42 + (m === 'happy' ? 0.06 : this.talking || m === 'listen' ? 0.04 : 0);
      e.brow.rotation.z = Math.PI / 2 + 0.12 * e.s + (m === 'sad' ? -0.35 * e.s : 0);
      e.blush.material.opacity = 0.42 + (m === 'happy' || m === 'eat' ? 0.25 : 0);
      const puff = m === 'eat' && this.chew > 0 ? 1 + Math.abs(Math.sin(t * 9)) * 0.2 : 1; e.blush.scale.set(1.3 * puff, 0.75 * puff, 1);
    }
    // boca
    let target = 0;
    if (this.talking) target = this.mouthLevel != null ? Math.min(1, 0.06 + this.mouthLevel) : 0.3 + 0.5 * Math.abs(Math.sin(t * 14 + Math.sin(t * 5) * 2));
    else if (m === 'happy') target = 0.8;
    else if (this.chew > 0) { this.chew -= dt; target = 0.5 * Math.abs(Math.sin(t * 9)); if (this.chew <= 0) this.mood = 'happy'; }
    else if (m === 'listen') target = 0.12;
    this.mouthOpen += (target - this.mouthOpen) * Math.min(1, dt * 18);
    const o = this.mouthOpen;
    P.mouthIn.scale.set(1 + o * 0.3, 0.02 + o * 1.0, 0.35);
    P.mouthIn.position.y = -0.06 - o * 0.08;
    P.tongue.scale.set(1.1, 0.02 + o * 0.5, 0.4); P.tongue.position.y = -0.1 - o * 0.13;
    P.lip.scale.y = m === 'sad' && !this.talking ? -0.8 : 1;
    P.headStar.rotation.z = 0.2 + Math.sin(t * 1.5) * 0.25; P.headStar.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
    this.applyAction(t, dt);
    if (this.growTarget) {
      const g = this.growCur, k = Math.min(1, dt * 2.2);
      for (const key of ['s', 'h', 'e', 't']) g[key] += (this.growTarget[key] - g[key]) * k;
      const pop = this.growPop > 0 ? Math.sin((1 - this.growPop) * Math.PI * 3) * 0.08 * this.growPop : 0; this.growPop = Math.max(0, (this.growPop || 0) - dt * 0.8);
      this.root.scale.setScalar(g.s * (1 + pop));
      P.head.scale.setScalar(g.h); P.earL.scale.setScalar(g.e); P.earR.scale.setScalar(g.e); P.tail.scale.setScalar(g.t);
    }
    if (P.aura.visible) { P.aura.userData.tick(t); }
    if (this.anims) for (const a of this.anims) a.userData.anim(t, a);
  }
  growTo(stage) { this.setGrowth(stage); this.growPop = 1; this.celebrate(); }
  /* ações do "Lumi diz" */
  act(name, dur = 2.4) {
    if (name === 'jump') { this.jump = { t: 0, n: 3 }; this.excite = 1; }
    else if (name === 'wave') this.doWave(dur);
    else if (name === 'eat') this.eat(dur);
    this.action = { name, t: 0, dur };
  }
  applyAction(t, dt) {
    const P = this.p, A = this.action;
    P.bounce.rotation.set(0, 0, 0);
    if (!A) return;
    A.t += dt; const k = A.t / A.dur;
    if (k >= 1) { this.action = null; return; }
    const ease = Math.sin(Math.min(1, k * 6) * Math.PI / 2) * Math.sin(Math.min(1, (1 - k) * 6) * Math.PI / 2); // entra e sai suave
    const arms = (fL, aL, fR, aR) => { P.armL.rotation.set(fL * ease, 0, -0.45 + (aL + 0.45) * ease); P.armR.rotation.set(fR * ease, 0, 0.45 + (aR - 0.45) * ease); };
    const happyFace = () => { for (const e of P.eyes) { e.open.visible = false; e.happy.visible = true; e.sleep.visible = false; } P.mouthIn.scale.set(1.3, 0.85, 0.35); P.tongue.scale.set(1.1, 0.45, 0.4); };
    switch (A.name) {
      case 'clap': { const c = Math.abs(Math.sin(A.t * 9)); arms(-1.25, 0.15 + c * 0.45, -1.25, -0.15 - c * 0.45); happyFace(); break; }
      case 'spin': P.bounce.rotation.y = (k < 0.85 ? k / 0.85 : 1) * Math.PI * 2; arms(0, -1.2, 0, 1.2); break;
      case 'nose': arms(0, -0.45, -2.3, -0.45); P.head.rotation.x = 0.12 * ease; break;
      case 'head': arms(0, -2.75, 0, 2.75); P.head.rotation.x = 0.1 * ease; break;
      case 'stretch': arms(0, -2.45, 0, 2.45); P.bounce.scale.y *= 1 + 0.07 * ease; P.head.rotation.x = -0.2 * ease; for (const e of P.eyes) { e.open.visible = false; e.sleep.visible = true; } break;
      case 'dance': { P.bounce.rotation.y = Math.sin(A.t * 5) * 0.6; P.bounce.rotation.z = Math.sin(A.t * 10) * 0.12; P.bounce.position.y += Math.abs(Math.sin(A.t * 10)) * 0.25; const s = Math.sin(A.t * 10); arms(0, -1.8 - s * 0.6, 0, 1.8 - s * 0.6); happyFace(); break; }
      case 'wiggle': P.bounce.rotation.z = Math.sin(A.t * 12) * 0.22 * ease; P.bounce.position.x += Math.sin(A.t * 12) * 0.15 * ease; arms(0, -1.0, 0, 1.0); happyFace(); break;
      case 'run': { const s = Math.sin(A.t * 16); P.bounce.position.y += Math.abs(s) * 0.3; P.bounce.rotation.x = 0.12 * ease; P.armL.rotation.set(s * 1.1 * ease, 0, -0.35); P.armR.rotation.set(-s * 1.1 * ease, 0, 0.35); break; }
      case 'stomp': { const s = Math.sin(A.t * 11); P.bounce.rotation.z = s * 0.12 * ease; P.bounce.position.y += Math.max(0, s) * 0.18 * ease; arms(0, -0.8, 0, 0.8); break; }
      case 'sit': { const d = ease; P.bounce.position.y -= 0.35 * d; P.bounce.scale.y *= 1 - 0.12 * d; P.bounce.scale.x *= 1 + 0.08 * d; P.bounce.scale.z *= 1 + 0.08 * d; arms(-0.6, -0.3, -0.6, 0.3); break; }
      case 'sleep': for (const e of P.eyes) { e.open.visible = false; e.happy.visible = false; e.sleep.visible = true; } P.head.rotation.x = 0.2 * ease; P.head.rotation.z = 0.18 * ease; P.mouthIn.scale.set(1, 0.15, 0.35); break;
      case 'no': P.head.rotation.y = Math.sin(A.t * 14) * 0.35 * ease; break;
    }
  }
}

/* ------------------------------------------------------------ acessórios */
function stripeTex(c1, c2) {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const x = cv.getContext('2d');
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? c1 : c2; x.fillRect(0, i * 32, 64, 32); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function makeAccessory(slot, id) {
  const g = new THREE.Group();
  if (!id || id === 'none') return null;
  if (slot === 'head') {
    if (id === 'cap') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.82, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat.std(0x2f7bf5)); dome.scale.set(1.1, 0.75, 1.05); g.add(dome);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 40, 1, false, -Math.PI / 2 - 1, 2), mat.std(0x1c56c9)); brim.scale.set(1.25, 1, 1.3); brim.position.set(0, 0.0, 0.62); g.add(brim);
      const b = sph(0.09, mat.gold(), 16); b.position.y = 0.62; g.add(b);
      g.position.set(0, -0.12, -0.02); g.rotation.x = -0.18;
    } else if (id === 'explorer') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.75, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat.std(0xd9b77e)); dome.scale.set(1.1, 0.95, 1.05); g.add(dome);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.83, 0.85, 0.16, 40, 1, true), mat.std(0x5b3a1d)); band.position.y = 0.1; g.add(band);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.05, 48), mat.std(0xc69a5a)); g.add(brim);
      g.position.y = -0.06; g.rotation.set(-0.08, 0, 0.06);
    } else if (id === 'crown') {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.55, 0.32, 40, 1, true), mat.gold()); band.position.y = 0.16; band.material.side = THREE.DoubleSide; g.add(band);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const c = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 16), mat.gold()); c.position.set(Math.sin(a) * 0.58, 0.47, Math.cos(a) * 0.58); g.add(c);
        const j = sph(0.05, mat.std(i % 2 ? 0xff4f7b : 0x4fc3ff, { roughness: 0.1, clearcoat: 1 }), 12); j.position.set(Math.sin(a) * 0.61, 0.18, Math.cos(a) * 0.61); g.add(j); }
      g.position.y = 0.18; g.rotation.z = 0.1;
    } else if (id === 'wizard') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.05, 48), mat.std(0x4b2a9a)); g.add(brim);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.9, 40), mat.std(0x7c4dff)); cone.position.y = 0.95; cone.rotation.z = -0.12; g.add(cone);
      for (const [x, y, z] of [[0.2, 0.7, 0.55], [-0.15, 1.2, 0.4], [0.05, 0.35, 0.68]]) { const s = starMesh(0.1, mat.gold()); s.position.set(x, y, z); g.add(s); }
      g.position.y = -0.05; g.rotation.z = 0.08;
    } else if (id === 'party') {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 40), new THREE.MeshPhysicalMaterial({ map: stripeTex('#ff4f7b', '#ffd54a'), roughness: 0.4, clearcoat: 0.5 })); cone.position.y = 0.5; g.add(cone);
      const pom = sph(0.14, mat.std(0x7cd8ff), 20); pom.position.y = 1.08; g.add(pom);
      g.position.set(0.3, 0.1, 0); g.rotation.z = -0.3;
    } else if (id === 'bow') {
      for (const s of [-1, 1]) { const w = sph(0.26, mat.std(0xff6fae), 24); w.scale.set(1.2, 0.85, 0.5); w.position.set(0.24 * s, 0, 0); w.rotation.z = 0.35 * s; g.add(w); }
      const k = sph(0.12, mat.std(0xff3d8b), 20); g.add(k);
      g.position.set(0.5, 0.05, 0.45); g.rotation.set(0, 0.4, -0.4);
    } else if (id === 'pirate') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 3), mat.std(0x22222c)); brim.rotation.y = Math.PI; brim.scale.set(1.25, 1, 1.05); g.add(brim);
      const cr = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16, 0, TAU, 0, Math.PI / 2), mat.std(0x22222c)); cr.scale.set(1.1, 0.75, 1); g.add(cr);
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 8, 3), mat.gold()); trim.rotation.x = Math.PI / 2; trim.rotation.z = Math.PI / 2; trim.scale.set(1.25, 1.05, 1); trim.position.y = 0.05; g.add(trim);
      const skull = sph(0.13, mat.white(), 16); skull.position.set(0, 0.32, 0.66); skull.scale.z = 0.4; g.add(skull);
      g.position.y = 0.0; g.rotation.x = -0.1;
    } else if (id === 'chef') {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.42, 36), mat.std(0xffffff, { roughness: 0.7 })); band.position.y = 0.12; g.add(band);
      for (const [x, y, z, r] of [[0, 0.62, 0, 0.55], [-0.42, 0.5, 0.1, 0.4], [0.42, 0.5, 0.1, 0.4], [0, 0.5, -0.4, 0.42], [0, 0.55, 0.38, 0.42]]) { const p = sph(r, mat.std(0xffffff, { roughness: 0.75, sheen: 1, sheenColor: new C(0xffffff) }), 24); p.position.set(x, y, z); g.add(p); }
      g.position.y = 0.02;
    } else if (id === 'cowboy') {
      const brim = new THREE.Mesh(new THREE.LatheGeometry([[0.5, 0.06], [1.0, 0.0], [1.25, 0.06], [1.36, 0.22], [1.38, 0.26]].map(([x, y]) => new THREE.Vector2(x, y)), 48), mat.std(0xa0693a, { side: THREE.DoubleSide })); brim.scale.z = 0.8; g.add(brim);
      const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 0.62, 32), mat.std(0xa0693a)); cr.position.y = 0.35; cr.scale.z = 0.85; g.add(cr);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.69, 0.7, 0.12, 32, 1, true), mat.std(0x5b3a1d)); band.position.y = 0.12; band.scale.z = 0.86; g.add(band);
      const st = starMesh(0.1, mat.gold()); st.position.set(0, 0.14, 0.62); g.add(st);
      g.rotation.set(-0.08, 0, 0.08);
    } else if (id === 'astronaut') {
      const glass = sph(1.5, new THREE.MeshPhysicalMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.22, roughness: 0.02, clearcoat: 1, depthWrite: false }), 48); glass.position.y = -0.55; glass.castShadow = false; g.add(glass);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 16, 48), mat.std(0xf2f4f8, { metalness: 0.2 })); ring.rotation.x = Math.PI / 2; ring.position.y = -1.75; g.add(ring);
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), mat.std(0xb0b6c4)); ant.position.set(0.5, 1.05, 0); g.add(ant);
      const ball = sph(0.08, new THREE.MeshBasicMaterial({ color: 0xff3b4e }), 12); ball.position.set(0.5, 1.27, 0); ball.userData.anim = (t, me) => me.scale.setScalar(1 + Math.abs(Math.sin(t * 4)) * 0.4); g.add(ball);
    } else if (id === 'flowers') {
      ['#ff6fae', '#ffd21f', '#ffffff', '#9a63ff', '#ff8a1f', '#7fd0ff', '#ff4f5e', '#3cc46a'].forEach((c, i) => {
        const a = (i / 8) * TAU, f = new THREE.Group(); f.position.set(Math.sin(a) * 0.7, 0.05, Math.cos(a) * 0.68);
        for (let k = 0; k < 5; k++) { const pa = (k / 5) * TAU; const p = sph(0.07, mat.std(c), 10); p.position.set(Math.cos(pa) * 0.08, Math.sin(pa) * 0.08, 0); f.add(p); }
        const cc = sph(0.05, mat.std(0xffe27a), 10); f.add(cc); f.lookAt(Math.sin(a) * 3, 0.6, Math.cos(a) * 3); g.add(f);
      });
    } else if (id === 'headphones') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.07, 12, 40, Math.PI), mat.std(0xff4f6a)); band.position.y = -0.62; band.scale.y = 1.12; g.add(band);
      for (const x of [-1, 1]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 28), mat.std(0x2a2a35)); cup.rotation.z = Math.PI / 2; cup.position.set(1.18 * x, -0.62, 0); g.add(cup); const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 28), mat.std(0xff4f6a)); pad.rotation.z = Math.PI / 2; pad.position.set(1.32 * x, -0.62, 0); g.add(pad); }
    } else if (id === 'tiara') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 40, Math.PI), mat.gold()); band.rotation.x = -Math.PI / 2 + 0.25; band.rotation.z = Math.PI; band.position.set(0, 0.08, 0.05); g.add(band);
      for (const [x, h] of [[-0.3, 0.18], [0, 0.32], [0.3, 0.18]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.07, h, 12), mat.gold()); c.position.set(x, 0.1 + h / 2, 0.55 - Math.abs(x) * 0.3); g.add(c); }
      const gem = sph(0.09, mat.std(0xff6fae, { roughness: 0.05, clearcoat: 1 }), 16); gem.position.set(0, 0.2, 0.62); g.add(gem);
    } else if (id === 'propeller') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.8, 40, 20, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: stripeTex('#2f86ff', '#ffd21f'), roughness: 0.5 })); dome.scale.set(1.1, 0.7, 1.05); g.add(dome);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), mat.std(0x888888)); stem.position.y = 0.66; g.add(stem);
      const prop = new THREE.Group(); prop.position.y = 0.8; g.add(prop);
      ['#ff4f5e', '#3cc46a', '#ff4f5e', '#3cc46a'].forEach((c, i) => { const b = sph(0.3, mat.std(c), 16); b.scale.set(1, 0.08, 0.32); b.position.set(Math.cos((i * Math.PI) / 2) * 0.3, 0, Math.sin((i * Math.PI) / 2) * 0.3); b.rotation.y = (-i * Math.PI) / 2; prop.add(b); });
      prop.userData.anim = (t, me) => { me.rotation.y = t * 9; };
      g.position.set(0, -0.12, -0.02); g.rotation.x = -0.1;
    }
  } else if (slot === 'face') {
    if (id === 'glasses') {
      for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.04, 14, 40), mat.std(0xff5a5f)); r.position.set(0.4 * s, 0.1, 1.0); r.rotation.y = 0.28 * s; g.add(r); }
      const br = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), mat.std(0xff5a5f)); br.rotation.z = Math.PI / 2; br.position.set(0, 0.12, 1.08); g.add(br);
    } else if (id === 'sunglasses') {
      for (const s of [-1, 1]) { const l = sph(0.3, mat.std(0x141433, { roughness: 0.05, clearcoat: 1 }), 28); l.scale.set(1.1, 0.85, 0.25); l.position.set(0.4 * s, 0.1, 1.0); l.rotation.y = 0.28 * s; g.add(l); }
      const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.9, 4, 8), mat.std(0x141433)); bar.rotation.z = Math.PI / 2; bar.position.set(0, 0.28, 1.0); g.add(bar);
    } else if (id === 'hearts' || id === 'stars') {
      const col = id === 'hearts' ? 0xff4f8a : 0xffc928;
      const sh = new THREE.Shape();
      if (id === 'hearts') { sh.moveTo(0, -0.3); sh.bezierCurveTo(-0.46, 0.02, -0.22, 0.38, 0, 0.14); sh.bezierCurveTo(0.22, 0.38, 0.46, 0.02, 0, -0.3); }
      else for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.16 : 0.36; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      const hole = new THREE.Path(); hole.absarc(0, 0.02, id === 'hearts' ? 0.13 : 0.12, 0, TAU, true); sh.holes.push(hole);
      for (const x of [-1, 1]) { const f = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }), mat.std(col)); f.position.set(0.42 * x, 0.1, 0.98); f.rotation.y = 0.28 * x; g.add(f); }
      const br = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), mat.std(col)); br.rotation.z = Math.PI / 2; br.position.set(0, 0.16, 1.08); g.add(br);
    } else if (id === 'mask') {
      const band = new THREE.Mesh(new THREE.SphereGeometry(1.035, 48, 12, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.38, Math.PI * 0.17), mat.std(0x2a2a35, { side: THREE.DoubleSide })); band.scale.set(1.13, 0.96, 0.98); band.position.y = 0.06; g.add(band);
      for (const x of [-1, 1]) { const tie = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.35, 4, 8), mat.std(0x2a2a35)); tie.position.set(0.25 * x, 0.05, -1.0); tie.rotation.z = 0.6 * x + Math.PI / 2; g.add(tie); }
    } else if (id === 'mustache') {
      for (const x of [-1, 1]) { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, -0.29, 1.03], [0.12 * x, -0.33, 1.02], [0.25 * x, -0.3, 0.98], [0.32 * x, -0.22, 0.93]].map((p) => new THREE.Vector3(...p))), 20, 0.045, 8), mat.std(0x5b3a1d)); g.add(m); }
    }
  } else if (slot === 'neck') {
    if (id === 'scarf') {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.17, 18, 48), mat.std(0xff4f5e)); r.rotation.x = Math.PI / 2 - 0.15; r.scale.set(1, 0.9, 1); g.add(r);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.6, 0.1, 2, 4, 1), mat.std(0xe93a4a)); tail.position.set(0.32, -0.32, 0.62); tail.rotation.set(0.2, 0, 0.15); g.add(tail);
    } else if (id === 'bowtie') {
      for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), mat.std(0x7c4dff)); w.rotation.z = (Math.PI / 2) * s; w.position.set(0.15 * s, 0, 0.78); g.add(w); }
      const k = sph(0.07, mat.std(0x5a2fd6), 16); k.position.set(0, 0, 0.8); g.add(k);
    } else if (id === 'lei') {
      ['#ff6fae', '#ffd21f', '#ff8a1f', '#ffffff', '#9a63ff'].forEach((c, ci) => { for (let i = ci; i < 20; i += 5) { const a = (i / 20) * TAU; const f = sph(0.11, mat.std(c, { roughness: 0.7 }), 12); f.position.set(Math.sin(a) * 0.68, -0.08 - Math.max(0, Math.cos(a)) * 0.18, Math.cos(a) * 0.66); g.add(f); } });
    } else if (id === 'medal') {
      for (const x of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.03), mat.std(x < 0 ? 0x2f86ff : 0xff3b4e)); r.position.set(0.1 * x, -0.25, 0.74); r.rotation.z = 0.35 * x; r.rotation.x = -0.25; g.add(r); }
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 32), mat.gold()); m.rotation.x = Math.PI / 2 - 0.25; m.position.set(0, -0.55, 0.84); g.add(m);
      const st = starMesh(0.08, mat.std(0xfff3b0)); st.position.set(0, -0.54, 0.88); g.add(st);
    } else if (id === 'tie') {
      const k = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 4), mat.std(0xff3b4e)); k.rotation.x = Math.PI; k.position.set(0, -0.02, 0.78); g.add(k);
      const t = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.62, 4), mat.std(0xff3b4e)); t.rotation.set(Math.PI - 0.25, Math.PI / 4, 0); t.position.set(0, -0.38, 0.84); t.scale.z = 0.3; g.add(t);
    }
  }
  return g;
}

/* ------------------------------------------------------------ guarda-roupa */
const TAU = Math.PI * 2;
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function drawEmblem(x, kind, cx, cy, r) {
  x.save(); x.translate(cx, cy);
  const star = (R, col) => { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R * 0.45 : R; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); };
  const heart = (R, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, R * 0.9); x.bezierCurveTo(-R * 1.4, -R * 0.1, -R * 0.6, -R * 1.1, 0, -R * 0.4); x.bezierCurveTo(R * 0.6, -R * 1.1, R * 1.4, -R * 0.1, 0, R * 0.9); x.fill(); };
  const bolt = (R, col) => { x.fillStyle = col; x.beginPath(); [[0.2, -1], [-0.55, 0.12], [-0.05, 0.12], [-0.25, 1], [0.55, -0.15], [0.05, -0.15]].forEach(([a, b], i) => (i ? x.lineTo(a * R, b * R) : x.moveTo(a * R, b * R))); x.closePath(); x.fill(); };
  if (kind === 'star') star(r, '#ffd21f');
  else if (kind === 'heart') heart(r, '#ffffff');
  else if (kind === 'bolt') bolt(r, '#ff3b4e');
  else if (kind === 'bolty') bolt(r, '#ffd21f');
  else if (kind === 'flower') { for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; x.fillStyle = '#ffffff'; x.beginPath(); x.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.42, 0, TAU); x.fill(); } x.fillStyle = '#ffd21f'; x.beginPath(); x.arc(0, 0, r * 0.35, 0, TAU); x.fill(); }
  else if (kind === 'ten') { x.fillStyle = '#1f7a3d'; x.font = `bold ${r * 1.6}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('10', 0, 0); }
  else if (kind === 'circleStar') { x.fillStyle = '#ffd21f'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); bolt(r * 0.75, '#ff3b4e'); }
  x.restore();
}
// textura da roupa: frente fica em u=0.25 (x = w/4)
function clothTex(spec) {
  return canvasTex(1024, 256, (x, w, h) => {
    if (spec.rainbow) { ['#ff4f5e', '#ff9a2f', '#ffd21f', '#3cc46a', '#2f86ff', '#9a55ff'].forEach((c, i) => { x.fillStyle = c; x.fillRect(0, (i * h) / 6, w, h / 6 + 1); }); }
    else { x.fillStyle = spec.color; x.fillRect(0, 0, w, h); }
    if (spec.stripes) { x.fillStyle = spec.stripes; for (let y = 18; y < h; y += 52) x.fillRect(0, y, w, 22); }
    if (spec.vstripes) { x.fillStyle = spec.vstripes; for (let i = 0; i < 26; i++) { const xx = (i / 26) * w; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx + 18, h * 0.5); x.lineTo(xx, h); x.lineTo(xx + 10, h); x.lineTo(xx + 26, h * 0.5); x.lineTo(xx + 10, 0); x.fill(); } }
    if (spec.dots) { x.fillStyle = spec.dots; for (let i = 0; i < 120; i++) { x.beginPath(); x.arc(((i * 97) % w) + ((i * 13) % 20), ((i * 53) % h), 9, 0, TAU); x.fill(); } }
    if (spec.bottom) { x.fillStyle = spec.bottom; x.fillRect(0, h * 0.62, w, h * 0.38); }
    if (spec.print) drawEmblem(x, spec.print, w / 4, h * 0.42, 54);
  });
}
const TOPS = {
  'tee-red': { color: '#ff4f5e', print: 'star' },
  'tee-yellow': { color: '#ffd21f', print: 'bolt' },
  'tee-green': { color: '#3cc46a', stripes: '#ffffff' },
  'tee-pink': { color: '#ff8cc6', print: 'heart' },
  'tee-rainbow': { rainbow: true },
  'hero': { color: '#ff3b4e', print: 'circleStar', long: true, trim: '#ffd21f' },
  'hoodie': { color: '#9a63ff', print: 'star', long: true, hood: true },
  'jersey': { color: '#ffd21f', print: 'ten', trim: '#1f9a4c' },
  'dress': { color: '#ff6fae', print: 'flower', skirt: '#ff6fae' },
  'pajama': { color: '#7fc8ff', dots: '#ffffff', long: true },
};
const LEGS = {
  'jeans': { color: '#3b6fd1', cuffs: '#5d8fe8' },
  'shorts': { color: '#ff7a3c', short: true },
  'skirt': { color: '#ff6fae', skirt: true },
  'tutu': { color: '#ffc1e3', tutu: true },
  'overalls': { color: '#4a7fd6', bib: true },
  'pj-pants': { color: '#7fc8ff', dots: '#ffffff' },
};
function shell(r, t0, t1, material) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32, 0, TAU, t0 * Math.PI, (t1 - t0) * Math.PI), material);
  m.scale.set(1, 1.04, 0.98); m.position.y = 0.78; return m;
}
const cloth = (spec, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ map: clothTex(spec), roughness: 0.75, sheen: 0.3, sheenColor: new C(0xffffff), side: THREE.DoubleSide, envMapIntensity: 0.45 }, o));
function sleeves(L, color, long, put) {
  const m = mat.std(color, { roughness: 0.75, clearcoat: 0 });
  for (const g of [L.p.sleeveL, L.p.sleeveR]) {
    const h = long ? 0.6 : 0.3;
    const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.215, h, 6, 20), m);
    c.position.y = -h / 2 - 0.1; put(g, c);
  }
}
function buildTop(L, id, put) {
  const s = TOPS[id]; if (!s) return;
  const P = L.p;
  put(P.wear, shell(0.885, 0.1, s.skirt ? 0.6 : 0.63, cloth(s)));
  const base = s.rainbow ? '#2f86ff' : s.color;
  sleeves(L, base, s.long, put);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 10, 32), mat.std(s.trim || base)); collar.rotation.x = Math.PI / 2; collar.position.y = 1.62; put(P.wear, collar);
  if (s.hood) { const h = sph(0.42, mat.std(base, { roughness: 0.8 }), 28); h.scale.set(1.3, 0.6, 0.6); h.position.set(0, 1.55, -0.62); put(P.wear, h); }
  if (s.skirt) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 1.25, 0.62, 48, 1, true), mat.std(s.skirt, { side: THREE.DoubleSide, roughness: 0.7 })); sk.position.y = 0.26; sk.scale.z = 0.96; put(P.wear, sk); }
}
function buildLegs(L, id, put) {
  const s = LEGS[id]; if (!s) return;
  const P = L.p;
  if (s.skirt || s.tutu) {
    if (s.tutu) for (let i = 0; i < 3; i++) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.84 - i * 0.02, 1.15 + i * 0.1, 0.3, 18, 1, true), new THREE.MeshPhysicalMaterial({ color: s.color, roughness: 0.6, transparent: true, opacity: 0.8, side: THREE.DoubleSide, sheen: 1, sheenColor: new C(0xffffff) })); sk.position.y = 0.42 - i * 0.07; put(P.wear, sk); }
    else { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.12, 0.48, 48, 1, true), mat.std(s.color, { side: THREE.DoubleSide, roughness: 0.7 })); sk.position.y = 0.3; put(P.wear, sk);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 10, 40), mat.std(0xffffff)); band.rotation.x = Math.PI / 2; band.position.y = 0.54; put(P.wear, band); }
    return;
  }
  put(P.wear, shell(0.872, s.short ? 0.6 : 0.58, s.short ? 0.85 : 0.98, cloth(s)));
  if (s.cuffs) for (const f of P.feet) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.07, 10, 28), mat.std(s.cuffs)); c.rotation.x = Math.PI / 2; c.scale.set(1.05, 1.35, 1); c.position.set(f.position.x, 0.3, 0.1); put(P.extra, c); }
  if (s.bib) {
    const bib = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.12), mat.std(s.color, { roughness: 0.8 })); bib.position.set(0, 0.95, 0.78); bib.rotation.x = -0.18; put(P.wear, bib);
    for (const x of [-0.3, 0.3]) { const st = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.9, 4, 10), mat.std(s.color)); st.position.set(x, 1.35, 0.25); st.rotation.x = 1.0; put(P.wear, st);
      const b = sph(0.07, mat.gold(), 12); b.position.set(x, 1.18, 0.86); put(P.wear, b); }
  }
}
/* fantasias de bichinho: capuz com abertura para o rosto + macacão */
const COSTUMES = {
  bear: { color: '#a0693a', belly: '#f0cf9e', ears: 'round', inner: '#f0cf9e', tail: 'ball' },
  bunny: { color: '#ffffff', belly: '#ffe0ee', ears: 'long', inner: '#ffb3d1', tail: 'puff' },
  dino: { color: '#4cc35a', belly: '#e2f7a8', ears: 'spikes', spikes: '#ffd21f', tail: 'dino' },
  cat: { color: '#ff9a3c', belly: '#fff1dd', ears: 'tri', inner: '#ffc9a0', tail: 'long', vstripes: '#e9771a' },
  frog: { color: '#5fcf6c', belly: '#e9ffd2', ears: 'frog' },
  unicorn: { color: '#ffffff', belly: '#fde6ff', ears: 'tri', inner: '#ffc1e3', horn: true, mane: true, tail: 'mane' },
  panda: { color: '#ffffff', belly: '#ffffff', ears: 'round', earColor: '#2a2a35', inner: '#2a2a35', bottom: '#2a2a35', dark: '#2a2a35', tail: 'ball' },
  tiger: { color: '#ff9a2f', belly: '#fff3e0', ears: 'round', inner: '#fff3e0', vstripes: '#2a2a35', tail: 'long' },
  chick: { color: '#ffd93b', belly: '#fff3b0', ears: 'tuft', beak: true, tail: 'puff' },
  shark: { color: '#7d9bb8', belly: '#ffffff', ears: 'fin', teeth: true, tail: 'fin' },
};
function hoodGeometry(r, openDeg) {
  const g = new THREE.SphereGeometry(r, 64, 48), pos = g.attributes.position, idx = g.index.array, keep = [];
  const dir = new THREE.Vector3(0, -0.12, 1).normalize(), lim = Math.cos((openDeg * Math.PI) / 180), v = new THREE.Vector3();
  for (let i = 0; i < idx.length; i += 3) {
    v.set(0, 0, 0); for (let k = 0; k < 3; k++) v.add(new THREE.Vector3().fromBufferAttribute(pos, idx[i + k]));
    if (v.normalize().dot(dir) < lim) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  g.setIndex(keep); return { g, dir };
}
function buildCostume(L, id, put) {
  const s = COSTUMES[id]; if (!s) return;
  const P = L.p, tex = clothTex(s), m = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.8, sheen: 0.35, sheenColor: new C(s.color), side: THREE.DoubleSide, envMapIntensity: 0.35 });
  const plain = mat.std(s.color, { roughness: 0.8, clearcoat: 0, envMapIntensity: 0.4 });
  const inner = mat.std(s.inner || s.belly, { roughness: 0.8, clearcoat: 0 });
  // capuz
  const hood = new THREE.Group(); hood.scale.set(1.13, 0.96, 0.98);
  const { g, dir } = hoodGeometry(1.09, 57); put(hood, new THREE.Mesh(g, m));
  const ang = (57 * Math.PI) / 180, rim = new THREE.Mesh(new THREE.TorusGeometry(1.09 * Math.sin(ang), 0.075, 14, 64), mat.std(s.belly, { roughness: 0.8 }));
  rim.position.copy(dir.clone().multiplyScalar(1.09 * Math.cos(ang))); rim.lookAt(dir.clone().multiplyScalar(5)); put(hood, rim);
  put(P.hood, hood);
  const earM = s.earColor ? mat.std(s.earColor, { roughness: 0.85 }) : plain;
  if (s.ears === 'round') for (const x of [-1, 1]) { const e = sph(0.32, earM, 28); e.scale.set(1, 1, 0.6); e.position.set(0.8 * x, 0.92, -0.02); put(P.hood, e); const i = sph(0.19, inner, 20); i.scale.set(1, 1, 0.35); i.position.set(0.8 * x, 0.92, 0.14); put(P.hood, i); }
  if (s.ears === 'long') for (const x of [-1, 1]) { const e = sph(0.2, earM, 24); e.scale.set(1, 3.1, 0.55); e.position.set(0.36 * x, 1.45, -0.1); e.rotation.z = -0.18 * x; put(P.hood, e); const i = sph(0.12, inner, 20); i.scale.set(1, 3.4, 0.3); i.position.set(0.36 * x + 0.02 * x, 1.42, 0.0); i.rotation.z = -0.18 * x; put(P.hood, i); }
  if (s.ears === 'tri') for (const x of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.62, 24), earM); e.scale.z = 0.55; e.position.set(0.62 * x, 0.98, -0.05); e.rotation.z = -0.35 * x; put(P.hood, e); const i = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 20), inner); i.scale.z = 0.3; i.position.set(0.6 * x, 0.94, 0.09); i.rotation.z = -0.35 * x; put(P.hood, i); }
  if (s.ears === 'spikes') for (let i = 0; i < 7; i++) { const a = -0.62 + i * 0.36, sz = 0.3 - i * 0.025; const c = new THREE.Mesh(new THREE.ConeGeometry(sz, sz * 2, 16), mat.std(s.spikes)); const n = new THREE.Vector3(0, Math.cos(a), -Math.sin(a)); c.position.set(0, n.y * 1.07 * 0.96, n.z * 1.07 * 0.98); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); c.scale.z = 0.5; put(P.hood, c); }
  if (s.ears === 'frog') for (const x of [-1, 1]) { const e = sph(0.3, plain, 28); e.position.set(0.45 * x, 0.92, 0.3); put(P.hood, e); const w = sph(0.22, mat.white(), 24); w.position.set(0.45 * x, 0.96, 0.46); put(P.hood, w); const pu = sph(0.1, mat.navy(), 16); pu.position.set(0.45 * x, 0.98, 0.64); put(P.hood, pu); }
  if (s.ears === 'tuft') for (const [x, rz] of [[-0.12, 0.4], [0, 0], [0.12, -0.4]]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 14), plain); c.position.set(x, 1.12, 0.1); c.rotation.z = rz; put(P.hood, c); }
  if (s.ears === 'fin') { const f = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 3), plain); f.scale.z = 0.25; f.position.set(0, 1.2, -0.25); f.rotation.x = -0.3; put(P.hood, f); }
  if (s.horn) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.72, 24), mat.gold()); h.position.set(0, 1.08, 0.52); h.rotation.x = 0.55; put(P.hood, h); }
  if (s.mane) ['#ff6fae', '#ffd21f', '#7fd0ff', '#9a63ff', '#3cc46a'].forEach((c, i) => { const a = 0.2 + i * 0.32; const b = sph(0.2, mat.std(c), 18); b.position.set(0, Math.cos(a) * 1.1, -Math.sin(a) * 1.1); put(P.hood, b); });
  if (s.beak) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), mat.std(0xff9a2f)); b.position.set(0, 0.62, 0.95); b.rotation.x = Math.PI / 2; put(P.hood, b); }
  if (s.teeth) for (let i = 0; i < 9; i++) { const a = -0.9 + (i / 8) * 1.8; const t = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 4), mat.white()); t.position.set(Math.sin(a) * 0.88, 0.72 - Math.abs(Math.sin(a)) * 0.25 + 0.02, 0.62 + Math.cos(a) * 0.12); t.rotation.z = Math.PI; put(P.hood, t); }
  // macacão
  put(P.wear, shell(0.885, 0.1, 0.97, m));
  const b = sph(0.8, mat.std(s.belly, { roughness: 0.85, clearcoat: 0, envMapIntensity: 0.4 }), 40); b.scale.set(0.66, 0.74, 0.9); b.position.set(0, 0.66, 0.2); put(P.wear, b);
  sleeves(L, s.dark || s.color, true, put);
  for (const f of P.feet) { const c = sph(0.31, mat.std(s.dark || s.color, { roughness: 0.85 }), 24); c.scale.set(1.08, 0.66, 1.38); c.position.copy(f.position); c.position.y += 0.01; put(P.extra, c); }
  // rabo
  if (s.tail === 'ball' || s.tail === 'puff') { const t = sph(s.tail === 'puff' ? 0.24 : 0.17, s.tail === 'puff' ? mat.std(0xffffff, { roughness: 0.9 }) : plain, 20); t.position.set(0, 0.6, -0.9); put(P.extra, t); }
  if (s.tail === 'dino') { const t = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.3, 24), plain); t.rotation.x = -Math.PI / 2 - 0.35; t.position.set(0, 0.45, -1.2); put(P.extra, t); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.12 - i * 0.02, 0.24, 12), mat.std(s.spikes)); c.position.set(0, 0.78 - i * 0.12, -0.95 - i * 0.32); put(P.extra, c); } }
  if (s.tail === 'long' || s.tail === 'mane') { const pts = [[0, 0.5, -0.8], [0.3, 0.55, -1.15], [0.55, 0.95, -1.2], [0.5, 1.35, -1.0]].map((p) => new THREE.Vector3(...p)); const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.11, 12), s.tail === 'mane' ? mat.std(0xff6fae) : m); put(P.extra, t); const tip = sph(0.13, s.tail === 'mane' ? mat.std(0x9a63ff) : mat.std(s.vstripes || s.color), 14); tip.position.copy(pts[3]); put(P.extra, tip); }
  if (s.tail === 'fin') { const f = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 3), plain); f.scale.z = 0.25; f.position.set(0, 0.5, -1.0); f.rotation.x = -1.2; put(P.extra, f); }
}
/* costas: capas, asas, mochila, casco, jetpack */
function makeBack(id) {
  const g = new THREE.Group();
  const flap = (o, axis, amp, sp) => { o.userData.base = o.rotation[axis]; o.userData.anim = (t, me) => { me.rotation[axis] = me.userData.base + Math.sin(t * sp) * amp; }; };
  if (id === 'cape-red' || id === 'cape-purple') {
    const col = id === 'cape-red' ? 0xff3b4e : 0x7c4dff;
    const piv = new THREE.Group(); piv.position.set(0, 1.5, 0);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.25, 1.55, 32, 8, true, Math.PI - 1.0, 2.0), mat.std(col, { side: THREE.DoubleSide, roughness: 0.6, sheen: 1, sheenColor: new C(0xffc0c8) }));
    c.position.y = -0.76; c.position.z = -0.05; piv.add(c);
    if (id === 'cape-purple') for (const [x, y] of [[-0.3, -0.5], [0.35, -0.9], [-0.1, -1.2]]) { const st = starMesh(0.09, mat.gold()); st.position.set(x, y, -1.05); piv.add(st); }
    const clasp = sph(0.09, mat.gold(), 14); clasp.position.set(0, -0.06, 0.62); piv.add(clasp);
    flap(piv, 'x', 0.07, 3); g.add(piv);
  } else if (id.startsWith('wings')) {
    const kind = id.split('-')[1];
    for (const sx of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(0.18 * sx, 1.05, -0.78);
      if (kind === 'fairy') {
        const m = new THREE.MeshPhysicalMaterial({ color: 0x9fe8ff, emissive: 0x4fb4ff, emissiveIntensity: 0.25, transparent: true, opacity: 0.6, roughness: 0.1, clearcoat: 1, side: THREE.DoubleSide, iridescence: 1 });
        const w1 = sph(0.8, m, 28); w1.scale.set(1, 0.6, 0.06); w1.position.set(0.85 * sx, 0.45, 0); w1.rotation.z = 0.55 * sx; piv.add(w1);
        const w2 = sph(0.55, m, 24); w2.scale.set(1, 0.6, 0.06); w2.position.set(0.62 * sx, -0.3, 0); w2.rotation.z = -0.45 * sx; piv.add(w2);
      } else if (kind === 'angel') {
        const m = mat.std(0xffffff, { roughness: 0.6, sheen: 1, sheenColor: new C(0xffffff) });
        for (let i = 0; i < 5; i++) { const f = sph(0.42 - i * 0.03, m, 20); f.scale.set(1.7, 0.42, 0.18); f.position.set((0.6 + i * 0.14) * sx, 0.5 - i * 0.22, -0.02 * i); f.rotation.z = (0.6 - i * 0.18) * sx; piv.add(f); }
      } else {
        const sh = new THREE.Shape(); sh.moveTo(0, 0.3); sh.lineTo(1.1, 0.55); sh.quadraticCurveTo(0.95, 0.1, 1.05, -0.25); sh.quadraticCurveTo(0.8, -0.05, 0.68, -0.3); sh.quadraticCurveTo(0.5, -0.05, 0.35, -0.3); sh.quadraticCurveTo(0.2, 0, 0, -0.2); sh.closePath();
        const w = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }), mat.std(0x4b2a7a, { side: THREE.DoubleSide })); w.scale.set(1.5 * sx, 1.5, 1); w.position.y = 0.1; piv.add(w);
      }
      piv.rotation.y = 0.25 * sx; flap(piv, 'y', 0.3 * sx, kind === 'fairy' ? 9 : 4); g.add(piv);
    }
  } else if (id === 'backpack') {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.35, 8, 20), mat.std(0xff8a1f)); b.scale.set(1.05, 1, 0.55); b.position.set(0, 0.85, -0.95); g.add(b);
    const pk = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.1, 6, 16), mat.std(0xffc928)); pk.scale.set(1.1, 1, 0.4); pk.position.set(0, 0.68, -1.2); g.add(pk);
    for (const x of [-0.38, 0.38]) { const st = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.55, 4, 10), mat.std(0xe0701a)); st.position.set(x, 1.12, 0.79); st.rotation.x = -0.25; g.add(st); }
  } else if (id === 'turtle') {
    const t = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#4caf50'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2e7d32'; x.lineWidth = 10; for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { const cx = c * 60 + (r % 2) * 30, cy = r * 64 + 30; x.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; x.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30); } x.closePath(); x.stroke(); } });
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.88, 40, 20, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.4, clearcoat: 0.6 })); s.rotation.x = -Math.PI / 2; s.scale.set(1, 0.6, 1); s.position.set(0, 0.8, -0.58); g.add(s);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.07, 10, 40), mat.std(0xd9b36b)); rim.position.set(0, 0.8, -0.58); g.add(rim);
  } else if (id === 'jetpack') {
    for (const x of [-0.28, 0.28]) {
      const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.55, 8, 20), mat.std(0xd8dde8, { metalness: 0.6, roughness: 0.25 })); c.position.set(x, 0.95, -0.98); g.add(c);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.25, 20), mat.std(0xff3b4e)); tip.position.set(x, 1.45, -0.98); g.add(tip);
      const fl = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 16), new THREE.MeshBasicMaterial({ color: 0xffb21f, transparent: true, opacity: 0.85 })); fl.rotation.x = Math.PI; fl.position.set(x, 0.42, -0.98);
      fl.userData.anim = (t, me) => { me.scale.y = 0.7 + Math.abs(Math.sin(t * 23 + x * 9)) * 0.6; }; g.add(fl);
    }
  }
  return g;
}
/* brilho do Super Lumi */
function makeAura() {
  const g = new THREE.Group();
  const tex = canvasTex(256, 256, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,240,150,.9)'); gr.addColorStop(0.45, 'rgba(255,214,90,.35)'); gr.addColorStop(1, 'rgba(255,214,90,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(6.5, 6.5, 1); sp.position.set(0, 2.1, -1.2); g.add(sp);
  const stars = []; for (let i = 0; i < 6; i++) { const s = starMesh(0.13, mat.gold()); g.add(s); stars.push(s); }
  g.userData.tick = (t) => { sp.material.opacity = 0.75 + Math.sin(t * 2) * 0.2; stars.forEach((s, i) => { const a = t * 0.9 + (i / 6) * TAU; s.position.set(Math.cos(a) * 1.9, 1.6 + Math.sin(t * 1.7 + i) * 0.9, Math.sin(a) * 1.2); s.rotation.y = t * 3; }); };
  return g;
}
/* ovo do começo */
function makeEgg() {
  const g = new THREE.Group();
  const tex = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); ['#9fd4ff', '#ffc1e3', '#ffe27a', '#b9f0c4'].forEach((c, k) => { x.fillStyle = c; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(((i * 73 + k * 41) % w), 30 + ((i * 37 + k * 59) % (h - 60)), 16 + ((i + k) % 3) * 6, 0, TAU); x.fill(); } }); });
  const m = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.8, sheen: 0.4 });
  const prof = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; const y = 1.15 - Math.cos(a) * 1.15; const r = Math.sin(a) * (0.82 - 0.14 * (y / 2.3)); prof.push([Math.max(0.0001, r), y]); }
  const cut = 13;
  const bottom = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(0, cut + 1).map(([r, y]) => new THREE.Vector2(r, y)), 48), m); bottom.material.side = THREE.DoubleSide;
  const top = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(cut).map(([r, y]) => new THREE.Vector2(r, y)), 48), m);
  const body = new THREE.Group(); body.add(bottom, top); g.add(body);
  const cracks = [];
  const yc = prof[cut][1], rc = prof[cut][0];
  for (let c = 0; c < 3; c++) {
    const pts = []; for (let i = 0; i <= 8; i++) { const a = -0.9 + c * 0.6 + (i / 8) * 0.9; pts.push(new THREE.Vector3(Math.sin(a) * (rc + 0.01), yc + (i % 2 ? 0.09 : -0.07), Math.cos(a) * (rc + 0.01))); }
    const cr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.022, 6), mat.std(0x8a6a4a)); cr.visible = false; body.add(cr); cracks.push(cr);
  }
  shadowAll(g);
  g.userData = { body, top, bottom, cracks, wob: 0, hatchT: -1 };
  return g;
}

/* ------------------------------------------------------------- cenário */
function makeIsland() {
  const g = new THREE.Group();
  const top = new THREE.MeshPhysicalMaterial({ color: 0x86d86f, roughness: 0.9, sheen: 0.6, sheenColor: new C(0xd8ffb8) });
  const side = new THREE.MeshStandardMaterial({ color: 0xe0a46a, roughness: 0.95 });
  const isl = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 2.4, 0.9, 64, 1), [side, top, side]); isl.position.y = -0.45; isl.receiveShadow = true; g.add(isl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.38, 0.13, 12, 64), top); rim.rotation.x = Math.PI / 2; rim.position.y = 0; rim.receiveShadow = true; g.add(rim);
  return g;
}
function makeTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.4, 16), new THREE.MeshStandardMaterial({ color: 0x9a6a3d, roughness: 0.9 })); trunk.position.y = 0.7; g.add(trunk);
  const leaf = new THREE.MeshPhysicalMaterial({ color: 0x4fbf5a, roughness: 0.8, sheen: 0.5, sheenColor: new C(0xc9ffb3) });
  for (const [x, y, z, r] of [[0, 1.7, 0, 0.75], [0.5, 1.45, 0.1, 0.5], [-0.5, 1.5, 0, 0.55], [0.1, 2.2, 0, 0.5]]) { const s = sph(r, leaf, 28); s.position.set(x, y, z); g.add(s); }
  for (const [x, y, z] of [[0.3, 1.9, 0.6], [-0.4, 1.6, 0.45], [0.55, 1.4, 0.45]]) { const a = sph(0.09, mat.std(0xff4a4a, { roughness: 0.2, clearcoat: 1 }), 14); a.position.set(x, y, z); g.add(a); }
  shadowAll(g); return g;
}
function makeFlower(color) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0x3aa04a })); stem.position.y = 0.2; g.add(stem);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const p = sph(0.08, mat.std(color), 12); p.position.set(Math.cos(a) * 0.09, 0.42, Math.sin(a) * 0.09); g.add(p); }
  const c = sph(0.06, mat.std(0xffd54a), 12); c.position.y = 0.43; g.add(c);
  shadowAll(g); return g;
}
function makeMushroom() {
  const g = new THREE.Group();
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.3, 16), mat.cream()); st.position.y = 0.15; g.add(st);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat.std(0xff4f5e)); cap.position.y = 0.28; cap.scale.y = 0.75; g.add(cap);
  for (const [x, z] of [[0.1, 0.12], [-0.12, 0.05], [0.02, -0.15]]) { const d = sph(0.04, mat.white(), 10); d.position.set(x, 0.43, z); g.add(d); }
  shadowAll(g); return g;
}
function makePillow() {
  const g = new THREE.Group();
  const p = sph(1.2, mat.std(0xb9a6ff, { roughness: 0.8, sheen: 1, sheenColor: new C(0xffffff) }), 36); p.scale.set(1.4, 0.28, 1.0); p.position.set(0, 0.15, -0.2); g.add(p);
  shadowAll(g); return g;
}

/* --------------------------------------------------------------- palco */
export class Stage {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.canvas = this.renderer.domElement; this.canvas.className = 'stage3d';
    const scene = (this.scene = new THREE.Scene());
    const pm = new THREE.PMREMGenerator(this.renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.hemi = new THREE.HemisphereLight(0xdff1ff, 0x8fd47e, 0.9); scene.add(this.hemi);
    const key = (this.key = new THREE.DirectionalLight(0xfff4e0, 2.4)); key.position.set(3.5, 7, 6); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 6; key.shadow.camera.bottom = -2; key.shadow.radius = 6; key.shadow.bias = -0.0006; scene.add(key);
    const rim = (this.rim = new THREE.DirectionalLight(0xbfe0ff, 1.4)); rim.position.set(-5, 4, -6); scene.add(rim);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.lumi = new Lumi3D(); scene.add(this.lumi.root);
    this.island = makeIsland(); scene.add(this.island);
    this.props = new THREE.Group(); scene.add(this.props);
    const tree = makeTree(); tree.position.set(-2.3, 0, -1.2); tree.scale.setScalar(1.15); this.props.add(tree);
    [[2.4, 0.9, 0xff8ac0], [2.0, 1.6, 0xffffff], [-1.8, 1.4, 0xffc928], [2.7, -0.2, 0x9d6bff], [-2.7, 0.6, 0xff6b6b]].forEach(([x, z, c]) => { const f = makeFlower(c); f.position.set(x, 0, z); this.props.add(f); });
    const mu = makeMushroom(); mu.position.set(2.2, 0, -1.3); mu.scale.setScalar(1.3); this.props.add(mu);
    this.pillow = makePillow(); this.pillow.visible = false; scene.add(this.pillow);
    this.egg = makeEgg(); this.egg.visible = false; scene.add(this.egg);
    this.clock = new THREE.Clock(); this.t = 0;
    this.framing = { y: 1.9, dist: 11.5, x: 0, lookY: 1.9, fov: 30 };
    this.target = Object.assign({}, this.framing);
    this.ray = new THREE.Raycaster();
    this.canvas.addEventListener('pointerdown', (e) => this.onTap(e));
    this.ro = new ResizeObserver(() => this.resize());
    requestAnimationFrame(() => this.loop());
  }
  mount(host, preset = {}) {
    if (this.canvas.parentElement !== host) host.appendChild(this.canvas);
    this.host = host; this.ro.disconnect(); this.ro.observe(host); this.resize();
    const p = Object.assign({ x: 0, y: 1.9, dist: 11.5, lookY: 1.9, props: true, night: false, rotY: 0 }, preset);
    this.target = p;
    if (preset.instant || !this.mounted) { this.mounted = true; this.framing = Object.assign({}, p); this.snapNext = true; }
    this.props.visible = p.props; this.pillow.visible = !!p.night;
    this.hemi.color.set(p.night ? 0x5c6bc0 : 0xdff1ff); this.hemi.groundColor.set(p.night ? 0x2b2f74 : 0x8fd47e); this.hemi.intensity = p.night ? 0.7 : 0.9;
    this.key.color.set(p.night ? 0xaac4ff : 0xfff4e0); this.key.intensity = p.night ? 1.2 : 2.4;
    this.renderer.toneMappingExposure = p.night ? 0.95 : 1.05;
  }
  resize() {
    if (!this.host) return;
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false); this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.aspect = w / h;
  }
  onTap(e) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    if (this.egg.visible) { // toque generoso: qualquer ponto perto do ovo vale
      const c = this.eggCenter(), near = Math.hypot(e.clientX - c.x, e.clientY - c.y) < r.height * 0.22;
      if (near || this.ray.intersectObject(this.egg, true).length) this.onEggTap && this.onEggTap(); return; }
    if (this.ray.intersectObject(this.lumi.root, true).length) { this.lumi.poke(); this.onPoke && this.onPoke(); }
  }
  loop() {
    requestAnimationFrame(() => this.loop());
    if (!this.host || document.hidden) return;
    const dt = Math.min(0.05, this.clock.getDelta()); this.t += dt;
    const f = this.framing, tg = this.target, k = this.snapNext ? 1 : Math.min(1, dt * 4); this.snapNext = false;
    if (tg.fit) { // enquadra o Lumi entre as frações [topo, base] da tela
      const [a, b] = tg.fit, th = Math.tan((this.camera.fov * Math.PI) / 360), H = 4.3;
      let d = H / ((b - a) * 2 * th); d = Math.max(d, 3.8 / (this.aspect || 1) / (2 * th));
      const hv = 2 * d * th; tg.dist = d; tg.lookY = 2.05 + ((a + b) / 2 - 0.5) * hv; tg.y = tg.lookY + 0.5;
    }
    for (const key of ['x', 'y', 'dist', 'lookY', 'rotY']) f[key] = (f[key] ?? 0) + ((tg[key] ?? 0) - (f[key] ?? 0)) * k;
    // em telas estreitas, afasta a câmera para caber o Lumi inteiro
    const narrow = tg.fit ? 1 : this.aspect < 0.62 ? 0.62 / this.aspect : 1;
    this.camera.position.set(f.x, f.y + (tg.fit ? 0 : 0.4), f.dist * Math.max(1, narrow * 0.92));
    this.camera.lookAt(f.x, f.lookY, 0);
    this.lumi.root.rotation.y = f.rotY + Math.sin(this.t * 0.4) * 0.06;
    this.lumi.update(this.t, dt);
    this.eggTick(dt);
    this.renderer.render(this.scene, this.camera);
  }
  project(obj) {
    const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }
  /* ovo: aparece antes do Lumi nascer */
  setEgg(on) {
    const E = this.egg, U = E.userData; E.visible = on; this.lumi.root.visible = !on;
    if (on) { U.hatchT = -1; U.top.position.set(0, 0, 0); U.top.rotation.set(0, 0, 0); U.bottom.scale.set(1, 1, 1); U.top.visible = U.bottom.visible = true; U.cracks.forEach((c) => (c.visible = false)); E.scale.setScalar(1); }
  }
  eggCenter() { const v = new THREE.Vector3(0, 1.15, 0).applyMatrix4(this.egg.matrixWorld).project(this.camera); const r = this.canvas.getBoundingClientRect(); return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height }; }
  tapEgg(level) { const U = this.egg.userData; U.wob = 1; U.cracks.forEach((c, i) => (c.visible = i < level)); }
  hatch() { const U = this.egg.userData; U.hatchT = 0; return new Promise((r) => (U.done = r)); }
  eggTick(dt) {
    const E = this.egg, U = E.userData; if (!E.visible) return;
    U.wob = Math.max(0, U.wob - dt * 1.6);
    const idle = Math.sin(this.t * 2.2) * 0.04;
    U.body.rotation.z = idle + Math.sin(this.t * 26) * 0.18 * U.wob;
    E.position.y = Math.abs(Math.sin(this.t * 2.2)) * 0.05;
    if (U.hatchT >= 0) {
      U.hatchT += dt; const h = U.hatchT;
      if (h < 0.7) U.body.rotation.z = Math.sin(h * 40) * 0.2;
      else {
        const k = Math.min(1, (h - 0.7) / 0.6);
        U.top.position.set(k * 0.6, k * 2.4 - k * k * 0.8, k * 0.4); U.top.rotation.set(k * 1.2, 0, -k * 2.4);
        U.bottom.scale.set(1 - k * 0.3, 1 - k, 1 - k * 0.3);
        if (!this.lumi.root.visible) { this.lumi.root.visible = true; if (this.lumi.growCur) this.lumi.growCur.s = 0.05; this.lumi.celebrate(); }
        if (k >= 1) { E.visible = false; U.hatchT = -1; U.done && U.done(); }
      }
    }
  }
  /* miniatura do Lumi vestindo uma peça (para a loja) */
  outfitSnapshot(outfit, focus, size = 140) {
    const L = this.lumi, saved = Object.assign({}, L.outfit), z = L.size;
    const vis = { p: this.props.visible, i: this.island.visible, e: this.egg.visible, l: L.root.visible, ry: L.root.rotation.y };
    this.props.visible = this.island.visible = this.egg.visible = false; L.root.visible = true;
    L.setOutfit(outfit);
    const F = { head: [3.15, 5.4], face: [2.75, 3.6], body: [1.25, 4.8], legs: [0.75, 4.8], neck: [1.7, 4.0], costume: [2.25, 8.6], back: [1.5, 6.8] }[focus] || [2.2, 8.8];
    if (focus === 'back') L.root.rotation.y = Math.PI * 0.82;
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60); cam.position.set(0, (F[0] + 0.25) * z, F[1] * z); cam.lookAt(0, F[0] * z, 0);
    L.root.updateMatrixWorld(true);
    const old = new THREE.Vector2(); this.renderer.getSize(old);
    this.renderer.setSize(size, size, false); this.renderer.render(this.scene, cam);
    const url = this.canvas.toDataURL('image/png');
    this.renderer.setSize(old.x, old.y, false);
    L.setOutfit(saved); L.root.rotation.y = vis.ry;
    this.props.visible = vis.p; this.island.visible = vis.i; this.egg.visible = vis.e; L.root.visible = vis.l;
    return url;
  }
  /* imagem do Lumi (para o mapa) */
  snapshot(w = 256, h = 256) {
    const old = { pv: this.props.visible, iv: this.island.visible, size: new THREE.Vector2() };
    this.renderer.getSize(old.size);
    this.props.visible = false; this.island.visible = false;
    const z = this.lumi.size; const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 50); cam.position.set(0, 2.6 * z, 7.2 * z + 0.6); cam.lookAt(0, 2.3 * z, 0);
    this.renderer.setSize(w, h, false); this.renderer.render(this.scene, cam);
    const url = this.canvas.toDataURL('image/png');
    this.renderer.setSize(old.size.x, old.size.y, false);
    this.props.visible = old.pv; this.island.visible = old.iv;
    return url;
  }
  accessorySnapshot(slot, id, size = 160) {
    const sc = new THREE.Scene(); sc.environment = this.scene.environment;
    sc.add(new THREE.HemisphereLight(0xffffff, 0xbfc9ff, 1.1)); const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(2, 4, 5); sc.add(d);
    const m = makeAccessory(slot, id); if (!m) return null;
    m.position.set(0, 0, 0); m.rotation.set(0.25, -0.35, 0); sc.add(m);
    const box = new THREE.Box3().setFromObject(m); const c = box.getCenter(new THREE.Vector3()); const s = box.getSize(new THREE.Vector3()).length();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 50); cam.position.set(c.x, c.y + s * 0.15, c.z + s * 1.9); cam.lookAt(c);
    const old = new THREE.Vector2(); this.renderer.getSize(old);
    this.renderer.setSize(size, size, false); this.renderer.render(sc, cam);
    const url = this.canvas.toDataURL('image/png'); this.renderer.setSize(old.x, old.y, false);
    return url;
  }
}
