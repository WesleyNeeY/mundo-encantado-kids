/* Cenários ilustrados (SVG) da casa na árvore e do mapa da floresta */
(function () {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const enc = (svg) => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';

  const PAL = {
    day: { w1: '#f7c47c', w2: '#c9773a', plank: '#a65c28', frame: '#7a3f1a', frame2: '#b8733b', s1: '#5fbef7', s2: '#d6f1ff', mt: ['#a9cbe9', '#86b0db', '#6a98c9'], tree: ['#3c8d4c', '#2f7a40'], f1: '#b46a33', f2: '#6e3b1c', glow: '#fff1c2', lamp: '#ffd36b' },
    lesson: { w1: '#f7c98a', w2: '#cf8344', plank: '#ab622e', frame: '#7a3f1a', frame2: '#b8733b', s1: '#6cc6fa', s2: '#e2f5ff', mt: ['#b4d2ee', '#92b8df', '#76a2cf'], tree: ['#46975a', '#367f46'], f1: '#b46a33', f2: '#6e3b1c', glow: '#fff4cf', lamp: '#ffd36b' },
    kitchen: { w1: '#f9cf8e', w2: '#d08443', plank: '#ad6430', frame: '#7a3f1a', frame2: '#b8733b', s1: '#69c4f8', s2: '#dff4ff', mt: ['#acd0ec', '#8ab4dd', '#6f9dcc'], tree: ['#46975a', '#367f46'], f1: '#c07a3e', f2: '#7a4423', glow: '#fff3c9', lamp: '#ffd36b' },
    wardrobe: { w1: '#f1c6ef', w2: '#a970cf', plank: '#9459bb', frame: '#6b2f86', frame2: '#a35cc4', s1: '#ff9fc9', s2: '#ffe3c4', mt: ['#d9a6e0', '#c08ad6', '#a46fc8'], tree: ['#7e57c2', '#673ab7'], f1: '#9c5fbf', f2: '#5b2a78', glow: '#fff0fb', lamp: '#ffd9f2' },
    night: { w1: '#5a4a8a', w2: '#251f4f', plank: '#1d1842', frame: '#3b2a58', frame2: '#5b4682', s1: '#0d1b4f', s2: '#33449a', mt: ['#2c3a7a', '#24306a', '#1b2558'], tree: ['#1e3d4f', '#16303f'], f1: '#3b2f63', f2: '#1a1538', glow: '#ffcf7a', lamp: '#ffb547' },
  };

  function lantern(x, y, len, P) {
    return `<line x1="${x}" y1="0" x2="${x}" y2="${y - 14}" stroke="#5a3417" stroke-width="2"/>
      <circle cx="${x}" cy="${y + 10}" r="80" fill="url(#lg)" opacity=".9"/>
      <rect x="${x - 13}" y="${y - 16}" width="26" height="8" rx="3" fill="#5a3417"/>
      <rect x="${x - 15}" y="${y - 8}" width="30" height="38" rx="9" fill="${P.lamp}" stroke="#5a3417" stroke-width="3"/>
      <rect x="${x - 7}" y="${y - 2}" width="14" height="26" rx="6" fill="#fff8de" opacity=".85"/>
      <rect x="${x - 11}" y="${y + 30}" width="22" height="6" rx="3" fill="#5a3417"/>`;
  }
  function plant(x, y, s, cols) {
    let g = `<g transform="translate(${x},${y}) scale(${s})">`;
    for (let i = 0; i < 7; i++) { const a = -80 + i * 27 + rnd() * 10; g += `<ellipse cx="0" cy="-26" rx="9" ry="26" fill="${cols[i % 2]}" transform="rotate(${a}) translate(0,-4)"/>`; }
    g += `<path d="M-18 0 L18 0 L13 26 L-13 26 Z" fill="#d9774a"/><rect x="-20" y="-4" width="40" height="8" rx="3" fill="#e98d5e"/></g>`;
    return g;
  }
  function books(x, y, n) {
    let g = '', cx = x;
    for (let i = 0; i < n; i++) { const w = 9 + rnd() * 6, h = 26 + rnd() * 18, c = pick(['#e2564a', '#3d7fd6', '#f2b630', '#5bb36b', '#8e5bd0', '#ef8a3a']); g += `<rect x="${cx}" y="${y - h}" width="${w}" height="${h}" rx="2" fill="${c}"/><rect x="${cx + 2}" y="${y - h + 5}" width="${w - 4}" height="3" fill="#fff" opacity=".5"/>`; cx += w + 1.5; }
    return g;
  }
  function jar(x, y, c) { return `<rect x="${x}" y="${y - 30}" width="24" height="30" rx="7" fill="#cfefff" opacity=".85"/><rect x="${x + 3}" y="${y - 22}" width="18" height="19" rx="5" fill="${c}"/><rect x="${x - 1}" y="${y - 35}" width="26" height="7" rx="3" fill="#b06a2c"/>`; }
  function shelf(x, y, w, P, items) { return `<rect x="${x}" y="${y + 4}" width="${w}" height="10" fill="#000" opacity=".15"/><rect x="${x}" y="${y}" width="${w}" height="12" rx="3" fill="${P.frame2}"/><rect x="${x}" y="${y}" width="${w}" height="4" rx="2" fill="#fff" opacity=".25"/>${items}`; }
  function vines(P, night) {
    const leaf = night ? ['#2f5b4a', '#244a3c'] : ['#5fbf5a', '#3f9c45', '#7ed26c'];
    let g = `<path d="M-10 26 C 60 60, 120 10, 195 34 S 330 8, 400 40" stroke="${night ? '#2a4a3a' : '#4a8a3a'}" stroke-width="5" fill="none"/>`;
    for (let i = 0; i < 46; i++) { const t = i / 45, x = -10 + t * 410, y = 26 + Math.sin(t * 9) * 12 + rnd() * 10; g += `<ellipse cx="${x}" cy="${y}" rx="${7 + rnd() * 5}" ry="${4 + rnd() * 3}" fill="${pick(leaf)}" transform="rotate(${rnd() * 180} ${x} ${y})"/>`; }
    for (const sx of [14, 376]) for (let i = 0; i < 14; i++) { const y = 40 + i * 17, x = sx + Math.sin(i) * 6; g += `<ellipse cx="${x}" cy="${y}" rx="8" ry="4.5" fill="${pick(leaf)}" transform="rotate(${i % 2 ? 35 : -35} ${x} ${y})"/>`; }
    return g;
  }
  function windowArch(P, theme) {
    const L = 80, R = 310, T = 250, B = 470, r = (R - L) / 2;
    const shape = `M${L} ${B} L${L} ${T} A${r} ${r} 0 0 1 ${R} ${T} L${R} ${B} Z`;
    let inside = `<rect x="${L}" y="${T - r}" width="${R - L}" height="${B - T + r}" fill="url(#sky)"/>`;
    if (theme === 'night') {
      inside += `<circle cx="250" cy="200" r="32" fill="#fff6d0"/><circle cx="264" cy="190" r="28" fill="url(#sky)"/>`;
      for (let i = 0; i < 26; i++) inside += `<circle cx="${L + rnd() * (R - L)}" cy="${T - r + rnd() * 180}" r="${0.8 + rnd() * 1.6}" fill="#fff" opacity="${0.5 + rnd() * 0.5}"/>`;
    } else if (theme === 'wardrobe') {
      inside += `<circle cx="200" cy="300" r="60" fill="#fff3c9" opacity=".7"/>`;
      for (let i = 0; i < 14; i++) inside += `<circle cx="${L + rnd() * (R - L)}" cy="${T - r + rnd() * 120}" r="1.5" fill="#fff"/>`;
    } else inside += `<circle cx="235" cy="225" r="48" fill="#fff8d2" opacity=".75"/><circle cx="235" cy="225" r="24" fill="#fffbe8"/>`;
    // montanhas, árvores e nuvens
    inside += `<path d="M${L} 390 L120 330 L160 360 L205 300 L250 350 L285 320 L${R} 345 L${R} ${B} L${L} ${B} Z" fill="${P.mt[0]}"/>
      <path d="M${L} 410 L130 370 L175 395 L225 350 L270 392 L${R} 372 L${R} ${B} L${L} ${B} Z" fill="${P.mt[1]}"/>
      <path d="M${L} 430 L150 405 L215 420 L280 400 L${R} 410 L${R} ${B} L${L} ${B} Z" fill="${P.mt[2]}"/>`;
    for (let i = 0; i < 9; i++) { const x = L + 8 + i * 26 + rnd() * 8, h = 34 + rnd() * 26, y = B - 4; inside += `<path d="M${x} ${y - h} L${x - 12} ${y} L${x + 12} ${y} Z" fill="${P.tree[i % 2]}"/>`; }
    if (theme !== 'night') inside += `<g fill="#fff" opacity=".9"><ellipse cx="130" cy="285" rx="26" ry="10"/><ellipse cx="148" cy="278" rx="18" ry="10"/><ellipse cx="270" cy="300" rx="22" ry="8"/></g>`;
    return `<defs><clipPath id="win"><path d="${shape}"/></clipPath></defs>
      <path d="M${L - 40} ${B + 60} L${L + 20} ${T - r + 30} L${R - 20} ${T - r + 30} L${R + 40} ${B + 60} Z" fill="${P.glow}" opacity="${theme === 'night' ? 0.05 : 0.18}"/>
      <g clip-path="url(#win)" filter="url(#soft)">${inside}</g>
      <path d="${shape}" fill="none" stroke="${P.frame}" stroke-width="24"/>
      <path d="${shape}" fill="none" stroke="${P.frame2}" stroke-width="6" transform="translate(0,2)" opacity=".7"/>
      <line x1="195" y1="${T - r + 6}" x2="195" y2="${B}" stroke="${P.frame}" stroke-width="10"/>
      <line x1="${L}" y1="${T + 40}" x2="${R}" y2="${T + 40}" stroke="${P.frame}" stroke-width="10"/>
      <rect x="${L - 24}" y="${B}" width="${R - L + 48}" height="18" rx="5" fill="${P.frame2}"/><rect x="${L - 24}" y="${B + 14}" width="${R - L + 48}" height="8" rx="3" fill="#000" opacity=".15"/>`;
  }
  function floor(P) {
    let g = `<rect x="0" y="640" width="390" height="204" fill="url(#floor)"/>`;
    for (let i = -8; i <= 8; i++) g += `<line x1="${195 + i * 14}" y1="640" x2="${195 + i * 70}" y2="844" stroke="${P.f2}" stroke-width="2" opacity=".35"/>`;
    for (const y of [668, 710, 768]) g += `<line x1="0" y1="${y}" x2="390" y2="${y}" stroke="${P.f2}" stroke-width="2" opacity=".25"/>`;
    return g + `<rect x="0" y="632" width="390" height="12" fill="${P.frame}"/>`;
  }
  function room(theme) {
    seed = { day: 11, lesson: 21, kitchen: 31, wardrobe: 41, night: 51 }[theme];
    const P = PAL[theme], night = theme === 'night';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.w1}"/><stop offset="1" stop-color="${P.w2}"/></linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.s1}"/><stop offset="1" stop-color="${P.s2}"/></linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.f1}"/><stop offset="1" stop-color="${P.f2}"/></linearGradient>
        <radialGradient id="lg"><stop offset="0" stop-color="${P.glow}" stop-opacity=".85"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
        <radialGradient id="warm" cx=".5" cy=".42" r=".65"><stop offset="0" stop-color="${P.glow}" stop-opacity="${night ? 0.12 : 0.35}"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
        <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1205" stop-opacity="${night ? 0.6 : 0.42}"/></radialGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="1.4"/></filter>
      </defs>
      <rect width="390" height="844" fill="url(#wall)"/>`;
    for (let x = 0; x < 400; x += 42) { s += `<line x1="${x}" y1="0" x2="${x}" y2="640" stroke="${P.plank}" stroke-width="2.5" opacity=".35"/>`; if (rnd() < 0.6) s += `<ellipse cx="${x + 12 + rnd() * 18}" cy="${80 + rnd() * 520}" rx="5" ry="3" fill="${P.plank}" opacity=".35"/>`; }
    s += windowArch(P, theme);
    if (night) s += `<path d="M48 120 Q70 330 52 520 L92 520 Q84 330 98 150 Z" fill="#6d4aa8"/><path d="M342 120 Q320 330 338 520 L298 520 Q306 330 292 150 Z" fill="#6d4aa8"/><rect x="40" y="112" width="310" height="10" rx="5" fill="#3b2a58"/>`;
    // prateleiras
    if (theme === 'kitchen') {
      s += shelf(-6, 250, 92, P, jar(6, 250, '#f2b630') + jar(34, 250, '#e2564a') + `<circle cx="74" cy="238" r="11" fill="#e53935"/><circle cx="62" cy="241" r="9" fill="#ffb300"/>`);
      s += shelf(-6, 390, 92, P, `<circle cx="18" cy="376" r="13" fill="#7cb342"/><circle cx="40" cy="378" r="11" fill="#fb8c00"/>` + jar(54, 390, '#8d6e63'));
      s += shelf(304, 260, 92, P, jar(314, 260, '#ff8a65') + jar(344, 260, '#ffd54f'));
      for (const [x, y, r] of [[330, 340, 22], [365, 360, 17]]) s += `<line x1="${x}" y1="300" x2="${x}" y2="${y - r}" stroke="#5a3417" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r}" fill="#9e9e9e"/><circle cx="${x}" cy="${y}" r="${r - 5}" fill="#757575"/>`;
    } else if (theme === 'wardrobe') {
      s += `<rect x="-4" y="300" width="96" height="8" rx="4" fill="#d4a017"/>`;
      ['#ff6f91', '#4fc3f7', '#ffd54f', '#81c784', '#ba68c8'].forEach((c, i) => { const x = 6 + i * 18; s += `<path d="M${x + 8} 300 l0 8" stroke="#888" stroke-width="2"/><path d="M${x} 312 l8 -4 l8 4 l2 30 l-20 0 Z" fill="${c}"/>`; });
      s += `<ellipse cx="345" cy="360" rx="38" ry="64" fill="#ffd54f"/><ellipse cx="345" cy="360" rx="31" ry="56" fill="#e3f2fd"/><path d="M325 330 L340 320" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
      for (let i = 0; i < 18; i++) { const x = rnd() * 390, y = 60 + rnd() * 560, r = 3 + rnd() * 5; s += `<path d="M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3} Z" fill="#fff6c2" opacity="${0.5 + rnd() * 0.5}"/>`; }
    } else {
      s += shelf(-6, 250, 92, P, books(2, 250, 4) + plant(66, 236, 0.55, night ? ['#2f5b4a', '#244a3c'] : ['#5fbf5a', '#3f9c45']));
      s += shelf(-6, 390, 92, P, jar(8, 390, night ? '#6a5acd' : '#7fd0ff') + books(38, 390, 3));
      s += shelf(304, 260, 92, P, plant(328, 246, 0.55, night ? ['#2f5b4a', '#244a3c'] : ['#5fbf5a', '#3f9c45']) + books(350, 260, 3));
      s += shelf(304, 400, 92, P, `<circle cx="330" cy="378" r="17" fill="#fff6e0" stroke="${P.frame}" stroke-width="4"/><path d="M330 378 L330 368 M330 378 L338 382" stroke="${P.frame}" stroke-width="2.5"/>` + jar(356, 400, '#f2b630'));
    }
    s += vines(P, night);
    s += lantern(62, 150, 0, P) + lantern(330, 160, 0, P);
    s += floor(P);
    // poltrona e planta grande
    if (theme === 'day' || theme === 'lesson') s += `<g transform="translate(-30,560)"><rect x="0" y="40" width="110" height="80" rx="26" fill="#e0703a"/><rect x="0" y="0" width="70" height="90" rx="28" fill="#ef8a4c"/><rect x="10" y="70" width="110" height="34" rx="16" fill="#f6a565"/></g>`;
    if (theme !== 'wardrobe') s += `<g transform="translate(350,640)"><path d="M-26 0 L26 0 L20 46 L-20 46 Z" fill="#d9774a"/>${[-60, -30, 0, 30, 60].map((a, i) => `<ellipse cx="0" cy="-48" rx="22" ry="52" fill="${night ? (i % 2 ? '#2f5b4a' : '#244a3c') : i % 2 ? '#3f9c45' : '#5fbf5a'}" transform="rotate(${a}) translate(0,-6)"/>`).join('')}</g>`;
    if (theme === 'kitchen') s += `<rect x="-10" y="600" width="140" height="70" rx="8" fill="#c58b55"/><rect x="-10" y="592" width="150" height="14" rx="5" fill="#f1e3c8"/><rect x="270" y="600" width="140" height="70" rx="8" fill="#c58b55"/><rect x="262" y="592" width="150" height="14" rx="5" fill="#f1e3c8"/>`;
    s += `<rect width="390" height="844" fill="url(#warm)"/><rect width="390" height="844" fill="url(#vig)"/></svg>`;
    return s;
  }

  /* mapa: floresta com cachoeiras e trilha de madeira passando pelos pontos */
  function map(H, pts) {
    seed = 99;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${H}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd8ff"/><stop offset="${Math.min(0.12, 900 / H)}" stop-color="#bde8c0"/><stop offset="${Math.min(0.2, 1500 / H)}" stop-color="#4fae5c"/><stop offset="1" stop-color="#2f8a46"/></linearGradient>
        <linearGradient id="fall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fd3ff"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#7cc8ff"/></linearGradient>
        <radialGradient id="pool"><stop offset="0" stop-color="#bfeaff"/><stop offset="1" stop-color="#3fa7e8"/></radialGradient>
      </defs><rect width="400" height="${H}" fill="url(#bg)"/>`;
    // montanhas no topo
    s += `<path d="M0 260 L60 150 L120 210 L190 110 L260 200 L330 130 L400 210 L400 420 L0 420 Z" fill="#9cc7e8"/><path d="M0 330 L80 240 L150 300 L230 220 L310 290 L400 250 L400 460 L0 460 Z" fill="#7fb3dc"/>`;
    for (let y0 = 380; y0 < H; y0 += 820) {
      const side = (Math.floor(y0 / 820) % 2) ? 1 : -1, fx = side > 0 ? 300 : 60;
      // penhascos
      for (const cx of [side > 0 ? 330 : 20, side > 0 ? 40 : 360]) { s += `<path d="M${cx - 90} ${y0 + 520} Q ${cx - 70} ${y0 + 80} ${cx} ${y0 + 40} Q ${cx + 80} ${y0 + 70} ${cx + 100} ${y0 + 520} Z" fill="#8b6a52"/><path d="M${cx - 70} ${y0 + 520} Q ${cx - 50} ${y0 + 140} ${cx + 4} ${y0 + 110} Q ${cx + 60} ${y0 + 140} ${cx + 76} ${y0 + 520} Z" fill="#6f523f"/><ellipse cx="${cx}" cy="${y0 + 48}" rx="96" ry="26" fill="#5cbf5c"/>`; }
      // cachoeira
      s += `<rect x="${fx - 26}" y="${y0 + 60}" width="52" height="420" fill="url(#fall)" opacity=".95"/>`;
      for (let k = 0; k < 7; k++) s += `<path d="M${fx - 20 + k * 7} ${y0 + 70} l0 400" stroke="#ffffff" stroke-width="2" opacity=".6" stroke-dasharray="18 12"/>`;
      s += `<ellipse cx="${fx}" cy="${y0 + 500}" rx="80" ry="26" fill="url(#pool)"/>`;
      for (let k = 0; k < 9; k++) s += `<circle cx="${fx - 40 + rnd() * 80}" cy="${y0 + 485 + rnd() * 20}" r="${6 + rnd() * 9}" fill="#fff" opacity=".9"/>`;
      // árvores
      for (let k = 0; k < 9; k++) {
        const x = rnd() < 0.5 ? rnd() * 90 : 310 + rnd() * 90, y = y0 + 150 + rnd() * 640, r = 22 + rnd() * 18;
        s += `<rect x="${x - 4}" y="${y}" width="8" height="${r * 1.4}" fill="#6d4c33"/><circle cx="${x}" cy="${y}" r="${r}" fill="#2e7d32"/><circle cx="${x - r * 0.45}" cy="${y + 4}" r="${r * 0.7}" fill="#43a047"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.6}" fill="#66bb6a"/>`;
        if (k === 3) s += `<g transform="translate(${x - 22},${y - r - 36})"><rect x="0" y="14" width="44" height="30" rx="4" fill="#c27c3e"/><path d="M-6 16 L22 -6 L50 16 Z" fill="#e2564a"/><rect x="15" y="22" width="14" height="12" rx="2" fill="#ffe28a"/></g>`;
      }
      for (let k = 0; k < 18; k++) s += `<circle cx="${rnd() * 400}" cy="${y0 + rnd() * 820}" r="${2 + rnd() * 3}" fill="${pick(['#ff8ab3', '#ffe36b', '#ffffff', '#c792ea'])}"/>`;
      s += `<ellipse cx="${200}" cy="${y0 + 470}" rx="160" ry="30" fill="#ffffff" opacity=".18"/>`;
    }
    // trilha de madeira
    if (pts.length > 1) {
      let d = `M${pts[0].x * 400},${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], m = (a.y - b.y) / 2; d += ` C${a.x * 400},${a.y - m} ${b.x * 400},${b.y + m} ${b.x * 400},${b.y}`; }
      s += `<path d="${d}" stroke="#5a3417" stroke-width="44" fill="none" stroke-linecap="round" opacity=".45" transform="translate(3,6)"/>
        <path d="${d}" stroke="#7a4a24" stroke-width="42" fill="none" stroke-linecap="round"/>
        <path d="${d}" stroke="#d29355" stroke-width="34" fill="none" stroke-linecap="round"/>
        <path d="${d}" stroke="#a86a33" stroke-width="34" fill="none" stroke-dasharray="3 15"/>
        <path d="${d}" stroke="#f0bb7a" stroke-width="8" fill="none" opacity=".45"/>`;
    }
    return s + '</svg>';
  }

  const cache = {};
  window.LUMI_SCENES = {
    room: (theme) => cache[theme] || (cache[theme] = enc(room(theme))),
    map: (H, pts) => enc(map(H, pts)),
  };
})();
