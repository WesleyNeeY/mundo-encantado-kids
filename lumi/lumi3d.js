/* Lumi 3D — personagem e palco em three.js (um único renderizador que muda de tela) */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const C = THREE.Color;
const mat = {
  fur: () => new THREE.MeshPhysicalMaterial({ color: 0x3a92ef, roughness: 0.7, sheen: 1, sheenRoughness: 0.5, sheenColor: new C(0x9fd4ff), envMapIntensity: 0.55 }),
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


/* ------------------------------------------------------------------ espécies (mesmo esqueleto, visual diferente) */
export const SPECIES = {
  lumi:   { fur: 0x3a92ef, furD: 0x1f6fdc, sheen: 0x9fd4ff, shell: [0x3a86dc, 0x8cc6ff], arm: null, hand: 'cream', cream: 0xfff6e8, creamShell: [0xf0e6d8, 0xffffff], earIn: 0xff7fb8, brow: 0x2a5fb8, nose: 0x0c1f4d, ears: 'cat', tail: 'curl', head: 'tufts', iris: ['#0d2a86', '#1d5fd8', '#3fb5ff', '#8ff0ff'], blush: 0xff8cc6 },
  fox:    { fur: 0xf28a2e, furD: 0x4a2414, sheen: 0xffd2a6, shell: [0xe8761c, 0xffb46a], arm: 0xf28a2e, hand: 0x4a2414, cream: 0xfffaf2, creamShell: [0xf4ead9, 0xffffff], earIn: 0xfff3e6, earTip: 0x3a1c10, brow: 0x7a3a12, nose: 0x1f120c, ears: 'fox', tail: 'fox', head: 'tufts', cheekCream: true, iris: ['#3a1d04', '#a85a0c', '#f0a422', '#ffe58a'], blush: 0xff9a7a },
  bunny:  { fur: 0xf7e9f2, furD: 0xe9c6dc, sheen: 0xffffff, shell: [0xf3dfec, 0xffffff], arm: null, hand: 'cream', cream: 0xffffff, creamShell: [0xf6f0f4, 0xffffff], earIn: 0xffa6cf, brow: 0xc98fb4, nose: 0xff6fa8, ears: 'bunny', tail: 'puff', head: 'tufts', teeth: true, iris: ['#3b0f6b', '#7a3fd0', '#c58cff', '#f3d6ff'], blush: 0xff7fb8 },
  dragon: { fur: 0x3fc48d, furD: 0x239a68, sheen: 0xb6ffe0, shell: null, arm: null, hand: 'fur', cream: 0xffe7a8, creamShell: null, earIn: 0xffd36b, brow: 0x1d7a50, nose: 0x14523a, ears: 'dragon', tail: 'dragon', head: 'spikes', smooth: true, wings: true, plates: true, iris: ['#3a2a00', '#c98a00', '#ffd23f', '#fff6b0'], blush: 0xff9ab0 },
  robot:  { robot: true, fur: 0xf4f7fb, furD: 0xf4f7fb, sheen: 0xffffff, shell: null, cream: 0xe3ecf7, nose: 0x1d2f6b, brow: 0x49d6ff, blush: 0xff7fc0, iris: null },
  panda:  { fur: 0xfbfbfb, furD: 0x24242c, sheen: 0xffffff, shell: [0xf2f2f2, 0xffffff], arm: 0x24242c, armShell: [0x1a1a20, 0x4a4a55], hand: 0x24242c, cream: 0xffffff, creamShell: [0xf2f2f2, 0xffffff], earIn: 0x3a3a46, earCol: 0x24242c, earShell: [0x1a1a20, 0x4a4a55], brow: 0x24242c, nose: 0x15151b, ears: 'panda', tail: 'panda', head: 'none', patches: true, iris: ['#1e0c03', '#6b3a17', '#b87a42', '#f0cfa0'], blush: 0xff9ac6 },
};
function furMat(c, sheen, smooth) {
  return smooth ? new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.4, sheenColor: new C(sheen), envMapIntensity: 0.8 })
    : new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.7, sheen: 1, sheenRoughness: 0.5, sheenColor: new C(sheen), envMapIntensity: 0.55 });
}

