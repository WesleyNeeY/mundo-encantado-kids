/* Cenários ilustrados (SVG) da casa na árvore e do mapa da floresta */
(function () {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const enc = (svg) => 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  const f = (n) => Math.round(n * 10) / 10;

  const PAL = {
    day: { w: ['#eba65a', '#de9447', '#e8a052', '#d68a3e'], grain: '#a0561f', beam: '#6e3713', frame: '#7a3f1a', frame2: '#c07a40', frame3: '#e3a76b', sky: ['#3fa3ef', '#8fd0ff', '#fde9c4'], sun: '#fff6d8', mt: ['#c9dcf0', '#9db9db', '#7c9fcb'], snow: '#ffffff', cliff: ['#7f9a8a', '#5e7b6c'], tree: ['#2f7d45', '#3f9a52', '#245f36'], f1: '#b8703a', f2: '#6a3818', glow: '#fff0c4', lamp: '#ffd36b', leaf: ['#4fae4c', '#3a913c', '#6cc35a', '#2f7d36'], vine: '#3e7a2f', amb: 0.2, vig: 0.46 },
    lesson: { w: ['#eeac62', '#e29b4e', '#eba75a', '#da9046'], grain: '#a35a22', beam: '#6e3713', frame: '#7a3f1a', frame2: '#c07a40', frame3: '#e3a76b', sky: ['#4aacf2', '#9ad6ff', '#fff0d2'], sun: '#fff8e0', mt: ['#cfe0f2', '#a6c0df', '#86a7d0'], snow: '#ffffff', cliff: ['#86a191', '#64826f'], tree: ['#358549', '#46a058', '#2a6a3c'], f1: '#b8703a', f2: '#6a3818', glow: '#fff3d0', lamp: '#ffd36b', leaf: ['#4fae4c', '#3a913c', '#6cc35a', '#2f7d36'], vine: '#3e7a2f', amb: 0.2, vig: 0.44 },
    kitchen: { w: ['#f6c47f', '#ecb26a', '#f3bb74', '#e5a960'], grain: '#a35a22', beam: '#6e3713', frame: '#7a3f1a', frame2: '#c07a40', frame3: '#e3a76b', sky: ['#45a8f1', '#96d3ff', '#ffeccc'], sun: '#fff8e0', mt: ['#cbdef1', '#a2bddd', '#82a3ce'], snow: '#ffffff', cliff: ['#86a191', '#64826f'], tree: ['#358549', '#46a058', '#2a6a3c'], f1: '#c07a3e', f2: '#7a4423', glow: '#fff3c9', lamp: '#ffd36b', leaf: ['#4fae4c', '#3a913c', '#6cc35a', '#2f7d36'], vine: '#3e7a2f', amb: 0.2, vig: 0.44 },
    wardrobe: { w: ['#e9b8ec', '#dca6e3', '#e5b0e9', '#d49bdc'], grain: '#8a4fb0', beam: '#5b2a78', frame: '#6b2f86', frame2: '#a35cc4', frame3: '#d39aea', sky: ['#7a5bd6', '#ff9fc9', '#ffe3c4'], sun: '#fff0f8', mt: ['#e2b6ea', '#c99be0', '#ad80d2'], snow: '#fff6ff', cliff: ['#9a7fb8', '#7c62a0'], tree: ['#7e57c2', '#9575cd', '#5e35b1'], f1: '#9c5fbf', f2: '#4f2368', glow: '#fff0fb', lamp: '#ffd9f2', leaf: ['#9ccc65', '#7cb342', '#aed581', '#689f38'], vine: '#6a8a3a', amb: 0.3, vig: 0.4 },
    night: { w: ['#4f4384', '#463b78', '#4b4080', '#41376f'], grain: '#231c4d', beam: '#1d1640', frame: '#33264f', frame2: '#5b4682', frame3: '#7d68a8', sky: ['#081440', '#1d2d78', '#3a4a9e'], sun: '#fff6d0', mt: ['#2f3d80', '#26326c', '#1d275a'], snow: '#c9d2ff', cliff: ['#2d3b60', '#223050'], tree: ['#173847', '#1f4655', '#112b37'], f1: '#3b2f63', f2: '#15112e', glow: '#ffcf7a', lamp: '#ffb547', leaf: ['#2f5b4a', '#244a3c', '#3a6b58', '#1d3c31'], vine: '#2a4a3a', amb: 0.14, vig: 0.62 },
  };

  /* ---------- peças ---------- */
  const leaf = (x, y, r, s, fill, vein) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(r)}) scale(${f(s)})"><path d="M0 -20 C 11 -11, 11 9, 0 20 C -11 9, -11 -11, 0 -20 Z" fill="${fill}"/><path d="M0 -17 Q 1.5 0 0 17" stroke="${vein}" stroke-width="1.2" fill="none" opacity=".55"/></g>`;
  function lantern(x, y, P) {
    return `<line x1="${x}" y1="0" x2="${x}" y2="${y - 18}" stroke="#4a2a12" stroke-width="2.2"/>
      <circle cx="${x}" cy="${y + 12}" r="95" fill="url(#lg)"/>
      <path d="M${x - 15} ${y - 10} Q ${x} ${y - 26} ${x + 15} ${y - 10} Z" fill="#5a3417"/>
      <rect x="${x - 17}" y="${y - 10}" width="34" height="42" rx="11" fill="${P.lamp}" stroke="#4a2a12" stroke-width="3"/>
      <rect x="${x - 9}" y="${y - 4}" width="18" height="30" rx="7" fill="#fffbe8" opacity=".9"/>
      <line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y + 32}" stroke="#4a2a12" stroke-width="2"/>
      <rect x="${x - 13}" y="${y + 32}" width="26" height="7" rx="3" fill="#5a3417"/>`;
  }
  function pot(x, y, s, P, kind) {
    let g = `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="30" rx="22" ry="5" fill="#000" opacity=".18"/>`;
    const L = P.leaf;
    if (kind === 'fern') for (let i = 0; i < 9; i++) { const a = -95 + i * 23 + rnd() * 8; g += `<g transform="rotate(${f(a)})">${leaf(0, -34, 0, 1.1 + rnd() * 0.3, L[i % 4], '#1d4a1f')}</g>`; }
    else for (let i = 0; i < 6; i++) { const a = -70 + i * 28; g += leaf(Math.sin((a * Math.PI) / 180) * 22, -26 - Math.cos((a * Math.PI) / 180) * 14, a, 0.95, L[i % 4], '#1d4a1f'); }
    g += `<path d="M-19 0 L19 0 L14 28 L-14 28 Z" fill="url(#potg)"/><rect x="-21" y="-5" width="42" height="9" rx="4" fill="#e9905e"/><rect x="-14" y="6" width="5" height="18" rx="2" fill="#fff" opacity=".18"/></g>`;
    return g;
  }
  function books(x, y, n) {
    let g = '', cx = x;
    for (let i = 0; i < n; i++) {
      const w = 9 + rnd() * 6, h = 28 + rnd() * 18, c = pick(['#d94a3f', '#3a74cc', '#eeb02c', '#4fa862', '#8653c4', '#e9802f']), tilt = i === n - 1 && rnd() < 0.5 ? 8 : 0;
      g += `<g transform="rotate(${tilt} ${f(cx)} ${y})"><rect x="${f(cx)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" rx="2" fill="${c}"/><rect x="${f(cx)}" y="${f(y - h)}" width="${f(w * 0.3)}" height="${f(h)}" fill="#fff" opacity=".14"/><rect x="${f(cx + 1.5)}" y="${f(y - h + 5)}" width="${f(w - 3)}" height="2.5" fill="#ffe7a8" opacity=".85"/><rect x="${f(cx + 1.5)}" y="${f(y - 9)}" width="${f(w - 3)}" height="2.5" fill="#ffe7a8" opacity=".85"/></g>`;
      cx += w + 1.6;
    }
    return g;
  }
  function jar(x, y, c) { return `<rect x="${x}" y="${y - 32}" width="26" height="32" rx="8" fill="#d8f3ff" opacity=".8"/><rect x="${x + 3}" y="${y - 23}" width="20" height="20" rx="6" fill="${c}"/><rect x="${x + 4}" y="${y - 29}" width="4" height="22" rx="2" fill="#fff" opacity=".7"/><rect x="${x - 1}" y="${y - 37}" width="28" height="8" rx="3" fill="#a8622a"/>`; }
  function shelf(x, y, w, P, items) {
    return `<path d="M${x + 10} ${y + 10} l0 18 l14 -18 Z M${x + w - 10} ${y + 10} l0 18 l-14 -18 Z" fill="${P.frame}"/><rect x="${x}" y="${y + 6}" width="${w}" height="12" fill="#000" opacity=".16"/><rect x="${x}" y="${y}" width="${w}" height="13" rx="3" fill="url(#shelfg)"/><rect x="${x}" y="${y}" width="${w}" height="3.5" rx="2" fill="#fff" opacity=".28"/>${items}`;
  }
  function picture(x, y, w, h, P) {
    return `<rect x="${x - 4}" y="${y - 4}" width="${w + 8}" height="${h + 8}" rx="5" fill="${P.frame}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe6ff"/><path d="M${x} ${y + h} L${x + w * 0.35} ${y + h * 0.45} L${x + w * 0.6} ${y + h * 0.75} L${x + w * 0.8} ${y + h * 0.5} L${x + w} ${y + h * 0.7} L${x + w} ${y + h} Z" fill="#5aa86a"/><circle cx="${x + w * 0.75}" cy="${y + h * 0.28}" r="${w * 0.1}" fill="#ffe27a"/>`;
  }
  function clock(x, y, P) { return `<circle cx="${x}" cy="${y}" r="19" fill="${P.frame}"/><circle cx="${x}" cy="${y}" r="15" fill="#fff8e8"/>${[0, 1, 2, 3].map((i) => `<circle cx="${f(x + Math.cos((i * Math.PI) / 2) * 11)}" cy="${f(y + Math.sin((i * Math.PI) / 2) * 11)}" r="1.6" fill="${P.frame}"/>`).join('')}<path d="M${x} ${y} L${x} ${y - 9} M${x} ${y} L${x + 7} ${y + 3}" stroke="${P.frame}" stroke-width="2.5" stroke-linecap="round"/>`; }

  /* paisagem da janela: céu, sol, montanhas com neve, cachoeira, lago e floresta */
  function landscape(P, theme, L, R, T) {
    const night = theme === 'night';
    let g = `<rect x="${L}" y="${T}" width="${R - L}" height="300" fill="url(#sky)"/>`;
    if (night) {
      for (let i = 0; i < 40; i++) g += `<circle cx="${f(L + rnd() * (R - L))}" cy="${f(T + rnd() * 160)}" r="${f(0.6 + rnd() * 1.5)}" fill="#fff" opacity="${f(0.4 + rnd() * 0.6)}"/>`;
      g += `<circle cx="252" cy="${T + 60}" r="40" fill="#fff3c4" opacity=".25"/><circle cx="252" cy="${T + 60}" r="27" fill="#fff6d6"/><circle cx="264" cy="${T + 52}" r="23" fill="url(#sky)"/>`;
    } else {
      g += `<circle cx="248" cy="${T + 78}" r="70" fill="url(#sunglow)"/><circle cx="248" cy="${T + 78}" r="20" fill="${P.sun}"/>`;
      for (const [cx, cy, s] of [[128, T + 70, 1], [205, T + 40, 0.7], [292, T + 110, 0.8]]) g += `<g opacity=".95" transform="translate(${cx},${cy}) scale(${s})"><ellipse cx="0" cy="6" rx="30" ry="10" fill="#fff"/><circle cx="-12" cy="0" r="12" fill="#fff"/><circle cx="6" cy="-4" r="15" fill="#fff"/><circle cx="20" cy="3" r="9" fill="#fff"/><ellipse cx="0" cy="12" rx="28" ry="4" fill="#d6e8f8" opacity=".7"/></g>`;
    }
    // montanhas
    g += `<path d="M${L} ${T + 175} L${L + 30} ${T + 120} L${L + 62} ${T + 150} L${L + 105} ${T + 92} L${L + 150} ${T + 140} L${L + 182} ${T + 108} L${R} ${T + 150} L${R} ${T + 300} L${L} ${T + 300} Z" fill="url(#mt0)"/>
      <path d="M${L + 105} ${T + 92} L${L + 92} ${T + 110} L${L + 100} ${T + 106} L${L + 108} ${T + 114} L${L + 116} ${T + 104} L${L + 121} ${T + 108} Z M${L + 182} ${T + 108} L${L + 172} ${T + 120} L${L + 182} ${T + 117} L${L + 192} ${T + 122} Z" fill="${P.snow}" opacity=".9"/>
      <path d="M${L} ${T + 205} L${L + 48} ${T + 160} L${L + 95} ${T + 190} L${L + 145} ${T + 150} L${R} ${T + 195} L${R} ${T + 300} L${L} ${T + 300} Z" fill="url(#mt1)"/>`;
    // penhasco com cachoeira
    g += `<path d="M${L + 120} ${T + 300} L${L + 128} ${T + 185} Q ${L + 150} ${T + 168} ${L + 178} ${T + 176} L${L + 186} ${T + 300} Z" fill="${P.cliff[0]}"/><path d="M${L + 120} ${T + 300} L${L + 126} ${T + 200} Q ${L + 140} ${T + 190} ${L + 150} ${T + 196} L${L + 148} ${T + 300} Z" fill="${P.cliff[1]}"/>
      <ellipse cx="${L + 152}" cy="${T + 176}" rx="30" ry="7" fill="${P.tree[1]}"/>
      <rect x="${L + 146}" y="${T + 178}" width="14" height="78" fill="url(#fallg)"/>
      ${[0, 1, 2].map((k) => `<path d="M${L + 148 + k * 4} ${T + 180} L${L + 148 + k * 4} ${T + 254}" stroke="#fff" stroke-width="1.4" opacity=".8" stroke-dasharray="7 6"/>`).join('')}
      <ellipse cx="${L + 153}" cy="${T + 256}" rx="22" ry="6" fill="#fff" opacity=".85"/>`;
    // lago e floresta
    g += `<path d="M${L} ${T + 240} Q ${L + 70} ${T + 225} ${R} ${T + 238} L${R} ${T + 300} L${L} ${T + 300} Z" fill="${P.tree[2]}"/>
      <ellipse cx="${L + 155}" cy="${T + 268}" rx="60" ry="10" fill="url(#lake)"/>`;
    for (let i = 0; i < 16; i++) {
      const x = L + 4 + i * ((R - L) / 15) + rnd() * 6, h = 26 + rnd() * 30, y = T + 262 + rnd() * 10;
      if (Math.abs(x - (L + 155)) < 40) continue;
      g += `<path d="M${f(x)} ${f(y - h)} L${f(x - 10)} ${f(y - h * 0.45)} L${f(x - 5)} ${f(y - h * 0.45)} L${f(x - 13)} ${f(y)} L${f(x + 13)} ${f(y)} L${f(x + 5)} ${f(y - h * 0.45)} L${f(x + 10)} ${f(y - h * 0.45)} Z" fill="${P.tree[i % 2]}"/>`;
    }
    g += `<path d="M${L} ${T + 300} L${L} ${T + 282} Q ${L + 60} ${T + 270} ${L + 110} ${T + 284} Q ${L + 170} ${T + 296} ${R} ${T + 280} L${R} ${T + 300} Z" fill="${P.tree[1]}"/>`;
    for (let i = 0; i < 14; i++) g += `<circle cx="${f(L + rnd() * (R - L))}" cy="${f(T + 286 + rnd() * 10)}" r="1.8" fill="${pick(['#ffe36b', '#ff8ab3', '#ffffff'])}"/>`;
    return g;
  }
  function windowArch(P, theme) {
    const L = 78, R = 312, B = 478, r = (R - L) / 2, T = 255;
    const shape = `M${L} ${B} L${L} ${T} A${r} ${r} 0 0 1 ${R} ${T} L${R} ${B} Z`;
    return `<defs><clipPath id="win"><path d="${shape}"/></clipPath></defs>
      <g clip-path="url(#win)">${landscape(P, theme, L, R, T - r)}
        <path d="M${L + 30} ${B} L${L + 120} ${T - r} L${L + 150} ${T - r} L${L + 60} ${B} Z" fill="#fff" opacity="${theme === 'night' ? 0.03 : 0.1}"/></g>
      <path d="${shape}" fill="none" stroke="url(#frameg)" stroke-width="26"/>
      <path d="${shape}" fill="none" stroke="${P.frame3}" stroke-width="3" opacity=".7" transform="translate(0,-9) scale(1)"/>
      <path d="M195 ${T - r + 4} L195 ${B}" stroke="url(#frameg)" stroke-width="11"/><path d="M${L} ${T + 46} L${R} ${T + 46}" stroke="url(#frameg)" stroke-width="11"/>
      <path d="M193 ${T - r + 6} L193 ${B}" stroke="${P.frame3}" stroke-width="2" opacity=".6"/>
      <rect x="${L - 30}" y="${B}" width="${R - L + 60}" height="20" rx="6" fill="url(#shelfg)"/><rect x="${L - 30}" y="${B}" width="${R - L + 60}" height="4" rx="2" fill="#fff" opacity=".3"/><rect x="${L - 26}" y="${B + 18}" width="${R - L + 52}" height="9" rx="3" fill="#000" opacity=".16"/>`;
  }
  function walls(P) {
    let g = '';
    for (let i = 0, x = -10; x < 400; i++, x += 40) {
      const c = P.w[i % P.w.length];
      g += `<rect x="${x}" y="0" width="41" height="660" fill="${c}"/><rect x="${x}" y="0" width="3" height="660" fill="${P.grain}" opacity=".35"/><rect x="${x + 3}" y="0" width="5" height="660" fill="#fff" opacity=".07"/>`;
      for (let k = 0; k < 3; k++) { const gx = x + 9 + k * 10 + rnd() * 4; let d = `M${f(gx)} 0`; for (let y = 40; y <= 680; y += 40) d += ` Q ${f(gx + (rnd() - 0.5) * 7)} ${y - 20} ${f(gx + (rnd() - 0.5) * 3)} ${y}`; g += `<path d="${d}" stroke="${P.grain}" stroke-width="${f(0.7 + rnd() * 0.8)}" fill="none" opacity="${f(0.16 + rnd() * 0.14)}"/>`; }
      if (rnd() < 0.55) { const ky = 60 + rnd() * 540, kx = x + 12 + rnd() * 16; g += `<ellipse cx="${f(kx)}" cy="${f(ky)}" rx="6" ry="3.5" fill="${P.grain}" opacity=".3"/><ellipse cx="${f(kx)}" cy="${f(ky)}" rx="10" ry="6" fill="none" stroke="${P.grain}" stroke-width=".8" opacity=".25"/>`; }
    }
    // vigas e troncos da árvore nas laterais
    g += `<rect x="-10" y="92" width="410" height="16" fill="${P.beam}"/><rect x="-10" y="92" width="410" height="4" fill="#fff" opacity=".12"/><rect x="-10" y="108" width="410" height="8" fill="#000" opacity=".12"/>`;
    for (const [x0, dir] of [[-22, 1], [412, -1]]) {
      let bark = `<path d="M${x0} 0 Q ${x0 + 44 * dir} 260 ${x0 + 30 * dir} 660 L${x0} 660 Z" fill="url(#barkg)"/>`;
      for (let k = 0; k < 6; k++) bark += `<path d="M${x0 + (6 + k * 5) * dir} 0 Q ${x0 + (30 + k * 3) * dir} 300 ${x0 + (16 + k * 3) * dir} 660" stroke="#3a1f0c" stroke-width="1.3" fill="none" opacity=".35"/>`;
      g += bark;
    }
    return g;
  }
  function floor(P) {
    let g = `<rect x="0" y="652" width="390" height="192" fill="url(#floor)"/>`;
    for (let i = -9; i <= 9; i++) g += `<line x1="${195 + i * 13}" y1="652" x2="${195 + i * 72}" y2="844" stroke="${P.f2}" stroke-width="2" opacity=".32"/>`;
    for (const y of [676, 716, 772, 840]) g += `<line x1="0" y1="${y}" x2="390" y2="${y}" stroke="${P.f2}" stroke-width="1.6" opacity=".2"/>`;
    return g + `<rect x="0" y="642" width="390" height="14" fill="${P.beam}"/><rect x="0" y="642" width="390" height="3" fill="#fff" opacity=".15"/><rect x="0" y="656" width="390" height="22" fill="url(#floorshade)"/>`;
  }
  function armchair() {
    return `<g transform="translate(-34,566)"><ellipse cx="62" cy="130" rx="74" ry="10" fill="#000" opacity=".2"/>
      <rect x="0" y="0" width="84" height="104" rx="34" fill="url(#chairg)"/><rect x="8" y="10" width="62" height="70" rx="26" fill="#f59a5c" opacity=".55"/>
      <rect x="-4" y="54" width="136" height="64" rx="28" fill="url(#chairg)"/><rect x="18" y="64" width="104" height="30" rx="15" fill="#ffb27a"/>
      <rect x="96" y="40" width="34" height="78" rx="16" fill="#d95f2b"/><circle cx="58" cy="48" r="18" fill="#fff1d6"/><path d="M48 46 L68 46 M58 36 L58 58" stroke="#f2b630" stroke-width="3" opacity=".7"/></g>`;
  }
  function bigPlant(P, night) {
    let g = `<g transform="translate(352,646)"><ellipse cx="0" cy="48" rx="40" ry="7" fill="#000" opacity=".22"/>`;
    const cols = P.leaf;
    for (let i = 0; i < 9; i++) { const a = -75 + i * 18, s = 1.05 + rnd() * 0.45; g += `<g transform="rotate(${f(a)})"><path d="M0 -6 Q -4 -40 0 -${f(60 * s)}" stroke="${night ? '#1d3c31' : '#2f6b2c'}" stroke-width="3" fill="none"/>${leaf(0, -60 * s, 0, s * 1.15, cols[i % 4], '#163a17')}</g>`; }
    g += `<path d="M-30 0 L30 0 L23 48 L-23 48 Z" fill="url(#potg)"/><rect x="-33" y="-7" width="66" height="12" rx="5" fill="#e9905e"/><rect x="-22" y="8" width="7" height="32" rx="3" fill="#fff" opacity=".16"/></g>`;
    return g;
  }

  /* camada da frente: folhas e cipós (balançam com CSS) */
  function vines(theme) {
    seed = 77;
    const P = PAL[theme], L = P.leaf;
    let g = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">`;
    g += `<path d="M-14 22 C 50 70, 120 0, 195 30 S 330 0, 404 34" stroke="${P.vine}" stroke-width="6" fill="none"/>`;
    for (let i = 0; i < 52; i++) { const t = i / 51, x = -12 + t * 414, y = 24 + Math.sin(t * 9.3) * 13 + rnd() * 8; g += leaf(x, y + 6, rnd() * 360, 0.5 + rnd() * 0.35, L[i % 4], '#1d4a1f'); }
    for (const [sx, n] of [[18, 16], [372, 14]]) {
      let d = `M${sx} 20`; for (let k = 1; k <= n; k++) d += ` Q ${sx + (k % 2 ? 9 : -9)} ${20 + k * 17 - 8} ${sx} ${20 + k * 17}`;
      g += `<path d="${d}" stroke="${P.vine}" stroke-width="3" fill="none"/>`;
      for (let k = 1; k <= n; k++) g += leaf(sx + (k % 2 ? 7 : -7), 20 + k * 17, k % 2 ? 50 : -50, 0.42 + rnd() * 0.12, L[k % 4], '#1d4a1f');
    }
    for (const [x, y, c] of [[120, 34, '#ff8ab3'], [262, 26, '#fff4a8'], [330, 40, '#ff8ab3'], [60, 52, '#fff4a8']]) g += `<g transform="translate(${x},${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-5" rx="3.6" ry="5.5" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="2.8" fill="#ffb300"/></g>`;
    return g + '</svg>';
  }
  /* raios de luz da janela */
  function rays(theme) {
    const night = theme === 'night', c = night ? '#ffd890' : '#fff6d8';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="${night ? 0.1 : 0.3}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs>
      <path d="M150 150 L235 150 L330 760 L60 760 Z" fill="url(#r)"/><path d="M190 140 L215 140 L265 700 L150 700 Z" fill="url(#r)" opacity=".8"/><path d="M110 170 L140 170 L120 720 L10 720 Z" fill="url(#r)" opacity=".6"/></svg>`;
  }

  function room(theme) {
    seed = { day: 11, lesson: 21, kitchen: 31, wardrobe: 41, night: 51 }[theme];
    const P = PAL[theme], night = theme === 'night';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset=".6" stop-color="${P.sky[1]}"/><stop offset="1" stop-color="${P.sky[2]}"/></linearGradient>
        <radialGradient id="sunglow"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".4" stop-color="#fff2c0" stop-opacity=".5"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
        <linearGradient id="mt0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.mt[0]}"/><stop offset="1" stop-color="${P.mt[1]}"/></linearGradient>
        <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.mt[1]}"/><stop offset="1" stop-color="${P.mt[2]}"/></linearGradient>
        <linearGradient id="fallg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fd8ff"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#8fd0ff"/></linearGradient>
        <radialGradient id="lake"><stop offset="0" stop-color="#d4f2ff"/><stop offset="1" stop-color="#5fb4ea"/></radialGradient>
        <linearGradient id="frameg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.frame2}"/><stop offset=".5" stop-color="${P.frame}"/><stop offset="1" stop-color="${P.frame2}"/></linearGradient>
        <linearGradient id="shelfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.frame3}"/><stop offset="1" stop-color="${P.frame2}"/></linearGradient>
        <linearGradient id="barkg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a2f12"/><stop offset=".5" stop-color="#8a4f24"/><stop offset="1" stop-color="#4a250d"/></linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.f1}"/><stop offset="1" stop-color="${P.f2}"/></linearGradient>
        <linearGradient id="floorshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
        <linearGradient id="potg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8643a"/><stop offset=".45" stop-color="#e8875a"/><stop offset="1" stop-color="#b85630"/></linearGradient>
        <linearGradient id="chairg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f08a4c"/><stop offset="1" stop-color="#c9592a"/></linearGradient>
        <radialGradient id="lg"><stop offset="0" stop-color="${P.glow}" stop-opacity="${night ? 0.95 : 0.8}"/><stop offset=".5" stop-color="${P.glow}" stop-opacity="${night ? 0.35 : 0.25}"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
        <radialGradient id="warm" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${P.glow}" stop-opacity="${P.amb}"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/></radialGradient>
        <radialGradient id="vig" cx=".5" cy=".45" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1205" stop-opacity="${P.vig}"/></radialGradient>
      </defs>`;
    s += walls(P);
    s += windowArch(P, theme);
    if (night) s += `<path d="M44 128 Q72 330 50 528 L98 528 Q86 330 102 158 Z" fill="#6d4aa8"/><path d="M44 128 Q60 330 50 528" stroke="#8a66c8" stroke-width="5" fill="none" opacity=".6"/><path d="M346 128 Q318 330 340 528 L292 528 Q304 330 288 158 Z" fill="#6d4aa8"/><rect x="36" y="120" width="318" height="10" rx="5" fill="#2a1f46"/>`;
    if (theme === 'kitchen') {
      s += shelf(-4, 258, 96, P, jar(8, 258, '#f2b630') + jar(38, 258, '#e2564a') + `<circle cx="76" cy="246" r="11" fill="#e53935"/><circle cx="66" cy="249" r="9" fill="#ffb300"/>`);
      s += shelf(-4, 398, 96, P, `<circle cx="18" cy="384" r="13" fill="#7cb342"/><circle cx="40" cy="386" r="11" fill="#fb8c00"/>` + jar(56, 398, '#8d6e63'));
      s += shelf(298, 268, 96, P, jar(310, 268, '#ff8a65') + jar(342, 268, '#ffd54f'));
      for (const [x, y, r] of [[328, 350, 22], [364, 368, 17]]) s += `<line x1="${x}" y1="306" x2="${x}" y2="${y - r}" stroke="#4a2a12" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r}" fill="#b0b0b0"/><circle cx="${x}" cy="${y}" r="${r - 5}" fill="#7a7a7a"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#fff" opacity=".35"/>`;
      s += `<rect x="-10" y="600" width="140" height="70" rx="8" fill="#c58b55"/><rect x="-10" y="590" width="150" height="15" rx="5" fill="#f4e7cf"/><rect x="262" y="600" width="140" height="70" rx="8" fill="#c58b55"/><rect x="254" y="590" width="150" height="15" rx="5" fill="#f4e7cf"/>`;
    } else if (theme === 'wardrobe') {
      s += `<rect x="-4" y="300" width="100" height="8" rx="4" fill="#d4a017"/>`;
      ['#ff6f91', '#4fc3f7', '#ffd54f', '#81c784', '#ba68c8'].forEach((c, i) => { const x = 6 + i * 18; s += `<path d="M${x + 8} 300 l0 8" stroke="#888" stroke-width="2"/><path d="M${x} 312 l8 -4 l8 4 l2 32 l-20 0 Z" fill="${c}"/><path d="M${x + 2} 314 l4 0 l0 28 l-4 0 Z" fill="#fff" opacity=".2"/>`; });
      s += `<ellipse cx="345" cy="362" rx="40" ry="66" fill="#e0b13a"/><ellipse cx="345" cy="362" rx="32" ry="57" fill="#e8f4ff"/><path d="M326 330 L342 318" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
      for (let i = 0; i < 20; i++) { const x = rnd() * 390, y = 60 + rnd() * 560, r = 3 + rnd() * 5; s += `<path d="M${f(x)} ${f(y - r)} L${f(x + r * 0.3)} ${f(y - r * 0.3)} L${f(x + r)} ${f(y)} L${f(x + r * 0.3)} ${f(y + r * 0.3)} L${f(x)} ${f(y + r)} L${f(x - r * 0.3)} ${f(y + r * 0.3)} L${f(x - r)} ${f(y)} L${f(x - r * 0.3)} ${f(y - r * 0.3)} Z" fill="#fff6c2" opacity="${f(0.5 + rnd() * 0.5)}"/>`; }
    } else {
      s += shelf(-4, 258, 96, P, books(4, 258, 4) + pot(72, 230, 0.55, P, 'fern'));
      s += shelf(-4, 398, 96, P, jar(8, 398, night ? '#6a5acd' : '#7fd0ff') + books(40, 398, 3) + `<circle cx="84" cy="390" r="7" fill="#ffd54f"/>`);
      s += shelf(298, 268, 96, P, pot(322, 240, 0.55, P) + books(344, 268, 3));
      s += shelf(298, 408, 96, P, clock(326, 386, P) + jar(352, 408, '#f2b630'));
      s += picture(318, 150, 52, 40, P);
    }
    s += lantern(60, 158, P) + lantern(332, 166, P);
    s += floor(P);
    if (theme === 'day' || theme === 'lesson') s += armchair();
    if (theme !== 'wardrobe' && theme !== 'kitchen') s += bigPlant(P, night);
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
  const memo = (k, fn) => cache[k] || (cache[k] = enc(fn()));
  window.LUMI_SCENES = {
    room: (theme) => memo('r' + theme, () => room(theme)),
    vines: (theme) => memo('v' + theme, () => vines(theme)),
    rays: (theme) => memo('y' + theme, () => rays(theme)),
    map: (H, pts) => enc(map(H, pts)),
  };
})();
