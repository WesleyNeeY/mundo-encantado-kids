/* Lumi — mascote animado em SVG, montado por partes.
   Uso: const l = new Lumi(elemento); l.setMood('happy'); l.talk(true); l.setHat('crown') */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  let uid = 0;

  const HATS = {
    none: '',
    cap: `<g class="acc"><path d="M118,96 C122,40 170,18 205,18 C250,18 286,44 290,96 Z" fill="url(#ID-gCap)"/>
      <path d="M118,96 C160,84 250,84 290,96 C320,102 336,112 330,118 C300,112 230,106 118,108 Z" fill="#1d4fb8"/>
      <circle cx="205" cy="20" r="9" fill="#ffd54a"/><path d="M190,50 l10,-12 l10,12 l-4,15 h-12z" fill="#fff" opacity=".9"/></g>`,
    explorer: `<g class="acc"><ellipse cx="200" cy="96" rx="128" ry="22" fill="#b98a4e"/><path d="M128,94 C130,50 160,26 200,26 C240,26 270,50 272,94 Z" fill="url(#ID-gKhaki)"/>
      <path d="M130,84 C170,74 230,74 270,84 L270,94 C230,84 170,84 130,94 Z" fill="#5b3a1d"/></g>`,
    crown: `<g class="acc"><path d="M140,96 L132,40 L170,70 L200,24 L230,70 L268,40 L260,96 Z" fill="url(#ID-gGold)" stroke="#c88a00" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="200" cy="72" r="9" fill="#ff4f7b"/><circle cx="160" cy="80" r="6" fill="#4fc3ff"/><circle cx="240" cy="80" r="6" fill="#4fc3ff"/>
      <circle cx="132" cy="38" r="7" fill="#ffd54a"/><circle cx="200" cy="22" r="8" fill="#ffd54a"/><circle cx="268" cy="38" r="7" fill="#ffd54a"/></g>`,
    wizard: `<g class="acc"><ellipse cx="200" cy="96" rx="118" ry="18" fill="#4b2a9a"/><path d="M134,94 L214,-40 C222,-50 236,-44 230,-30 L266,94 Z" fill="url(#ID-gWiz)"/>
      <path d="M180,40 l6,12 l13,2 l-10,9 l3,13 l-12,-7 l-12,7 l3,-13 l-10,-9 l13,-2z" fill="#ffd54a"/><circle cx="232" cy="64" r="5" fill="#ffd54a"/><circle cx="210" cy="10" r="4" fill="#fff"/></g>`,
    party: `<g class="acc"><path d="M160,96 L208,-20 L250,96 Z" fill="url(#ID-gParty)"/><path d="M171,70 L238,66 M184,40 L228,38 M196,12 L218,10" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      <circle cx="208" cy="-22" r="13" fill="#ffd54a"/></g>`,
    bow: `<g class="acc"><path d="M200,70 C180,40 140,40 146,74 C150,100 186,92 200,78 Z" fill="#ff6fae"/><path d="M200,70 C220,40 260,40 254,74 C250,100 214,92 200,78 Z" fill="#ff6fae"/>
      <circle cx="200" cy="74" r="13" fill="#ff3d8b"/><path d="M160,62 C168,58 176,60 182,66" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/></g>`,
  };
  const FACE = {
    none: '',
    glasses: `<g class="acc"><circle cx="150" cy="172" r="44" fill="rgba(255,255,255,.12)" stroke="#ff5a5f" stroke-width="8"/><circle cx="250" cy="172" r="44" fill="rgba(255,255,255,.12)" stroke="#ff5a5f" stroke-width="8"/>
      <path d="M194,170 Q200,162 206,170" stroke="#ff5a5f" stroke-width="7" fill="none"/></g>`,
    sunglasses: `<g class="acc"><path d="M104,150 h92 v26 c0,26 -20,38 -46,38 c-26,0 -46,-12 -46,-38z" fill="#16163a"/><path d="M204,150 h92 v26 c0,26 -20,38 -46,38 c-26,0 -46,-12 -46,-38z" fill="#16163a"/>
      <path d="M100,152 H300" stroke="#16163a" stroke-width="8"/><path d="M118,160 l20,0 M218,160 l20,0" stroke="#8fb8ff" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>`,
  };
  const NECK = {
    none: '',
    scarf: `<g class="acc"><path d="M118,262 C160,286 240,286 282,262 C292,276 290,292 280,298 C240,316 160,316 120,298 C110,292 108,276 118,262 Z" fill="#ff4f5e"/>
      <path d="M240,292 C246,320 248,350 240,372 L270,368 C272,344 268,316 262,294 Z" fill="#e93a4a"/><path d="M130,280 C170,296 230,296 270,280" stroke="#fff" stroke-width="5" stroke-dasharray="10 12" fill="none" opacity=".7"/></g>`,
    bowtie: `<g class="acc"><path d="M200,282 L162,262 L162,302 Z" fill="#7c4dff"/><path d="M200,282 L238,262 L238,302 Z" fill="#7c4dff"/><circle cx="200" cy="282" r="10" fill="#5a2fd6"/></g>`,
  };

  function svgMarkup(id) {
    const g = (s) => s.replaceAll('ID-', id + '-');
    return g(`
<svg viewBox="-20 -60 440 520" xmlns="${NS}" class="lumi-svg" aria-hidden="true">
 <defs>
  <radialGradient id="ID-gHead" cx="40%" cy="28%" r="78%"><stop offset="0" stop-color="#d6f0ff"/><stop offset=".45" stop-color="#86ccff"/><stop offset="1" stop-color="#3a86ea"/></radialGradient>
  <radialGradient id="ID-gBody" cx="42%" cy="25%" r="85%"><stop offset="0" stop-color="#b9e3ff"/><stop offset=".5" stop-color="#65b2f7"/><stop offset="1" stop-color="#2d72d8"/></radialGradient>
  <radialGradient id="ID-gMuzzle" cx="45%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcefff"/></radialGradient>
  <linearGradient id="ID-gEarIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b8ff"/><stop offset="1" stop-color="#ffa9d4"/></linearGradient>
  <radialGradient id="ID-gIris" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#7fe0ff"/><stop offset=".42" stop-color="#2b86ea"/><stop offset="1" stop-color="#0e2a6a"/></radialGradient>
  <linearGradient id="ID-gTail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2f78dc"/><stop offset=".7" stop-color="#7cc4ff"/><stop offset="1" stop-color="#d6f0ff"/></linearGradient>
  <radialGradient id="ID-gShadow"><stop offset="0" stop-color="#0b2a5a" stop-opacity=".35"/><stop offset="1" stop-color="#0b2a5a" stop-opacity="0"/></radialGradient>
  <radialGradient id="ID-gStar"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffc21a"/></radialGradient>
  <linearGradient id="ID-gCap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa0ff"/><stop offset="1" stop-color="#2a63d8"/></linearGradient>
  <linearGradient id="ID-gKhaki" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3c48f"/><stop offset="1" stop-color="#b98a4e"/></linearGradient>
  <linearGradient id="ID-gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a6"/><stop offset="1" stop-color="#ffb300"/></linearGradient>
  <linearGradient id="ID-gWiz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9d6bff"/><stop offset="1" stop-color="#5a2fd6"/></linearGradient>
  <linearGradient id="ID-gParty" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8ac0"/><stop offset="1" stop-color="#ff4f7b"/></linearGradient>
  <filter id="ID-soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0b2a5a" flood-opacity=".18"/></filter>
 </defs>
 <ellipse data-p="shadow" cx="200" cy="438" rx="120" ry="16" fill="url(#ID-gShadow)"/>
 <g data-p="root" filter="url(#ID-soft)">
  <g data-p="tail">
   <path d="M258,396 C326,404 388,356 380,282 C376,240 346,212 320,224 C298,234 306,262 326,270 C346,280 344,322 318,342 C298,356 278,358 258,356 Z" fill="url(#ID-gTail)"/>
   <path d="M322,226 C346,214 376,238 380,276 C368,262 352,256 336,262 C316,256 306,238 322,226 Z" fill="#f4fbff"/>
  </g>
  <g data-p="body">
   <ellipse cx="156" cy="420" rx="42" ry="22" fill="#3f88e8"/><ellipse cx="244" cy="420" rx="42" ry="22" fill="#3f88e8"/>
   <path d="M140,428 q6,-10 12,0 M156,430 q6,-10 12,0 M228,430 q6,-10 12,0 M244,428 q6,-10 12,0" stroke="#2a63c4" stroke-width="3" fill="none" stroke-linecap="round"/>
   <path d="M200,248 C288,248 304,330 296,374 C288,416 246,430 200,430 C154,430 112,416 104,374 C96,330 112,248 200,248 Z" fill="url(#ID-gBody)"/>
   <ellipse cx="200" cy="362" rx="62" ry="58" fill="url(#ID-gMuzzle)" opacity=".95"/>
   <path d="M200,352 l7,14 l15,2 l-11,10 l3,15 l-14,-8 l-14,8 l3,-15 l-11,-10 l15,-2z" fill="url(#ID-gStar)" opacity=".9"/>
  </g>
  <g data-p="neck"></g>
  <g data-p="head">
   <g data-p="earL"><path d="M98,150 C74,92 80,38 108,16 C142,36 168,78 174,112 Z" fill="url(#ID-gHead)"/><path d="M110,134 C96,96 100,60 112,42 C132,60 150,88 154,110 Z" fill="url(#ID-gEarIn)"/><path d="M108,18 C112,10 118,6 124,8 C118,14 116,22 118,30 Z" fill="#eaf7ff"/></g>
   <g data-p="earR"><path d="M302,150 C326,92 320,38 292,16 C258,36 232,78 226,112 Z" fill="url(#ID-gHead)"/><path d="M290,134 C304,96 300,60 288,42 C268,60 250,88 246,110 Z" fill="url(#ID-gEarIn)"/><path d="M292,18 C288,10 282,6 276,8 C282,14 284,22 282,30 Z" fill="#eaf7ff"/></g>
   <path d="M200,56 C286,56 332,108 336,168 C350,178 356,196 342,206 C350,222 338,238 322,236 C302,268 256,288 200,288 C144,288 98,268 78,236 C62,238 50,222 58,206 C44,196 50,178 64,168 C68,108 114,56 200,56 Z" fill="url(#ID-gHead)"/>
   <ellipse cx="170" cy="100" rx="70" ry="34" fill="#fff" opacity=".22" transform="rotate(-18 170 100)"/>
   <path d="M168,68 C172,38 192,26 206,18 C200,38 210,50 224,42 C222,58 236,66 248,62 C236,80 200,84 168,68 Z" fill="#a9dcff"/>
   <path d="M254,82 l5,10 l11,2 l-8,8 l2,11 l-10,-5 l-10,5 l2,-11 l-8,-8 l11,-2z" fill="url(#ID-gStar)" data-p="starmark"/>
   <ellipse cx="200" cy="226" rx="78" ry="52" fill="url(#ID-gMuzzle)"/>
   <ellipse data-p="blushL" cx="124" cy="224" rx="22" ry="13" fill="#ff8fc6" opacity=".5"/>
   <ellipse data-p="blushR" cx="276" cy="224" rx="22" ry="13" fill="#ff8fc6" opacity=".5"/>
   <path data-p="browL" d="M124,116 Q150,104 174,114" stroke="#2a5fb8" stroke-width="6" fill="none" stroke-linecap="round"/>
   <path data-p="browR" d="M226,114 Q250,104 276,116" stroke="#2a5fb8" stroke-width="6" fill="none" stroke-linecap="round"/>
   <g data-p="eyeL" transform="translate(150 170)">
    <g data-p="eyeLopen"><ellipse rx="36" ry="44" fill="url(#ID-gIris)" stroke="#0d2350" stroke-width="3"/><g data-p="pupL"><ellipse cy="4" rx="18" ry="23" fill="#0a1a42"/><circle cx="-12" cy="-16" r="11" fill="#fff"/><circle cx="11" cy="14" r="5" fill="#fff" opacity=".9"/></g></g>
    <path data-p="eyeLhappy" d="M-28,8 Q0,-24 28,8" stroke="#0d2350" stroke-width="7" fill="none" stroke-linecap="round" style="display:none"/>
   </g>
   <g data-p="eyeR" transform="translate(250 170)">
    <g data-p="eyeRopen"><ellipse rx="36" ry="44" fill="url(#ID-gIris)" stroke="#0d2350" stroke-width="3"/><g data-p="pupR"><ellipse cy="4" rx="18" ry="23" fill="#0a1a42"/><circle cx="-12" cy="-16" r="11" fill="#fff"/><circle cx="11" cy="14" r="5" fill="#fff" opacity=".9"/></g></g>
    <path data-p="eyeRhappy" d="M-28,8 Q0,-24 28,8" stroke="#0d2350" stroke-width="7" fill="none" stroke-linecap="round" style="display:none"/>
   </g>
   <path d="M187,200 Q200,192 213,200 Q208,214 200,216 Q192,214 187,200 Z" fill="#1d2f6b"/><ellipse cx="196" cy="200" rx="5" ry="3" fill="#fff" opacity=".7"/>
   <g data-p="mouth" transform="translate(200 230)">
    <ellipse data-p="mouthIn" cx="0" cy="12" rx="17" ry="0.1" fill="#b2264b"/>
    <ellipse data-p="tongue" cx="0" cy="20" rx="10" ry="0.1" fill="#ff7aa2"/>
    <path data-p="lip" d="M-24,-2 Q-12,11 0,0 Q12,11 24,-2" stroke="#1d2f6b" stroke-width="4.5" fill="none" stroke-linecap="round"/>
   </g>
   <g data-p="face"></g>
   <g data-p="hat"></g>
  </g>
  <g data-p="armL"><ellipse cx="122" cy="338" rx="24" ry="46" transform="rotate(22 122 338)" fill="url(#ID-gBody)"/><ellipse cx="108" cy="372" rx="20" ry="16" fill="#e8f5ff"/></g>
  <g data-p="armR"><ellipse cx="278" cy="338" rx="24" ry="46" transform="rotate(-22 278 338)" fill="url(#ID-gBody)"/><ellipse cx="292" cy="372" rx="20" ry="16" fill="#e8f5ff"/></g>
 </g>
 <g data-p="zzz" style="display:none" font-family="Fredoka, sans-serif" font-weight="700" fill="#6f9ee6" stroke="#fff" stroke-width="3" paint-order="stroke">
  <text data-p="z1" x="296" y="60" font-size="40">z</text><text data-p="z2" x="322" y="22" font-size="52">Z</text><text data-p="z3" x="350" y="-20" font-size="64">Z</text>
 </g>
 <g data-p="fx"></g>
</svg>`);
  }

  class Lumi {
    constructor(container, opts = {}) {
      this.id = 'lumi' + (++uid);
      container.innerHTML = svgMarkup(this.id);
      this.svg = container.querySelector('svg');
      this.p = {};
      this.svg.querySelectorAll('[data-p]').forEach((el) => (this.p[el.dataset.p] = el));
      this.mood = 'idle';
      this.talking = false;
      this.mouthOpen = 0;
      this.t0 = performance.now();
      this.nextBlink = 1500;
      this.blinkUntil = 0;
      this.earTwitch = { side: 0, until: 0 };
      this.look = { x: 0, y: 0, tx: 0, ty: 0, next: 0 };
      this.jump = null;
      this.wave = 0;
      this.chew = 0;
      this.shake = 0;
      this.excite = 0;
      this.boundaryPulse = 0;
      this.scaleMode = opts.small ? 1 : 0;
      this.setOutfit(opts.outfit || {});
      this._tick = this._tick.bind(this);
      this.alive = true;
      requestAnimationFrame(this._tick);
      this.svg.addEventListener('pointerdown', () => this.poke());
    }
    destroy() { this.alive = false; }
    setOutfit(o) {
      const fill = (part, lib, key) => { this.p[part].innerHTML = (lib[key || 'none'] || '').replaceAll('ID-', this.id + '-'); };
      fill('hat', HATS, o.head); fill('face', FACE, o.face); fill('neck', NECK, o.neck);
    }
    setMood(m) { this.mood = m; this.p.zzz.style.display = m === 'sleep' ? '' : 'none'; }
    talk(on) { this.talking = on; }
    pulse() { this.boundaryPulse = 1; }
    celebrate() { this.jump = { t: 0, n: 2 }; this.excite = 1.6; this.setMood('happy'); this.sparkle(14); }
    hop() { this.jump = { t: 0, n: 1 }; }
    doWave(sec = 1.6) { this.wave = sec; }
    encourage() { this.setMood('sad'); this.shake = 0.6; }
    eat(sec = 2.2) { this.chew = sec; this.setMood('eat'); }
    poke() { if (this.mood === 'sleep') return; this.hop(); this.excite = 0.8; this.earTwitch = { side: Math.random() < .5 ? -1 : 1, until: performance.now() + 260 }; this.onPoke && this.onPoke(); }
    sparkle(n = 10) {
      const fx = this.p.fx;
      for (let i = 0; i < n; i++) {
        const s = document.createElementNS(NS, 'path');
        const a = Math.random() * Math.PI * 2, d = 150 + Math.random() * 90;
        const x = 200 + Math.cos(a) * d * 0.9, y = 220 + Math.sin(a) * d * 0.75;
        const r = 8 + Math.random() * 12;
        s.setAttribute('d', `M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r}Z`);
        s.setAttribute('fill', ['#ffd54a', '#fff', '#ff9ecf', '#8fe3ff'][i % 4]);
        s.style.transformOrigin = `${x}px ${y}px`;
        s.style.animation = `lumiSpark ${0.8 + Math.random() * 0.6}s ${Math.random() * 0.25}s ease-out forwards`;
        s.style.opacity = '0';
        fx.appendChild(s);
        setTimeout(() => s.remove(), 1800);
      }
    }
    _tick(now) {
      if (!this.alive) return;
      if (this.paused || !this.svg.isConnected) { this._last = now; requestAnimationFrame(this._tick); return; }
      const t = (now - this.t0) / 1000;
      const dt = Math.min(0.05, (now - (this._last || now)) / 1000); this._last = now;
      const P = this.p, m = this.mood;
      const sleeping = m === 'sleep';
      // breathing
      const br = Math.sin(t * (sleeping ? 1.3 : 2.1));
      // jump
      let jy = 0, sq = 1;
      if (this.jump) {
        this.jump.t += dt;
        const D = 0.55, k = this.jump.t / D;
        if (k >= 1) { this.jump.n--; this.jump.t = 0; if (this.jump.n <= 0) this.jump = null; }
        else { jy = -Math.sin(k * Math.PI) * 70; sq = k < 0.12 ? 1 - (0.12 - k) * 1.2 : (k > 0.88 ? 1 - (k - 0.88) * 1.2 : 1 + Math.sin(k * Math.PI) * 0.06); }
      }
      this.excite = Math.max(0, this.excite - dt * 0.8);
      // root
      const shakeX = this.shake > 0 ? Math.sin(t * 40) * 6 * this.shake : 0; this.shake = Math.max(0, this.shake - dt);
      P.root.setAttribute('transform', `translate(${shakeX} ${jy}) translate(200 432) scale(${2 - sq} ${sq}) translate(-200 -432)`);
      const shS = 1 + jy / 220; P.shadow.setAttribute('transform', `translate(200 438) scale(${shS} ${shS}) translate(-200 -438)`);
      P.body.setAttribute('transform', `translate(200 430) scale(${1 + br * 0.008} ${1 + br * 0.018}) translate(-200 -430)`);
      // head
      let tilt = Math.sin(t * 0.7) * 3;
      let headY = br * -3;
      if (m === 'sad') tilt = 12 + Math.sin(t * 2) * 2;
      if (m === 'listen') tilt = -10 + Math.sin(t * 1.5) * 2;
      if (m === 'think') tilt = 8;
      if (sleeping) { tilt = 9 + br * 2; headY = 10 + br * 4; }
      if (m === 'happy') tilt = Math.sin(t * 6) * 6 * (0.4 + this.excite);
      if (this.talking) { tilt += Math.sin(t * 3.1) * 3; headY += Math.sin(t * 7) * 1.5; }
      P.head.setAttribute('transform', `translate(0 ${headY}) rotate(${tilt} 200 262)`);
      // ears
      let eL = Math.sin(t * 1.7) * 2, eR = -Math.sin(t * 1.9) * 2;
      if (now < this.earTwitch.until) { if (this.earTwitch.side < 0) eL -= 14; else eR += 14; }
      else if (Math.random() < dt * 0.25) this.earTwitch = { side: Math.random() < 0.5 ? -1 : 1, until: now + 180 };
      if (m === 'sad') { eL -= 16; eR += 16; }
      if (sleeping) { eL -= 10; eR += 10; }
      if (m === 'listen') { eL += 8; eR -= 8; }
      P.earL.setAttribute('transform', `rotate(${eL} 128 132)`);
      P.earR.setAttribute('transform', `rotate(${eR} 272 132)`);
      // tail
      const ts = sleeping ? 0.6 : (m === 'happy' ? 4.5 : 1.6);
      P.tail.setAttribute('transform', `rotate(${Math.sin(t * ts) * (m === 'happy' ? 12 : 6)} 262 380)`);
      // arms
      let aL = Math.sin(t * 2.1) * 2, aR = -Math.sin(t * 2.1) * 2;
      if (this.wave > 0) { this.wave -= dt; aR = -160 + Math.sin(t * 12) * 18; }
      if (m === 'happy') { aL = 40 + Math.sin(t * 10) * 10 * this.excite; aR = -40 - Math.sin(t * 10) * 10 * this.excite; }
      if (this.jump) { aL = 70; aR = -70; }
      if (m === 'eat') { aL = 28; aR = -28; }
      P.armL.setAttribute('transform', `rotate(${aL} 132 300)`);
      P.armR.setAttribute('transform', `rotate(${aR} 268 300)`);
      // eyes
      const happyEyes = m === 'happy' || sleeping || (m === 'eat' && this.chew > 0);
      if (!happyEyes && now > this.nextBlink) { this.blinkUntil = now + 130; this.nextBlink = now + 1800 + Math.random() * 3200; }
      const blink = now < this.blinkUntil;
      // look around
      if (now > this.look.next) { this.look.tx = (Math.random() - 0.5) * 10; this.look.ty = (Math.random() - 0.5) * 6; this.look.next = now + 900 + Math.random() * 2200; }
      if (m === 'listen') { this.look.tx = 6; this.look.ty = -4; }
      this.look.x += (this.look.tx - this.look.x) * Math.min(1, dt * 8); this.look.y += (this.look.ty - this.look.y) * Math.min(1, dt * 8);
      ['L', 'R'].forEach((s) => {
        P['eye' + s + 'open'].style.display = happyEyes ? 'none' : '';
        P['eye' + s + 'happy'].style.display = happyEyes ? '' : 'none';
        if (sleeping) P['eye' + s + 'happy'].setAttribute('d', 'M-26,0 Q0,18 26,0'); else P['eye' + s + 'happy'].setAttribute('d', 'M-28,8 Q0,-24 28,8');
        P['eye' + s + 'open'].setAttribute('transform', `scale(1 ${blink ? 0.08 : (m === 'sad' ? 0.88 : 1)})`);
        P['pup' + s].setAttribute('transform', `translate(${this.look.x} ${this.look.y})`);
      });
      // brows
      const bY = m === 'happy' ? -6 : (m === 'listen' || this.talking ? -4 : 0);
      const bRot = m === 'sad' ? 14 : (m === 'think' ? -8 : 0);
      P.browL.setAttribute('transform', `translate(0 ${bY}) rotate(${-bRot} 150 112)`);
      P.browR.setAttribute('transform', `translate(0 ${bY}) rotate(${bRot} 250 112)`);
      // mouth
      let target = 0;
      if (this.talking) {
        this.boundaryPulse = Math.max(0, this.boundaryPulse - dt * 4);
        target = this.mouthLevel != null ? Math.min(1, 0.08 + this.mouthLevel) : 0.25 + 0.55 * Math.abs(Math.sin(t * 14 + Math.sin(t * 5) * 2)) + this.boundaryPulse * 0.3;
      } else if (m === 'happy') target = 0.75;
      else if (this.chew > 0) { this.chew -= dt; target = 0.45 * Math.abs(Math.sin(t * 9)); if (this.chew <= 0) this.setMood('happy'); }
      else if (m === 'listen') target = 0.15;
      this.mouthOpen += (target - this.mouthOpen) * Math.min(1, dt * 18);
      const o = Math.min(1, this.mouthOpen);
      P.mouthIn.setAttribute('ry', (o * 20 + 0.1).toFixed(2));
      P.mouthIn.setAttribute('rx', (13 + o * 6).toFixed(2));
      P.mouthIn.setAttribute('cy', (8 + o * 9).toFixed(2));
      P.tongue.setAttribute('ry', (o * 7 + 0.1).toFixed(2));
      P.tongue.setAttribute('cy', (12 + o * 16).toFixed(2));
      P.lip.setAttribute('d', m === 'sad' && !this.talking ? 'M-18,8 Q0,-4 18,8' : 'M-24,-2 Q-12,11 0,0 Q12,11 24,-2');
      // blush
      const bl = 0.45 + (m === 'happy' ? 0.3 : 0) + (m === 'eat' ? 0.25 : 0);
      P.blushL.setAttribute('opacity', bl); P.blushR.setAttribute('opacity', bl);
      const puff = m === 'eat' && this.chew > 0 ? 1 + Math.abs(Math.sin(t * 9)) * 0.15 : 1;
      P.blushL.setAttribute('transform', `translate(124 224) scale(${puff}) translate(-124 -224)`);
      P.blushR.setAttribute('transform', `translate(276 224) scale(${puff}) translate(-276 -224)`);
      // star twinkle
      P.starmark.setAttribute('transform', `translate(259 97) scale(${1 + Math.sin(t * 3) * 0.12}) rotate(${Math.sin(t * 1.3) * 10}) translate(-259 -97)`);
      // zzz
      if (sleeping) {
        ['z1', 'z2', 'z3'].forEach((k, i) => {
          const ph = (t * 0.45 + i / 3) % 1;
          P[k].setAttribute('transform', `translate(${ph * 20} ${-ph * 50})`);
          P[k].setAttribute('opacity', (Math.sin(ph * Math.PI)).toFixed(2));
        });
      }
      requestAnimationFrame(this._tick);
    }
  }
  const PREVIEW_DEFS = `<defs>
  <linearGradient id="ID-gCap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa0ff"/><stop offset="1" stop-color="#2a63d8"/></linearGradient>
  <linearGradient id="ID-gKhaki" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3c48f"/><stop offset="1" stop-color="#b98a4e"/></linearGradient>
  <linearGradient id="ID-gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a6"/><stop offset="1" stop-color="#ffb300"/></linearGradient>
  <linearGradient id="ID-gWiz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9d6bff"/><stop offset="1" stop-color="#5a2fd6"/></linearGradient>
  <linearGradient id="ID-gParty" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8ac0"/><stop offset="1" stop-color="#ff4f7b"/></linearGradient></defs>`;
  const VB = { head: '100 -60 200 190', face: '96 120 208 104', neck: '100 250 200 130' };
  Lumi.accessory = function (slot, key) {
    const lib = slot === 'head' ? HATS : slot === 'face' ? FACE : NECK;
    const id = 'acc' + (++uid);
    const body = (lib[key] || '');
    if (!body) return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="#b8c4e0" stroke-width="8"/><path d="M29,71 L71,29" stroke="#b8c4e0" stroke-width="8" stroke-linecap="round"/></svg>`;
    return (`<svg viewBox="${VB[slot]}" xmlns="${NS}">` + PREVIEW_DEFS + body + '</svg>').replaceAll('ID-', id + '-');
  };
  Lumi.HATS = Object.keys(HATS); Lumi.FACE = Object.keys(FACE); Lumi.NECK = Object.keys(NECK);
  window.Lumi = Lumi;
})();
