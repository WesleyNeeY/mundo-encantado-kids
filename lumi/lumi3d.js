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
    for (const s of [-1, 1]) { const f = sph(0.3, furD); f.scale.set(1.05, 0.62, 1.35); f.position.set(0.36 * s, 0.17, 0.12); P.bounce.add(f);
      const pad = sph(0.12, mat.pink()); pad.scale.set(1, 0.7, 0.4); pad.position.set(0.36 * s, 0.13, 0.5); P.bounce.add(pad); }
    // corpo
    P.body = new THREE.Group(); P.body.position.y = 0.2; P.bounce.add(P.body);
    const body = sph(0.82, fur); body.scale.set(1, 1.04, 0.92); body.position.y = 0.78; P.body.add(body);
    const belly = sph(0.8, cream, 48); belly.scale.set(0.74, 0.8, 0.88); belly.position.set(0, 0.7, 0.13); P.body.add(belly);
    const bst = starMesh(0.17, mat.gold()); bst.position.set(0, 0.86, 0.84); bst.rotation.x = -0.15; P.body.add(bst);
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
    }
    // cabeça
    P.head = new THREE.Group(); P.head.position.y = 1.75; P.bounce.add(P.head);
    const H = new THREE.Group(); H.position.y = 0.88; P.head.add(H); P.H = H;
    const head = sph(1.0, fur, 56); head.scale.set(1.13, 0.96, 0.98); H.add(head);
    for (const s of [-1, 1]) { // bochechas fofas
      const ch = sph(0.36, fur, 28); ch.scale.set(1, 0.8, 0.85); ch.position.set(0.98 * s, -0.32, 0.2); H.add(ch);
      const ch2 = sph(0.24, fur, 24); ch2.position.set(1.08 * s, -0.12, 0.05); H.add(ch2);
    }
    for (const [x, y, z, r, rz] of [[-0.18, 0.92, 0.1, 0.22, 0.4], [0.06, 1.0, 0.05, 0.25, -0.1], [0.28, 0.9, 0.08, 0.2, -0.5]]) { // topete
      const c = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.2, 20), fur); c.position.set(x, y, z); c.rotation.z = rz; H.add(c);
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
  }
  /* ---- acessórios em 3D ---- */
  setOutfit(o) {
    this.outfit = Object.assign({}, o);
    for (const k of ['hat', 'face', 'neck']) { const g = this.p[k]; while (g.children.length) g.remove(g.children[0]); }
    const add = (slot, id) => { const m = makeAccessory(slot, id); if (m) { shadowAll(m); this.p[slot === 'head' ? 'hat' : slot].add(m); } };
    add('head', o.head); add('face', o.face); add('neck', o.neck);
    this.p.headStar.visible = !o.head || o.head === 'none' || o.head === 'bow';
  }
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
    }
  } else if (slot === 'face') {
    if (id === 'glasses') {
      for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.04, 14, 40), mat.std(0xff5a5f)); r.position.set(0.4 * s, 0.1, 1.0); r.rotation.y = 0.28 * s; g.add(r); }
      const br = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), mat.std(0xff5a5f)); br.rotation.z = Math.PI / 2; br.position.set(0, 0.12, 1.08); g.add(br);
    } else if (id === 'sunglasses') {
      for (const s of [-1, 1]) { const l = sph(0.3, mat.std(0x141433, { roughness: 0.05, clearcoat: 1 }), 28); l.scale.set(1.1, 0.85, 0.25); l.position.set(0.4 * s, 0.1, 1.0); l.rotation.y = 0.28 * s; g.add(l); }
      const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.9, 4, 8), mat.std(0x141433)); bar.rotation.z = Math.PI / 2; bar.position.set(0, 0.28, 1.0); g.add(bar);
    }
  } else if (slot === 'neck') {
    if (id === 'scarf') {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.17, 18, 48), mat.std(0xff4f5e)); r.rotation.x = Math.PI / 2 - 0.15; r.scale.set(1, 0.9, 1); g.add(r);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.6, 0.1, 2, 4, 1), mat.std(0xe93a4a)); tail.position.set(0.32, -0.32, 0.62); tail.rotation.set(0.2, 0, 0.15); g.add(tail);
    } else if (id === 'bowtie') {
      for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 4), mat.std(0x7c4dff)); w.rotation.z = (Math.PI / 2) * s; w.position.set(0.15 * s, 0, 0.78); g.add(w); }
      const k = sph(0.07, mat.std(0x5a2fd6), 16); k.position.set(0, 0, 0.8); g.add(k);
    }
  }
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
    this.renderer.render(this.scene, this.camera);
  }
  project(obj) {
    const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(this.camera);
    const r = this.canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }
  /* imagem do Lumi (para o mapa) */
  snapshot(w = 256, h = 256) {
    const old = { pv: this.props.visible, iv: this.island.visible, size: new THREE.Vector2() };
    this.renderer.getSize(old.size);
    this.props.visible = false; this.island.visible = false;
    const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 50); cam.position.set(0, 2.6, 7.2); cam.lookAt(0, 2.4, 0);
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