/* ------------------------------------------------------------------ Lumi */
export class Lumi3D {
  constructor(species) {
    this.species = SPECIES[species] ? species : 'lumi'; this.sp = SPECIES[this.species];
    this.root = new THREE.Group();
    this.mood = 'idle'; this.talking = false; this.mouthLevel = null; this.mouthOpen = 0;
    this.jump = null; this.excite = 0; this.waveT = 0; this.chew = 0; this.shake = 0;
    this.nextBlink = 1.5; this.blinkT = 0; this.look = { x: 0, y: 0, tx: 0, ty: 0, next: 0 }; this.earTw = { s: 0, t: 0 };
    this.build();
    shadowAll(this.root);
    this.addFurAll();
    this.outfit = {};
  }
  build() {
    if (this.sp.robot) return this.buildRobot();
    const R = this.root, P = (this.p = {});
    const sp = this.sp, fur = furMat(sp.fur, sp.sheen, sp.smooth), furD = furMat(sp.furD, sp.sheen, sp.smooth), navy = mat.navy();
    const cream = sp.smooth ? mat.std(sp.cream, { roughness: 0.4, clearcoat: 0.6 }) : furMat(sp.cream, 0xffffff);
    const armM = sp.arm ? furMat(sp.arm, sp.arm === sp.fur ? sp.sheen : 0x8a8aa0, sp.smooth) : fur;
    const handM = sp.hand === 'cream' ? cream : sp.hand === 'fur' ? fur : furMat(sp.hand, 0x8a6a5a);
    const noseM = mat.std(sp.nose, { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
    P.bounce = new THREE.Group(); R.add(P.bounce);
    // pés
    for (const s of [-1, 1]) { const f = sph(0.3, furD); f.scale.set(1.05, 0.62, 1.35); f.position.set(0.36 * s, 0.17, 0.12); P.bounce.add(f); (this._feet = this._feet || []).push(f);
      const pad = sph(0.12, mat.pink()); pad.scale.set(1, 0.7, 0.4); pad.position.set(0.36 * s, 0.13, 0.5); P.bounce.add(pad); }
    // corpo
    P.body = new THREE.Group(); P.body.position.y = 0.2; P.bounce.add(P.body);
    const body = sph(0.82, fur, 48); body.scale.set(1, 1.04, 0.92); body.position.y = 0.78; P.body.add(body); P.bodyMesh = body;
    const belly = sph(0.8, cream, 48); belly.scale.set(0.74, 0.8, 0.88); belly.position.set(0, 0.7, 0.13); P.body.add(belly); P.belly = belly;
    if (sp.plates) for (let k = 0; k < 5; k++) { // placas na barriga do dragão
      const y = 0.36 + k * 0.17, q = Math.sqrt(Math.max(0.05, 1 - ((y - 0.7) / 0.64) ** 2)), rx = 0.59 * q, rz = 0.704 * q;
      const g = new THREE.TorusGeometry(rx, 0.016, 8, 48, Math.PI * 0.76); g.rotateZ(Math.PI * 0.12);
      const pl = new THREE.Mesh(g, mat.std(0xe0a94a, { roughness: 0.5 })); pl.rotation.x = Math.PI / 2; pl.scale.set(1, rz / rx, 1); pl.position.set(0, y, 0.13); P.body.add(pl); (P.plates = P.plates || []).push(pl); }
    const bst = starMesh(0.17, mat.gold()); bst.position.set(0, 0.86, 0.84); bst.rotation.x = -0.15; P.body.add(bst); P.bellyStar = bst;
    P.feet = [];
    // rabo
    P.tail = new THREE.Group(); P.tail.position.set(0.3, 0.5, -0.62); P.bounce.add(P.tail);
    const tailSeg = (s, k) => { s.userData.b = s.position.clone(); s.userData.k = k; P.tail.add(s); };
    if (sp.tail === 'fox') { // cauda grande e fofa com ponta branca
      P.tail.position.set(0.25, 0.42, -0.6);
      for (let i = 0; i <= 14; i++) { const k = i / 14, a = k * 1.7; const r = 0.22 + Math.sin(k * Math.PI * 0.85) * 0.3; const s = sph(r, k > 0.72 ? cream : fur, 24); s.position.set(Math.sin(a) * 0.75, (1 - Math.cos(a)) * 0.6 + k * 0.75, -k * 0.35); tailSeg(s, k); }
    } else if (sp.tail === 'puff' || sp.tail === 'panda') { // pompom
      P.tail.position.set(0, 0.62, -0.78); const s = sph(sp.tail === 'puff' ? 0.3 : 0.24, sp.tail === 'puff' ? cream : furD, 28); tailSeg(s, 0.15);
    } else if (sp.tail === 'dragon') { // cauda que afina, com espinhos e ponta de flecha
      P.tail.position.set(0.15, 0.32, -0.6);
      for (let i = 0; i <= 14; i++) { const k = i / 14, a = k * 1.5; const r = 0.3 * (1 - k * 0.8); const s = sph(r, fur, 24); s.position.set(Math.sin(a) * 0.95, (1 - Math.cos(a)) * 0.35 + k * 0.45, -k * 0.55); tailSeg(s, k);
        if (i % 3 === 1 && i < 13) { const sp1 = new THREE.Mesh(new THREE.ConeGeometry(r * 0.45, r * 0.9, 10), mat.std(0xffc94a, { roughness: 0.4 })); sp1.position.set(0, r * 0.95, 0); s.add(sp1); } }
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 4), mat.std(0xffc94a, { roughness: 0.4 })); tip.scale.z = 0.4; const last = P.tail.children[P.tail.children.length - 1]; tip.position.set(0.12, 0.08, 0); tip.rotation.z = -1.2; last.add(tip);
    } else for (let i = 0; i <= 12; i++) { const k = i / 12, a = k * 2.1; const r = 0.2 + Math.sin(k * Math.PI * 0.9) * 0.16;
      const s = sph(r, k > 0.85 ? cream : fur, 24); s.position.set(Math.sin(a) * 0.55, (1 - Math.cos(a)) * 0.55 + k * 0.5, -k * 0.25); tailSeg(s, k); }
    // braços
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(0.66 * s, 1.36, 0.2); P.body.add(sh);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.42, 8, 20), armM); arm.position.y = -0.34; sh.add(arm);
      const hand = sph(0.2, handM, 28); hand.position.y = -0.62; hand.scale.set(1, 0.9, 0.95); sh.add(hand);
      const pad = sph(0.08, mat.pink(), 14); pad.scale.set(1, 0.8, 0.35); pad.position.set(0, -0.64, 0.17); sh.add(pad);
      for (const dx of [-0.08, 0, 0.08]) { const tp = sph(0.035, mat.pink(), 10); tp.scale.z = 0.35; tp.position.set(dx, -0.53, 0.17); sh.add(tp); }
      sh.rotation.z = 0.45 * s; P[s < 0 ? 'armL' : 'armR'] = sh;
      const sl = new THREE.Group(); sh.add(sl); P[s < 0 ? 'sleeveL' : 'sleeveR'] = sl;
    }
    // cabeça
    P.head = new THREE.Group(); P.head.position.y = 1.75; P.bounce.add(P.head);
    const H = new THREE.Group(); H.position.y = 0.88; P.head.add(H); P.H = H;
    const head = sph(1.0, fur, 56); head.scale.set(1.13, 0.96, 0.98); H.add(head); P.headMesh = head;
    for (const s of [-1, 1]) { // bochechas fofas
      const chM = sp.cheekCream ? cream : fur;
      const ch = sph(0.36, chM, 28); ch.scale.set(1, 0.8, 0.85); ch.position.set(0.98 * s, -0.32, 0.2); H.add(ch);
      const ch2 = sph(0.24, chM, 24); ch2.position.set(1.08 * s, -0.12, 0.05); H.add(ch2); (P.cheeks = P.cheeks || []).push(ch, ch2);
    }
    P.tufts = [];
    if (sp.head === 'tufts') for (const [x, y, z, r, rz] of [[-0.18, 0.92, 0.1, 0.22, 0.4], [0.06, 1.0, 0.05, 0.25, -0.1], [0.28, 0.9, 0.08, 0.2, -0.5]]) { // topete
      const c = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.2, 20), fur); c.position.set(x, y, z); c.rotation.z = rz; H.add(c); P.tufts.push(c);
    }
    if (sp.head === 'spikes') for (const [y, z, r, rx] of [[0.93, 0.3, 0.13, 0.25], [1.0, -0.08, 0.17, -0.1], [0.86, -0.48, 0.15, -0.6], [0.55, -0.82, 0.13, -1.0], [0.15, -0.98, 0.11, -1.4]]) { // cristas do dragão
      const c = new THREE.Mesh(new THREE.ConeGeometry(r, r * 2.1, 12), mat.std(0xffc94a, { roughness: 0.4 })); c.position.set(0, y, z); c.rotation.x = rx; H.add(c); P.tufts.push(c);
    }
    const muz = sph(0.52, cream); muz.scale.set(1.18, 0.74, 0.62); muz.position.set(0, -0.36, 0.7); H.add(muz); P.muzzle = muz;
    const nose = sph(0.1, noseM, 24); nose.scale.set(1.35, 0.9, 0.8); nose.position.set(0, -0.2, 1.02); H.add(nose);
    const nh = sph(0.03, mat.white(), 10); nh.scale.set(1.4, 0.7, 0.4); nh.position.set(-0.035, -0.165, 1.09); H.add(nh);
    if (sp.teeth) for (const dx of [-0.055, 0.055]) { const tt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.04), mat.std(0xffffff, { roughness: 0.3 })); tt.position.set(dx, -0.53, 0.99); tt.rotation.x = -0.25; H.add(tt); }
    if (sp.patches) for (const s of [-1, 1]) { const pt = sph(0.4, furD, 32); pt.scale.set(0.8, 1.05, 0.32); pt.position.set(0.42 * s, 0.05, 0.86); pt.rotation.set(0, 0.42 * s, -0.55 * s); H.add(pt); }
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
      const eb = sph(0.27, mat.std(0x0a1640, { roughness: 0.25, clearcoat: 1 }), 36); eb.scale.set(1.04, 1.22, 0.55); open.add(eb);
      const pupil = new THREE.Group(); open.add(pupil);
      const it = irisTexture(sp.iris);
      const ir = new THREE.Mesh(new THREE.CircleGeometry(0.215, 56), new THREE.MeshStandardMaterial({ map: it, emissiveMap: it, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.15, transparent: true }));
      ir.scale.set(1, 1.2, 1); ir.position.z = 0.152; pupil.add(ir);
      const h1 = sph(0.075, mat.white(), 20); h1.scale.set(1, 1.25, 0.3); h1.position.set(-0.075, 0.1, 0.17); pupil.add(h1);
      const h2 = sph(0.036, mat.white(), 16); h2.scale.z = 0.3; h2.position.set(0.085, -0.1, 0.165); pupil.add(h2);
      const h3 = starMesh(0.03, mat.white()); h3.position.set(0.05, 0.13, 0.17); h3.scale.z = 0.2; pupil.add(h3);
      for (let k = 0; k < 3; k++) { const lash = tube([[0.12 + k * 0.04, 0.27 - k * 0.04, 0.1], [0.19 + k * 0.05, 0.33 - k * 0.05, 0.08], [0.25 + k * 0.05, 0.35 - k * 0.07, 0.05]].map(([x, y, z]) => [x * s, y, z]), 0.014, navy); open.add(lash); }
      const happy = tube([[-0.18, -0.03, 0.12], [-0.09, 0.08, 0.15], [0, 0.11, 0.16], [0.09, 0.08, 0.15], [0.18, -0.03, 0.12]], 0.035, navy); happy.visible = false; g.add(happy);
      const sleep = tube([[-0.18, 0.04, 0.12], [-0.09, -0.06, 0.15], [0, -0.08, 0.16], [0.09, -0.06, 0.15], [0.18, 0.04, 0.12]], 0.035, navy); sleep.visible = false; g.add(sleep);
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.18, 6, 12), mat.std(sp.brow)); brow.rotation.z = Math.PI / 2 + 0.12 * s; brow.position.set(0, 0.42, 0.06); g.add(brow);
      const blush = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), new THREE.MeshBasicMaterial({ color: sp.blush, transparent: true, opacity: 0.45, depthWrite: false }));
      blush.scale.set(1.3, 0.75, 1); blush.position.set(0.66 * s, -0.36, 0.77); blush.rotation.y = 0.55 * s; H.add(blush);
      P.eyes.push({ g, open, pupil, happy, sleep, brow, blush, s });
    }
    // orelhas
    const earIn = mat.std(sp.earIn, { roughness: 0.6, clearcoat: 0 });
    for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(0.62 * s, 0.62, -0.05); g.rotation.z = -0.38 * s; H.add(g);
      if (sp.ears === 'bunny') { // orelhas compridas de coelho
        const pts = [[0, 0], [0.2, 0.05], [0.26, 0.45], [0.25, 1.0], [0.17, 1.45], [0, 1.6]];
        g.position.set(0.4 * s, 0.78, -0.08); const o = lathe(pts, fur); o.scale.set(1, 1, 0.5); g.add(o);
        const i = lathe(pts.map(([x, y]) => [x * 0.6, y * 0.86 + 0.08]), earIn); i.scale.set(1, 1, 0.35); i.position.z = 0.07; g.add(i);
      } else if (sp.ears === 'panda') { // orelhas redondas
        g.position.set(0.74 * s, 0.7, -0.1); const o = sph(0.32, furMat(sp.earCol, 0x8a8aa0), 28); o.scale.set(1, 1, 0.55); o.position.y = 0.12; g.add(o);
        const i = sph(0.19, earIn, 20); i.scale.set(1, 1, 0.3); i.position.set(0, 0.1, 0.12); g.add(i);
      } else if (sp.ears === 'dragon') { // chifrinhos + barbatanas
        g.position.set(0.5 * s, 0.75, -0.2);
        const hornM = mat.std(0xffd65a, { roughness: 0.3, clearcoat: 0.8, emissive: 0x6a4a00, emissiveIntensity: 0.15 });
        const horn = tube([[0, -0.05, 0], [0.08 * s, 0.25, -0.02], [0.2 * s, 0.5, -0.1], [0.36 * s, 0.68, -0.22]], 0.11, hornM); g.add(horn);
        const tipc = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 14), hornM); tipc.position.set(0.44 * s, 0.8, -0.3); tipc.rotation.set(-0.5, 0, -0.75 * s); g.add(tipc);
        const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.quadraticCurveTo(0.45, 0.15, 0.6, 0.5); fin.quadraticCurveTo(0.3, 0.3, 0, 0.35); fin.closePath();
        const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.03, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), mat.std(sp.earIn, { roughness: 0.45 }));
        fm.scale.setScalar(0.85); fm.position.set(0.42 * s, -0.42, 0.1); fm.rotation.set(0, s < 0 ? Math.PI + 0.2 : -0.2, -0.35 * s); g.add(fm);
      } else { // gato (Lumi) ou raposa (maior, ponta escura)
        const fox = sp.ears === 'fox', earPts = fox ? [[0, 0], [0.42, 0.04], [0.4, 0.34], [0.28, 0.72], [0.12, 1.05], [0, 1.18]] : [[0, 0], [0.34, 0.04], [0.33, 0.3], [0.24, 0.6], [0.1, 0.86], [0, 0.95]];
        const o = lathe(earPts, fur); o.scale.set(1, 1, 0.55); g.add(o);
        const i = lathe(earPts.map(([x, y]) => [x * 0.62, y * 0.82 + 0.05]), fox ? cream : mat.pink()); i.scale.set(1, 1, 0.4); i.position.z = 0.09; g.add(i);
        if (fox) { const tipM = lathe(earPts.filter(([, y]) => y >= 0.7).map(([x, y]) => [x * 1.06, y + 0.01]).concat([[0, 1.2]]), furMat(sp.earTip, 0x8a6a5a)); tipM.scale.set(1, 1, 0.58); g.add(tipM); }
        else { const tip = sph(0.07, cream, 16); tip.position.y = 0.93; g.add(tip); }
      }
      P[s < 0 ? 'earL' : 'earR'] = g;
    }
    if (sp.wings) { // asinhas de dragão nas costas
      P.dwings = new THREE.Group(); P.dwings.position.set(0, 1.35, -0.6); P.body.add(P.dwings);
      for (const s of [-1, 1]) {
        const w = new THREE.Group(); w.position.x = 0.3 * s; w.rotation.set(0.15, -0.5 * s, 0.45 * s); w.scale.setScalar(1.5); P.dwings.add(w);
        const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.35, 0.55, 0.95, 0.75); sh.quadraticCurveTo(0.8, 0.45, 0.88, 0.2); sh.quadraticCurveTo(0.65, 0.2, 0.62, -0.05); sh.quadraticCurveTo(0.42, 0.05, 0.36, -0.22); sh.quadraticCurveTo(0.2, -0.05, 0, 0);
        const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }), mat.std(0x9b7bff, { roughness: 0.35, clearcoat: 0.6, sheen: 0.5, sheenColor: new C(0xe0d4ff) }));
        m.scale.set(s, 1, 1); w.add(m);
        const bone = tube([[0, 0, 0.04], [0.35 * s, 0.5, 0.04], [0.95 * s, 0.75, 0.04]], 0.045, mat.std(0x5b3fd0)); w.add(bone);
        w.userData.s = s; (P.wingL = s < 0 ? w : P.wingL), (P.wingR = s > 0 ? w : P.wingR);
      }
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

  /* ---- robozinho: casco branco brilhante, visor-tela com olhos de LED (mesmos pontos de encaixe das roupas) ---- */
  buildRobot() {
    const R = this.root, P = (this.p = {});
    const shellM = new THREE.MeshPhysicalMaterial({ color: 0xf7f9fd, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.25, sheenColor: new C(0xdfeaff), envMapIntensity: 0.95 });
    const navy = mat.std(0x1b2a63, { roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.1 }), blue = mat.std(0x2a6fe0, { roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
    const bezelM = mat.std(0xdbe8fb, { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 });
    const visorM = new THREE.MeshPhysicalMaterial({ map: visorTexture(), roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.2, metalness: 0.15, envMapIntensity: 0.55 });
    const glow = new THREE.MeshBasicMaterial({ color: 0x45d4ff, toneMapped: false });
    const glowSoft = (o) => new THREE.MeshBasicMaterial({ color: 0x2fb8ff, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    P.halos = []; const halo = (m, o) => { m.userData.o = o; m.userData.ph = Math.random() * 6; P.halos.push(m); return m; };
    P.bounce = new THREE.Group(); R.add(P.bounce);
    // botinhas: casco branco, biqueira azul e sola azul-marinho
    this._feet = [];
    for (const s of [-1, 1]) {
      const f = sph(0.32, shellM, 40); f.scale.set(1.06, 0.72, 1.38); f.position.set(0.36 * s, 0.2, 0.12); P.bounce.add(f); this._feet.push(f);
      const so = sph(0.32, navy, 32); so.scale.set(1.1, 0.3, 1.42); so.position.set(0.36 * s, 0.08, 0.12); P.bounce.add(so);
      const toe = sph(0.2, blue, 28); toe.scale.set(1.18, 0.78, 0.9); toe.position.set(0.36 * s, 0.17, 0.44); P.bounce.add(toe);
    }
    // corpo: casco arredondado, painel no peito com "L" e luzinhas, cinto
    P.body = new THREE.Group(); P.body.position.y = 0.2; P.bounce.add(P.body);
    const body = new THREE.Mesh(roundBoxGeo(0.8, 2.3, 0.98, 1.02, 0.9), shellM); body.position.y = 0.78; P.body.add(body); P.bodyMesh = body;
    P.belly = new THREE.Group(); P.body.add(P.belly);
    const frame = new THREE.Mesh(roundRectGeo(0.7, 0.62, 0.17, 0.03), navy); frame.position.set(0, 0.82, 0.668); frame.rotation.x = -0.1; P.belly.add(frame);
    const pane = new THREE.Mesh(roundRectGeo(0.62, 0.54, 0.14, 0.035), bezelM); pane.position.set(0, 0.82, 0.69); pane.rotation.x = -0.1; P.belly.add(pane);
    for (const [x, c] of [[-0.13, 0x6bffb4], [0, 0xffd84a], [0.13, 0xff7ab6]]) { const l = sph(0.035, new THREE.MeshBasicMaterial({ color: c, toneMapped: false }), 14); l.position.set(x, 0.62, 0.745); P.belly.add(l); }
    const Ls = new THREE.Shape(); Ls.moveTo(-0.11, 0.17); Ls.lineTo(-0.03, 0.17); Ls.lineTo(-0.03, -0.09); Ls.lineTo(0.13, -0.09); Ls.lineTo(0.13, -0.17); Ls.lineTo(-0.11, -0.17); Ls.closePath();
    const Lg = new THREE.ExtrudeGeometry(Ls, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }); Lg.center();
    const Lm = new THREE.Mesh(Lg, mat.std(0x2f86ff, { emissive: 0x0b4fc0, emissiveIntensity: 0.45, roughness: 0.18, clearcoat: 1 })); Lm.position.set(0, 0.86, 0.74); Lm.rotation.x = -0.1; P.body.add(Lm); P.bellyStar = Lm;
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 12, 72), navy); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.92, 1); belt.position.y = 0.36; P.body.add(belt); P.belt = belt;
    // mochila: corpo azul-marinho, tampa e bolso azuis, estrela dourada, alças
    P.pack = new THREE.Group(); P.body.add(P.pack);
    const bag = new THREE.Mesh(roundBoxGeo(0.5, 2.8, 1, 1.12, 0.52), navy); bag.position.set(0, 0.88, -0.74); P.pack.add(bag);
    const flap = new THREE.Mesh(roundBoxGeo(0.5, 2.8, 1.04, 0.42, 0.56), blue); flap.position.set(0, 1.2, -0.75); P.pack.add(flap);
    const pocket = new THREE.Mesh(roundBoxGeo(0.3, 2.6, 1.05, 0.72, 0.45), blue); pocket.position.set(0, 0.64, -0.98); P.pack.add(pocket);
    const pst = starMesh(0.11, mat.gold()); pst.position.set(0, 0.66, -1.115); pst.rotation.y = Math.PI; P.pack.add(pst);
    for (const s of [-1, 1]) P.pack.add(tube([[0.3 * s, 1.24, -0.58], [0.38 * s, 1.5, -0.12], [0.37 * s, 1.38, 0.4], [0.32 * s, 1.02, 0.62]], 0.055, navy));
    P.tail = new THREE.Group(); P.bounce.add(P.tail); // robô não tem rabo
    // braços articulados: ombro e cotovelo azuis, luva branca com punho
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(0.66 * s, 1.36, 0.2); P.body.add(sh);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.13, 8, 20), shellM); upper.position.y = -0.17; sh.add(upper);
      sh.add(sph(0.2, navy, 28));
      const elbow = sph(0.14, navy, 24); elbow.position.y = -0.34; sh.add(elbow);
      const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.1, 8, 20), shellM); fore.position.y = -0.47; sh.add(fore);
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.045, 10, 32), navy); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.56; sh.add(cuff);
      const hand = sph(0.19, shellM, 28); hand.position.y = -0.68; hand.scale.set(1, 0.92, 0.95); sh.add(hand);
      const th = sph(0.075, shellM, 16); th.position.set(-0.14 * s, -0.62, 0.08); sh.add(th);
      sh.rotation.z = 0.45 * s; P[s < 0 ? 'armL' : 'armR'] = sh;
      const sl = new THREE.Group(); sh.add(sl); P[s < 0 ? 'sleeveL' : 'sleeveR'] = sl;
    }
    // cabeça: capacete branco, faixa azul no topo, moldura clara e visor-tela de cantos arredondados
    P.head = new THREE.Group(); P.head.position.y = 1.75; P.bounce.add(P.head);
    const H = new THREE.Group(); H.position.y = 0.88; P.head.add(H); P.H = H;
    const head = sph(1.0, shellM, 72); head.scale.set(HEAD_R.x, HEAD_R.y, HEAD_R.z); H.add(head); P.headMesh = head;
    H.add(new THREE.Mesh(squirclePatch(1.08, 0.6, -0.03, 0.012), bezelM));
    H.add(new THREE.Mesh(squirclePatch(1.03, 0.555, -0.03, 0.018), navy));
    H.add(new THREE.Mesh(squirclePatch(1.0, 0.53, -0.03, 0.024), visorM));
    const glare = new THREE.Mesh(squirclePatch(1.0, 0.53, -0.03, 0.03), new THREE.MeshBasicMaterial({ map: glareTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.55 })); H.add(glare);
    const crestPts = []; for (let k = 0; k <= 16; k++) { const a = 0.62 + (k / 16) * 2.1; crestPts.push([0, Math.sin(a) * HEAD_R.y * 1.012, Math.cos(a) * HEAD_R.z * 1.012]); }
    const crest = tube(crestPts, 0.07, blue); crest.scale.x = 1.9; H.add(crest);
    P.cheeks = []; P.tufts = [crest];
    P.muzzle = new THREE.Group(); H.add(P.muzzle);
    // boca de LED
    P.mouth = placeOnHead(new THREE.Group(), 0, -0.33, 0.034); H.add(P.mouth);
    P.lip = tube([[-0.16, 0.035, 0], [-0.085, -0.035, 0], [0, -0.055, 0], [0.085, -0.035, 0], [0.16, 0.035, 0]], 0.022, glow); P.mouth.add(P.lip);
    P.lip.add(halo(tube([[-0.16, 0.035, -0.002], [-0.085, -0.035, -0.002], [0, -0.055, -0.002], [0.085, -0.035, -0.002], [0.16, 0.035, -0.002]], 0.05, glowSoft(0.35)), 0.35));
    P.mouthIn = new THREE.Mesh(new THREE.CircleGeometry(0.13, 40), new THREE.MeshBasicMaterial({ map: ledTexture(), transparent: true, toneMapped: false })); P.mouthIn.scale.set(1, 0.02, 1); P.mouthIn.position.set(0, -0.1, 0.002); P.mouth.add(P.mouthIn);
    P.tongue = new THREE.Mesh(new THREE.CircleGeometry(0.065, 24), new THREE.MeshBasicMaterial({ color: 0xff8cc6, toneMapped: false })); P.tongue.scale.set(1.1, 0.02, 1); P.tongue.position.set(0, -0.15, 0.004); P.mouth.add(P.tongue);
    // olhos de LED grandes, com brilho, auréola e reflexos
    P.eyes = [];
    const eyeTex = ledTexture(), haloTex = haloTexture();
    for (const s of [-1, 1]) {
      const g = placeOnHead(new THREE.Group(), 0.36 * s, 0.08, 0.03); H.add(g);
      const open = new THREE.Group(); g.add(open);
      open.add(halo(new THREE.Mesh(new THREE.CircleGeometry(0.46, 40), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.6 })), 0.6));
      const pupil = new THREE.Group(); pupil.position.z = 0.003; open.add(pupil);
      const e1 = new THREE.Mesh(new THREE.CircleGeometry(0.26, 56), new THREE.MeshBasicMaterial({ map: eyeTex, transparent: true, toneMapped: false })); e1.scale.set(0.93, 1.12, 1); pupil.add(e1);
      const h1 = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), mat.white()); h1.scale.set(1, 1.25, 1); h1.position.set(-0.08, 0.11, 0.004); pupil.add(h1);
      const h2 = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), mat.white()); h2.position.set(0.08, -0.1, 0.004); pupil.add(h2);
      const h3 = new THREE.Mesh(new THREE.ShapeGeometry(starShape(0.035, 0.016)), mat.white()); h3.position.set(0.07, 0.12, 0.004); pupil.add(h3);
      const arc = (pts) => { const m = tube(pts, 0.04, glow); m.add(halo(tube(pts.map(([x, y]) => [x, y, -0.003]), 0.085, glowSoft(0.3)), 0.3)); return m; };
      const happy = arc([[-0.18, -0.06, 0.004], [-0.1, 0.07, 0.004], [0, 0.115, 0.004], [0.1, 0.07, 0.004], [0.18, -0.06, 0.004]]); happy.visible = false; g.add(happy);
      const sleep = arc([[-0.18, 0.03, 0.004], [-0.1, -0.06, 0.004], [0, -0.085, 0.004], [0.1, -0.06, 0.004], [0.18, 0.03, 0.004]]); sleep.visible = false; g.add(sleep);
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.16, 6, 12), glow); brow.rotation.z = Math.PI / 2 + 0.12 * s; brow.position.set(0, 0.42, 0.004); g.add(brow);
      brow.add(halo(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.18, 6, 12), glowSoft(0.25)), 0.25));
      const blush = placeOnHead(new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({ map: haloTexture('255,120,190'), transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })), 0.64 * s, -0.2, 0.032);
      H.add(blush);
      P.eyes.push({ g, open, pupil, happy, sleep, brow, blush, s });
    }
    // fones de ouvido com anel de luz (giram em volta do próprio eixo, então ficam firmes)
    for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(1.07 * s, 0.02, -0.02); g.rotation.set(0, (Math.PI / 2) * s, 0); H.add(g);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.33, 0.16, 48), navy); base.rotation.x = Math.PI / 2; g.add(base);
      const cap = lathe([[0, 0.1], [0.12, 0.097], [0.2, 0.084], [0.25, 0.06], [0.275, 0.03], [0.275, 0]], shellM, 48); cap.rotation.x = Math.PI / 2; cap.position.z = 0.07; g.add(cap);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.026, 12, 48), glow); ring.position.z = 0.152; g.add(ring);
      ring.add(halo(new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.06, 12, 48), glowSoft(0.3)), 0.3));
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.085, 32), new THREE.MeshBasicMaterial({ map: eyeTex, transparent: true, toneMapped: false })); dot.position.z = 0.172; g.add(dot);
      P[s < 0 ? 'earL' : 'earR'] = g;
    }
    const hs = placeOnHead(starMesh(0.11, mat.gold()), 0.62, 0.6, 0.05); H.add(hs); P.headStar = hs;
    P.hat = new THREE.Group(); P.hat.position.set(0, 0.62, 0); H.add(P.hat);
    P.face = new THREE.Group(); P.face.position.z = 0.1; H.add(P.face);
    P.neck = new THREE.Group(); P.neck.position.y = 1.72; P.bounce.add(P.neck);
    P.hood = new THREE.Group(); H.add(P.hood);
    P.wear = new THREE.Group(); P.body.add(P.wear);
    P.back = new THREE.Group(); P.body.add(P.back);
    P.extra = new THREE.Group(); P.bounce.add(P.extra);
    P.aura = makeAura(); P.aura.visible = false; R.add(P.aura);
    P.feet = this._feet;
  }
  /* expressões extras do robô: piscadinha, surpresa ao ser tocado, luzes pulsando */
  robotFace(t, dt, m) {
    const P = this.p;
    for (const h of P.halos) h.material.opacity = h.userData.o * (0.82 + Math.sin(t * 2.4 + h.userData.ph) * 0.18);
    const surp = this.surp > 0; if (surp) this.surp -= dt;
    this.winkT = (this.winkT ?? 5) - dt;
    if (this.winkT <= 0) { this.winkT = 6 + Math.random() * 6; if (m === 'idle' && !this.talking) this.wink = 0.6; }
    if (this.wink > 0) this.wink -= dt;
    P.eyes.forEach((e, i) => {
      const k = surp ? 1.2 : 1; e.open.scale.x = k; if (e.open.scale.y > 0.5) e.open.scale.y = k * (m === 'sad' ? 0.85 : 1);
      e.brow.position.y -= 0.08; // sobrancelhas de LED um pouco abaixo da borda da tela
      if (surp) { e.open.visible = true; e.happy.visible = false; e.sleep.visible = false; e.brow.position.y = 0.44; }
      else if (this.wink > 0 && i === 1) { e.open.visible = false; e.happy.visible = true; }
    });
    if (surp) { P.mouthIn.scale.set(0.62, 0.62, 1); P.mouthIn.position.y = -0.09; P.tongue.scale.set(0.01, 0.01, 1); P.lip.visible = false; } else P.lip.visible = true;
  }
  /* ---- pelo fofinho: camadas (shell fur) que seguem a forma de cada parte ---- */
  addFurAll() {
    const P = this.p, sp = this.sp;
    // no rosto o pelo é bem curtinho para não cobrir olhos, focinho e bochechas
    const face = new THREE.Vector3(0, -0.12, 1).normalize(), v = new THREE.Vector3();
    const faceMask = (x, y, z) => { const d = v.set(x, y, z).normalize().dot(face); return Math.min(1, Math.max(0.06, (0.72 - d) / 0.3)); };
    this.fur = { face: faceMask };
    if (!sp.shell) return; // dragão: pele lisinha, sem pelo
    const main = sp.shell, cream = sp.creamShell, dark = sp.armShell || main;
    const add = (m, col, n, len, rep, mask) => { if (m) furShells(m, col, n, len, rep, mask); };
    const lite = (navigator.deviceMemory || 4) < 4 ? 0.6 : 1, N = (x) => Math.max(4, Math.round(x * lite));
    const isCream = (m) => m.material && m.material.color && m.material.color.getHex() === new C(sp.cream).getHex();
    add(P.headMesh, main, N(12), 0.12, [5, 3], faceMask); add(P.bodyMesh, main, N(10), 0.105, [4, 3]);
    add(P.belly, cream, N(6), 0.07, [3, 2]);
    P.cheeks.forEach((c) => add(c, sp.cheekCream ? cream : main, N(8), 0.12, [2, 1]));
    for (const a of [P.armL, P.armR]) add(a.children[0], sp.arm && sp.arm !== sp.fur ? dark : main, N(7), 0.08, [2, 2]);
    P.tail.children.forEach((t) => add(t, isCream(t) ? cream : sp.tail === 'panda' ? dark : main, N(6), sp.tail === 'fox' ? 0.13 : 0.1, [1, 1]));
    for (const e of [P.earL, P.earR]) add(e.children[0], sp.ears === 'panda' ? (sp.earShell || dark) : main, N(6), 0.05, [2, 2]);
    P.tufts.forEach((t) => add(t, main, N(5), 0.06, [1, 1]));
  }
  setFur(mesh, on) { if (mesh) mesh.children.forEach((c) => c.userData.fur && (c.visible = on)); }
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
    put(P.face, (this.sp.robot && robotFaceItem(o.face)) || makeAccessory('face', o.face));
    put(P.neck, makeAccessory('neck', o.neck));
    if (o.back && o.back !== 'none') put(P.back, makeBack(o.back));
    const hatOn = !costume && o.head && o.head !== 'none';
    const top = costume || (o.body && o.body !== 'none');
    P.headStar.visible = !costume && (!hatOn || o.head === 'bow' || o.head === 'flowers');
    P.belly.visible = P.bellyStar.visible = !top;
    if (P.plates) P.plates.forEach((pl) => (pl.visible = !top));
    if (P.dwings) P.dwings.visible = !costume && (!o.back || o.back === 'none');
    if (P.pack) P.pack.visible = !costume && (!o.back || o.back === 'none');
    if (P.belt) P.belt.visible = !top && !(o.legs && o.legs !== 'none');
    P.earL.visible = P.earR.visible = !costume && o.head !== 'astronaut';
    P.tufts.forEach((t) => (t.visible = !costume && !hatOn));
    P.cheeks.forEach((c) => (c.visible = !costume));
    P.tail.visible = !costume && o.back !== 'turtle';
    const legsOn = !costume && o.legs && o.legs !== 'none' && o.legs !== 'hero-boots';
    this.setFur(P.bodyMesh, !top && !legsOn); this.setFur(P.belly, !top && !legsOn);
    this.setFur(P.headMesh, !costume && !['astronaut', 'galaxy-helmet', 'robot-helmet'].includes(o.head));
    for (const a of [P.armL, P.armR]) this.setFur(a.children[0], !top);
    const mermaid = !costume && o.legs === 'mermaid-tail';
    P.feet.forEach((f) => (f.visible = !mermaid));
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
  poke() { if (this.mood === 'sleep') return; this.hop(); this.excite = 0.8; if (this.sp.robot) this.surp = 0.9; this.earTw = { s: Math.random() < 0.5 ? -1 : 1, t: 0.25 }; }
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
    const lag = Math.sin(t * (sleeping ? 1.3 : 2.2) - 0.7) * 0.05; // orelhas acompanham a respiração com atraso
    P.earL.rotation.z = 0.38 + eL + lag; P.earR.rotation.z = -0.38 + eR - lag; P.earL.rotation.x = P.earR.rotation.x = lag * 0.6;
    // rabo
    const ts = sleeping ? 0.7 : m === 'happy' ? 5 : 1.7;
    P.tail.rotation.set(0, Math.sin(t * ts * 0.7) * 0.2, Math.sin(t * ts) * (m === 'happy' ? 0.3 : 0.12));
    for (const c of P.tail.children) { const k = c.userData.k, b = c.userData.b; if (!b) continue; c.position.set(b.x + Math.sin(t * ts * 1.3 - k * 3) * 0.12 * k, b.y + Math.sin(t * ts * 1.1 - k * 2.5) * 0.05 * k, b.z); }
    if (P.wingL) { const f = Math.sin(t * (m === 'happy' ? 9 : 2.4)) * (m === 'happy' ? 0.35 : 0.12); P.wingL.rotation.y = 0.2 + f; P.wingR.rotation.y = -0.2 - f; }
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
    if (this.sp.robot) this.robotFace(t, dt, m);
    if (this.anims) for (const a of this.anims) a.userData.anim(t, a);
    if (this.fx) this.fx.userData.tick(t, dt);
  }
  setEffect(type) {
    if (this.fxType === type) return;
    this.fxType = type;
    if (this.fx) { this.root.remove(this.fx); this.fx = null; }
    if (type) { this.fx = makeFx(type); this.root.add(this.fx); }
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

/* ------------------------------------------------------------ peças do robô */
const HEAD_R = new THREE.Vector3(1.12, 0.98, 1.0);
function headPoint(lon, lat, off = 0) { // ponto na superfície da cabeça (elipsoide) + normal
  const p = new THREE.Vector3(Math.sin(lon) * Math.cos(lat) * HEAD_R.x, Math.sin(lat) * HEAD_R.y, Math.cos(lon) * Math.cos(lat) * HEAD_R.z);
  const n = new THREE.Vector3(p.x / (HEAD_R.x * HEAD_R.x), p.y / (HEAD_R.y * HEAD_R.y), p.z / (HEAD_R.z * HEAD_R.z)).normalize();
  return { p: p.addScaledVector(n, off), n };
}
function placeOnHead(obj, lon, lat, off) { const { p, n } = headPoint(lon, lat, off); obj.position.copy(p); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); return obj; }
// "tela" de cantos arredondados (superelipse) colada na curva da cabeça
function squirclePatch(hLon, hLat, latC, off, expo = 4.2, seg = 44) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= seg; j++) for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * 2 - 1, b = (j / seg) * 2 - 1, t = Math.max(Math.abs(a), Math.abs(b));
    let X = 0, Y = 0;
    if (t > 0) { const dx = a / t, dy = b / t, k = Math.pow(Math.pow(Math.abs(dx), expo) + Math.pow(Math.abs(dy), expo), -1 / expo); X = dx * k * t; Y = dy * k * t; }
    const { p } = headPoint(X * hLon, latC + Y * hLat, off); pos.push(p.x, p.y, p.z); uv.push((X + 1) / 2, (Y + 1) / 2);
  }
  for (let j = 0; j < seg; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// caixa arredondada (superelipsoide)
function roundBoxGeo(r, e, sx, sy, sz, seg = 48) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), p = g.attributes.position, f = (v) => Math.sign(v) * Math.pow(Math.abs(v), 2 / e);
  for (let i = 0; i < p.count; i++) p.setXYZ(i, f(p.getX(i)) * r * sx, f(p.getY(i)) * r * sy, f(p.getZ(i)) * r * sz);
  g.computeVertexNormals(); return g;
}
function roundRectGeo(w, h, r, depth) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 10 }); g.center(); return g;
}
// moldura de cantos arredondados em volta da tela (anel entre duas superelipses)
function squircleRing(inLon, inLat, outLon, outLat, latC, off, expo = 4.2, seg = 120, rings = 3) {
  const pos = [], idx = [], sq = (t) => { const c = Math.cos(t), s = Math.sin(t); return [Math.sign(c) * Math.pow(Math.abs(c), 2 / expo), Math.sign(s) * Math.pow(Math.abs(s), 2 / expo)]; };
  for (let r = 0; r <= rings; r++) { const k = r / rings, hl = inLon + (outLon - inLon) * k, ht = inLat + (outLat - inLat) * k;
    for (let i = 0; i <= seg; i++) { const [X, Y] = sq((i / seg) * TAU); const { p } = headPoint(X * hl, latC + Y * ht, off); pos.push(p.x, p.y, p.z); } }
  for (let r = 0; r < rings; r++) for (let i = 0; i < seg; i++) { const a = r * (seg + 1) + i, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* acessórios de rosto no robô: nada cobre os olhos de LED (a máscara vira moldura em volta da tela) */
function robotFaceItem(id) {
  if (!['mask', 'bolt-mask', 'robot-visor', 'ninja-mask'].includes(id)) return null;
  const g = new THREE.Group(); g.position.z = -0.1; // compensa o deslocamento do grupo do rosto
  const ring = (m) => new THREE.Mesh(squircleRing(1.0, 0.53, 1.17, 0.67, -0.03, 0.036), m);
  if (id === 'mask' || id === 'bolt-mask') {
    const col = id === 'mask' ? 0x2a2a35 : 0xffd21f, m = mat.std(col, { roughness: 0.4, clearcoat: 0.6, side: THREE.DoubleSide });
    g.add(ring(m));
    for (const s of [-1, 1]) { // pontinhas da máscara nas laterais
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), m); tip.scale.z = 0.35;
      const { p } = headPoint(1.16 * s, 0.24, 0.05); tip.position.copy(p); tip.rotation.set(0, 0.9 * s, -0.75 * s); g.add(tip);
    }
    if (id === 'mask') for (const x of [-1, 1]) { const tie = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.35, 4, 8), m); tie.position.set(0.25 * x, 0.05, -1.08); tie.rotation.z = 0.6 * x + Math.PI / 2; g.add(tie); }
    else for (const x of [-1, 1]) { // raios da máscara relâmpago
      const b = new THREE.Shape(); b.moveTo(0, 0.3); b.lineTo(0.1, 0.3); b.lineTo(0.03, 0.05); b.lineTo(0.12, 0.05); b.lineTo(-0.06, -0.3); b.lineTo(0, -0.04); b.lineTo(-0.09, -0.04); b.closePath();
      const bolt = new THREE.Mesh(new THREE.ExtrudeGeometry(b, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }), mat.std(0xffe14d, { emissive: 0x7a5a00, emissiveIntensity: 0.4, roughness: 0.3 }));
      const { p } = headPoint(1.05 * x, 0.62, 0.04); bolt.position.copy(p); bolt.rotation.set(0, 0.8 * x, -0.45 * x); g.add(bolt);
    }
  } else if (id === 'robot-visor') { // tela turbinada: moldura acesa e brilho ciano por cima
    const glowR = ring(new THREE.MeshStandardMaterial({ color: 0x40e0ff, emissive: 0x00bcd4, emissiveIntensity: 0.9, roughness: 0.3, side: THREE.DoubleSide }));
    glowR.userData.anim = (t, me) => { me.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.35; }; g.add(glowR);
    g.add(new THREE.Mesh(squirclePatch(1.0, 0.53, -0.03, 0.038), new THREE.MeshBasicMaterial({ color: 0x40e0ff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
  } else { // máscara ninja: pano só na parte de baixo da tela (olhos aparecem) + nó atrás
    const m = mat.std(0x26304d, { roughness: 0.85, side: THREE.DoubleSide });
    g.add(new THREE.Mesh(squirclePatch(1.18, 0.3, -0.52, 0.09, 3.2), m));
    const knot = sph(0.12, m, 16); knot.position.set(0, -0.2, -1.06); g.add(knot);
    for (const x of [-1, 1]) { const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.32, 4, 8), m); tail.position.set(0.12 * x, -0.42, -1.06); tail.rotation.z = 0.35 * x; g.add(tail); }
  }
  return g;
}
const TEX = {};
function ledTexture() { // olho de LED: miolo branco, azul-claro e borda azul
  if (TEX.led) return TEX.led;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'), c = 128;
  const g = x.createRadialGradient(c, c - 10, 0, c, c, 128); g.addColorStop(0, '#ffffff'); g.addColorStop(0.16, '#e9fdff'); g.addColorStop(0.36, '#9df2ff'); g.addColorStop(0.6, '#38cdff'); g.addColorStop(0.82, '#1696f2'); g.addColorStop(0.94, '#0c66d4'); g.addColorStop(1, 'rgba(12,102,212,0)');
  x.fillStyle = g; x.beginPath(); x.arc(c, c, 128, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(210,250,255,.55)'; x.lineWidth = 5; x.beginPath(); x.arc(c, c, 92, 0, Math.PI * 2); x.stroke();
  const b = x.createRadialGradient(c, c + 70, 0, c, c + 70, 60); b.addColorStop(0, 'rgba(220,255,255,.75)'); b.addColorStop(1, 'rgba(220,255,255,0)'); x.fillStyle = b; x.beginPath(); x.arc(c, c, 120, 0, Math.PI * 2); x.fill();
  TEX.led = new THREE.CanvasTexture(cv); TEX.led.colorSpace = THREE.SRGBColorSpace; return TEX.led;
}
function haloTexture(rgb = '60,200,255') { // brilho suave em volta
  const k = 'h' + rgb; if (TEX[k]) return TEX[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, `rgba(${rgb},.9)`); g.addColorStop(0.45, `rgba(${rgb},.45)`); g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  TEX[k] = new THREE.CanvasTexture(cv); TEX[k].colorSpace = THREE.SRGBColorSpace; return TEX[k];
}
function visorTexture() { // fundo da tela: azul bem escuro no meio, preto nas bordas
  if (TEX.visor) return TEX.visor;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d');
  const g = x.createRadialGradient(128, 70, 10, 128, 64, 150); g.addColorStop(0, '#13204a'); g.addColorStop(0.55, '#080d22'); g.addColorStop(1, '#020309');
  x.fillStyle = g; x.fillRect(0, 0, 256, 128);
  x.globalAlpha = 0.06; x.fillStyle = '#7fd8ff'; for (let y = 0; y < 128; y += 4) x.fillRect(0, y, 256, 1); // linhas de tela bem sutis
  TEX.visor = new THREE.CanvasTexture(cv); TEX.visor.colorSpace = THREE.SRGBColorSpace; return TEX.visor;
}
function glareTexture() { // reflexo curvo no canto de cima do visor
  if (TEX.glare) return TEX.glare;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const x = cv.getContext('2d');
  x.filter = 'blur(6px)';
  x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(34, 50); x.quadraticCurveTo(52, 20, 100, 14); x.stroke();
  x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 6; x.beginPath(); x.moveTo(118, 12); x.lineTo(140, 11); x.stroke();
  TEX.glare = new THREE.CanvasTexture(cv); TEX.glare.colorSpace = THREE.SRGBColorSpace; return TEX.glare;
}

/* ------------------------------------------------------------ olhos */
const IRIS_TEX = {};
function irisTexture(cols = ['#0d2a86', '#1d5fd8', '#3fb5ff', '#8ff0ff']) {
  const key = cols.join(); if (IRIS_TEX[key]) return IRIS_TEX[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'), c = 128;
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, cols[0]); g.addColorStop(0.45, cols[1]); g.addColorStop(0.8, cols[2]); g.addColorStop(1, cols[3]);
  x.fillStyle = g; x.beginPath(); x.arc(c, c, 126, 0, Math.PI * 2); x.fill();
  x.globalAlpha = 0.28; x.strokeStyle = '#d8fbff'; x.lineWidth = 2;
  for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2, r0 = 52 + Math.random() * 10, r1 = 96 + Math.random() * 24; x.beginPath(); x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); x.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); x.stroke(); }
  x.globalAlpha = 1;
  const pg = x.createRadialGradient(c, c - 6, 0, c, c - 6, 74); pg.addColorStop(0, '#020717'); pg.addColorStop(0.7, '#050f36'); pg.addColorStop(0.9, '#08164a'); pg.addColorStop(1, 'rgba(6,18,61,0)'); x.fillStyle = pg; x.beginPath(); x.arc(c, c - 6, 74, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#061444'; x.lineWidth = 12; x.beginPath(); x.arc(c, c, 120, 0, Math.PI * 2); x.stroke();
  const bg = x.createRadialGradient(c, c + 90, 0, c, c + 90, 70); bg.addColorStop(0, 'rgba(200,255,255,.7)'); bg.addColorStop(1, 'rgba(200,255,255,0)'); x.fillStyle = bg; x.beginPath(); x.arc(c, c, 118, 0, Math.PI * 2); x.fill();
  const tx = (IRIS_TEX[key] = new THREE.CanvasTexture(cv)); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

/* ------------------------------------------------------------ pelo */
let FUR_TEX = null;
function furTexture() {
  if (FUR_TEX) return FUR_TEX;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256);
  x.lineCap = 'round';
  for (let i = 0; i < 700; i++) { const px = Math.random() * 256, py = Math.random() * 256, L = 6 + Math.random() * 6, a = Math.PI / 2 + (Math.random() - 0.5) * 0.7, v = 170 + Math.random() * 85;
    const g = x.createLinearGradient(px, py, px + Math.cos(a) * L, py + Math.sin(a) * L); g.addColorStop(0, `rgb(${v},${v},${v})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.strokeStyle = g; x.lineWidth = 2.6 + Math.random() * 2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }
  for (let i = 0; i < 1500; i++) { const px = Math.random() * 256, py = Math.random() * 256, r = 2.6 + Math.random() * 3; const g = x.createRadialGradient(px, py, 0, px, py, r); const v = 150 + Math.random() * 105; g.addColorStop(0, `rgb(${v},${v},${v})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); }
  FUR_TEX = new THREE.CanvasTexture(cv); FUR_TEX.wrapS = FUR_TEX.wrapT = THREE.RepeatWrapping; return FUR_TEX;
}
function furShells(mesh, [c0, c1], n, len, rep, mask) {
  const base = mesh.geometry, pos = base.attributes.position, nor = base.attributes.normal;
  const tex = furTexture().clone(); tex.needsUpdate = true; tex.repeat.set(rep[0], rep[1]);
  const a = new C(c0), b = new C(c1);
  for (let i = 1; i <= n; i++) {
    const k = i / n, g = base.clone(), p = g.attributes.position;
    const droop = len * 0.35 * k * k; for (let v = 0; v < p.count; v++) { const f = mask ? mask(pos.getX(v), pos.getY(v), pos.getZ(v)) : 1, L = len * k * f; p.setXYZ(v, pos.getX(v) + nor.getX(v) * L, pos.getY(v) + nor.getY(v) * L - droop * f, pos.getZ(v) + nor.getZ(v) * L); }
    const m = new THREE.MeshStandardMaterial({ color: a.clone().lerp(b, Math.pow(k, 1.3)), alphaMap: tex, alphaTest: 0.08 + Math.pow(k, 0.8) * 0.7, roughness: 1, envMapIntensity: 0.35 });
    const sh = new THREE.Mesh(g, m); sh.userData.fur = true; sh.castShadow = false; sh.receiveShadow = false; sh.raycast = () => {};
    mesh.add(sh);
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
    } else if (id === 'crystal-tiara') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.04, 8, 40, Math.PI), mat.gold()); band.rotation.x = -Math.PI / 2 + 0.25; band.rotation.z = Math.PI; band.position.set(0, 0.08, 0.05); g.add(band);
      const cm = new THREE.MeshPhysicalMaterial({ color: 0xbff3ff, transmission: 0.6, roughness: 0.02, clearcoat: 1, iridescence: 1, emissive: 0x7fd8ff, emissiveIntensity: 0.35, transparent: true, opacity: 0.9 });
      for (const [x, h] of [[-0.42, 0.22], [-0.21, 0.34], [0, 0.5], [0.21, 0.34], [0.42, 0.22]]) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), cm); c.scale.y = h / 0.16; c.position.set(x, 0.12 + h / 2, 0.55 - Math.abs(x) * 0.35); c.userData.anim = (t, me) => { me.rotation.y = t * 1.5 + x * 5; }; g.add(c); }
    } else if (id === 'captain-hat') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 3), mat.std(0x1b1b24)); brim.rotation.y = Math.PI; brim.scale.set(1.35, 1, 1.12); g.add(brim);
      const cr = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 16, 0, TAU, 0, Math.PI / 2), mat.std(0x1b1b24)); cr.scale.set(1.12, 0.85, 1); g.add(cr);
      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.045, 8, 3), mat.gold()); trim.rotation.x = Math.PI / 2; trim.rotation.z = Math.PI / 2; trim.scale.set(1.35, 1.12, 1); trim.position.y = 0.06; g.add(trim);
      const fe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.35, 0.4, 0.2], [0.55, 0.9, 0.0], [0.4, 1.3, -0.35], [0.1, 1.45, -0.6]].map((p) => new THREE.Vector3(...p))), 20, 0.09, 10), mat.std(0xe53935)); fe.scale.set(1, 1, 0.5); g.add(fe);
      const sk = sph(0.15, mat.white(), 16); sk.scale.z = 0.4; sk.position.set(0, 0.36, 0.7); g.add(sk);
      g.rotation.x = -0.1;
    } else if (id === 'galaxy-helmet') {
      const glass = sph(1.5, new THREE.MeshPhysicalMaterial({ color: 0xd9c2ff, transparent: true, opacity: 0.25, roughness: 0.02, clearcoat: 1, iridescence: 1, depthWrite: false }), 48); glass.position.y = -0.55; glass.castShadow = false; g.add(glass);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 16, 48), mat.std(0x7c4dff, { metalness: 0.5, roughness: 0.25 })); ring.rotation.x = Math.PI / 2; ring.position.y = -1.75; g.add(ring);
      const orbit = new THREE.Group(); orbit.position.y = -0.55; g.add(orbit);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.035, 8, 64), new THREE.MeshStandardMaterial({ color: 0xb388ff, emissive: 0xb388ff, emissiveIntensity: 1.2, roughness: 0.3 })); halo.rotation.x = 1.2; orbit.add(halo);
      const moon = sph(0.16, new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffd54f, emissiveIntensity: 0.8, roughness: 0.3 }), 16); moon.position.set(1.75, 0, 0); orbit.add(moon);
      orbit.userData.anim = (t, me) => { me.rotation.y = t * 1.2; }; 
    } else if (id === 'ninja-band') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.1, 10, 48), mat.std(0xe53935)); band.rotation.x = Math.PI / 2 - 0.12; band.scale.set(1.08, 0.95, 1); band.position.set(0, -0.32, 0); g.add(band);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.05), mat.std(0xcfd8dc, { metalness: 0.7, roughness: 0.25 })); plate.position.set(0, -0.26, 1.02); plate.rotation.x = -0.15; g.add(plate);
      for (const sx of [-1, 1]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.03), mat.std(0xe53935)); tl.geometry.translate(0, -0.37, 0); tl.position.set(0.12 * sx, -0.3, -1.05); tl.rotation.set(0.6, 0, 0.35 * sx); tl.userData.anim = (t, me) => { me.rotation.x = 0.6 + Math.sin(t * 7 + sx) * 0.25; }; g.add(tl); }
    } else if (id === 'shell-crown') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.04, 8, 40), mat.std(0xffffff, { iridescence: 1, clearcoat: 1 })); band.rotation.x = Math.PI / 2 - 0.15; band.position.y = 0.05; g.add(band);
      for (let i = 0; i < 5; i++) { const a = -0.8 + i * 0.4; const sh = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 8), mat.std(i % 2 ? 0xff9ecf : 0xffd1e8, { iridescence: 1, clearcoat: 1 })); sh.scale.z = 0.5; sh.position.set(Math.sin(a) * 0.66, 0.2 + (i === 2 ? 0.08 : 0), Math.cos(a) * 0.62); g.add(sh); }
      const pearl = sph(0.08, mat.std(0xffffff, { iridescence: 1, roughness: 0.1, clearcoat: 1 }), 14); pearl.position.set(0, 0.45, 0.62); g.add(pearl);
    } else if (id === 'robot-helmet') {
      const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.5, 8), mat.std(0xb8c2d4, { metalness: 0.7, roughness: 0.25 })); dome.position.y = 0.05; g.add(dome);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.85, 0.2, 8), mat.std(0x8d99ae, { metalness: 0.7, roughness: 0.3 })); top.position.y = 0.38; g.add(top);
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), mat.std(0x5b6478)); ant.position.y = 0.7; g.add(ant);
      const bulb = blink(sph(0.11, new THREE.MeshStandardMaterial({ color: 0xff3b4e, emissive: 0xff3b4e, emissiveIntensity: 1, roughness: 0.3 }), 14), 6, 0); bulb.position.y = 0.95; g.add(bulb);
      for (const x of [-1, 1]) { const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 6), mat.std(0x5b6478, { metalness: 0.6 })); bolt.rotation.z = Math.PI / 2; bolt.position.set(0.98 * x, 0.02, 0); g.add(bolt); }
      g.position.y = -0.08;
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
    } else if (id === 'bolt-mask' || id === 'ninja-mask' || id === 'robot-visor') {
      if (id === 'robot-visor') { const v = new THREE.Mesh(new THREE.SphereGeometry(1.06, 48, 10, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.4, Math.PI * 0.13), new THREE.MeshStandardMaterial({ color: 0x40e0ff, emissive: 0x00bcd4, emissiveIntensity: 0.9, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); v.scale.set(1.13, 0.96, 0.98); v.position.y = 0.06; v.userData.anim = (t, me) => { me.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.35; }; g.add(v); }
      else if (id === 'bolt-mask') { const band = new THREE.Mesh(new THREE.SphereGeometry(1.035, 48, 12, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.38, Math.PI * 0.17), mat.std(0xffd21f, { side: THREE.DoubleSide })); band.scale.set(1.13, 0.96, 0.98); band.position.y = 0.06; g.add(band); for (const x of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 3), mat.std(0xffd21f)); w.position.set(1.05 * x, 0.3, 0.3); w.rotation.z = -0.9 * x; g.add(w); } }
      else { const m = new THREE.Mesh(new THREE.SphereGeometry(1.04, 48, 14, Math.PI * 0.1, Math.PI * 0.8, Math.PI * 0.6, Math.PI * 0.26), mat.std(0x26304d, { side: THREE.DoubleSide })); m.scale.set(1.15, 0.96, 1.0); m.position.y = 0.02; g.add(m); const muzzle = sph(0.5, mat.std(0x26304d), 24); muzzle.scale.set(1.2, 0.72, 0.64); muzzle.position.set(0, -0.36, 0.72); g.add(muzzle); }
    } else if (id === 'eyepatch') {
      const p = sph(0.24, mat.std(0x1b1b24), 20); p.scale.set(1, 1.15, 0.3); p.position.set(-0.4, 0.1, 1.0); p.rotation.y = -0.28; g.add(p);
      const st = new THREE.Mesh(new THREE.TorusGeometry(1.09, 0.025, 6, 60), mat.std(0x1b1b24)); st.rotation.set(0, 0, -0.5); st.scale.set(1.08, 0.95, 1); st.position.y = 0.2; g.add(st);
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
    } else if (id === 'star-necklace' || id === 'comet-pendant' || id === 'dragon-amulet' || id === 'pearl-necklace') {
      if (id === 'pearl-necklace') { for (let i = 0; i < 22; i++) { const a = (i / 22) * TAU; const p = sph(0.065, mat.std(0xffffff, { iridescence: 1, roughness: 0.1, clearcoat: 1 }), 12); p.position.set(Math.sin(a) * 0.66, -0.05 - Math.max(0, Math.cos(a)) * 0.2, Math.cos(a) * 0.64); g.add(p); } }
      else {
        const ch = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.025, 6, 48), mat.gold()); ch.rotation.x = Math.PI / 2 - 0.3; ch.position.y = -0.05; g.add(ch);
        let pend;
        if (id === 'star-necklace') pend = starMesh(0.13, new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffd54f, emissiveIntensity: 0.9, roughness: 0.3 }));
        else if (id === 'comet-pendant') { pend = new THREE.Group(); const c = sph(0.1, new THREE.MeshStandardMaterial({ color: 0x80d8ff, emissive: 0x80d8ff, emissiveIntensity: 1, roughness: 0.3 }), 14); pend.add(c); const tl = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 12), new THREE.MeshBasicMaterial({ color: 0xb388ff, transparent: true, opacity: 0.7 })); tl.rotation.z = -2.3; tl.position.set(0.12, 0.12, 0); pend.add(tl); }
        else { pend = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), new THREE.MeshPhysicalMaterial({ color: 0xff1744, emissive: 0xd50000, emissiveIntensity: 0.6, roughness: 0.05, clearcoat: 1 })); pend.scale.y = 1.4; }
        pend.position.set(0, -0.36, 0.78); pend.userData.anim = (t, me) => { me.rotation.y = Math.sin(t * 2) * 0.5; }; g.add(pend);
      }
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
  else if (kind === 'anchor') { x.strokeStyle = '#ffd21f'; x.lineWidth = r * 0.18; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, -r * 0.8); x.lineTo(0, r * 0.8); x.moveTo(-r * 0.4, -r * 0.45); x.lineTo(r * 0.4, -r * 0.45); x.moveTo(-r * 0.75, r * 0.2); x.quadraticCurveTo(-r * 0.6, r * 0.9, 0, r * 0.85); x.quadraticCurveTo(r * 0.6, r * 0.9, r * 0.75, r * 0.2); x.stroke(); x.beginPath(); x.arc(0, -r * 0.95, r * 0.2, 0, TAU); x.stroke(); }
  else if (kind === 'bigbolt') { x.fillStyle = '#ffd21f'; x.beginPath(); x.arc(0, 0, r * 1.15, 0, TAU); x.fill(); bolt(r, '#2f6bff'); }
  else if (kind === 'panel') { x.fillStyle = '#5b6478'; x.fillRect(-r, -r * 0.7, r * 2, r * 1.4); ['#ff3b4e', '#ffd21f', '#3cc46a', '#2f86ff'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(-r * 0.6 + i * r * 0.4, -r * 0.25, r * 0.13, 0, TAU); x.fill(); }); x.fillStyle = '#9fe8ff'; x.fillRect(-r * 0.8, r * 0.1, r * 1.6, r * 0.35); }
  else if (kind === 'shells') { for (const sx of [-1, 1]) { x.fillStyle = '#ff9ecf'; x.beginPath(); x.ellipse(sx * r * 0.62, 0, r * 0.55, r * 0.5, 0, Math.PI, 0); x.lineTo(sx * r * 0.62, r * 0.35); x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = 4; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(sx * r * 0.62, r * 0.3); x.lineTo(sx * r * 0.62 + k * r * 0.2, -r * 0.4); x.stroke(); } } }
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
    if (spec.starfield) for (let i = 0; i < 70; i++) { x.save(); x.translate((i * 151) % w, 14 + ((i * 67) % (h - 28))); x.fillStyle = spec.starfield; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 4 : 10; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.fill(); x.restore(); }
    if (spec.scales) { x.strokeStyle = spec.scales; x.lineWidth = 4; for (let yy = 0; yy < h + 20; yy += 22) for (let xx = (yy / 22) % 2 ? 0 : 16; xx < w + 32; xx += 32) { x.beginPath(); x.arc(xx, yy, 16, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); } }
    if (spec.print) drawEmblem(x, spec.print, w / 4, h * 0.42, spec.printSize || 54);
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
  // lendárias
  'star-dress': { color: '#c9a3ff', starfield: '#fff3a0', skirt: '#e6c8ff', glow: 0.18, irid: true, trim: '#ffd21f' },
  'bolt-suit': { color: '#2f6bff', print: 'bigbolt', printSize: 62, long: true, belt: '#ffd21f', trim: '#ffd21f' },
  'pirate-coat': { color: '#c62828', print: 'anchor', long: true, buttons: '#ffd21f', belt: '#3e2723', trim: '#ffd21f' },
  'space-suit': { color: '#f4f6fa', print: 'panel', long: true, belt: '#2f86ff', lights: true, trim: '#2f86ff' },
  'ninja-gi': { color: '#26304d', long: true, belt: '#e53935', trim: '#e53935' },
  'shell-top': { color: '#7fe3d6', print: 'shells', printSize: 60, irid: true, trim: '#ffffff' },
  'robot-chest': { color: '#b8c2d4', print: 'panel', long: true, metal: true, lights: true, trim: '#5b6478' },
};
const LEGS = {
  'jeans': { color: '#3b6fd1', cuffs: '#5d8fe8' },
  'shorts': { color: '#ff7a3c', short: true },
  'skirt': { color: '#ff6fae', skirt: true },
  'tutu': { color: '#ffc1e3', tutu: true },
  'overalls': { color: '#4a7fd6', bib: true },
  'pj-pants': { color: '#7fc8ff', dots: '#ffffff' },
  'hero-boots': { boots: '#ff3b4e', trim: '#ffd21f' },
  'mermaid-tail': { color: '#2ec4b6', scales: '#9ff5ea', mermaid: true },
};
function shell(r, t0, t1, material) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32, 0, TAU, t0 * Math.PI, (t1 - t0) * Math.PI), material);
  m.scale.set(1, 1.04, 0.98); m.position.y = 0.78; return m;
}
const cloth = (spec, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ map: clothTex(spec), roughness: 0.75, sheen: 0.3, sheenColor: new C(0xffffff), side: THREE.DoubleSide, envMapIntensity: 0.45 },
  spec.metal ? { metalness: 0.55, roughness: 0.3, envMapIntensity: 1, sheen: 0 } : {}, spec.irid ? { iridescence: 1, iridescenceIOR: 1.6, clearcoat: 0.6, roughness: 0.35 } : {}, spec.glow ? { emissive: new C(spec.color), emissiveIntensity: spec.glow } : {}, o));
function blink(m, sp, ph) { m.userData.anim = (t, me) => { me.material.emissiveIntensity = 0.3 + (Math.sin(t * sp + ph) > 0 ? 1.4 : 0); }; return m; }
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
  if (s.skirt) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 1.25, 0.62, 48, 1, true), s.starfield ? cloth({ color: s.skirt, starfield: s.starfield }, { emissive: new C(s.skirt), emissiveIntensity: 0.15 }) : mat.std(s.skirt, { side: THREE.DoubleSide, roughness: 0.7 })); sk.position.y = 0.26; sk.scale.z = 0.96; put(P.wear, sk); }
  if (s.belt) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.07, 10, 48), mat.std(s.belt)); b.rotation.x = Math.PI / 2; b.scale.set(1, 0.98, 1); b.position.y = 0.48; put(P.wear, b); const k = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.06), mat.gold()); k.position.set(0, 0.48, 0.86); put(P.wear, k); }
  if (s.buttons) for (const y of [0.75, 1.0, 1.25]) { const b = sph(0.055, mat.gold(), 12); b.position.set(0.28, y, 0.84 - (y - 0.75) * 0.12); put(P.wear, b); }
  if (s.lights) ['#ff3b4e', '#ffd21f', '#3cc46a'].forEach((c, i) => { const l = blink(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1 })), 5 + i, i * 2); l.position.set(-0.3 + i * 0.13, 1.18, 0.82); put(P.wear, l); });
}
function buildLegs(L, id, put) {
  const s = LEGS[id]; if (!s) return;
  const P = L.p;
  if (s.boots) { for (const f of P.feet) { const c = sph(0.32, mat.std(s.boots, { clearcoat: 1, roughness: 0.25 }), 24); c.scale.set(1.08, 0.75, 1.4); c.position.copy(f.position); c.position.y += 0.03; put(P.extra, c); const t = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 10, 28), mat.std(s.trim)); t.rotation.x = Math.PI / 2; t.position.set(f.position.x, 0.36, 0.1); put(P.extra, t); } return; }
  if (s.mermaid) {
    const m = cloth(s, { iridescence: 1, iridescenceIOR: 1.7, clearcoat: 0.8, roughness: 0.3 });
    put(P.wear, shell(0.872, 0.52, 0.98, m));
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.12, 0.85, 32, 6), m); tail.position.set(0, -0.08, 0.38); tail.rotation.x = 1.25; put(P.wear, tail);
    const fin = new THREE.Group(); fin.position.set(0, -0.2, 0.82);
    for (const sx of [-1, 1]) { const f = sph(0.34, new THREE.MeshPhysicalMaterial({ color: 0x9ff5ea, transparent: true, opacity: 0.9, iridescence: 1, roughness: 0.2, side: THREE.DoubleSide }), 20); f.scale.set(1.1, 0.55, 0.1); f.position.set(0.3 * sx, 0.18, 0); f.rotation.z = 0.55 * sx; fin.add(f); }
    fin.userData.anim = (t, me) => { me.rotation.x = Math.sin(t * 3) * 0.25; }; put(P.wear, fin);
    return;
  }
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
  'fire-dragon': { color: '#e53935', belly: '#ffcc80', ears: 'horns', spikes: '#ffb300', tail: 'dino', wings: '#b71c1c', vstripes: '#c62828' },
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
  if (s.ears === 'horns') for (const x of [-1, 1]) { const h = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0.42 * x, 0.85, 0.1], [0.62 * x, 1.2, -0.05], [0.72 * x, 1.45, -0.35]].map((p) => new THREE.Vector3(...p))), 16, 0.09, 10), mat.std(0xfff0c8)); put(P.hood, h); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 10), mat.std(0xfff0c8)); tip.position.set(0.74 * x, 1.52, -0.42); tip.rotation.x = -0.8; put(P.hood, tip); }
  if (s.ears === 'horns') for (let i = 0; i < 6; i++) { const a = -0.25 + i * 0.36, sz = 0.2 - i * 0.02; const c = new THREE.Mesh(new THREE.ConeGeometry(sz, sz * 2, 12), mat.std(s.spikes)); const n = new THREE.Vector3(0, Math.cos(a), -Math.sin(a)); c.position.set(0, n.y * 1.07 * 0.96, n.z * 1.07 * 0.98); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); put(P.hood, c); }
  if (s.wings) for (const sx of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0.3); sh.lineTo(1.1, 0.6); sh.quadraticCurveTo(0.95, 0.1, 1.05, -0.25); sh.quadraticCurveTo(0.8, -0.05, 0.68, -0.3); sh.quadraticCurveTo(0.5, -0.05, 0.35, -0.3); sh.quadraticCurveTo(0.2, 0, 0, -0.2); sh.closePath();
    const piv = new THREE.Group(); piv.position.set(0.18 * sx, 1.35, -0.6); const w = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }), mat.std(s.wings, { side: THREE.DoubleSide })); w.scale.set(1.4 * sx, 1.4, 1); piv.add(w); piv.rotation.y = 0.3 * sx; piv.userData.anim = (t, me) => { me.rotation.y = 0.3 * sx + Math.sin(t * 4) * 0.3 * sx; }; put(P.extra, piv); }
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
  } else if (id === 'light-wings') {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xffd6f5, emissive: 0xff8ad8, emissiveIntensity: 0.55, transparent: true, opacity: 0.75, roughness: 0.1, iridescence: 1, side: THREE.DoubleSide, depthWrite: false });
    for (const sx of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(0.18 * sx, 1.05, -0.78);
      const w1 = sph(0.95, m, 28); w1.scale.set(1, 0.58, 0.05); w1.position.set(0.95 * sx, 0.55, 0); w1.rotation.z = 0.6 * sx; piv.add(w1);
      const w2 = sph(0.62, m, 24); w2.scale.set(1, 0.6, 0.05); w2.position.set(0.72 * sx, -0.3, 0); w2.rotation.z = -0.45 * sx; piv.add(w2);
      for (let i = 0; i < 4; i++) { const st = starMesh(0.07, new THREE.MeshStandardMaterial({ color: 0xffe082, emissive: 0xffe082, emissiveIntensity: 1, roughness: 0.3 })); st.position.set((0.5 + i * 0.32) * sx, 0.35 + i * 0.18, 0.05); piv.add(st); }
      piv.rotation.y = 0.25 * sx; flap(piv, 'y', 0.3 * sx, 7); g.add(piv);
    }
  } else if (id === 'glow-cape') {
    const piv = new THREE.Group(); piv.position.set(0, 1.5, 0);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.4, 1.65, 32, 8, true, Math.PI - 1.05, 2.1), new THREE.MeshPhysicalMaterial({ color: 0xffd21f, emissive: 0xffab00, emissiveIntensity: 0.35, side: THREE.DoubleSide, roughness: 0.4, sheen: 1, sheenColor: new C(0xffffff) }));
    c.position.set(0, -0.8, -0.05); piv.add(c);
    const em = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), new THREE.MeshStandardMaterial({ color: 0x2f6bff, side: THREE.DoubleSide })); em.position.set(0, -0.75, -1.18); em.rotation.y = Math.PI; piv.add(em);
    const clasp = sph(0.1, mat.gold(), 14); clasp.position.set(0, -0.06, 0.62); piv.add(clasp);
    piv.userData.anim = (t, me) => { me.rotation.x = 0.12 + Math.sin(t * 5) * 0.12; c.material.emissiveIntensity = 0.3 + Math.abs(Math.sin(t * 3)) * 0.4; }; g.add(piv);
  } else if (id === 'parrot') {
    const pr = new THREE.Group(); pr.position.set(1.02, 1.42, 0.12); pr.rotation.y = -0.5; pr.scale.setScalar(1.5);
    const body = sph(0.22, mat.std(0xe53935), 20); body.scale.set(0.9, 1.25, 0.9); body.position.y = 0.25; pr.add(body);
    const head = sph(0.16, mat.std(0xe53935), 18); head.position.set(0, 0.55, 0.06); pr.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), mat.std(0xffd21f)); beak.rotation.x = Math.PI / 2 + 0.4; beak.position.set(0, 0.52, 0.22); pr.add(beak);
    for (const sx of [-1, 1]) { const e = sph(0.035, mat.navy(), 8); e.position.set(0.09 * sx, 0.6, 0.13); pr.add(e); const w = sph(0.16, mat.std(0x2f86ff), 14); w.scale.set(0.4, 1.1, 0.8); w.position.set(0.18 * sx, 0.22, -0.02); pr.add(w); }
    const tl = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 10), mat.std(0xffd21f)); tl.rotation.x = 2.6; tl.position.set(0, 0.0, -0.18); pr.add(tl);
    pr.userData.anim = (t, me) => { me.rotation.z = Math.sin(t * 2.5) * 0.12; me.position.y = 1.42 + Math.abs(Math.sin(t * 2.5)) * 0.06; }; g.add(pr);
  } else if (id === 'rocket-pack') {
    const r = new THREE.Group(); r.position.set(0, 0.95, -1.05);
    const bodyR = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 8, 20), mat.std(0xf4f6fa, { metalness: 0.3, roughness: 0.3 })); r.add(bodyR);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.45, 24), mat.std(0x7c4dff)); nose.position.y = 0.78; r.add(nose);
    const win = sph(0.12, new THREE.MeshPhysicalMaterial({ color: 0x80d8ff, emissive: 0x00b0ff, emissiveIntensity: 0.6, clearcoat: 1 }), 14); win.position.set(0, 0.2, -0.27); r.add(win);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; const f = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.25), mat.std(0x7c4dff)); f.position.set(Math.sin(a) * 0.3, -0.45, Math.cos(a) * 0.3); f.rotation.y = a; r.add(f); }
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 16), new THREE.MeshBasicMaterial({ color: 0xff9100, transparent: true, opacity: 0.9 })); fl.rotation.x = Math.PI; fl.position.y = -0.9; fl.userData.anim = (t, me) => { me.scale.y = 0.7 + Math.abs(Math.sin(t * 25)) * 0.6; }; r.add(fl);
    g.add(r);
  } else if (id === 'leaf-cape') {
    const piv = new THREE.Group(); piv.position.set(0, 1.5, 0);
    for (let row = 0; row < 5; row++) for (let i = 0; i < 9; i++) { const a = Math.PI - 1.0 + (i / 8) * 2.0, rr = 0.93 + row * 0.1; const l = sph(0.27, mat.std(row % 2 ? 0x43a047 : 0x66bb6a, { side: THREE.DoubleSide }), 10); l.scale.set(0.62, 1, 0.12); l.position.set(Math.sin(a) * rr, -0.22 - row * 0.3, Math.cos(a) * rr - 0.05); l.rotation.y = a; piv.add(l); }
    flap(piv, 'x', 0.08, 3); g.add(piv);
  } else if (id === 'gear-pack') {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.18), mat.std(0x8d99ae, { metalness: 0.6, roughness: 0.3 })); plate.position.set(0, 0.95, -0.88); g.add(plate);
    const gear = (r, n, col) => { const G = new THREE.Group(); const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 24), mat.std(col, { metalness: 0.7, roughness: 0.25 })); disc.rotation.x = Math.PI / 2; G.add(disc); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; const tooth = new THREE.Mesh(new THREE.BoxGeometry(r * 0.28, r * 0.35, 0.1), disc.material); tooth.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); tooth.rotation.z = a; G.add(tooth); } return G; };
    const g1 = gear(0.32, 10, 0xffd21f); g1.position.set(-0.18, 1.08, -1.02); g1.userData.anim = (t, me) => { me.rotation.z = t * 1.5; }; g.add(g1);
    const g2 = gear(0.22, 8, 0xff8a1f); g2.position.set(0.28, 0.75, -1.02); g2.userData.anim = (t, me) => { me.rotation.z = -t * 2.2; }; g.add(g2);
    const lamp = blink(sph(0.08, new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1, roughness: 0.3 }), 12), 4, 1); lamp.position.set(0.3, 1.25, -1.0); g.add(lamp);
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
/* efeitos das coleções completas */
function makeFx(type) {
  const g = new THREE.Group(); const parts = [];
  const add = (m, o) => { g.add(m); parts.push(Object.assign({ m }, o)); };
  const n = 12;
  for (let i = 0; i < n; i++) {
    const ph = (i / n) * TAU, sp = 0.6 + (i % 4) * 0.15;
    if (type === 'sparkle') add(starMesh(0.15, new THREE.MeshStandardMaterial({ color: 0xfff59d, emissive: 0xffe082, emissiveIntensity: 1 })), { ph, sp, kind: 'twinkle' });
    else if (type === 'bolt') { const b = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xffd600, emissiveIntensity: 1.2 })); add(b, { ph, sp: 1.6, kind: 'orbit', r: 1.6, h: 0.6 + (i % 3) * 0.9 }); }
    else if (type === 'coins') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 20), mat.gold()); c.rotation.x = Math.PI / 2; add(c, { ph, sp: 0.8, kind: 'orbit', r: 1.7, h: 0.4 + (i % 4) * 0.7, spin: true }); }
    else if (type === 'planets' && i < 4) { const c = ['#ff8a65', '#4fc3f7', '#ba68c8', '#ffd54f'][i]; const p = sph(0.16 + (i % 2) * 0.06, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3 }), 16); if (i === 2) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 30), mat.std(0xffe0b2)); ring.rotation.x = 1.2; p.add(ring); } add(p, { ph: (i / 4) * TAU, sp: 0.5, kind: 'orbit', r: 2.0, h: 1.2 + i * 0.5 }); }
    else if (type === 'leaves') { const l = sph(0.12, mat.std(i % 2 ? 0x66bb6a : 0x9ccc65, { side: THREE.DoubleSide }), 8); l.scale.set(0.6, 1, 0.1); add(l, { ph, sp: 1.2, kind: 'swirl' }); }
    else if (type === 'bubbles') { const b = sph(0.12 + (i % 3) * 0.05, new THREE.MeshPhysicalMaterial({ color: 0xe0f7fa, transparent: true, opacity: 0.6, iridescence: 1, roughness: 0, clearcoat: 1, depthWrite: false }), 14); add(b, { ph, sp: 0.5 + (i % 3) * 0.2, kind: 'rise', x: Math.cos(ph) * 1.4, z: Math.sin(ph) * 0.9 }); }
    else if (type === 'fire') { const f = sph(0.06 + (i % 3) * 0.03, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff6d00 : 0xffd600, transparent: true, opacity: 0.9 }), 8); add(f, { ph, sp: 0.9 + (i % 3) * 0.3, kind: 'rise', x: Math.cos(ph) * 1.2, z: Math.sin(ph) * 0.8 }); }
    else if (type === 'lights') { const c = ['#ff3b4e', '#ffd21f', '#3cc46a', '#2f86ff'][i % 4]; const l = sph(0.07, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1 }), 10); add(l, { ph, sp: 0.7, kind: 'orbit', r: 1.6, h: 2.0, blink: true }); }
  }
  g.userData.tick = (t) => {
    for (const p of parts) {
      const m = p.m, a = t * p.sp + p.ph;
      if (p.kind === 'twinkle') { m.position.set(Math.cos(p.ph * 3) * (1.2 + (p.ph % 1)), 0.5 + ((p.ph * 7) % 3.4), Math.sin(p.ph * 3) * 0.9); m.scale.setScalar(Math.max(0, Math.sin(t * 3 + p.ph * 5))); m.rotation.z = t; }
      else if (p.kind === 'orbit') { m.position.set(Math.cos(a) * p.r, p.h + Math.sin(t * 2 + p.ph) * 0.15, Math.sin(a) * p.r * 0.7); if (p.spin) m.rotation.z = t * 4; if (p.blink) m.material.emissiveIntensity = Math.sin(t * 6 + p.ph * 4) > 0 ? 1.5 : 0.2; m.rotation.y = -a; }
      else if (p.kind === 'swirl') { const k = (t * 0.25 + p.ph / TAU) % 1; m.position.set(Math.cos(a * 2) * (1.0 + k * 0.6), k * 4, Math.sin(a * 2) * (0.8 + k * 0.4)); m.rotation.set(t * 2, a, t); }
      else if (p.kind === 'rise') { const k = (t * p.sp * 0.3 + p.ph / TAU) % 1; m.position.set(p.x + Math.sin(t * 2 + p.ph) * 0.15, k * 4.2, p.z); m.scale.setScalar(Math.sin(k * Math.PI)); }
    }
  };
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
function makeEgg(robot) {
  const g = new THREE.Group();
  const tex = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); ['#9fd4ff', '#ffc1e3', '#ffe27a', '#b9f0c4'].forEach((c, k) => { x.fillStyle = c; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(((i * 73 + k * 41) % w), 30 + ((i * 37 + k * 59) % (h - 60)), 16 + ((i + k) % 3) * 6, 0, TAU); x.fill(); } }); });
  // ovo do robô: casco branco brilhante, faixa de luz azul na emenda e estrelinha
  const robotTex = (band) => canvasTex(512, 256, (x, w, h) => {
    x.fillStyle = '#f7f9fd'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(40,70,140,.18)'; x.lineWidth = 3; for (const yy of [h * 0.42, h * 0.7]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
    const y0 = band === 'top' ? 0 : h - 26, gr = x.createLinearGradient(0, y0, 0, y0 + 26);
    gr.addColorStop(0, band === 'top' ? '#3fd2ff' : 'rgba(63,210,255,0)'); gr.addColorStop(1, band === 'top' ? 'rgba(63,210,255,0)' : '#3fd2ff');
    x.fillStyle = '#1b2a63'; x.fillRect(0, band === 'top' ? 0 : h - 14, w, 14); x.fillStyle = gr; x.fillRect(0, y0, w, 26);
    for (let i = 0; i < 6; i++) { x.fillStyle = ['#6bffb4', '#ffd84a', '#ff7ab6'][i % 3]; x.beginPath(); x.arc(40 + i * 86, band === 'top' ? 40 : h - 44, 6, 0, TAU); x.fill(); }
    if (band === 'bottom') for (const sx of [0, w]) { x.fillStyle = '#ffc928'; x.save(); x.translate(sx, h * 0.45); x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 11 : 26; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.restore(); } // estrela na frente (emenda u=0)
  });
  const shellOf = (t) => new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.95 });
  const m = robot ? shellOf(robotTex('top')) : new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.8, sheen: 0.4 });
  const mTop = robot ? shellOf(robotTex('bottom')) : m;
  const prof = [];
  if (robot) for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI, c = Math.cos(a), sn = Math.sin(a), n = 3.2; prof.push([Math.max(0.0001, 0.8 * Math.pow(sn, 2 / n)), 1.2 - 1.2 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n)]); } // cápsula
  else for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; const y = 1.15 - Math.cos(a) * 1.15; const r = Math.sin(a) * (0.82 - 0.14 * (y / 2.3)); prof.push([Math.max(0.0001, r), y]); }
  const cut = 13;
  const bottom = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(0, cut + 1).map(([r, y]) => new THREE.Vector2(r, y)), 48), m); bottom.material.side = THREE.DoubleSide;
  const top = new THREE.Mesh(new THREE.LatheGeometry(prof.slice(cut).map(([r, y]) => new THREE.Vector2(r, y)), 48), mTop);
  const body = new THREE.Group(); body.add(bottom, top); g.add(body);
  const cracks = [];
  const yc = prof[cut][1], rc = prof[cut][0];
  for (let c = 0; c < 3; c++) {
    const pts = []; for (let i = 0; i <= 8; i++) { const a = -0.9 + c * 0.6 + (i / 8) * 0.9; pts.push(new THREE.Vector3(Math.sin(a) * (rc + 0.01), yc + (i % 2 ? 0.09 : -0.07), Math.cos(a) * (rc + 0.01))); }
    const cr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, robot ? 0.026 : 0.022, 6), robot ? new THREE.MeshBasicMaterial({ color: 0x5fe0ff, toneMapped: false }) : mat.std(0x8a6a4a)); cr.visible = false; body.add(cr); cracks.push(cr);
  }
  if (robot) { // janelinha com luz e pezinhos de pouso
    const win = new THREE.Group(); win.position.set(0, 1.8, 0.775); win.rotation.x = -0.28; top.add(win);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 14, 40), mat.std(0x1b2a63, { clearcoat: 1, roughness: 0.25 })); win.add(rim);
    win.add(new THREE.Mesh(new THREE.CircleGeometry(0.25, 40), new THREE.MeshPhysicalMaterial({ color: 0x0a1230, roughness: 0.05, clearcoat: 1 })));
    const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.13, 32), new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, toneMapped: false })); lamp.position.z = 0.01; win.add(lamp);
    const hl = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(-0.1, 0.1, 0.02); win.add(hl);
    g.userData.lamp = lamp;
    for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.5, leg = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 16), mat.std(0x1b2a63, { clearcoat: 1, roughness: 0.25 })); leg.position.set(Math.sin(a) * 0.62, 0.12, Math.cos(a) * 0.62); leg.rotation.set(Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4); body.add(leg); }
  }
  shadowAll(g);
  g.userData = Object.assign(g.userData, { body, top, bottom, cracks, wob: 0, hatchT: -1, robot });
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
/* ------------------------------------------------------------ escola futurista 3D (tela principal) */
// Montada para a câmera da tela principal com o Lumi bebê; o palco reajusta escala e posição a cada quadro
// para manter o mesmo enquadramento em qualquer tamanho do Lumi (o chão continua sempre em y = 0).
const SCHOOL_REF = { x: 0.55, dist: 13.242 };
function rrShape(x, y, w, h, r, Ctor = THREE.Shape) {
  const s = new Ctor(); s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false); s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false); return s;
}
function ctxRR(x, X, Y, W, H, R) { x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); }
const radialTex = (stops, size = 128) => canvasTex(size, size, (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); });
function uvFit(geo, x0, y0, w, h) { const P = geo.attributes.position, U = geo.attributes.uv; for (let i = 0; i < U.count; i++) U.setXY(i, (P.getX(i) - x0) / w, (P.getY(i) - y0) / h); return geo; }
function smoothLathe(pts, seg = 28, n = 26) { // perfil suave (spline) girado em volta do eixo
  const sp = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y))); return new THREE.LatheGeometry(sp.getPoints(n), seg);
}
// espelho do piso (reflexo suave e desfocado), em meia resolução e só com os objetos da camada 1
function makeFloorMirror(geo, strength = 0.42) {
  const rt = new THREE.WebGLRenderTarget(256, 512, { type: THREE.UnsignedByteType }); rt.texture.generateMipmaps = false;
  const texM = new THREE.Matrix4(), cam = new THREE.PerspectiveCamera(); cam.layers.set(1);
  const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { tDiffuse: { value: rt.texture }, textureMatrix: { value: texM }, strength: { value: strength }, texel: { value: new THREE.Vector2(1 / 256, 1 / 512) } },
    vertexShader: 'uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW; void main(){ vUv = textureMatrix * vec4(position, 1.0); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float strength; uniform vec2 texel; varying vec4 vUv; varying vec3 vW;
      void main(){ vec2 uv = vUv.xy / vUv.w; vec2 d = texel * 2.2;
        vec4 c = texture2D(tDiffuse, uv) * 0.2;
        c += (texture2D(tDiffuse, uv + vec2(d.x, 0.)) + texture2D(tDiffuse, uv - vec2(d.x, 0.)) + texture2D(tDiffuse, uv + vec2(0., d.y)) + texture2D(tDiffuse, uv - vec2(0., d.y))) * 0.12;
        c += (texture2D(tDiffuse, uv + d) + texture2D(tDiffuse, uv - d) + texture2D(tDiffuse, uv + vec2(d.x, -d.y)) + texture2D(tDiffuse, uv + vec2(-d.x, d.y))) * 0.08;
        float f = 1.0 - abs(normalize(cameraPosition - vW).y);
        gl_FragColor = vec4(c.rgb, c.a * strength * mix(0.35, 1.0, f * f));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` });
  const m = new THREE.Mesh(geo, material); m.renderOrder = -1; m.userData.rt = rt;
  const P = new THREE.Plane(), N = new THREE.Vector3(), RW = new THREE.Vector3(), CW = new THREE.Vector3(), R = new THREE.Matrix4(), LA = new THREE.Vector3(), CL = new THREE.Vector4(), V = new THREE.Vector3(), T = new THREE.Vector3(), Q = new THREE.Vector4(), sz = new THREE.Vector2();
  let fr = 0;
  m.onBeforeRender = (renderer, scene, camera) => {
    renderer.getDrawingBufferSize(sz); const tw = Math.max(64, Math.round(sz.x * 0.45)), th = Math.max(64, Math.round(sz.y * 0.45));
    if (rt.width !== tw || rt.height !== th) { rt.setSize(tw, th); material.uniforms.texel.value.set(1 / tw, 1 / th); fr = 0; }
    if (fr++ % 2) return; // atualiza o reflexo em quadros alternados
    RW.setFromMatrixPosition(m.matrixWorld); CW.setFromMatrixPosition(camera.matrixWorld); R.extractRotation(m.matrixWorld); N.set(0, 0, 1).applyMatrix4(R);
    V.subVectors(RW, CW); if (V.dot(N) > 0) return; V.reflect(N).negate().add(RW);
    R.extractRotation(camera.matrixWorld); LA.set(0, 0, -1).applyMatrix4(R).add(CW); T.subVectors(RW, LA).reflect(N).negate().add(RW);
    cam.position.copy(V); cam.up.set(0, 1, 0).applyMatrix4(R).reflect(N); cam.lookAt(T); cam.far = camera.far; cam.updateMatrixWorld(); cam.projectionMatrix.copy(camera.projectionMatrix);
    texM.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse).multiply(m.matrixWorld);
    P.setFromNormalAndCoplanarPoint(N, RW).applyMatrix4(cam.matrixWorldInverse); CL.set(P.normal.x, P.normal.y, P.normal.z, P.constant);
    const e = cam.projectionMatrix.elements; Q.set((Math.sign(CL.x) + e[8]) / e[0], (Math.sign(CL.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]); CL.multiplyScalar(2 / CL.dot(Q));
    e[2] = CL.x; e[6] = CL.y; e[10] = CL.z + 1 - 0.003; e[14] = CL.w;
    m.visible = false; const rt0 = renderer.getRenderTarget(), sh = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false; let ok = true;
    try { renderer.setRenderTarget(rt); renderer.state.buffers.depth.setMask(true); if (renderer.autoClear === false) renderer.clear(); renderer.render(scene, cam); }
    catch (err) { ok = false; console.warn('reflexo do piso desligado', err); } // se o aparelho não aguentar, o piso fica só brilhante
    renderer.shadowMap.autoUpdate = sh; renderer.setRenderTarget(rt0); m.visible = ok; if (!ok) m.onBeforeRender = () => {};
  };
  return m;
}
function makeSchool() {
  const G = new THREE.Group(), anim = [], tick = (fn) => anim.push(fn);
  const CY = 0x4fe3ff, LI = 0xb38bff, PK = 0xff86d4, YE = 0xffd65a, MI = 0x5fe0b0;
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
  const addM = (c, o, map) => basic(c, { map: map || null, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
  const gloss = (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 0.6 }, o));
  const soft = (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.78, sheen: 1, sheenRoughness: 0.45, sheenColor: new C(0xffffff), envMapIntensity: 0.4 }, o));
  const WHITE = gloss(0xf3f4ff);
  const glowT = radialTex([[0, 'rgba(255,255,255,1)'], [0.22, 'rgba(255,255,255,.6)'], [0.55, 'rgba(255,255,255,.14)'], [1, 'rgba(255,255,255,0)']]);
  const shadowT = radialTex([[0, 'rgba(34,20,104,.62)'], [0.5, 'rgba(34,20,104,.26)'], [1, 'rgba(34,20,104,0)']]);
  const halo = (c, s, o = 0.6) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.set(s, s, 1); return sp; };
  const blob = (w, d, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; return m; };
  const glowLine = (pts, c, r = 0.03, hr = 0.11, ho = 0.22, closed = false) => {
    const cv = new THREE.CatmullRomCurve3(pts, closed), n = Math.max(32, pts.length * 4);
    return [new THREE.Mesh(new THREE.TubeGeometry(cv, n, r, 6, closed), basic(c)), new THREE.Mesh(new THREE.TubeGeometry(cv, n, hr, 6, closed), addM(c, ho))];
  };
  const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), ONE = new THREE.Vector3(1, 1, 1), eul = new THREE.Euler();
  const inst = (geo, mtl, items) => { const im = new THREE.InstancedMesh(geo, mtl, items.length); items.forEach((it, i) => { m4.compose(it.p, it.r ? new THREE.Quaternion().setFromEuler(eul.set(...it.r)) : q0, it.s || ONE); im.setMatrixAt(i, m4); if (it.c != null) im.setColorAt(i, new C(it.c)); }); return im; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const rrPts = (x, y, w, h, r, z, d = 10) => { const p = rrShape(x, y, w, h, r).getPoints(d).map((v) => new THREE.Vector3(v.x, v.y, z)); if (p.length > 1 && p[0].distanceTo(p[p.length - 1]) < 1e-3) p.pop(); return p; };

  /* ---------- parede do fundo com a janela panorâmica */
  const WZ = -9, X0 = -1.62, X1 = 2.92, Y0 = 0.95, Y1 = 5.75, WR = 0.8, WW = X1 - X0, WH = Y1 - Y0, WC = (X0 + X1) / 2, WM = (Y0 + Y1) / 2;
  const wallS = new THREE.Shape(); wallS.moveTo(-16, -0.2); wallS.lineTo(17, -0.2); wallS.lineTo(17, 12); wallS.lineTo(-16, 12); wallS.closePath();
  wallS.holes.push(rrShape(X0, Y0, WW, WH, WR, THREE.Path));
  const wallT = canvasTex(512, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#4d45b4'); g.addColorStop(0.3, '#6f68d8'); g.addColorStop(0.62, '#8f88ea'); g.addColorStop(0.93, '#6c64d4'); g.addColorStop(1, '#5a52c6'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const cx = ((WC + 16) / 33) * w, cy = (1 - (WM + 0.2) / 12.2) * h, r = x.createRadialGradient(cx, cy, 10, cx, cy, w * 0.3);
    r.addColorStop(0, 'rgba(200,214,255,.7)'); r.addColorStop(0.5, 'rgba(180,190,255,.28)'); r.addColorStop(1, 'rgba(180,190,255,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 2; for (let k = -16; k <= 17; k += 1.65) { const px = ((k + 16) / 33) * w; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, h); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, h - ((0.35 + 0.2) / 12.2) * h, w, 3); // rodapé com friso claro
  });
  const wall = new THREE.Mesh(uvFit(new THREE.ShapeGeometry(wallS, 20), -16, -0.2, 33, 12.2), new THREE.MeshStandardMaterial({ map: wallT, color: 0xa49ef2, roughness: 0.6, envMapIntensity: 0.35 }));
  wall.position.z = WZ; G.add(wall);
  // moldura branca arredondada, grossa e brilhante
  const frameS = rrShape(X0 - 0.3, Y0 - 0.3, WW + 0.6, WH + 0.6, WR + 0.3); frameS.holes.push(rrShape(X0, Y0, WW, WH, WR, THREE.Path));
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(frameS, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.09, bevelSegments: 4, curveSegments: 20 }), WHITE);
  frame.position.z = WZ - 0.04; G.add(frame);
  // luz ciano no contorno de dentro e brilho difuso em volta da moldura
  const [eCore, eHalo] = glowLine(rrPts(X0 + 0.04, Y0 + 0.04, WW - 0.08, WH - 0.08, WR - 0.04, WZ + 0.2), CY, 0.026, 0.1, 0.32, true); G.add(eCore, eHalo);
  const wgT = canvasTex(512, 512, (x, w, h) => { x.shadowColor = '#a8f2ff'; x.shadowBlur = 46; x.strokeStyle = 'rgba(200,246,255,.95)'; x.lineWidth = 16; ctxRR(x, 50, 50, w - 100, h - 100, 84); x.stroke(); x.stroke(); });
  const wglow = new THREE.Mesh(new THREE.PlaneGeometry(WW + 1.6, WH + 1.6), addM(0xb8c8ff, 0.5, wgT)); wglow.position.set(WC, WM, WZ + 0.01); G.add(wglow);
  tick((t) => { eHalo.material.opacity = 0.24 + 0.1 * Math.sin(t * 1.7); wglow.material.opacity = 0.42 + 0.1 * Math.sin(t * 1.1 + 1); });
  // montantes arredondados (três vidraças) e travessa alta
  const mulls = [X0 + WW / 3, X0 + (2 * WW) / 3].map((x) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, WH - 0.1, 6, 12), WHITE); m.position.set(x, WM, WZ - 0.02); G.add(m); return m; });
  const tr = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, WW - 0.1, 6, 12), WHITE); tr.rotation.z = Math.PI / 2; tr.position.set(WC, Y0 + WH * 0.84, WZ - 0.02); G.add(tr);
  // vidro: reflexos diagonais suaves
  const glareT = canvasTex(256, 256, (x, w, h) => { x.translate(w / 2, h / 2); x.rotate(-0.62); x.translate(-w / 2, -h / 2);
    [[0.12, 34, 0.2], [0.24, 8, 0.16], [0.58, 46, 0.11], [0.7, 7, 0.13], [0.9, 20, 0.08]].forEach(([p, bw, a]) => { const cx = p * w * 1.5 - w * 0.25, g = x.createLinearGradient(cx - bw, 0, cx + bw, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-w, -h, w * 3, h * 3); }); });
  const glass = new THREE.Mesh(uvFit(new THREE.ShapeGeometry(rrShape(X0, Y0, WW, WH, WR), 16), X0, Y0, WW, WH), addM(0xe6f6ff, 0.55, glareT)); glass.position.z = WZ - 0.06; G.add(glass);
  // faixas de luz curvas no alto (sanca)
  [[0.62, CY], [0.88, LI], [1.14, PK]].forEach(([dy, c], i) => {
    const pts = []; for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push(new THREE.Vector3(-8 + u * 17.3, Y1 + dy + Math.sin(u * Math.PI) * 0.32, WZ + 0.2)); }
    const [a, b] = glowLine(pts, c, 0.03, 0.12, 0.24); G.add(a, b); tick((t) => { b.material.opacity = 0.14 + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.6 - i * 1.1)); });
  });
  // luminárias de anel penduradas
  [[1.9, 4.95, -6.6, 0.3]].forEach(([x, y, z, r], i) => {
    const g = new THREE.Group(); g.position.set(x, y, z); G.add(g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 10, 56), basic(0xeefcff)); ring.rotation.x = Math.PI / 2 - 0.3; g.add(ring);
    const shell = new THREE.Mesh(new THREE.TorusGeometry(r, 0.075, 10, 56, Math.PI * 2), WHITE); shell.rotation.x = Math.PI / 2 - 0.3; shell.position.y = 0.05; g.add(shell);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 4, 6), basic(0xdfe3ff)); cable.position.y = 2.05; g.add(cable);
    const h = halo(0x9ff3ff, r * 5.2, 0.32); g.add(h);
    tick((t) => { h.material.opacity = 0.26 + 0.08 * Math.sin(t * 1.3 + i * 2.1); g.rotation.z = Math.sin(t * 0.45 + i) * 0.03; });
  });

  /* ---------- banco acolchoado embaixo da janela */
  const bench = new THREE.Group(); bench.position.set(WC, 0, WZ + 0.76); G.add(bench);
  const bBody = new THREE.Mesh(roundBoxGeo(1, 3.4, WW / 2 + 0.15, 0.36, 0.42, 40), WHITE); bBody.position.y = 0.42; bench.add(bBody);
  const bTop = new THREE.Mesh(roundBoxGeo(1, 3.0, WW / 2 + 0.06, 0.13, 0.38, 40), soft(0xa48bff)); bTop.position.set(0, 0.85, 0.02); bench.add(bTop);
  { const [a, b] = glowLine([new THREE.Vector3(-WW / 2 - 0.1, 0.06, 0.4), new THREE.Vector3(WW / 2 + 0.1, 0.06, 0.4)], CY, 0.018, 0.07, 0.35); bench.add(a, b); }
  { const s = blob(WW + 1.6, 1.7, 0.85); s.position.z = 0.15; bench.add(s); }
  bench.add(inst(roundBoxGeo(0.27, 3, 1, 0.85, 0.42, 28), soft(0xffffff), [[-2.05, 0x6fd8ff], [0.95, PK], [1.5, YE], [2.0, MI]].map(([x, c], i) => ({ p: V(x, 1.16, -0.05), r: [-0.15, (i - 1.5) * 0.18, (i % 2 ? 1 : -1) * 0.12], c }))));

  /* ---------- mesa holográfica (direita) com a tela "Let's Learn English!" */
  const desk = new THREE.Group(); desk.position.set(1.95, 0, -4.2); G.add(desk);
  desk.add(new THREE.Mesh(smoothLathe([[0.001, 0], [0.4, 0.0], [0.46, 0.04], [0.42, 0.09], [0.2, 0.13], [0.12, 0.25], [0.11, 0.62], [0.16, 0.74], [0.46, 0.8], [0.56, 0.86], [0.55, 0.93], [0.42, 0.965], [0.001, 0.97]], 40, 40), WHITE));
  const dRing = new THREE.Mesh(new THREE.TorusGeometry(0.556, 0.016, 8, 64), basic(CY)); dRing.rotation.x = Math.PI / 2; dRing.position.y = 0.885; desk.add(dRing);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), basic(0xbff8ff)); lens.rotation.x = -Math.PI / 2; lens.position.y = 0.975; desk.add(lens);
  const lensH = halo(CY, 0.9, 0.5); lensH.position.y = 1.02; desk.add(lensH);
  { const s = blob(1.5, 1.2, 0.9); desk.add(s); const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), addM(CY, 0.22, glowT)); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.02; desk.add(pool); }
  const beamT = canvasTex(32, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(160,245,255,.0)'); g.addColorStop(0.65, 'rgba(160,245,255,.22)'); g.addColorStop(1, 'rgba(200,250,255,.7)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.1, 0.78, 32, 1, true), addM(0xffffff, 0.55, beamT)); beam.material.side = THREE.DoubleSide; beam.position.y = 0.97 + 0.39; desk.add(beam);
  const holo = new THREE.Group(); holo.position.y = 2.3; holo.rotation.y = -0.24; desk.add(holo);
  const hcv = document.createElement('canvas'); hcv.width = 512; hcv.height = 384; const hx = hcv.getContext('2d');
  const holoT = new THREE.CanvasTexture(hcv); holoT.colorSpace = THREE.SRGBColorSpace; holoT.anisotropy = 4;
  const drawHolo = () => {
    const x = hx, w = 512, h = 384, F = "'Fredoka', 'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif"; x.clearRect(0, 0, w, h); x.save();
    ctxRR(x, 12, 12, w - 24, h - 24, 46); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(38,86,226,.84)'); g.addColorStop(1, 'rgba(26,38,160,.78)'); x.fillStyle = g; x.fill();
    x.shadowColor = '#5ff0ff'; x.shadowBlur = 20; x.strokeStyle = '#b4f7ff'; x.lineWidth = 6; x.stroke();
    x.strokeStyle = '#ffffff'; x.lineWidth = 7; x.lineCap = 'round'; // cantoneiras
    [[34, 34, 1, 1], [w - 34, 34, -1, 1], [34, h - 34, 1, -1], [w - 34, h - 34, -1, -1]].forEach(([px, py, sx, sy]) => { x.beginPath(); x.moveTo(px, py + sy * 30); x.lineTo(px, py); x.lineTo(px + sx * 30, py); x.stroke(); });
    x.textAlign = 'center'; x.shadowColor = '#46d9ff'; x.shadowBlur = 16; x.fillStyle = '#ffffff'; x.font = `600 56px ${F}`; x.fillText("Let's Learn", w / 2, 104);
    x.shadowColor = '#ffae00'; x.fillStyle = '#ffe56e'; x.font = `700 82px ${F}`; x.fillText('English!', w / 2, 190);
    [['A', '#ff8ad8', 0.29], ['B', '#7dffb6', 0.5], ['C', '#ffd65a', 0.71]].forEach(([l, c, p]) => { const cx = w * p, cy = 286; x.shadowColor = c; x.shadowBlur = 18;
      x.fillStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.arc(cx, cy, 44, 0, TAU); x.fill(); x.lineWidth = 5; x.strokeStyle = c; x.stroke();
      x.fillStyle = c; x.font = `700 56px ${F}`; x.textBaseline = 'middle'; x.fillText(l, cx, cy + 4); x.textBaseline = 'alphabetic'; });
    x.restore(); holoT.needsUpdate = true;
  };
  drawHolo(); if (document.fonts && document.fonts.load) document.fonts.load("700 60px 'Fredoka'").then(drawHolo).catch(() => {});
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.11), basic(0xffffff, { map: holoT, transparent: true, depthWrite: false, side: THREE.DoubleSide })); holo.add(screen);
  const scanT = canvasTex(8, 64, (x, w, h) => { for (let y = 0; y < h; y += 4) { x.fillStyle = 'rgba(210,252,255,.5)'; x.fillRect(0, y, w, 1.5); } }); scanT.wrapS = scanT.wrapT = THREE.RepeatWrapping; scanT.repeat.set(1, 5);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.03), addM(0xffffff, 0.22, scanT)); scan.position.z = 0.005; holo.add(scan);
  const sweepT = canvasTex(256, 16, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.46, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(0.54, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const sweep = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.99), addM(0xcff9ff, 0.5, sweepT)); sweep.position.z = 0.01; holo.add(sweep);
  const hback = halo(CY, 2.6, 0.32); hback.position.z = -0.08; hback.scale.set(2.5, 2.0, 1); holo.add(hback);
  tick((t) => {
    holo.position.y = 2.3 + Math.sin(t * 1.25) * 0.05; holo.rotation.y = -0.24 + Math.sin(t * 0.6) * 0.03;
    scanT.offset.y = (t * 0.12) % 1; sweepT.offset.x = 0.7 - ((t * 0.25) % 2.2);
    const fl = Math.sin(t * 17) > 0.985 ? 0.6 : 1; screen.material.opacity = (0.92 + 0.08 * Math.sin(t * 2.6)) * fl;
    hback.material.opacity = 0.26 + 0.08 * Math.sin(t * 1.9); beam.material.opacity = 0.42 + 0.14 * Math.sin(t * 3.1); lensH.material.opacity = 0.45 + 0.15 * Math.sin(t * 3.1);
  });

  /* ---------- esquerda: planta arredondada com botões de luz e estante colorida */
  const plant = new THREE.Group(); plant.position.set(-1.3, 0, -4.9); G.add(plant);
  plant.add(new THREE.Mesh(smoothLathe([[0.001, 0], [0.26, 0], [0.33, 0.12], [0.36, 0.42], [0.33, 0.5], [0.001, 0.5]], 32, 20), WHITE));
  { const r = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.014, 6, 48), basic(LI)); r.rotation.x = Math.PI / 2; r.position.y = 0.33; plant.add(r); }
  plant.add(inst(new THREE.SphereGeometry(1, 28, 20), soft(0xffffff, { sheenColor: new C(0xd8ffee) }), [[0, 1.05, 0, 0.42, 0x47c98d], [-0.26, 1.25, 0.05, 0.32, 0x6fe2a9], [0.27, 1.3, -0.02, 0.34, 0x6fe2a9], [0.02, 1.55, 0.02, 0.33, 0x47c98d], [-0.12, 0.82, 0.18, 0.26, 0x6fe2a9], [0.2, 0.86, 0.16, 0.24, 0x47c98d]].map(([x, y, z, r, c]) => ({ p: V(x, y, z), s: V(r, r, r), c }))));
  const budL = [[0.18, 1.7, 0.22, YE], [-0.32, 1.42, 0.24, PK], [0.36, 1.12, 0.3, CY], [-0.05, 1.22, 0.42, YE]];
  plant.add(inst(new THREE.SphereGeometry(0.05, 10, 8), basic(0xffffff), budL.map(([x, y, z, c]) => ({ p: V(x, y, z), c }))));
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(budL.flatMap(([x, y, z]) => [x, y, z]), 3)); const bcol = new Float32Array(budL.length * 3); bg.setAttribute('color', new THREE.BufferAttribute(bcol, 3));
  plant.add(new THREE.Points(bg, new THREE.PointsMaterial({ size: 0.34, map: glowT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
  const budC = budL.map((b) => new C(b[3]));
  tick((t) => { budC.forEach((c, i) => { const k = 0.45 + 0.4 * Math.sin(t * 2 + i * 1.7); bcol[i * 3] = c.r * k; bcol[i * 3 + 1] = c.g * k; bcol[i * 3 + 2] = c.b * k; }); bg.attributes.color.needsUpdate = true; });
  { const s = blob(1.2, 1.2, 0.8); plant.add(s); const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.0), addM(LI, 0.18, glowT)); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.02; plant.add(pool); }
  const shelf = new THREE.Group(); shelf.position.set(-2.15, 0, -7.0); shelf.rotation.y = 0.5; G.add(shelf);
  { const b = new THREE.Mesh(roundBoxGeo(1, 3.6, 0.62, 1.75, 0.34, 40), WHITE); b.position.y = 1.75; shelf.add(b);
    const inn = new THREE.Mesh(roundBoxGeo(1, 3.2, 0.5, 1.6, 0.22, 32), soft(0x8f7cf0)); inn.position.set(0, 1.75, 0.15); shelf.add(inn);
    const bookG = roundBoxGeo(1, 3.2, 0.055, 0.2, 0.15, 16), books = new THREE.InstancedMesh(bookG, gloss(0xffffff, { roughness: 0.45, clearcoat: 0.4 }), 15), cols = [0xff6fa8, 0x4fc3ff, 0xffd54f, 0x9b7bff, 0x5fd39a, 0xff9a4d];
    for (let i = 0; i < 15; i++) { const row = Math.floor(i / 5), k = i % 5, hgt = 0.82 + ((i * 7) % 5) * 0.06; m4.compose(new THREE.Vector3(-0.32 + k * 0.15, 0.38 + row * 1.08 + 0.2 * hgt, 0.2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, k === 4 ? 0.2 : 0)), new THREE.Vector3(1, hgt, 1)); books.setMatrixAt(i, m4); books.setColorAt(i, new C(cols[(i + row) % 6])); }
    shelf.add(books);
    for (const y of [0.32, 1.4, 2.48]) { const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.9, 4, 8), basic(CY)); l.rotation.z = Math.PI / 2; l.position.set(0, y, 0.36); shelf.add(l); }
    const s = blob(1.8, 1.2, 0.8); shelf.add(s); }

  /* ---------- piso brilhante: placas arredondadas, reflexo da janela e frisos de luz */
  const floorT = canvasTex(512, 512, (x, w) => { x.fillStyle = '#3a33a3'; x.fillRect(0, 0, w, w); const s = w / 2;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { ctxRR(x, i * s + 4, j * s + 4, s - 8, s - 8, 34); const g = x.createLinearGradient(i * s, j * s, i * s + s, j * s + s); g.addColorStop(0, '#6c66df'); g.addColorStop(1, '#544dca'); x.fillStyle = g; x.fill();
      x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 3; ctxRR(x, i * s + 9, j * s + 9, s - 18, s - 18, 30); x.stroke(); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(28, 42);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 60), new THREE.MeshPhysicalMaterial({ map: floorT, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0.5, 0, 21); floor.receiveShadow = true; G.add(floor);
  const mirror = makeFloorMirror(new THREE.PlaneGeometry(40, 60)); mirror.rotation.x = -Math.PI / 2; mirror.position.set(0.5, 0.003, 21); G.add(mirror);
  const streakT = canvasTex(64, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.3, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const e = x.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.25, 'rgba(0,0,0,0)'); e.addColorStop(0.75, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = e; x.fillRect(0, 0, w, h); });
  { const aoT = canvasTex(8, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(26,14,90,.55)'); g.addColorStop(1, 'rgba(26,14,90,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const aoF = new THREE.Mesh(new THREE.PlaneGeometry(34, 1.6), new THREE.MeshBasicMaterial({ map: aoT, transparent: true, depthWrite: false })); aoF.rotation.x = -Math.PI / 2; aoF.position.set(0.5, 0.004, WZ + 0.8); G.add(aoF);
    const aoW = new THREE.Mesh(new THREE.PlaneGeometry(34, 1.1), new THREE.MeshBasicMaterial({ map: aoT, transparent: true, depthWrite: false })); aoW.rotation.z = Math.PI; aoW.position.set(0.5, 0.55, WZ + 0.01); G.add(aoW); }
  [[X0 + WW / 6, 0xd7c8ff], [WC, 0xbfeaff], [X1 - WW / 6, 0xd7c8ff]].forEach(([x, c], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(WW / 3 - 0.2, 7), addM(c, 0.42, streakT)); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.006, WZ + 0.7 + 3.5); G.add(m); tick((t) => (m.material.opacity = 0.38 + 0.06 * Math.sin(t * 0.9 + i))); });

  /* ---------- feixes de luz entrando pela janela e partículas brilhando no ar */
  const shaftT = canvasTex(128, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const e = x.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.5, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = e; x.fillRect(0, 0, w, h); });
  const shafts = [[-1.1, 1.2, 0.08], [0.45, 1.7, 0.065], [1.75, 1.0, 0.06]].map(([x, wd, o], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, 7.5), addM(0xdcf4ff, o, shaftT)); m.position.set(x + 0.9, 2.6, -7.3); m.rotation.set(-0.5, 0, 0.36); G.add(m); tick((t) => (m.material.opacity = o * (0.7 + 0.3 * Math.sin(t * 0.6 + i * 1.9)))); return m; });
  const NP = 44, pg = new THREE.BufferGeometry(), pp = new Float32Array(NP * 3), pc = new Float32Array(NP * 3), seeds = [];
  for (let i = 0; i < NP; i++) seeds.push([-1.7 + Math.random() * 4.6, Math.random() * 5, -7.6 + Math.random() * 5.2, Math.random() * TAU, 0.1 + Math.random() * 0.18]);
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
  const sparks = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.085, map: radialTex([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']], 64), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  sparks.frustumCulled = false; G.add(sparks); const spA = new C(0x8ff4ff), spB = new C(0xe2d2ff);
  tick((t) => { for (let i = 0; i < NP; i++) { const s = seeds[i], y = (s[1] + t * s[4]) % 5.2, tw = 0.3 + 0.7 * Math.max(0, Math.sin(t * 2.1 + s[3] * 3)), fd = Math.min(1, y * 2, (5.2 - y) * 2) * tw, c = i % 2 ? spA : spB;
      pp[i * 3] = s[0] + Math.sin(t * 0.4 + s[3]) * 0.25; pp[i * 3 + 1] = 0.25 + y; pp[i * 3 + 2] = s[2] + Math.cos(t * 0.3 + s[3]) * 0.2; pc[i * 3] = c.r * fd; pc[i * 3 + 1] = c.g * fd; pc[i * 3 + 2] = c.b * fd; }
    pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; });
  // globo holográfico girando (malha ciano, anel rosa e satélite)
  const globe = new THREE.Group(); globe.position.set(-0.46, 4.05, -6); G.add(globe);
  const gw = new THREE.Mesh(new THREE.IcosahedronGeometry(0.27, 2), basic(0x8ff6ff, { wireframe: true, transparent: true, opacity: 0.8 })); globe.add(gw);
  const gcore = new THREE.Mesh(new THREE.SphereGeometry(0.235, 20, 14), addM(0x4fd6ff, 0.35)); globe.add(gcore);
  const gring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 6, 64), basic(PK)); gring.rotation.x = 1.25; globe.add(gring);
  const moon = sph(0.045, basic(0xfff3a8), 10); globe.add(moon); const gh = halo(0x7feaff, 1.3, 0.35); globe.add(gh);
  tick((t) => { gw.rotation.y = t * 0.6; gw.rotation.x = 0.35; gring.rotation.z = t * 0.9; moon.position.set(Math.cos(t * 1.4) * 0.4, Math.sin(t * 1.4) * 0.4 * Math.cos(1.25), Math.sin(t * 1.4) * 0.4 * Math.sin(1.25)); globe.position.y = 4.05 + Math.sin(t * 1.2) * 0.07; gh.material.opacity = 0.28 + 0.08 * Math.sin(t * 2); });
  /* ---------- lá fora: céu do entardecer, planeta com anel e a cidade do futuro */
  const skyT = canvasTex(512, 1024, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1f6fe8'); g.addColorStop(0.25, '#3d8cf7'); g.addColorStop(0.5, '#73adff'); g.addColorStop(0.7, '#a9cdff'); g.addColorStop(0.85, '#d8e9ff'); g.addColorStop(1, '#f4f9ff'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const cloud = (cx, cy, s, a) => { for (let k = 0; k < 11; k++) { const q = Math.sin(((k + 0.5) / 11) * Math.PI), px = cx + (k - 5) * s * 0.34, py = cy - q * s * 0.34, r = s * (0.24 + q * 0.26);
      const gg = x.createRadialGradient(px - r * 0.25, py - r * 0.4, r * 0.08, px, py, r); gg.addColorStop(0, `rgba(255,255,255,${a})`); gg.addColorStop(0.55, `rgba(246,250,255,${a * 0.85})`); gg.addColorStop(0.85, `rgba(214,229,252,${a * 0.45})`); gg.addColorStop(1, 'rgba(214,229,252,0)'); x.fillStyle = gg; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); } };
    cloud(110, 420, 120, 0.9); cloud(400, 330, 110, 0.85); cloud(250, 600, 170, 0.8); cloud(470, 680, 160, 0.75); cloud(40, 720, 150, 0.8); cloud(300, 210, 80, 0.7);
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(64, 54), basic(0xffffff, { map: skyT, fog: false })); sky.position.set(1.2, 15, -150); G.add(sky);
  { const sun = halo(0xfff6dc, 30, 0.85); sun.material.fog = false; sun.position.set(13, 32, -148); G.add(sun); const sun2 = halo(0xffffff, 9, 0.9); sun2.material.fog = false; sun2.position.set(13, 32, -147.5); G.add(sun2); }
  const planetT = canvasTex(256, 256, (x, w) => { const g = x.createRadialGradient(w * 0.36, w * 0.33, 6, w / 2, w / 2, w / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#ece4ff'); g.addColorStop(0.86, '#cbbcf6'); g.addColorStop(1, '#b7a6f0'); x.fillStyle = g; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 1, 0, TAU); x.fill();
    x.globalAlpha = 0.16; x.fillStyle = '#6f56cf'; [[0.36, 0.58, 22], [0.64, 0.42, 14], [0.56, 0.74, 10], [0.28, 0.36, 8]].forEach(([a, b, r]) => { x.beginPath(); x.arc(a * w, b * w, r, 0, TAU); x.fill(); }); x.globalAlpha = 1; });
  const PL = new THREE.Vector3(5.4, 28.3, -140);
  const planet = new THREE.Mesh(new THREE.CircleGeometry(4.4, 48), basic(0xffffff, { map: planetT, transparent: true, opacity: 0.82, fog: false })); planet.position.copy(PL); G.add(planet);
  const ringM = basic(0xf6ecff, { transparent: true, opacity: 0.75, fog: false });
  [[0, -0.2], [Math.PI, 0.2]].forEach(([a0, dz]) => { const r = new THREE.Mesh(new THREE.TorusGeometry(7, 0.32, 6, 48, Math.PI), ringM); r.rotation.z = a0 - 0.28; r.scale.y = 0.24; r.position.copy(PL); r.position.z += dz; G.add(r); });
  { const h = halo(0xe8f2ff, 20, 0.3); h.material.fog = false; h.position.set(PL.x, PL.y, PL.z - 1); G.add(h); }
  const farT = canvasTex(1024, 256, (x, w, h) => { let sd = 7; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    x.fillStyle = '#bcd3f7'; for (let i = 0; i < 48; i++) { const bw = 14 + r() * 36, bh = 40 + r() * 170, bx = r() * w; ctxRR(x, bx, h - bh, bw, bh + 12, Math.min(bw / 2, 12)); x.fill(); if (r() < 0.35) { x.beginPath(); x.arc(bx + bw / 2, h - bh + 2, bw * 0.5, Math.PI, 0); x.fill(); } if (r() < 0.25) x.fillRect(bx + bw / 2 - 1, h - bh - 26, 2, 26); }
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(120,170,240,.45)'; for (let i = 0; i < 520; i++) x.fillRect(r() * w, h * 0.25 + r() * h * 0.75, 2, 3);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(236,244,255,0)'); g.addColorStop(1, 'rgba(236,244,255,.8)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(72, 18), basic(0xffffff, { map: farT, transparent: true, fog: false })); far.position.set(1, 6.5, -118); G.add(far);
  // prédios redondos (torno) em duas camadas, instanciados: poucas chamadas de desenho no celular
  // prédios de dia: corpo branco com sombra pintada (sol à esquerda) e faixas de vidro azul refletindo o céu (sem depender das luzes da sala)
  const towerT = (seed, glass, wins = true) => canvasTex(256, 512, (x, w, h) => { let sd = seed; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const L = (i) => Math.max(0, Math.cos((i / w) * TAU - TAU * 0.875));
    for (let i = 0; i < w; i += 2) { const k = 0.66 + 0.34 * L(i), g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgb(${Math.round(255 * k)},${Math.round(255 * k)},255)`); g.addColorStop(1, `rgb(${Math.round(226 * k)},${Math.round(234 * k)},${Math.round(255 * Math.min(1, k + 0.06))})`); x.fillStyle = g; x.fillRect(i, 0, 2, h); }
    if (wins) { for (let y = 26; y < h - 34; y += 24) { const v = r(); if (v < 0.14) continue; x.fillStyle = v < 0.3 ? glass[1] : v < 0.34 ? '#c3b0ff' : glass[0]; x.fillRect(0, y, w, 10);
        for (let i = 0; i < w; i += 4) { x.fillStyle = `rgba(12,30,96,${(0.42 * (1 - L(i))).toFixed(3)})`; x.fillRect(i, y, 4, 10); }
        x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(0, y, w, 1.5); }
      x.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < w; k += 11) x.fillRect(k, 0, 1.5, h); }
    x.globalCompositeOperation = 'lighter';
    const band = (cx, bw, col) => { const g = x.createLinearGradient(cx - bw, 0, cx + bw, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - bw, 0, bw * 2, h); };
    band(w * 0.94, 9, 'rgba(255,255,255,.35)'); band(w * 0.27, 12, 'rgba(90,210,255,.22)'); x.globalCompositeOperation = 'source-over'; });
  const profiles = [
    [[0.001, 0], [1, 0], [1, 0.82], [0.92, 0.93], [0.62, 0.99], [0.001, 1]],
    [[0.001, 0], [0.82, 0], [0.76, 0.55], [1.0, 0.72], [1.06, 0.84], [0.82, 0.95], [0.3, 0.995], [0.001, 1]],
    [[0.001, 0], [1, 0], [0.86, 0.6], [0.6, 0.88], [0.22, 0.99], [0.001, 1]],
  ].map((p) => smoothLathe(p, 22, 22));
  const layers = [
    { z: [-36, -50], x: [-9, 10], n: 12, h: [3.2, 8.2], w: [1.2, 2.3], tint: [0xffffff, 0xeef4ff, 0xe2edff, 0xf1edff], win: towerT(11, ['#3c94f2', '#5fd6ff']) },
    { z: [-66, -88], x: [-15, 16], n: 18, h: [6, 13.5], w: [1.6, 3.0], tint: [0xe6eeff, 0xece8ff, 0xdde9fd, 0xf0eeff], win: towerT(29, ['#5aa6f4', '#86dcff']) },
  ];
  let sd = 3; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const antP = [];
  for (const L of layers) {
    const per = profiles.map(() => []);
    for (let i = 0; i < L.n; i++) { const x = L.x[0] + ((i + 0.2 + rr() * 0.6) / L.n) * (L.x[1] - L.x[0]); if (L.n === 12 && x > -3.2 && x < 0.3) continue; // espaço para a torre-símbolo
      per[Math.floor(rr() * 3)].push({ x, z: L.z[0] + rr() * (L.z[1] - L.z[0]), h: L.h[0] + rr() * (L.h[1] - L.h[0]), w: L.w[0] + rr() * (L.w[1] - L.w[0]), c: L.tint[Math.floor(rr() * L.tint.length)] }); }
    profiles.forEach((geo, k) => { const list = per[k]; if (!list.length) return;
      const matT = basic(0xffffff, { map: L.win });
      const im = new THREE.InstancedMesh(geo, matT, list.length);
      list.forEach((b, i) => { m4.compose(new THREE.Vector3(b.x, -6, b.z), q0, new THREE.Vector3(b.w, b.h + 6, b.w)); im.setMatrixAt(i, m4); im.setColorAt(i, new C(b.c)); if (rr() < 0.5) antP.push(b.x, b.h + 0.4, b.z); });
      G.add(im); });
  }
  const cloudT = canvasTex(256, 128, (x, w, h) => { let sd = 5; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 14; k++) { const q = Math.sin(((k + 0.5) / 14) * Math.PI), px = w * (0.1 + 0.8 * ((k + 0.5) / 14)), rad = h * (0.18 + 0.26 * q) * (0.85 + r() * 0.3), py = h * 0.78 - rad * 0.55 - q * h * 0.12;
      const g = x.createRadialGradient(px - rad * 0.2, py - rad * 0.35, rad * 0.1, px, py, rad); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(244,249,255,.9)'); g.addColorStop(1, 'rgba(206,224,252,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill(); } });
  const clouds = [[-4.6, 12.2, -82, 15, 5.6], [7.6, 10.4, -80, 17, 6.2], [8.8, 2.6, -78, 18, 6], [12.5, 15.5, -90, 12, 4.2], [-7.5, 4.5, -86, 16, 6]].map(([x, y, z, sx, sy], i) => { const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })); c.scale.set(sx, sy, 1); c.position.set(x, y, z); c.userData.x = x; G.add(c); return c; });
  tick((t) => clouds.forEach((c, i) => (c.position.x = c.userData.x + Math.sin(t * 0.03 + i * 1.3) * 2.5)));
  { const hzT = canvasTex(8, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(226,240,255,.35)'); g.addColorStop(1, 'rgba(240,248,255,.75)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const hz = new THREE.Mesh(new THREE.PlaneGeometry(60, 9), addM(0xffffff, 0.42, hzT)); hz.material.fog = false; hz.position.set(1, 0.5, -32); G.add(hz); }
  // torre-símbolo: agulha com disco-observatório, anéis girando e esfera rosa no topo
  const tower = new THREE.Group(); tower.position.set(-1.5, -6, -46); G.add(tower);
  const tw = basic(0xffffff, { map: towerT(41, ['#3c9af4', '#7fe4ff']) });
  tower.add(new THREE.Mesh(smoothLathe([[0.001, 0], [1.6, 0], [1.1, 2.5], [0.62, 7], [0.5, 13], [0.42, 16.6], [0.001, 16.8]], 24, 30), tw));
  tower.add(new THREE.Mesh(smoothLathe([[0.001, 13.5], [1.2, 13.6], [2.3, 14.15], [2.2, 14.45], [1.2, 14.85], [0.001, 15.0]], 32, 20), basic(0xffffff, { map: towerT(7, null, false) })));
  { const band = new THREE.Mesh(new THREE.TorusGeometry(2.26, 0.07, 6, 48), basic(CY)); band.rotation.x = Math.PI / 2; band.position.y = 14.3; tower.add(band); }
  const orb = sph(0.62, basic(0xffb8ec), 20); orb.position.y = 17.3; tower.add(orb); const orbH = halo(PK, 4.2, 0.55); orbH.position.y = 17.3; tower.add(orbH);
  const tRings = [10.4, 11.6].map((y, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(1.25 - i * 0.18, 0.06, 6, 40), basic(i ? LI : CY)); r.position.y = y; r.rotation.x = Math.PI / 2 - 0.2; tower.add(r); return r; });
  tick((t) => { tRings.forEach((r, i) => { r.rotation.z = t * (i ? -0.7 : 0.9); r.position.y = (i ? 11.6 : 10.4) + Math.sin(t * 1.2 + i) * 0.12; }); orbH.material.opacity = 0.45 + 0.15 * Math.sin(t * 2.4); });
  // pontinhos piscando no topo dos prédios
  const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.Float32BufferAttribute(antP, 3)); const ac = new Float32Array(antP.length); ag.setAttribute('color', new THREE.BufferAttribute(ac, 3));
  const ants = new THREE.Points(ag, new THREE.PointsMaterial({ size: 0.7, map: glowT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); G.add(ants);
  const antC = [new C(PK), new C(CY), new C(0xffffff)];
  tick((t) => { for (let i = 0; i < ac.length / 3; i++) { const on = Math.max(0, Math.sin(t * 2.2 + i * 1.7)), c = antC[i % 3]; ac[i * 3] = c.r * on; ac[i * 3 + 1] = c.g * on; ac[i * 3 + 2] = c.b * on; } ag.attributes.color.needsUpdate = true; });
  // monotrilho com trem passando
  const railPts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; railPts.push(new THREE.Vector3(-34 + u * 70, 1.0 + Math.sin(u * Math.PI * 1.5) * 0.9, -26 - Math.cos(u * Math.PI) * 4)); }
  const railC = new THREE.CatmullRomCurve3(railPts);
  G.add(new THREE.Mesh(new THREE.TubeGeometry(railC, 120, 0.22, 6), basic(0xeef0ff))); G.add(new THREE.Mesh(new THREE.TubeGeometry(railC, 120, 0.07, 5), basic(CY)));
  const train = new THREE.Group(); G.add(train);
  train.add(inst(new THREE.CapsuleGeometry(0.42, 1.5, 6, 10), basic(0xffffff), [0, 1, 2, 3].map((k) => ({ p: V(-k * 2.45, 0, 0), r: [0, 0, Math.PI / 2] }))));
  train.add(inst(new THREE.CapsuleGeometry(0.13, 1.25, 4, 8), basic(0x8ff4ff), [0, 1, 2, 3].map((k) => ({ p: V(-k * 2.45, 0.12, 0.34), r: [0, 0, Math.PI / 2] }))));
  const tA = new THREE.Vector3(), tB = new THREE.Vector3();
  tick((t) => { const u = (t * 0.03) % 1.25; train.visible = u < 1; if (!train.visible) return; railC.getPointAt(Math.min(u, 0.999), tA); railC.getPointAt(Math.min(u + 0.005, 1), tB); train.position.set(tA.x, tA.y + 0.55, tA.z); train.rotation.y = -Math.atan2(tB.z - tA.z, tB.x - tA.x); });
  // carros voadores com rastro de luz
  const trailT = canvasTex(128, 8, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.95)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const CARS = [[9.2, -30, 1.5, CY], [7.0, -38, -1.1, PK], [12.5, -62, 0.9, LI], [8.05, -26, -1.7, CY], [16, -84, 0.7, YE], [9.4, -50, 1.2, PK], [17.8, -70, -0.8, CY]].map(([y, z, sp, c]) => ({ y, z, sp, c, span: 0.16 * (13 - z) + 6, ph: rr() * 40 }));
  const parts = [ // corpo, cúpula, luz de baixo e rastro (uma chamada de desenho para cada tipo)
    [new THREE.CapsuleGeometry(0.38, 1.1, 6, 10), basic(0xf4f6ff), V(0, 0, 0), [0, 0, Math.PI / 2], false],
    [new THREE.SphereGeometry(0.4, 12, 8, 0, TAU, 0, Math.PI / 2), basic(0x9ff3ff), V(0, 0.2, 0), [0, 0, 0], false],
    [new THREE.CapsuleGeometry(0.06, 0.9, 4, 6), basic(0xffffff), V(0, -0.3, 0), [0, 0, Math.PI / 2], true],
    [new THREE.PlaneGeometry(5.5, 0.2), addM(0xffffff, 0.85, trailT), V(-3.3, 0, 0), [0, 0, 0], true],
  ].map(([geo, mtl, off, r, tint]) => { const im = new THREE.InstancedMesh(geo, mtl, CARS.length); im.frustumCulled = false; if (tint) CARS.forEach((c, i) => im.setColorAt(i, new C(c.c))); G.add(im); return { im, off, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)) }; });
  const cq = new THREE.Quaternion(), flip = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI), cp = new THREE.Vector3(), op = new THREE.Vector3(), oq = new THREE.Quaternion();
  tick((t) => { CARS.forEach((c, i) => { cp.set(((c.ph + t * Math.abs(c.sp) * 2.2) % (2 * c.span) - c.span) * Math.sign(c.sp), c.y + Math.sin(t * 0.9 + i) * 0.25, c.z); cq.copy(c.sp < 0 ? flip : q0);
      parts.forEach((P) => { op.copy(P.off).applyQuaternion(cq).add(cp); oq.copy(cq).multiply(P.q); m4.compose(op, oq, ONE); P.im.setMatrixAt(i, m4); }); });
    parts.forEach((P) => (P.im.instanceMatrix.needsUpdate = true)); });

  // o que aparece refletido no piso (camada 1): sala, janela, céu e prédios próximos — o Lumi fica na base, que não reflete
  [wall, frame, eCore, eHalo, wglow, tr, bench, desk, plant, sky, far, ...mulls].forEach((o) => o.traverse((c) => c.layers.enable(1)));
  G.userData.tick = (t) => { for (const fn of anim) fn(t); };
  G.userData.mirrorRT = mirror.userData.rt;
  G.userData.lowPower = () => { mirror.visible = false; sparks.visible = false; shafts.forEach((m) => (m.visible = false)); floor.material.envMapIntensity = 0.55; };
  return G;
}
/* ------------------------------------------------------------ quarto do Lumi à noite (tela de descanso) */
// Montado para a câmera da tela de descanso (de cima, olhando a cama); o palco reajusta a escala para qualquer tamanho do Lumi.
const BEDROOM_REF = { x: 0, dist: 13.035 };
function makeBedroom() {
  const G = new THREE.Group(), anim = [], tick = (fn) => anim.push(fn);
  const CY = 0x6fe8ff, LI = 0xb38bff, PK = 0xff8ad8, YE = 0xffd65a, WARM = 0xffc27a;
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
  const addM = (c, o, map) => basic(c, { map: map || null, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
  const gloss = (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.14, envMapIntensity: 0.5 }, o));
  const soft = (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.85, sheen: 1, sheenRoughness: 0.5, sheenColor: new C(0xffffff), envMapIntensity: 0.35 }, o));
  const glowT = radialTex([[0, 'rgba(255,255,255,1)'], [0.22, 'rgba(255,255,255,.6)'], [0.55, 'rgba(255,255,255,.14)'], [1, 'rgba(255,255,255,0)']]);
  const shadowT = radialTex([[0, 'rgba(14,8,48,.6)'], [0.5, 'rgba(14,8,48,.26)'], [1, 'rgba(14,8,48,0)']]);
  const halo = (c, s, o = 0.6) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.set(s, s, 1); return sp; };
  const blob = (w, d, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; return m; };
  const WHITE = gloss(0xf2f0ff);
  const starT = canvasTex(64, 64, (x, w) => { x.translate(w / 2, w / 2); x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 8; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 9 : 22; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); });

  /* ---------- parede com janela grande arredondada */
  const WZ = -5.5, X0 = -1.9, X1 = 1.9, Y0 = 0.75, Y1 = 3.3, WR = 0.62, WW = X1 - X0, WH = Y1 - Y0, WM = (Y0 + Y1) / 2;
  const wallS = new THREE.Shape(); wallS.moveTo(-12, -0.2); wallS.lineTo(12, -0.2); wallS.lineTo(12, 12); wallS.lineTo(-12, 12); wallS.closePath(); wallS.holes.push(rrShape(X0, Y0, WW, WH, WR, THREE.Path));
  const wallT = canvasTex(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a2470'); g.addColorStop(0.55, '#4a3c9e'); g.addColorStop(0.92, '#3a2f88'); g.addColorStop(1, '#2c2472'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const cx = w / 2, cy = (1 - (WM + 0.2) / 12.2) * h, r = x.createRadialGradient(cx, cy, 10, cx, cy, w * 0.32); r.addColorStop(0, 'rgba(150,160,255,.55)'); r.addColorStop(1, 'rgba(150,160,255,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 70; i++) { x.beginPath(); x.arc(Math.random() * w, Math.random() * h * 0.9, 1 + Math.random() * 1.6, 0, TAU); x.fill(); } });
  const wall = new THREE.Mesh(uvFit(new THREE.ShapeGeometry(wallS, 16), -12, -0.2, 24, 12.2), new THREE.MeshStandardMaterial({ map: wallT, roughness: 0.75, envMapIntensity: 0.25 })); wall.position.z = WZ; G.add(wall);
  const frameS = rrShape(X0 - 0.22, Y0 - 0.22, WW + 0.44, WH + 0.44, WR + 0.22); frameS.holes.push(rrShape(X0, Y0, WW, WH, WR, THREE.Path));
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(frameS, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 3, curveSegments: 16 }), WHITE); frame.position.z = WZ - 0.03; G.add(frame);
  const sill = new THREE.Mesh(roundBoxGeo(1, 3.2, WW / 2 + 0.32, 0.07, 0.24, 32), WHITE); sill.position.set(0, Y0 - 0.2, WZ + 0.22); G.add(sill);
  { const pts = rrShape(X0 + 0.03, Y0 + 0.03, WW - 0.06, WH - 0.06, WR - 0.03).getPoints(10).map((v) => new THREE.Vector3(v.x, v.y, WZ + 0.17)); pts.pop(); const cv = new THREE.CatmullRomCurve3(pts, true);
    const core = new THREE.Mesh(new THREE.TubeGeometry(cv, 120, 0.02, 6, true), basic(0x9fd8ff)), hal = new THREE.Mesh(new THREE.TubeGeometry(cv, 120, 0.08, 6, true), addM(LI, 0.3)); G.add(core, hal); tick((t) => (hal.material.opacity = 0.24 + 0.08 * Math.sin(t * 1.2))); }
  const mull = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, WH - 0.1, 4, 10), WHITE); mull.position.set(0, WM, WZ - 0.01); G.add(mull);

  /* ---------- lá fora: céu da noite, lua, estrelas cadentes e cidade com janelas acesas */
  const skyT = canvasTex(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#070b33'); g.addColorStop(0.45, '#1c1c66'); g.addColorStop(0.78, '#4a2f8f'); g.addColorStop(1, '#a35bb8'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const nx = Math.random() * w, ny = Math.random() * h * 0.6, nr = 30 + Math.random() * 70, ng = x.createRadialGradient(nx, ny, 0, nx, ny, nr); ng.addColorStop(0, 'rgba(140,110,255,.10)'); ng.addColorStop(1, 'rgba(140,110,255,0)'); x.fillStyle = ng; x.fillRect(nx - nr, ny - nr, nr * 2, nr * 2); }
    for (let i = 0; i < 220; i++) { const y = Math.random() * h * 0.8; x.globalAlpha = 0.3 + Math.random() * 0.7; x.fillStyle = '#fff'; x.beginPath(); x.arc(Math.random() * w, y, 0.5 + Math.random() * 1.3, 0, TAU); x.fill(); } x.globalAlpha = 1; });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(16, 11), basic(0xffffff, { map: skyT })); sky.position.set(0, 3.2, -16); G.add(sky);
  const moonT = canvasTex(256, 256, (x, w) => { const g = x.createRadialGradient(w * 0.42, w * 0.42, 6, w / 2, w / 2, w * 0.36); g.addColorStop(0, '#fffbe8'); g.addColorStop(1, '#ffe7a8'); x.fillStyle = g; x.beginPath(); x.arc(w / 2, w / 2, w * 0.36, 0, TAU); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(w * 0.66, w * 0.4, w * 0.32, 0, TAU); x.fill(); });
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), basic(0xffffff, { map: moonT, transparent: true, depthWrite: false })); moon.position.set(2.2, 1.75, -15.5); G.add(moon);
  const moonH = halo(0xfff1c4, 4.2, 0.45); moonH.position.set(2.05, 1.75, -15.6); G.add(moonH);
  const skyline = (seed, base, col, lit, hmin, hmax, n) => canvasTex(1024, 256, (x, w, h) => { let sd = seed; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) { const bw = 26 + r() * 50, bh = hmin + r() * (hmax - hmin), bx = r() * w; x.fillStyle = col; ctxRR(x, bx, h - bh, bw, bh + 20, Math.min(bw / 2, 16)); x.fill(); if (r() < 0.4) { x.beginPath(); x.arc(bx + bw / 2, h - bh + 2, bw / 2, Math.PI, 0); x.fill(); }
      for (let yy = h - bh + 14; yy < h - 6; yy += 11) for (let xx = bx + 6; xx < bx + bw - 6; xx += 9) if (r() < 0.32) { x.fillStyle = r() < 0.25 ? '#ffb3ea' : r() < 0.55 ? lit : '#7ff3ff'; x.globalAlpha = 0.5 + r() * 0.5; x.fillRect(xx, yy, 4, 5); x.globalAlpha = 1; }
      if (r() < 0.3) { x.fillStyle = r() < 0.5 ? '#ff6fb8' : '#4fe3ff'; x.fillRect(bx + bw / 2 - 1, h - bh - 18, 2, 18); x.beginPath(); x.arc(bx + bw / 2, h - bh - 19, 3, 0, TAU); x.fill(); } }
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(120,80,190,0)'); g.addColorStop(1, 'rgba(120,80,190,' + base + ')'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const far = new THREE.Mesh(new THREE.PlaneGeometry(15, 3.8), basic(0xffffff, { map: skyline(7, 0.55, '#2b2470', '#ffe9a8', 70, 200, 40), transparent: true })); far.position.set(0, 0.0, -14); G.add(far);
  const near = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), basic(0xffffff, { map: skyline(19, 0.3, '#16124a', '#ffd88a', 60, 220, 22), transparent: true })); near.position.set(0.3, -0.55, -11); G.add(near);
  // estrela cadente e carro voador passando de vez em quando
  const shootT = canvasTex(128, 8, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const shoot = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.05), addM(0xffffff, 0, shootT)); shoot.position.z = -15; shoot.rotation.z = -0.42; G.add(shoot);
  tick((t) => { const c = t % 7.5, k = c / 1.1; shoot.visible = c < 1.1; if (!shoot.visible) return; const sx = -3 + (Math.floor(t / 7.5) % 3) * 1.6; shoot.position.set(sx + k * 3.2, 2.5 - k * 1.2, -15); shoot.material.opacity = Math.sin(k * Math.PI) * 0.9; });
  const car = new THREE.Group(); G.add(car);
  { const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 4, 8), basic(0xe9ecff)); body.rotation.z = Math.PI / 2; car.add(body); const tl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.045), addM(0xff8ad8, 0.85, shootT)); tl.position.x = -0.62; car.add(tl); const lt = halo(0x9ff3ff, 0.3, 0.8); lt.position.x = 0.14; car.add(lt); }
  tick((t) => { const c = t % 13, k = c / 6; car.visible = c < 6; car.position.set(-4.5 + k * 9, 1.55 + Math.sin(k * 3) * 0.08, -12.5); });

  /* ---------- cortinas fofas, varal de luzinhas e estrelas que brilham no escuro */
  const curtain = (sd) => { const g = new THREE.PlaneGeometry(0.62, 3.5, 16, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), pinch = y < -0.6 ? 0.55 + 0.45 * ((y + 1.75) / 1.15) : 1; p.setXYZ(i, x * pinch, y, Math.sin((x + 0.31) * 31) * 0.05); } g.computeVertexNormals();
    const m = new THREE.Mesh(g, soft(0xb69cff, { side: THREE.DoubleSide })); m.position.set(sd * (WW / 2 + 0.28), WM + 0.12, WZ + 0.3); return m; };
  G.add(curtain(-1), curtain(1));
  const rod = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, WW + 1.2, 4, 8), gloss(0xffd28a)); rod.rotation.z = Math.PI / 2; rod.position.set(0, WM + 1.87, WZ + 0.32); G.add(rod);
  const bulbs = [], NB = 15; for (let i = 0; i < NB; i++) { const u = i / (NB - 1), x = X0 - 0.1 + u * (WW + 0.2); bulbs.push(new THREE.Vector3(x, Y1 + 0.3 - Math.sin(u * Math.PI) * 0.32, WZ + 0.36)); }
  G.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bulbs), 60, 0.008, 4), basic(0x3a3270)));
  const bc = [new C(0xffd65a), new C(PK), new C(CY), new C(0xffffff)], bg = new THREE.BufferGeometry(), bcol = new Float32Array(NB * 3); bg.setFromPoints(bulbs); bg.setAttribute('color', new THREE.BufferAttribute(bcol, 3));
  G.add(new THREE.Points(bg, new THREE.PointsMaterial({ size: 0.26, map: glowT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), basic(0xffffff), NB); bulbs.forEach((b, i) => { dots.setMatrixAt(i, new THREE.Matrix4().setPosition(b)); dots.setColorAt(i, bc[i % 4]); }); G.add(dots);
  tick((t) => { for (let i = 0; i < NB; i++) { const c = bc[i % 4], k = 0.55 + 0.45 * Math.max(0, Math.sin(t * 2.2 + i * 1.3)); bcol[i * 3] = c.r * k; bcol[i * 3 + 1] = c.g * k; bcol[i * 3 + 2] = c.b * k; } bg.attributes.color.needsUpdate = true; });
  const fs = []; let sd = 9; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  while (fs.length < 22) { const x = -2.3 + rr() * 4.6, z = -5 + rr() * 6.4; if (Math.abs(x) < 1.45 && z > -1.7 && z < 1.0) continue; fs.push(new THREE.Vector3(x, 0.03, z)); }
  const sg = new THREE.BufferGeometry(); sg.setFromPoints(fs); const scol = new Float32Array(fs.length * 3); sg.setAttribute('color', new THREE.BufferAttribute(scol, 3));
  G.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.2, map: starT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
  const sCol = [new C(0xfff3a0), new C(0xbff6ff), new C(0xffc7ee)];
  tick((t, night) => { fs.forEach((_, i) => { const c = sCol[i % 3], k = (0.35 + 0.45 * night) * (0.55 + 0.45 * Math.sin(t * 1.4 + i * 2.1)); scol[i * 3] = c.r * k; scol[i * 3 + 1] = c.g * k; scol[i * 3 + 2] = c.b * k; }); sg.attributes.color.needsUpdate = true; });

  /* ---------- piso macio, tapete redondo, luar no chão */
  const floorT = canvasTex(256, 256, (x, w) => { x.fillStyle = '#3b2f7e'; x.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#41348a' : '#382c78'; x.fillRect(0, i * 64, w, 62); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, i * 64 + 62, w, 2); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(5, 5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshPhysicalMaterial({ map: floorT, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 6); floor.receiveShadow = true; G.add(floor);
  const rugT = canvasTex(512, 512, (x, w) => { const c = w / 2; [['#6a4fd0', 250], ['#8f72ee', 232], ['#6a4fd0', 196], ['#a68cf6', 180], ['#7a5fe0', 120], ['#b39cfa', 104]].forEach(([col, r]) => { x.fillStyle = col; x.beginPath(); x.arc(c, c, r, 0, TAU); x.fill(); });
    x.fillStyle = '#ffe27a'; for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; x.save(); x.translate(c + Math.cos(a) * 214, c + Math.sin(a) * 214); x.beginPath(); for (let k = 0; k < 10; k++) { const b = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 4 : 9; x.lineTo(Math.cos(b) * r, Math.sin(b) * r); } x.fill(); x.restore(); } });
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.3, 0.05, 72), [soft(0x5a40b8), soft(0xffffff, { map: rugT }), soft(0x5a40b8)]); rug.scale.z = 0.82; rug.position.set(0, 0.02, -0.3); rug.receiveShadow = true; G.add(rug);
  const beamT = canvasTex(128, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(200,220,255,.7)'); g.addColorStop(1, 'rgba(200,220,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); const e = x.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.5, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = e; x.fillRect(0, 0, w, h); });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.2), addM(0x9fb8ff, 0.22, beamT)); pool.rotation.x = -Math.PI / 2; pool.position.set(0.2, 0.03, WZ + 2.3); G.add(pool);
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.5), addM(0xb8ccff, 0.07, beamT)); shaft.position.set(0.15, 1.9, WZ + 1.3); shaft.rotation.x = -0.62; G.add(shaft);
  tick((t, night) => { pool.material.opacity = 0.18 + 0.08 * night; shaft.material.opacity = 0.05 + 0.04 * night + 0.015 * Math.sin(t * 0.7); });

  /* ---------- criado-mudo com abajur de lua (esquerda) */
  const stand = new THREE.Group(); stand.position.set(-1.55, 0, -3.7); G.add(stand);
  { const b = new THREE.Mesh(roundBoxGeo(1, 3.2, 0.4, 0.4, 0.34, 32), WHITE); b.position.y = 0.4; stand.add(b);
    const top = new THREE.Mesh(roundBoxGeo(1, 3, 0.42, 0.06, 0.36, 28), soft(0xb69cff)); top.position.y = 0.82; stand.add(top);
    const dr = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 20), gloss(0xffd28a)); dr.position.set(0, 0.45, 0.34); stand.add(dr); stand.add(blob(1.1, 0.9, 0.8)); }
  const lampG = new THREE.Group(); lampG.position.set(-1.55, 0.86, -3.7); G.add(lampG);
  lampG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.06, 24), gloss(0xffd28a)));
  { const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 10), gloss(0xffd28a)); stem.position.y = 0.17; lampG.add(stem); }
  const lampM = basic(0xffe6a8), lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), lampM); lamp.position.y = 0.48; lampG.add(lamp);
  const lampH = halo(WARM, 1.5, 0.6); lampH.position.y = 0.48; lampG.add(lampH);
  const pool2 = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), addM(WARM, 0.2, glowT)); pool2.rotation.x = -Math.PI / 2; pool2.position.set(-1.45, 0.03, -3.4); G.add(pool2);
  tick((t, night) => { const k = 1 - 0.55 * night; lampH.material.opacity = (0.5 + 0.08 * Math.sin(t * 1.8)) * k; pool2.material.opacity = 0.2 * k; lampM.color.setHex(night > 0.5 ? 0xffd88a : 0xffe6a8); });

  /* ---------- estante baixa com livros, foguete de brinquedo e planeta holográfico (direita) */
  const shelf = new THREE.Group(); shelf.position.set(1.6, 0, -4.0); shelf.rotation.y = -0.25; G.add(shelf);
  { const b = new THREE.Mesh(roundBoxGeo(1, 3.4, 0.62, 0.55, 0.32, 36), WHITE); b.position.y = 0.55; shelf.add(b);
    const inn = new THREE.Mesh(roundBoxGeo(1, 3.2, 0.52, 0.42, 0.2, 28), soft(0x7b62e0)); inn.position.set(0, 0.55, 0.14); shelf.add(inn);
    const cols = [0xff6fa8, 0x4fc3ff, 0xffd54f, 0x9b7bff, 0x5fd39a, 0xff9a4d], bk = new THREE.InstancedMesh(roundBoxGeo(1, 3.2, 0.05, 0.16, 0.12, 14), gloss(0xffffff, { roughness: 0.45, clearcoat: 0.4 }), 7);
    for (let i = 0; i < 7; i++) { bk.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(-0.38 + i * 0.12, 0.62, 0.2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, i === 6 ? 0.25 : 0)), new THREE.Vector3(1, 0.85 + ((i * 7) % 4) * 0.08, 1))); bk.setColorAt(i, new C(cols[i % 6])); }
    shelf.add(bk); shelf.add(blob(1.6, 0.9, 0.8));
    const rk = new THREE.Group(); rk.position.set(-0.3, 1.1, 0); rk.rotation.z = 0.12; shelf.add(rk);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 6, 14), gloss(0xffffff)); body.position.y = 0.2; rk.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 16), gloss(0xff5a8a)); nose.position.y = 0.43; rk.add(nose);
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), basic(0x7fe6ff)); win.position.set(0, 0.24, 0.092); rk.add(win);
    for (const a of [0, 2.1, 4.2]) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.08), gloss(0xff5a8a)); fin.position.set(Math.sin(a) * 0.09, 0.07, Math.cos(a) * 0.09); fin.rotation.y = a; rk.add(fin); } }
  const planet = new THREE.Group(); planet.position.set(0.3, 1.45, 0); shelf.add(planet);
  const pw = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 2), basic(0x8ff6ff, { wireframe: true, transparent: true, opacity: 0.8 })); planet.add(pw);
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12), addM(0x4fd6ff, 0.35)));
  const pr = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.01, 6, 48), basic(PK)); pr.rotation.x = 1.2; planet.add(pr);
  const ph = halo(0x7feaff, 0.9, 0.35); planet.add(ph);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.05, 0.32, 20, 1, true), addM(0x9ff3ff, 0.25)); beam.material.side = THREE.DoubleSide; beam.position.set(0.3, 1.22, 0); shelf.add(beam);
  const proj = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 20), gloss(0xffffff)); proj.position.set(0.3, 1.08, 0); shelf.add(proj);
  tick((t) => { pw.rotation.y = t * 0.6; pr.rotation.z = t * 0.9; planet.position.y = 1.45 + Math.sin(t * 1.3) * 0.04; ph.material.opacity = 0.28 + 0.08 * Math.sin(t * 2); });

  /* ---------- almofadas e brinquedos no tapete, plantinha */
  const cush = new THREE.InstancedMesh(roundBoxGeo(0.24, 3, 1, 0.55, 0.9, 20), soft(0xffffff), 2);
  [[-1.85, 0.14, -1.7, PK, 0.4], [1.88, 0.14, -2.0, CY, -0.5]].forEach(([x, y, z, c, r], i) => { cush.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r, 0)), new THREE.Vector3(1, 1, 1))); cush.setColorAt(i, new C(c)); });
  G.add(cush); { const s1 = blob(0.8, 0.7, 0.6); s1.position.set(-1.85, 0.03, -1.7); const s2 = blob(0.8, 0.7, 0.6); s2.position.set(1.88, 0.03, -2.0); G.add(s1, s2); }
  const ball = sph(0.13, gloss(0xffd65a), 20); ball.position.set(1.75, 0.13, -0.9); G.add(ball);
  const pot = new THREE.Group(); pot.position.set(1.95, 0, -2.95); G.add(pot);
  pot.add(new THREE.Mesh(smoothLathe([[0.001, 0], [0.16, 0], [0.2, 0.08], [0.22, 0.3], [0.001, 0.3]], 24, 12), WHITE));
  const leaves = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), soft(0xffffff), 5);
  [[0, 0.5, 0, 0.2, 0x47c98d], [-0.14, 0.62, 0.04, 0.15, 0x6fe2a9], [0.14, 0.64, 0, 0.15, 0x6fe2a9], [0.02, 0.78, 0.02, 0.14, 0x47c98d], [0, 0.4, 0.12, 0.12, 0x6fe2a9]].forEach(([x, y, z, r, c], i) => { leaves.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(r, r, r))); leaves.setColorAt(i, new C(c)); });
  pot.add(leaves); pot.add(blob(0.7, 0.6, 0.7));

  // vaga-lumes / pó de estrela no luar
  const NP = 26, pg = new THREE.BufferGeometry(), pp = new Float32Array(NP * 3), pc = new Float32Array(NP * 3), seeds = [];
  for (let i = 0; i < NP; i++) seeds.push([-2 + Math.random() * 4, Math.random() * 3.4, -5 + Math.random() * 4.5, Math.random() * TAU, 0.06 + Math.random() * 0.1]);
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
  const sparks = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.07, map: glowT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sparks.frustumCulled = false; G.add(sparks);
  const spA = new C(0xfff1a8), spB = new C(0xbfe8ff);
  tick((t) => { for (let i = 0; i < NP; i++) { const s = seeds[i], y = (s[1] + t * s[4]) % 3.6, tw = 0.3 + 0.7 * Math.max(0, Math.sin(t * 1.8 + s[3] * 3)), fd = Math.min(1, y * 2, (3.6 - y) * 2) * tw, c = i % 2 ? spA : spB;
      pp[i * 3] = s[0] + Math.sin(t * 0.4 + s[3]) * 0.2; pp[i * 3 + 1] = 0.3 + y; pp[i * 3 + 2] = s[2]; pc[i * 3] = c.r * fd; pc[i * 3 + 1] = c.g * fd; pc[i * 3 + 2] = c.b * fd; }
    pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; });

  G.userData.tick = (t, night = 0) => { for (const fn of anim) fn(t, night); };
  G.userData.lowPower = () => { sparks.visible = false; shaft.visible = false; };
  return G;
}
/* ------------------------------------------------------------ peças comuns dos cômodos 3D */
function roomKit() {
  const anim = [], tick = (fn) => anim.push(fn);
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
  const addM = (c, o, map) => basic(c, { map: map || null, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending });
  const gloss = (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.14, envMapIntensity: 0.55 }, o));
  const soft = (c, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.82, sheen: 1, sheenRoughness: 0.5, sheenColor: new C(0xffffff), envMapIntensity: 0.4 }, o));
  const glowT = radialTex([[0, 'rgba(255,255,255,1)'], [0.22, 'rgba(255,255,255,.6)'], [0.55, 'rgba(255,255,255,.14)'], [1, 'rgba(255,255,255,0)']]);
  const shadowT = radialTex([[0, 'rgba(30,20,90,.5)'], [0.5, 'rgba(30,20,90,.2)'], [1, 'rgba(30,20,90,0)']]);
  const halo = (c, s, o = 0.6) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.set(s, s, 1); return sp; };
  const blob = (w, d, o = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowT, transparent: true, opacity: o, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; return m; };
  const box = (sx, sy, sz, m, e = 3.4) => new THREE.Mesh(roundBoxGeo(1, e, sx / 2, sy / 2, sz / 2, 28), m);
  const glowLine = (pts, c, r = 0.02, hr = 0.07, ho = 0.3) => { const cv = new THREE.CatmullRomCurve3(pts); return [new THREE.Mesh(new THREE.TubeGeometry(cv, 40, r, 6), basic(c)), new THREE.Mesh(new THREE.TubeGeometry(cv, 40, hr, 6), addM(c, ho))]; };
  const holoPanel = (w, h, draw, tint = 0x9ff3ff) => { // tela holográfica com texto/ícones desenhados, linhas que correm e brilho
    const g = new THREE.Group(), cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round((512 * h) / w); const x = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const paint = () => { const W = cv.width, H = cv.height; x.clearRect(0, 0, W, H); ctxRR(x, 10, 10, W - 20, H - 20, 40); const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(38,86,226,.84)'); gr.addColorStop(1, 'rgba(26,38,160,.78)'); x.fillStyle = gr; x.fill();
      x.save(); x.shadowColor = '#5ff0ff'; x.shadowBlur = 18; x.strokeStyle = '#b4f7ff'; x.lineWidth = 6; x.stroke(); x.restore(); draw(x, W, H); tex.needsUpdate = true; };
    paint(); if (document.fonts && document.fonts.load) document.fonts.load("700 60px 'Fredoka'").then(paint).catch(() => {});
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic(0xffffff, { map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); g.add(scr);
    const hb = halo(tint, Math.max(w, h) * 1.5, 0.3); hb.position.z = -0.05; hb.scale.set(w * 1.6, h * 1.6, 1); g.add(hb);
    tick((t) => { const fl = Math.sin(t * 17 + w) > 0.985 ? 0.6 : 1; scr.material.opacity = (0.92 + 0.08 * Math.sin(t * 2.4)) * fl; hb.material.opacity = 0.24 + 0.08 * Math.sin(t * 1.9); });
    return g;
  };
  const F = "'Fredoka', 'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif";
  const sparks = (G, n, x0, x1, y0, y1, z0, z1, cA, cB) => { // brilhinhos subindo devagar
    const pg = new THREE.BufferGeometry(), pp = new Float32Array(n * 3), pc = new Float32Array(n * 3), sd = []; for (let i = 0; i < n; i++) sd.push([x0 + Math.random() * (x1 - x0), Math.random() * (y1 - y0), z0 + Math.random() * (z1 - z0), Math.random() * TAU, 0.06 + Math.random() * 0.1]);
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    const P = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.07, map: glowT, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); P.frustumCulled = false; G.add(P);
    const a = new C(cA), b = new C(cB), H = y1 - y0;
    tick((t) => { for (let i = 0; i < n; i++) { const s = sd[i], y = (s[1] + t * s[4]) % H, tw = 0.3 + 0.7 * Math.max(0, Math.sin(t * 1.8 + s[3] * 3)), fd = Math.min(1, y * 2, (H - y) * 2) * tw, c = i % 2 ? a : b;
      pp[i * 3] = s[0] + Math.sin(t * 0.4 + s[3]) * 0.2; pp[i * 3 + 1] = y0 + y; pp[i * 3 + 2] = s[2]; pc[i * 3] = c.r * fd; pc[i * 3 + 1] = c.g * fd; pc[i * 3 + 2] = c.b * fd; }
      pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true; });
    return P;
  };
  const floorTiles = (c1, c2, rep, gloss = true) => { const t = canvasTex(256, 256, (x, w) => { x.fillStyle = c2; x.fillRect(0, 0, w, w); for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { ctxRR(x, i * 128 + 3, j * 128 + 3, 122, 122, 18); x.fillStyle = (i + j) % 2 ? c1 : c2; x.fill(); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2; x.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.3, clearcoat: gloss ? 1 : 0, clearcoatRoughness: 0.1, envMapIntensity: 0.45 }));
    m.rotation.x = -Math.PI / 2; m.position.set(0, 0, 8); m.receiveShadow = true; return m; };
  const wallWith = (z, texDraw, holes = []) => { const S = new THREE.Shape(); S.moveTo(-12, -0.2); S.lineTo(12, -0.2); S.lineTo(12, 12); S.lineTo(-12, 12); S.closePath(); holes.forEach((h) => S.holes.push(h));
    const m = new THREE.Mesh(uvFit(new THREE.ShapeGeometry(S, 24), -12, -0.2, 24, 12.2), new THREE.MeshStandardMaterial({ map: canvasTex(512, 512, texDraw), roughness: 0.7, envMapIntensity: 0.3 })); m.position.z = z; return m; };
  return { anim, tick, basic, addM, gloss, soft, glowT, halo, blob, box, glowLine, holoPanel, F, sparks, floorTiles, wallWith };
}
const ROOM_REF = { x: 0, dist: 12.138 }; // câmera das telas de lanche e de acessórios (Lumi bebê)

/* ------------------------------------------------------------ cozinha futurista (tela de lanche) */
function makeKitchen() {
  const K = roomKit(), { tick, basic, addM, gloss, soft, halo, blob, box, glowLine, holoPanel, F } = K, G = new THREE.Group();
  const CY = 0x4fe3ff, PK = 0xff8ad8, YE = 0xffd65a, WHITE = gloss(0xf6f5ff), MINT = gloss(0x8ce8d2), LIL = gloss(0xb9a4ff);
  const WZ = -6, R0 = { x: -1.45, y: 4.0, r: 0.72 };
  const hole = new THREE.Path(); hole.absarc(R0.x, R0.y, R0.r, 0, TAU, true);
  G.add(K.wallWith(WZ, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7563d8'); g.addColorStop(0.5, '#9d8cf2'); g.addColorStop(1, '#8472e4'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const by0 = h * (1 - 2.6 / 12.2), by1 = h * (1 - 1.05 / 12.2); for (let yy = by0; yy < by1; yy += 14) for (let xx = (Math.floor(yy / 14) % 2) * 9; xx < w; xx += 18) { ctxRR(x, xx + 1, yy + 1, 16, 12, 4); x.fillStyle = 'rgba(255,255,255,.55)'; x.fill(); } }, [hole]));
  // janela redonda com o céu de dia e a cidade
  const sky = new THREE.Mesh(new THREE.CircleGeometry(R0.r + 0.05, 48), basic(0xffffff, { map: canvasTex(256, 256, (x, w) => { const g = x.createLinearGradient(0, 0, 0, w); g.addColorStop(0, '#3d8cf7'); g.addColorStop(0.7, '#a9cdff'); g.addColorStop(1, '#e8f3ff'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    x.fillStyle = 'rgba(255,255,255,.9)'; for (const [cx, cy, r] of [[60, 70, 26], [90, 62, 30], [120, 72, 22], [180, 110, 18], [205, 104, 22]]) { x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); }
    let sd = 3; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 9; i++) { const bw = 22 + rr() * 26, bh = 60 + rr() * 110, bx = i * 30 - 10; x.fillStyle = rr() < 0.5 ? '#ffffff' : '#dfe9ff'; ctxRR(x, bx, w - bh, bw, bh + 10, bw / 2.4); x.fill(); x.fillStyle = '#5aa6f4'; for (let yy = w - bh + 16; yy < w - 6; yy += 14) x.fillRect(bx + 3, yy, bw - 6, 4); } }) }));
  sky.position.set(R0.x, R0.y, WZ - 0.4); G.add(sky);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R0.r + 0.06, 0.09, 12, 64), WHITE); ring.position.set(R0.x, R0.y, WZ + 0.02); G.add(ring);
  { const rg = new THREE.Mesh(new THREE.TorusGeometry(R0.r + 0.01, 0.018, 6, 64), basic(CY)); rg.position.set(R0.x, R0.y, WZ + 0.1); G.add(rg); const gl = new THREE.Mesh(new THREE.CircleGeometry(R0.r, 48), addM(0xe6f6ff, 0.18)); gl.position.set(R0.x, R0.y, WZ - 0.02); G.add(gl); }
  // balcão arredondado com tampo e faixa de luz, armários de cima com potes coloridos
  const counter = box(6.2, 1.0, 0.9, WHITE); counter.position.set(0, 0.5, WZ + 0.45); G.add(counter);
  const top = box(6.4, 0.12, 1.0, MINT, 4); top.position.set(0, 1.04, WZ + 0.48); G.add(top);
  { const [a, b] = glowLine([new THREE.Vector3(-3.1, 0.12, WZ + 0.92), new THREE.Vector3(3.1, 0.12, WZ + 0.92)], CY); G.add(a, b); }
  for (const x of [-2.2, -0.75, 0.75]) { const d = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 18), gloss(0xffd28a)); d.position.set(x, 0.62, WZ + 0.91); G.add(d); }
  const shelf = box(3.4, 0.08, 0.36, WHITE); shelf.position.set(0.55, 2.85, WZ + 0.2); G.add(shelf);
  const jars = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 18), gloss(0xffffff, { transparent: true, opacity: 0.9 }), 6), lids = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 18), gloss(0xffffff), 6);
  [[-0.7, 0xff6f91], [-0.35, 0xffd65a], [0, 0x7be08a], [0.95, 0x7fd6ff], [1.3, 0xc49bff], [1.65, 0xff9a4d]].forEach(([x, c], i) => { jars.setMatrixAt(i, new THREE.Matrix4().setPosition(x, 3.02, WZ + 0.22)); jars.setColorAt(i, new C(c)); lids.setMatrixAt(i, new THREE.Matrix4().setPosition(x, 3.18, WZ + 0.22)); lids.setColorAt(i, new C([PK, CY, YE][i % 3])); });
  G.add(jars, lids);
  // geladeira com tela holográfica de comidas
  const fr = new THREE.Group(); fr.position.set(1.75, 0, WZ + 0.55); G.add(fr);
  { const b = box(1.15, 3.3, 0.9, WHITE, 3.8); b.position.y = 1.65; fr.add(b); const ln = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.02, 0.02), basic(0xc9c4f0)); ln.position.set(0, 2.25, 0.46); fr.add(ln);
    for (const y of [1.4, 2.7]) { const hd = box(0.07, 0.5, 0.07, gloss(0xffd28a)); hd.position.set(-0.42, y, 0.5); fr.add(hd); } fr.add(blob(1.6, 1.0, 0.7)); }
  const menu = holoPanel(0.82, 0.62, (x, w, h) => { x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 64px ${F}`; x.fillStyle = '#ffe56e'; x.shadowColor = '#ffae00'; x.shadowBlur = 14; x.fillText('Yummy!', w / 2, h * 0.3); x.shadowBlur = 0; x.font = '84px serif'; ['🍎', '🍌', '🍪'].forEach((e, i) => x.fillText(e, w * (0.24 + i * 0.26), h * 0.7)); });
  menu.position.set(1.72, 1.55, WZ + 1.03); G.add(menu);
  // fruteira, plantinha e lâmpadas penduradas
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 12, 0, TAU, Math.PI / 2, Math.PI / 2), gloss(0xffffff, { side: THREE.DoubleSide })); bowl.position.set(-1.55, 1.38, WZ + 0.5); G.add(bowl);
  const fruit = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 18, 14), gloss(0xffffff, { clearcoat: 1, roughness: 0.25 }), 4);
  [[-1.68, 1.25, 0xff4a5f], [-1.45, 1.27, 0xffb43a], [-1.58, 1.42, 0x7be08a], [-1.38, 1.4, 0xff4a5f]].forEach(([x, y, c], i) => { fruit.setMatrixAt(i, new THREE.Matrix4().setPosition(x, y, WZ + 0.5)); fruit.setColorAt(i, new C(c)); }); G.add(fruit);
  const ban = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 18, 2.2), gloss(0xffd84a)); ban.position.set(-1.5, 1.5, WZ + 0.55); ban.rotation.z = 2.5; G.add(ban);
  const pot = new THREE.Group(); pot.position.set(-2.55, 1.1, WZ + 0.5); G.add(pot);
  pot.add(new THREE.Mesh(smoothLathe([[0.001, 0], [0.13, 0], [0.16, 0.06], [0.17, 0.22], [0.001, 0.22]], 20, 10), LIL));
  const lv = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 9), soft(0xffffff), 4); [[0, 0.36, 0, 0.16, 0x47c98d], [-0.1, 0.46, 0.02, 0.12, 0x6fe2a9], [0.1, 0.47, 0, 0.12, 0x6fe2a9], [0.02, 0.58, 0.02, 0.1, 0x47c98d]].forEach(([x, y, z, r, c], i) => { lv.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(r, r, r))); lv.setColorAt(i, new C(c)); }); pot.add(lv);
  [[-0.95, 4.75, -4.6, PK], [0.95, 4.95, -5.0, CY]].forEach(([x, y, z, c], i) => { const g = new THREE.Group(); g.position.set(x, y, z); G.add(g);
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 12, 0, TAU, 0, Math.PI / 2), gloss(c, { side: THREE.DoubleSide })); g.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), basic(0xfff3c8)); bulb.position.y = -0.03; g.add(bulb); const h = halo(0xffe2a0, 1.3, 0.45); h.position.y = -0.1; g.add(h);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 3, 6), basic(0x6a5aa8)); cord.position.y = 1.6; g.add(cord);
    tick((t) => { g.rotation.z = Math.sin(t * 0.7 + i) * 0.03; h.material.opacity = 0.4 + 0.08 * Math.sin(t * 1.5 + i); }); });
  G.add(K.floorTiles('#e9e4ff', '#cfc6fb', 7));
  { const b = blob(7, 1.2, 0.6); b.position.set(0, 0.013, WZ + 1.05); G.add(b); }
  K.sparks(G, 18, -2.4, 2.4, 0.4, 4.2, -5, -2, 0xfff1a8, 0xbff6ff);
  G.userData.tick = (t) => { for (const fn of K.anim) fn(t); };
  return G;
}

/* ------------------------------------------------------------ closet fashion (tela de acessórios) */
function makeCloset() {
  const K = roomKit(), { tick, basic, addM, gloss, soft, halo, blob, box, glowLine, holoPanel, F } = K, G = new THREE.Group();
  const CY = 0x4fe3ff, PK = 0xff7ac0, YE = 0xffd65a, LI = 0xb38bff, WHITE = gloss(0xfbf7ff);
  const WZ = -6;
  G.add(K.wallWith(WZ, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#b06fd8'); g.addColorStop(0.5, '#e3b0f2'); g.addColorStop(1, '#c48ae6'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 3; for (let k = 0; k < w; k += 42) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k, h); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 40; i++) { const sx = Math.random() * w, sy = Math.random() * h * 0.7; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2.5 : 6; x.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } x.fill(); } }));
  // guarda-roupa aberto à esquerda: prateleiras com luz, roupas dobradas, chapéus e sapatos
  const wd = new THREE.Group(); wd.position.set(-1.75, 0, WZ + 0.45); G.add(wd);
  { const b = box(1.5, 3.6, 0.8, WHITE, 3.6); b.position.y = 1.8; wd.add(b); const inn = box(1.32, 3.36, 0.5, soft(0xf2c9ff), 3.2); inn.position.set(0, 1.8, 0.2); wd.add(inn);
    for (const y of [0.75, 1.6, 2.45]) { const [a, c] = glowLine([new THREE.Vector3(-0.6, y, 0.42), new THREE.Vector3(0.6, y, 0.42)], CY, 0.015, 0.05, 0.35); wd.add(a, c); const sh = box(1.3, 0.05, 0.42, WHITE, 4); sh.position.set(0, y - 0.03, 0.2); wd.add(sh); }
    const folds = new THREE.InstancedMesh(roundBoxGeo(1, 3, 0.2, 0.06, 0.15, 14), soft(0xffffff), 9); let k = 0;
    for (const y of [0.82, 1.67]) for (let i = 0; i < 4; i++, k++) { folds.setMatrixAt(k, new THREE.Matrix4().compose(new THREE.Vector3(-0.42 + i * 0.28, y + 0.06 + (i % 2) * 0.12, 0.25), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1))); folds.setColorAt(k, new C([PK, CY, YE, 0x8f7bff][(i + k) % 4])); }
    folds.setMatrixAt(8, new THREE.Matrix4().setPosition(-0.42, 1.95, 0.25)); folds.setColorAt(8, new C(0x5fd39a)); wd.add(folds);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.32, 20), gloss(PK)); hat.position.set(0.1, 2.68, 0.25); wd.add(hat); const pom = sph(0.05, gloss(YE), 10); pom.position.set(0.1, 2.86, 0.25); wd.add(pom);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 10, 0, TAU, 0, Math.PI / 2), gloss(CY)); cap.position.set(-0.36, 2.48, 0.25); wd.add(cap);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.12, 8, 1, true), gloss(YE, { side: THREE.DoubleSide, metalness: 0.3 })); crown.position.set(0.42, 2.55, 0.25); wd.add(crown);
    const shoes = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.06, 0.12, 4, 10), gloss(0xffffff), 4); [[-0.4, 0xff5a8a], [-0.25, 0xff5a8a], [0.2, 0x4fc3ff], [0.35, 0x4fc3ff]].forEach(([x, c], i) => { shoes.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, 0.18, 0.3), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1))); shoes.setColorAt(i, new C(c)); }); wd.add(shoes);
    wd.add(blob(2, 1.1, 0.7)); }
  // arara com cabides e camisetas coloridas
  const rail = new THREE.Group(); rail.position.set(0.15, 0, WZ + 0.5); G.add(rail);
  { const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 1.7, 4, 8), gloss(0xffd28a, { metalness: 0.4 })); bar.rotation.z = Math.PI / 2; bar.position.y = 3.35; rail.add(bar);
    const shirts = new THREE.InstancedMesh(roundBoxGeo(1, 3, 0.16, 0.24, 0.05, 14), soft(0xffffff), 6), hangers = new THREE.InstancedMesh(new THREE.TorusGeometry(0.08, 0.01, 4, 12, Math.PI), gloss(0xffffff), 6);
    [PK, YE, CY, 0x8f7bff, 0x5fd39a, 0xff9a4d].forEach((c, i) => { const x = -0.7 + i * 0.28; shirts.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, 3.02, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.5, 0)), new THREE.Vector3(1, 1, 1))); shirts.setColorAt(i, new C(c)); hangers.setMatrixAt(i, new THREE.Matrix4().setPosition(x, 3.3, 0)); });
    rail.add(shirts, hangers); tick((t) => { rail.rotation.z = Math.sin(t * 0.6) * 0.004; }); }
  // espelho oval com moldura que brilha
  const mir = new THREE.Group(); mir.position.set(1.75, 1.95, WZ + 0.3); G.add(mir);
  { const fr = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 12, 64), gloss(YE, { metalness: 0.35 })); fr.scale.y = 1.75; mir.add(fr);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48), basic(0xffffff, { map: canvasTex(128, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#f6f9ff'); g.addColorStop(0.55, '#d6e2ff'); g.addColorStop(1, '#b4c4f2'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.55)'; x.translate(w / 2, h / 2); x.rotate(-0.5); x.fillRect(-60, -70, 14, 140); x.fillRect(-36, -70, 6, 140); }) })); gl.scale.y = 1.75; gl.position.z = -0.01; mir.add(gl);
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 2.2), addM(0xffffff, 0.35)); sw.rotation.z = 0.5; sw.position.z = 0.02; mir.add(sw);
    const fg = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.1, 8, 64), addM(PK, 0.3)); fg.scale.y = 1.75; mir.add(fg);
    tick((t) => { const k = ((t * 0.25) % 2.4) - 1.2; sw.position.x = k * 0.5; sw.material.opacity = 0.3 * Math.max(0, 1 - Math.abs(k)); fg.material.opacity = 0.22 + 0.1 * Math.sin(t * 1.6); }); }
  { const b = blob(1.4, 0.8, 0.5); b.position.set(1.75, 0.013, WZ + 0.55); G.add(b); }
  // holograma "Style!" e holofotes no Lumi
  const sign = holoPanel(0.9, 0.42, (x, w, h) => { x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 92px ${F}`; x.fillStyle = '#ffe56e'; x.shadowColor = '#ff7ac0'; x.shadowBlur = 16; x.fillText('Style!', w / 2, h * 0.54); }, PK);
  sign.position.set(1.7, 3.75, WZ + 0.6); G.add(sign); tick((t) => { sign.position.y = 3.75 + Math.sin(t * 1.2) * 0.04; });
  const spotT = canvasTex(32, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.0)'); g.addColorStop(0.15, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  [[-1.0, PK], [1.0, CY]].forEach(([x, c], i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.9, 5, 24, 1, true), addM(c, 0.16, spotT)); m.material.side = THREE.DoubleSide; m.position.set(x * 0.8, 2.7, -1.2); m.rotation.z = -x * 0.22; G.add(m);
    tick((t) => (m.material.opacity = 0.12 + 0.05 * Math.sin(t * 1.3 + i * 2))); });
  G.add(K.floorTiles('#f4e9ff', '#e2ccfa', 7));
  { const b = blob(7, 1.2, 0.5); b.position.set(0, 0.013, WZ + 1.05); G.add(b); }
  K.sparks(G, 24, -2.4, 2.4, 0.3, 4.4, -5, -1.5, 0xffe6a0, 0xffc7ee);
  G.userData.tick = (t) => { for (const fn of K.anim) fn(t); };
  return G;
}
// cômodos 3D por tela (data-scene): cada um com sua câmera de referência, as duas luzes coloridas e o contraluz
const ROOMS = {
  bedroom: { make: makeBedroom, ref: BEDROOM_REF, l: [[0x6fe8ff, 3, [1.75, 1.6, -3.7]], [0xffb86b, 6, [-1.5, 1.45, -3.4]]], rim: [0x8fb4ff, 2.0, 0xffc27a, 1.0], dim: true },
  kitchen: { make: makeKitchen, ref: ROOM_REF, l: [[0x6fe8ff, 4, [1.7, 1.6, -4.6]], [0xffd6a0, 5, [-1.2, 3.8, -4.2]]], rim: [0xbfe6ff, 2.2, 0xffd9b0, 1.2], pad: true },
  wardrobe: { make: makeCloset, ref: ROOM_REF, l: [[0xff8ad8, 5, [-0.9, 3.5, -2.0]], [0x6fe8ff, 5, [0.9, 3.5, -2.0]]], rim: [0xd8b8ff, 2.2, 0xffc0e8, 1.3], pad: true },
};
function makePad() { // base holográfica da escola: disco branco brilhante com anéis de luz
  const g = new THREE.Group();
  const top = canvasTex(512, 512, (x, w) => { const c = w / 2, gr = x.createRadialGradient(c, c, 0, c, c, c);
    gr.addColorStop(0, '#d9e2ff'); gr.addColorStop(0.55, '#b3bdf5'); gr.addColorStop(0.8, '#8f98e6'); gr.addColorStop(1, '#6e76cf'); x.fillStyle = gr; x.fillRect(0, 0, w, w);
    x.strokeStyle = 'rgba(79,227,255,.55)'; x.lineWidth = 6; for (const r of [150, 205]) { x.beginPath(); x.arc(c, c, r, 0, Math.PI * 2); x.stroke(); }
    x.strokeStyle = 'rgba(169,139,255,.45)'; x.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; x.beginPath(); x.moveTo(c + Math.cos(a) * 160, c + Math.sin(a) * 160); x.lineTo(c + Math.cos(a) * 200, c + Math.sin(a) * 200); x.stroke(); } });
  const side = new THREE.MeshPhysicalMaterial({ color: 0xc9cff7, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.14, 72), [side, new THREE.MeshPhysicalMaterial({ map: top, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }), side]);
  disc.receiveShadow = true; g.add(disc);
  const glow = new THREE.MeshBasicMaterial({ color: 0x4fe3ff, toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.96, 0.03, 10, 96), glow); ring.rotation.x = Math.PI / 2; ring.position.y = 0.04; g.add(ring);
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.95, 2.35, 96), new THREE.MeshBasicMaterial({ color: 0x4fe3ff, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = -0.05; g.add(halo);
  const rings = [[2.75, 0xb38bff, 0.5], [3.45, 0x4fe3ff, 0.32], [4.3, 0xb38bff, 0.18]].map(([r, c, o]) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 6, 120), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); m.rotation.x = Math.PI / 2; m.position.y = 0.07; m.userData.o = o; g.add(m); return m; });
  { const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(30,20,100,.5)'); gr.addColorStop(0.45, 'rgba(30,20,100,.22)'); gr.addColorStop(1, 'rgba(30,20,100,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.078; g.add(sh); } // sombra de contato embaixo do Lumi
  // frisos de luz no chão: pulsos correndo em direção ao Lumi
  const flowT = canvasTex(16, 128, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.15)'); gr.addColorStop(0.92, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
  flowT.wrapT = THREE.RepeatWrapping; flowT.repeat.set(1, 2);
  const flowM = new THREE.MeshBasicMaterial({ color: 0x7ff3ff, map: flowT, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  for (const a of [-2.6, -2.05, -1.57, -1.09, -0.54, 0, Math.PI]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 3.6), flowM); m.rotation.x = -Math.PI / 2; const wrap = new THREE.Group(); wrap.rotation.y = -a - Math.PI / 2; m.position.set(0, 0.075, -(2.3 + 1.8)); wrap.add(m); g.add(wrap); }
  g.userData.tick = (t) => { halo.material.opacity = 0.1 + Math.sin(t * 2.2) * 0.05; flowT.offset.y = (t * 0.35) % 1; rings.forEach((m, i) => (m.material.opacity = m.userData.o * (0.75 + 0.25 * Math.sin(t * 1.6 + i)))); };
  g.scale.z = 0.8; g.position.y = -0.06; return g;
}
function makeRug() {
  const t = canvasTex(512, 512, (x, w) => { const c = w / 2; [['#e8743b', 250], ['#fff1d6', 225], ['#f2a33a', 200], ['#fff1d6', 150], ['#e8743b', 128], ['#ffd27a', 100], ['#fff1d6', 50]].forEach(([col, r]) => { x.fillStyle = col; x.beginPath(); x.arc(c, c, r, 0, Math.PI * 2); x.fill(); });
    x.fillStyle = '#e8743b'; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; x.beginPath(); x.arc(c + Math.cos(a) * 175, c + Math.sin(a) * 175, 9, 0, Math.PI * 2); x.fill(); } });
  const r = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.65, 0.08, 64), [new THREE.MeshStandardMaterial({ color: 0xd8662f, roughness: 1 }), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), new THREE.MeshStandardMaterial({ color: 0xd8662f })]);
  r.scale.z = 0.8; r.position.y = -0.03; r.receiveShadow = true; return r;
}
function makeBed() {
  // caminha redonda fofinha
  const g = new THREE.Group(), soft = (c) => mat.std(c, { roughness: 0.9, clearcoat: 0, sheen: 1, sheenColor: new C(0xffffff) });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.55, 24, 64), soft(0x9b7bea)); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 0.85, 1); rim.position.y = 0.45; g.add(rim);
  const cush = sph(1.75, soft(0xc9b6ff), 48); cush.scale.set(1, 0.22, 0.85); cush.position.y = 0.3; g.add(cush);
  const pil = sph(0.5, soft(0xffffff), 28); pil.scale.set(1.3, 0.5, 0.8); pil.position.set(0, 0.62, -0.95); g.add(pil);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const st = starMesh(0.08, mat.std(0xffe082)); st.position.set(Math.cos(a) * 1.75, 0.95, Math.sin(a) * 1.75 * 0.85); st.rotation.x = -0.5; g.add(st); }
  g.scale.setScalar(0.78); g.position.z = -0.35; shadowAll(g); return g;
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
    scene.fog = new THREE.Fog(0xd4e6ff, 1e4, 2e4); // névoa só para a cidade da escola (longe demais para o resto)
    this.hemi = new THREE.HemisphereLight(0xdff1ff, 0x8fd47e, 0.9); scene.add(this.hemi);
    const key = (this.key = new THREE.DirectionalLight(0xfff4e0, 2.4)); key.position.set(3.5, 7, 6); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 6; key.shadow.camera.bottom = -2; key.shadow.radius = 6; key.shadow.bias = -0.0006; scene.add(key);
    const rim = (this.rim = new THREE.DirectionalLight(0xd4ecff, 2.2)); rim.position.set(-5, 5, -6); scene.add(rim);
    const rim2 = (this.rim2 = new THREE.DirectionalLight(0xfff0d8, 1.2)); rim2.position.set(6, 3, -5); scene.add(rim2);
    const fill = (this.fill = new THREE.DirectionalLight(0xffe6cc, 0.55)); fill.position.set(-4, 2, 6); scene.add(fill);
    [this.hemi, key, rim, rim2, fill].forEach((l) => l.layers.enable(1)); // luzes também valem para o reflexo do piso
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 320);
    this.lumi = new Lumi3D(window.LUMI_SPECIES || 'robot'); scene.add(this.lumi.root);
    this.island = makeIsland(); scene.add(this.island);
    this.props = new THREE.Group(); scene.add(this.props);
    const tree = makeTree(); tree.position.set(-2.3, 0, -1.2); tree.scale.setScalar(1.15); this.props.add(tree);
    [[2.4, 0.9, 0xff8ac0], [2.0, 1.6, 0xffffff], [-1.8, 1.4, 0xffc928], [2.7, -0.2, 0x9d6bff], [-2.7, 0.6, 0xff6b6b]].forEach(([x, z, c]) => { const f = makeFlower(c); f.position.set(x, 0, z); this.props.add(f); });
    const mu = makeMushroom(); mu.position.set(2.2, 0, -1.3); mu.scale.setScalar(1.3); this.props.add(mu);
    this.pillow = makeBed(); this.pillow.visible = false; scene.add(this.pillow);
    this.rug = makeRug(); this.rug.visible = false; scene.add(this.rug);
    this.pad = makePad(); this.pad.visible = false; scene.add(this.pad);
    this.school = null; // a escola 3D é criada só quando a tela principal aparece
    this.egg = makeEgg(!!this.lumi.sp.robot); this.egg.visible = false; scene.add(this.egg);
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
    const room = p.scene === 'room' || p.night; this.island.visible = !room;
    const school = !!(host.closest && host.closest('[data-scene="school"]')); // escola futurista: base holográfica no lugar do tapete
    this.rug.visible = room && !p.night && !school; this.pad.visible = room && !p.night && school;
    if (school && !this.school && !this.schoolBroken) { // monta a escola e compila os materiais em segundo plano antes de mostrar (sem travar a tela)
      let S = null; try { S = makeSchool(); } catch (e) { console.warn('escola 3D indisponível neste aparelho', e); this.schoolBroken = true; } // se falhar, fica o fundo desenhado
      if (S) {
        const R = this.renderer, prev = R.getRenderTarget(); this.school = S; S.visible = false; this.scene.add(S);
        const show = () => { this.schoolReady = true; S.visible = !this.schoolBroken && !!(this.host && this.host.closest && this.host.closest('[data-scene="school"]')); };
        try {
          if (!R.compileAsync || !R.extensions.has('KHR_parallel_shader_compile')) throw 0; // sem compilação paralela: mostra direto
          const jobs = [R.compileAsync(S, this.camera, this.scene)];
          if (S.userData.mirrorRT) { R.setRenderTarget(S.userData.mirrorRT); jobs.push(R.compileAsync(S, this.camera, this.scene)); }
          Promise.all(jobs).then(show, show); setTimeout(() => this.schoolReady || show(), 2500); // garantia: nunca fica sem a escola
        } catch (e) { show(); } finally { R.setRenderTarget(prev); }
      }
    }
    if (this.school) this.school.visible = school && !!this.schoolReady && !this.schoolBroken;
    const envEl = host.closest && host.closest('[data-scene]'), envKey = envEl ? envEl.dataset.scene : '', ENV = ROOMS[envKey] || null, bedroom = envKey === 'bedroom';
    this.rooms = this.rooms || {};
    if (ENV && !this.rooms[envKey]) { // monta o cômodo uma vez e compila em segundo plano antes de mostrar
      let Gr = null; try { Gr = ENV.make(); } catch (e) { console.warn('cômodo 3D indisponível neste aparelho', envKey, e); }
      const RM = (this.rooms[envKey] = { key: envKey, G: Gr, ENV, ready: false, broken: !Gr });
      if (Gr) {
        const R = this.renderer; Gr.visible = false; this.scene.add(Gr);
        const show = () => { RM.ready = true; Gr.visible = !RM.broken && this.envKey === envKey; };
        try { if (!R.compileAsync || !R.extensions.has('KHR_parallel_shader_compile')) throw 0; R.compileAsync(Gr, this.camera, this.scene).then(show, show); setTimeout(() => RM.ready || show(), 2500); } catch (e) { show(); }
      }
    }
    this.envKey = envKey; this.roomActive = ENV ? this.rooms[envKey] : null;
    for (const k in this.rooms) { const RM = this.rooms[k]; if (RM.G) RM.G.visible = k === envKey && RM.ready && !RM.broken; }
    if (ENV && ENV.pad) { this.pad.visible = room && !p.night; this.rug.visible = false; } // base holográfica no lugar do tapete
    if (!this.schoolLights) { // luzes coloridas da escola (ciano e lilás), ligadas só na escola
      this.schoolLights = [new THREE.PointLight(0x4fe3ff, 0, 9, 1.6), new THREE.PointLight(0xc28bff, 0, 9, 1.6)];
      this.schoolLights[0].userData.p = new THREE.Vector3(1.9, 1.7, -3.4); this.schoolLights[1].userData.p = new THREE.Vector3(-1.7, 2.6, -2.4); this.schoolLights.forEach((l) => { l.position.copy(l.userData.p); l.layers.enable(1); this.scene.add(l); });
    }
    // as duas luzes coloridas servem aos dois cenários (escola: ciano e lilás; quarto: abajur quente e planeta ciano)
    const EL = this.schoolLights;
    if (ENV) EL.forEach((l, i) => { l.color.set(ENV.l[i][0]); l.intensity = ENV.l[i][1]; l.userData.pe = new THREE.Vector3(...ENV.l[i][2]); });
    else { EL[0].color.set(0x4fe3ff); EL[1].color.set(0xc28bff); EL[0].intensity = school ? 9 : 0; EL[1].intensity = school ? 7 : 0; }
    this.envBase = [EL[0].intensity, EL[1].intensity];
    this.props.visible = p.props && !room; this.pillow.visible = !!p.night;
    this.hemi.color.set(p.night ? 0x5c6bc0 : room ? 0xfff0dc : 0xdff1ff); this.hemi.groundColor.set(p.night ? 0x2b2f74 : room ? 0xc98b55 : 0x8fd47e); this.hemi.intensity = p.night ? 0.7 : room ? 1.0 : 0.9;
    this.fill.color.set(p.night ? 0xffb86b : 0xffe6cc); this.fill.intensity = p.night ? 0.5 : 0.55;
    this.key.color.set(p.night ? 0xaac4ff : 0xfff4e0); this.key.intensity = p.night ? 1.2 : 2.4;
    this.rim.color.set(0xd4ecff); this.rim.intensity = 2.2; this.rim2.color.set(0xfff0d8); this.rim2.intensity = 1.2;
    this.renderer.toneMappingExposure = p.night ? 0.95 : 1.05;
    if (!school) this.scene.fog.near = 1e4, this.scene.fog.far = 2e4;
    if (school) { // luz de cinema da escola: céu azul-lilás, contraluz ciano vinda da janela, recorte lilás do outro lado
      this.hemi.color.set(0xd2d8ff); this.hemi.groundColor.set(0x6a5ed2); this.hemi.intensity = 0.9;
      this.fill.color.set(0xc4e6ff); this.key.color.set(0xfff3f6); this.key.intensity = 2.2;
      this.rim.color.set(0x9fe9ff); this.rim.intensity = 2.6; this.rim2.color.set(0xe2b8ff); this.rim2.intensity = 1.5;
      this.renderer.toneMappingExposure = 1.0;
    }
    if (ENV) { // contraluz de cada cômodo (no quarto: luar azul pela janela e abajur quente)
      this.rim.color.set(ENV.rim[0]); this.rim.intensity = ENV.rim[1]; this.rim2.color.set(ENV.rim[2]); this.rim2.intensity = ENV.rim[3]; this.renderer.toneMappingExposure = bedroom ? 1.0 : 1.02;
    }
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
    const raw = this.clock.getDelta(), dt = Math.min(0.05, raw); this.t += dt;
    const f = this.framing, tg = this.target, k = this.snapNext ? 1 : Math.min(1, dt * 4); this.snapNext = false;
    if (tg.fit) { // enquadra o Lumi entre as frações [topo, base] da tela
      // o enquadramento acompanha só metade do crescimento: o bebê parece menor, mas continua bem visível
      const [a, b] = tg.fit, th = Math.tan((this.camera.fov * Math.PI) / 360), z = 0.45 + 0.55 * this.lumi.size, H = 4.3 * z;
      let d = H / ((b - a) * 2 * th); d = Math.max(d, (3.8 * z) / (this.aspect || 1) / (2 * th));
      const hv = 2 * d * th, cy = 2.05 * this.lumi.size; tg.dist = d; tg.lookY = cy + ((a + b) / 2 - 0.5) * hv; tg.y = tg.lookY + 0.5 * z + (tg.tilt || 0);
    }
    for (const key of ['x', 'y', 'dist', 'lookY', 'rotY']) f[key] = (f[key] ?? 0) + ((tg[key] ?? 0) - (f[key] ?? 0)) * k;
    // em telas estreitas, afasta a câmera para caber o Lumi inteiro
    const narrow = tg.fit ? 1 : this.aspect < 0.62 ? 0.62 / this.aspect : 1;
    this.camera.position.set(f.x, f.y + (tg.fit ? 0 : 0.4), f.dist * Math.max(1, narrow * 0.92));
    this.camera.lookAt(f.x, f.lookY, 0);
    const lie = tg.night && this.lumi.mood === 'sleep' ? 1 : 0; this.lieK = (this.lieK || 0) + (lie - (this.lieK || 0)) * Math.min(1, dt * 3);
    this.lumi.root.rotation.y = (f.rotY + Math.sin(this.t * 0.4) * 0.06) * (1 - this.lieK);
    this.lumi.root.rotation.x = -1.3 * this.lieK; this.lumi.root.position.set(0, 0.55 * this.lieK, -0.2 * this.lieK);
    this.lumi.update(this.t, dt);
    if (this.pad.visible) this.pad.userData.tick(this.t);
    if (this.school && this.school.visible) try {
      const s = (tg.dist || SCHOOL_REF.dist) / SCHOOL_REF.dist, ox = (tg.x || 0) - s * SCHOOL_REF.x, S = this.school;
      S.scale.setScalar(s); S.position.set(ox, 0, 0); S.userData.tick(this.t);
      if (!this.schoolLow) { // modo econômico automático: média de quadros lenta (abaixo de ~38 qps) depois do aquecimento
        const P = (this.schoolPerf = this.schoolPerf || { n: 0, sum: 0 }); P.n++;
        if (P.n > 45) { P.sum += Math.min(raw, 0.1); if (P.n >= 165) { if (P.sum / (P.n - 45) > 0.026) { this.schoolLow = true; S.userData.lowPower(); } else this.schoolLow = 'ok'; } }
      }
      this.scene.fog.near = 55 * s; this.scene.fog.far = 300 * s;
      for (const l of this.schoolLights) l.position.copy(l.userData.p).multiplyScalar(s).setX(l.userData.p.x * s + ox);
    } catch (err) { console.warn('escola 3D desligada', err); this.schoolBroken = true; this.school.visible = false; } // nunca trava o Lumi
    const RM = this.roomActive;
    if (RM && RM.G && RM.G.visible) try {
      const ref = RM.ENV.ref, sc = (tg.dist || ref.dist) / ref.dist, ox = (tg.x || 0) - sc * ref.x, night = this.lieK || 0;
      RM.G.scale.setScalar(sc); RM.G.position.set(ox, 0, 0); RM.G.userData.tick(this.t, night);
      const EL = this.schoolLights, base = this.envBase || [0, 0];
      for (const l of EL) if (l.userData.pe) l.position.copy(l.userData.pe).multiplyScalar(sc).setX(l.userData.pe.x * sc + ox);
      if (RM.ENV.dim) { EL[0].intensity = base[0] * (1 - 0.4 * night); EL[1].intensity = base[1] * (1 - 0.6 * night); }
    } catch (err) { console.warn('cômodo 3D desligado', err); RM.broken = true; RM.G.visible = false; }
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
    if (U.lamp) U.lamp.material.opacity = 0.55 + Math.abs(Math.sin(this.t * (2 + U.cracks.filter((c) => c.visible).length * 2))) * 0.45;
    if (U.robot && U.hatchT >= 0) {
      U.hatchT += dt; const h = U.hatchT;
      if (h < 0.7) U.body.rotation.z = Math.sin(h * 40) * 0.08;
      else {
        const k = Math.min(1, (h - 0.7) / 0.7);
        U.top.position.set(0, k * 1.8, -k * 0.9); U.top.rotation.set(-k * 1.9, 0, 0);
        U.bottom.scale.set(1 - k * 0.25, 1 - k, 1 - k * 0.25);
        if (!this.lumi.root.visible) { this.lumi.root.visible = true; if (this.lumi.growCur) this.lumi.growCur.s = 0.05; this.lumi.celebrate(); }
        if (k >= 1) { E.visible = false; U.hatchT = -1; U.done && U.done(); }
      }
      return;
    }
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
    const vis = { p: this.props.visible, i: this.island.visible, e: this.egg.visible, l: L.root.visible, ry: L.root.rotation.y, r: this.rug.visible, b: this.pillow.visible, pd: this.pad.visible, sc: this.school && this.school.visible, rooms: Object.values(this.rooms || {}).filter((r) => r.G && r.G.visible) };
    if (this.school) this.school.visible = false; vis.rooms.forEach((r) => (r.G.visible = false));
    this.props.visible = this.island.visible = this.egg.visible = this.rug.visible = this.pillow.visible = this.pad.visible = false; L.root.visible = true;
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
    this.props.visible = vis.p; this.island.visible = vis.i; this.egg.visible = vis.e; L.root.visible = vis.l; this.rug.visible = vis.r; this.pillow.visible = vis.b; this.pad.visible = vis.pd; if (this.school) this.school.visible = !!vis.sc; vis.rooms.forEach((r) => (r.G.visible = true));
    return url;
  }
  /* imagem do Lumi (para o mapa) */
  snapshot(w = 256, h = 256) {
    const old = { pv: this.props.visible, iv: this.island.visible, rv: this.rug.visible, bv: this.pillow.visible, dv: this.pad.visible, sv: this.school && this.school.visible, rooms: Object.values(this.rooms || {}).filter((r) => r.G && r.G.visible), size: new THREE.Vector2() };
    if (this.school) this.school.visible = false; old.rooms.forEach((r) => (r.G.visible = false));
    this.renderer.getSize(old.size);
    this.props.visible = this.island.visible = this.rug.visible = this.pillow.visible = this.pad.visible = false;
    const z = this.lumi.size; const cam = new THREE.PerspectiveCamera(26, w / h, 0.1, 50); cam.position.set(0, 2.6 * z, 7.2 * z + 0.6); cam.lookAt(0, 2.3 * z, 0);
    this.renderer.setSize(w, h, false); this.renderer.render(this.scene, cam);
    const url = this.canvas.toDataURL('image/png');
    this.renderer.setSize(old.size.x, old.size.y, false);
    this.props.visible = old.pv; this.island.visible = old.iv; this.rug.visible = old.rv; this.pillow.visible = old.bv; this.pad.visible = old.dv; if (this.school) this.school.visible = !!old.sv; old.rooms.forEach((r) => (r.G.visible = true));
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
