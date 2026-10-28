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
    if (theme === 'school') return school();
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

  /* ================= MAPA: floresta encantada cinematográfica =================
     O mapa é desenhado em pedaços (chunks) com coordenadas do mundo (400 × H).
     Só os pedaços perto da tela recebem imagem — leve no celular. */
  const WP = [ // de baixo (Mundo 1) para cima (Mundo 6)
    { g: ['#5dbb5c', '#3f9c4c'], leaf: ['#1d6a34', '#2d8a44', '#4bb04f', '#8fd86c'], flw: ['#ff7aa8', '#ffe36b', '#ffffff', '#c792ea'], water: ['#8fe6ff', '#2fa6e8', '#1a6fc0'] },
    { g: ['#86c95a', '#62ad48'], leaf: ['#2b7a2e', '#3f9a3a', '#6cbf45', '#b9e36c'], flw: ['#ffe36b', '#ffffff', '#ffb347', '#ff8ab3'], water: ['#8fe6ff', '#2fa6e8', '#1a6fc0'] },
    { g: ['#9bbb52', '#76a03e'], leaf: ['#a8461c', '#d8661f', '#f29b2b', '#ffd36b'], flw: ['#ff8a3d', '#ffe36b', '#ffffff', '#e5533b'], water: ['#9ae8ff', '#38a8e0', '#1d72b8'] },
    { g: ['#78c470', '#55a65c'], leaf: ['#c2588f', '#e57fb5', '#ffb3d6', '#ffe2f0'], flw: ['#ff9ccc', '#ffffff', '#c792ea', '#ffe36b'], water: ['#9be9ff', '#36a9e6', '#1d70bd'] },
    { g: ['#36b48e', '#1f8f70'], leaf: ['#0e5a48', '#178a63', '#2fbf7f', '#86e6ad'], flw: ['#ff6b8a', '#ffd23f', '#ffffff', '#ff9a3d'], water: ['#7ff0ff', '#1fb3d6', '#0f78a8'] },
    { g: ['#3f7a8f', '#2c5c74'], leaf: ['#173f5e', '#245c84', '#3d82b8', '#8fc7ff'], flw: ['#9ff3ff', '#d6a8ff', '#ffffff', '#7fffd4'], water: ['#a9f2ff', '#4fb8f0', '#2c6fc0'] },
  ];
  const GREEN = ['#1d6a34', '#2d8a44', '#4bb04f', '#8fd86c'];
  const SKY = 760; // acima disso: céu, montanhas e nuvens

  // trilha: curva igual à do app (cúbica vertical)
  function trail(pts) {
    let d = `M${f(pts[0].x * 400)},${f(pts[0].y)}`; const sm = [];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], m = (a.y - b.y) / 2, ax = a.x * 400, bx = b.x * 400;
      d += ` C${f(ax)},${f(a.y - m)} ${f(bx)},${f(b.y + m)} ${f(bx)},${f(b.y)}`;
      for (let k = 0; k < 16; k++) {
        const t = k / 16, u = 1 - t;
        sm.push({ x: u * u * u * ax + 3 * u * u * t * ax + 3 * u * t * t * bx + t * t * t * bx, y: u * u * u * a.y + 3 * u * u * t * (a.y - m) + 3 * u * t * t * (b.y + m) + t * t * t * b.y });
      }
    }
    sm.push({ x: pts[pts.length - 1].x * 400, y: pts[pts.length - 1].y });
    return { d, sm };
  }

  /* ----- peças do mapa (desenhadas na origem; base no chão) ----- */
  const shadow = (x, y, rx, ry, o) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#0b2a12" opacity="${o || 0.22}"/>`;
  function canopy(x, y, r, L) { // copa volumosa com luz vindo do alto à esquerda
    let s = `<circle cx="${f(x + r * 0.12)}" cy="${f(y + r * 0.16)}" r="${f(r)}" fill="${L[0]}"/>`;
    s += `<circle cx="${f(x - r * 0.42)}" cy="${f(y + r * 0.12)}" r="${f(r * 0.66)}" fill="${L[1]}"/><circle cx="${f(x + r * 0.42)}" cy="${f(y + r * 0.02)}" r="${f(r * 0.62)}" fill="${L[1]}"/><circle cx="${f(x - r * 0.05)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.7)}" fill="${L[1]}"/>`;
    s += `<circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.38)}" r="${f(r * 0.44)}" fill="${L[2]}"/><circle cx="${f(x - r * 0.62)}" cy="${f(y - r * 0.02)}" r="${f(r * 0.3)}" fill="${L[2]}"/><circle cx="${f(x + r * 0.18)}" cy="${f(y - r * 0.55)}" r="${f(r * 0.3)}" fill="${L[2]}"/>`;
    s += `<circle cx="${f(x - r * 0.38)}" cy="${f(y - r * 0.5)}" r="${f(r * 0.17)}" fill="${L[3]}" opacity=".8"/><circle cx="${f(x + r * 0.08)}" cy="${f(y - r * 0.72)}" r="${f(r * 0.11)}" fill="${L[3]}" opacity=".7"/><circle cx="${f(x - r * 0.72)}" cy="${f(y - r * 0.12)}" r="${f(r * 0.1)}" fill="${L[3]}" opacity=".7"/>`;
    return s;
  }
  function tree(x, y, r, L, trunk) {
    const h = r * 1.15;
    return shadow(x + r * 0.35, y + 2, r * 0.95, r * 0.24) + `<path d="M${f(x - 7)} ${f(y)} Q ${f(x - 4)} ${f(y - h * 0.6)} ${f(x - 3)} ${f(y - h)} L ${f(x + 4)} ${f(y - h)} Q ${f(x + 5)} ${f(y - h * 0.6)} ${f(x + 8)} ${f(y)} Z" fill="${trunk || '#6b4128'}"/><path d="M${f(x - 1)} ${f(y - 4)} Q ${f(x)} ${f(y - h * 0.5)} ${f(x - 1)} ${f(y - h + 4)}" stroke="#3d2414" stroke-width="1.4" fill="none" opacity=".6"/>` + canopy(x, y - h - r * 0.5, r, L);
  }
  function pine(x, y, h, L) {
    let s = shadow(x + h * 0.2, y + 2, h * 0.32, h * 0.08) + `<rect x="${f(x - 3)}" y="${f(y - h * 0.22)}" width="6" height="${f(h * 0.22)}" fill="#5a3620"/>`;
    for (let k = 0; k < 4; k++) {
      const ty = y - h * 0.16 - k * h * 0.2, w = h * (0.36 - k * 0.07), th = h * 0.34;
      s += `<path d="M${f(x)} ${f(ty - th)} L${f(x + w)} ${f(ty)} L${f(x - w)} ${f(ty)} Z" fill="${L[0]}"/><path d="M${f(x)} ${f(ty - th)} L${f(x - w)} ${f(ty)} L${f(x - w * 0.15)} ${f(ty - 2)} Z" fill="${L[2]}"/><path d="M${f(x)} ${f(ty - th)} L${f(x - w * 0.35)} ${f(ty - th * 0.4)} L${f(x)} ${f(ty - th * 0.45)} Z" fill="${L[3]}" opacity=".6"/>`;
    }
    return s;
  }
  function bush(x, y, r, L) { return shadow(x + r * 0.3, y, r * 1.1, r * 0.25, 0.18) + `<circle cx="${f(x - r * 0.5)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.6)}" fill="${L[0]}"/><circle cx="${f(x + r * 0.45)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.62)}" fill="${L[0]}"/><circle cx="${f(x)}" cy="${f(y - r * 0.7)}" r="${f(r * 0.66)}" fill="${L[1]}"/><circle cx="${f(x - r * 0.25)}" cy="${f(y - r * 0.95)}" r="${f(r * 0.3)}" fill="${L[2]}"/><circle cx="${f(x - r * 0.55)}" cy="${f(y - r * 0.6)}" r="${f(r * 0.2)}" fill="${L[2]}"/>`; }
  function fern(x, y, s, c1, c2, flip) {
    let o = `<g transform="translate(${f(x)},${f(y)}) scale(${flip ? -s : s},${s})">`;
    for (const [a, l] of [[-60, 26], [-35, 32], [-10, 34], [15, 30], [40, 24]]) {
      o += `<g transform="rotate(${a})"><path d="M0 0 Q 4 ${-l / 2} 0 ${-l}" stroke="${c1}" stroke-width="1.6" fill="none"/>`;
      for (let k = 1; k < 6; k++) o += `<path d="M0 ${f(-l * k / 6)} l${f(6 - k * 0.6)} ${-3} M0 ${f(-l * k / 6)} l${f(-6 + k * 0.6)} ${-3}" stroke="${k % 2 ? c1 : c2}" stroke-width="2.4" stroke-linecap="round"/>`;
      o += '</g>';
    }
    return o + '</g>';
  }
  const tuft = (x, y, c) => `<path d="M${f(x - 5)} ${f(y)} Q ${f(x - 6)} ${f(y - 8)} ${f(x - 9)} ${f(y - 12)} M${f(x)} ${f(y)} Q ${f(x)} ${f(y - 10)} ${f(x + 1)} ${f(y - 15)} M${f(x + 5)} ${f(y)} Q ${f(x + 6)} ${f(y - 7)} ${f(x + 10)} ${f(y - 10)}" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const flower = (x, y, c) => `<path d="M${f(x)} ${f(y)} l0 -8" stroke="#2f7d36" stroke-width="1.6"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${f(x + Math.cos(a * Math.PI / 180) * 3.2)}" cy="${f(y - 10 + Math.sin(a * Math.PI / 180) * 3.2)}" r="2.6" fill="${c}"/>`).join('')}<circle cx="${f(x)}" cy="${f(y - 10)}" r="1.8" fill="#ffcf3a"/>`;
  const stone = (x, y, r, c) => shadow(x + r * 0.3, y + r * 0.3, r * 1.1, r * 0.4, 0.2) + `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.72)}" fill="${c || '#8e8a86'}"/><ellipse cx="${f(x - r * 0.25)}" cy="${f(y - r * 0.3)}" rx="${f(r * 0.55)}" ry="${f(r * 0.32)}" fill="#c9c4bd" opacity=".7"/><path d="M${f(x - r * 0.8)} ${f(y - r * 0.3)} Q ${f(x - r * 0.2)} ${f(y - r * 0.9)} ${f(x + r * 0.6)} ${f(y - r * 0.5)}" stroke="#6fbf4f" stroke-width="${f(r * 0.3)}" fill="none" stroke-linecap="round" opacity=".85"/>`;
  function mushroom(x, y, s, cap, dots, glow) {
    let o = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
    if (glow) o += `<circle cx="0" cy="-16" r="26" fill="url(#mglow)"/>`;
    o += `<ellipse cx="4" cy="1" rx="13" ry="3.5" fill="#0b2a12" opacity=".22"/><path d="M-5 0 Q -6 -10 -4 -16 L 4 -16 Q 6 -10 5 0 Z" fill="#fff4dc"/><path d="M1 -2 Q 2 -9 1 -15" stroke="#e2cfa6" stroke-width="2" fill="none"/>`;
    o += `<path d="M-15 -14 Q -14 -30 0 -31 Q 14 -30 15 -14 Q 0 -10 -15 -14 Z" fill="${cap}"/><path d="M-11 -19 Q -9 -27 -2 -28" stroke="#fff" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>`;
    o += `<circle cx="-6" cy="-22" r="2.6" fill="${dots}"/><circle cx="4" cy="-25" r="2.2" fill="${dots}"/><circle cx="9" cy="-18" r="1.8" fill="${dots}"/><circle cx="-1" cy="-17" r="1.5" fill="${dots}"/>`;
    return o + '</g>';
  }
  function cloud(x, y, s, o) {
    return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" opacity="${o || 1}"><ellipse cx="0" cy="10" rx="62" ry="14" fill="#c9b9ef" opacity=".6"/><circle cx="-34" cy="0" r="20" fill="#f4eeff"/><circle cx="-8" cy="-12" r="28" fill="#fff"/><circle cx="24" cy="-4" r="22" fill="#fbf8ff"/><circle cx="44" cy="4" r="14" fill="#f1eaff"/><ellipse cx="2" cy="8" rx="56" ry="11" fill="#fff"/><circle cx="-14" cy="-22" r="10" fill="#fff" opacity=".9"/></g>`;
  }

  // casa na árvore detalhada (base do tronco em 0,0)
  function treehouse(L, wi) {
    const roof = ['#e2564a', '#3a8fd8', '#d9542b', '#9a55ff', '#1fa37a', '#5b4fc4'][wi], roofD = ['#b23a30', '#2468a8', '#a83a1a', '#6c34c4', '#137a5a', '#3b308f'][wi];
    let s = shadow(16, 4, 80, 15, 0.25);
    s += canopy(-6, -196, 64, L) + canopy(52, -170, 40, L) + canopy(-58, -160, 36, L);
    // tronco com raízes e casca
    s += `<path d="M-30 4 Q -22 -6 -18 -30 Q -14 -90 -12 -150 L 12 -150 Q 14 -90 18 -30 Q 22 -6 32 4 Q 12 -2 0 2 Q -12 -2 -30 4 Z" fill="url(#bark)"/>`;
    s += `<path d="M-30 4 Q -40 2 -46 8 M30 4 Q 42 2 48 9 M-8 2 Q -12 8 -18 10" stroke="#5b3720" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    s += `<path d="M-8 -10 Q -10 -60 -6 -140 M4 -20 Q 7 -70 5 -140 M-14 -40 Q -12 -60 -14 -80" stroke="#4a2c18" stroke-width="1.6" fill="none" opacity=".55"/><ellipse cx="-2" cy="-70" rx="4" ry="6" fill="#3d2414" opacity=".6"/>`;
    // vigas de apoio
    s += `<path d="M-14 -100 L -56 -128 M14 -100 L 56 -128" stroke="#6b4128" stroke-width="6" stroke-linecap="round"/>`;
    // plataforma de tábuas
    s += `<rect x="-68" y="-134" width="136" height="12" rx="3" fill="#8a5530"/>`;
    for (let k = 0; k < 9; k++) s += `<rect x="${-68 + k * 15.2}" y="-136" width="14" height="10" rx="2" fill="${k % 2 ? '#c98a4b' : '#d99a58'}"/>`;
    s += `<rect x="-68" y="-127" width="136" height="3" fill="#6e4220" opacity=".7"/>`;
    // casinha
    s += `<rect x="-40" y="-190" width="80" height="56" rx="4" fill="#d79a5c"/>`;
    for (let k = 1; k < 6; k++) s += `<path d="M-40 ${-190 + k * 9.4} L40 ${-190 + k * 9.4}" stroke="#a8682f" stroke-width="1.4" opacity=".7"/>`;
    s += `<rect x="-40" y="-190" width="80" height="56" rx="4" fill="url(#cabinShade)"/>`;
    // telhado com telhas
    s += `<path d="M-52 -184 L 0 -228 L 52 -184 Z" fill="${roof}"/>`;
    for (let r = 0; r < 4; r++) { const yy = -218 + r * 10, half = 12 + r * 11.5; for (let x = -half; x < half; x += 9) s += `<path d="M${f(x)} ${yy} q 4.5 7 9 0" fill="${roofD}" opacity=".55"/>`; }
    s += `<path d="M-54 -183 L 0 -229 L 54 -183" stroke="${roofD}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M-30 -202 L 0 -226" stroke="#fff" stroke-width="2.4" opacity=".35" stroke-linecap="round"/>`;
    // janela redonda iluminada + porta
    s += `<circle cx="-16" cy="-164" r="13" fill="#7a3f1a"/><circle cx="-16" cy="-164" r="10" fill="url(#winGlow)"/><path d="M-16 -174 L -16 -154 M-26 -164 L -6 -164" stroke="#7a3f1a" stroke-width="2"/>`;
    s += `<path d="M10 -134 L 10 -168 Q 10 -178 20 -178 Q 30 -178 30 -168 L 30 -134 Z" fill="#7a3f1a"/><path d="M13 -134 L 13 -166 Q 13 -175 20 -175 Q 27 -175 27 -166 L 27 -134 Z" fill="#a8622a"/><circle cx="24" cy="-152" r="1.8" fill="#ffd36b"/>`;
    // corrimão de corda
    for (const px of [-64, -38, 38, 64]) s += `<rect x="${px - 2}" y="-152" width="4" height="18" rx="1" fill="#6b4128"/>`;
    s += `<path d="M-64 -150 Q -51 -144 -38 -150 M38 -150 Q 51 -144 64 -150" stroke="#e8c48a" stroke-width="2" fill="none"/>`;
    // escada
    s += `<path d="M44 -124 L 52 2 M60 -124 L 68 2" stroke="#7a4a24" stroke-width="3.4"/>`;
    for (let k = 0; k < 8; k++) { const yy = -112 + k * 15; s += `<path d="M${f(44.6 + (yy + 124) * 0.063)} ${yy} L${f(60.6 + (yy + 124) * 0.063)} ${yy}" stroke="#c98a4b" stroke-width="3" stroke-linecap="round"/>`; }
    // varal de luzinhas
    s += `<path d="M-60 -186 Q -30 -168 0 -184 Q 30 -168 60 -186" stroke="#5b3720" stroke-width="1" fill="none"/>`;
    [['#ffd36b', -48, -179], ['#ff8ab3', -30, -174], ['#8fe6ff', -14, -178], ['#ffd36b', 14, -178], ['#b388ff', 30, -174], ['#ffd36b', 48, -179]].forEach(([c, x, y]) => { s += `<circle cx="${x}" cy="${y}" r="5" fill="${c}" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`; });
    // lanterna pendurada
    s += `<path d="M-60 -128 L -60 -112" stroke="#5b3720" stroke-width="1.2"/><circle cx="-60" cy="-102" r="12" fill="url(#lampGlow)"/><rect x="-65" y="-110" width="10" height="13" rx="3" fill="#ffd36b" stroke="#7a3f1a" stroke-width="1.4"/>`;
    // balanço de corda
    s += `<path d="M-30 -122 L -34 -40 M-10 -122 L -12 -40" stroke="#e8c48a" stroke-width="1.6"/><rect x="-38" y="-42" width="30" height="5" rx="2" fill="#a8622a"/>`;
    // folhas na frente
    s += canopy(-70, -118, 20, L) + canopy(74, -196, 18, L);
    return s;
  }

  // penhasco com cachoeira (desenhado para o lado esquerdo; o direito é espelhado)
  function falls(W) {
    let s = `<path d="M-20 110 L -20 -170 Q 30 -186 70 -168 Q 112 -150 126 -110 Q 140 -40 132 30 Q 128 80 140 110 Z" fill="url(#rock)"/>`;
    s += `<path d="M-20 -60 Q 40 -70 96 -46 L 112 -8 Q 60 -26 -20 -16 Z" fill="#6b6058" opacity=".55"/><path d="M-20 20 Q 50 10 120 30 L 126 60 Q 60 46 -20 56 Z" fill="#5b5048" opacity=".5"/>`;
    s += `<path d="M10 -120 l18 30 M40 -30 l-10 26 M88 -100 l10 22 M20 40 l16 20 M100 4 l-6 22" stroke="#4a403a" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
    s += `<path d="M-20 -150 Q 20 -134 40 -140 Q 60 -146 78 -134 M-20 -66 Q 30 -58 74 -48 M-20 12 Q 40 22 100 18" stroke="#b0a597" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
    // musgo no topo
    s += `<path d="M-24 -170 Q 30 -196 74 -172 Q 110 -158 128 -112 Q 100 -140 70 -150 Q 30 -166 -24 -150 Z" fill="${W.leaf[1]}"/><path d="M-20 -176 Q 20 -192 60 -178" stroke="${W.leaf[3]}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
    s += canopy(10, -196, 34, W.leaf) + canopy(-20, -150, 26, W.leaf);
    // cachoeira em degraus
    s += `<path d="M58 -150 Q 70 -152 84 -148 L 92 -40 Q 96 30 104 80 L 54 80 Q 58 20 56 -40 Z" fill="url(#fall)"/>`;
    for (let k = 0; k < 6; k++) { const x = 60 + k * 6; s += `<path d="M${x} -144 Q ${x + 2} -40 ${x + 4 + k} 76" stroke="#fff" stroke-width="${k % 2 ? 1.6 : 2.6}" fill="none" opacity="${k % 2 ? 0.5 : 0.75}"/>`; }
    s += `<path d="M52 -150 Q 70 -158 88 -150" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>`;
    // lago com espuma
    s += `<ellipse cx="86" cy="96" rx="92" ry="26" fill="#2b6f4a" opacity=".5"/><ellipse cx="84" cy="92" rx="86" ry="22" fill="url(#pond)"/>`;
    s += `<ellipse cx="84" cy="92" rx="70" ry="15" fill="none" stroke="#fff" stroke-width="1.4" opacity=".45"/><ellipse cx="96" cy="96" rx="44" ry="8" fill="none" stroke="#fff" stroke-width="1.2" opacity=".35"/>`;
    for (let k = 0; k < 10; k++) s += `<circle cx="${f(58 + rnd() * 52)}" cy="${f(76 + rnd() * 12)}" r="${f(5 + rnd() * 7)}" fill="#fff" opacity="${f(0.7 + rnd() * 0.3)}"/>`;
    // arco-íris na névoa
    ['#ff6b6b', '#ffb347', '#ffe36b', '#7be07b', '#6fc3ff', '#b388ff'].forEach((c, k) => { s += `<path d="M${18 + k * 4} 70 A ${66 - k * 4} ${60 - k * 4} 0 0 1 ${150 - k * 4} 70" stroke="${c}" stroke-width="3.4" fill="none" opacity=".26"/>`; });
    // pedras e plantas
    s += stone(24, 104, 12) + stone(148, 98, 10) + stone(126, 112, 7);
    s += fern(2, 116, 1.1, W.leaf[1], W.leaf[2]) + fern(160, 118, 0.9, W.leaf[1], W.leaf[2], true);
    return s;
  }
  function pond(W) {
    let s = `<ellipse cx="0" cy="6" rx="78" ry="30" fill="#2b5a2a" opacity=".45"/><ellipse cx="0" cy="2" rx="72" ry="26" fill="url(#pond)"/><ellipse cx="-14" cy="-4" rx="40" ry="8" fill="#fff" opacity=".18"/>`;
    for (const [x, y] of [[-30, 8], [18, 12], [34, -2], [-6, -8]]) s += `<path d="M${x} ${y} m-10 0 a10 6 0 1 0 20 0 l-10 0 z" fill="#3fae4f"/><path d="M${x - 8} ${y - 1} q 8 -4 16 0" stroke="#7fd36a" stroke-width="1.4" fill="none"/>`;
    s += `<g transform="translate(18,6)"><path d="M0 0 l-5 -8 l5 3 l5 -3 z M-6 -2 l-4 -5 l6 1 z M6 -2 l4 -5 l-6 1 z" fill="#ff9ccc"/><circle cx="0" cy="-3" r="2" fill="#ffe36b"/></g>`;
    for (let k = 0; k < 5; k++) { const x = -70 + k * 7; s += `<path d="M${x} 0 Q ${x - 2} -26 ${x + 2} -44" stroke="#3b7a2f" stroke-width="2" fill="none"/><rect x="${x}" y="-46" width="4.4" height="12" rx="2.2" fill="#8a5530"/>`; }
    s += stone(62, 14, 10) + stone(-60, 20, 8) + fern(70, 8, 0.9, W.leaf[1], W.leaf[2], true);
    return s;
  }
  function grove(W, wi) {
    const glow = wi === 5;
    const cap = glow ? ['#57d9ff', '#b388ff', '#7fffd4'] : ['#e8443a', '#ff7a3d', '#e8443a'];
    let s = tree(-30, -6, 34, W.leaf) + bush(40, 0, 22, W.leaf);
    s += mushroom(-4, 26, 1.6, cap[0], '#fff', glow) + mushroom(36, 30, 1.1, cap[1], '#fff', glow) + mushroom(-50, 34, 0.9, cap[2], '#fff', glow) + mushroom(14, 40, 0.7, cap[1], '#fff', glow);
    s += fern(64, 34, 0.8, W.leaf[1], W.leaf[2], true) + tuft(-20, 44, W.leaf[1]);
    return s;
  }
  function rocks(W, wi) {
    const cr = wi === 5 ? ['#9ff3ff', '#57c8ff'] : wi === 3 ? ['#ffc2e6', '#e57fb5'] : ['#b9f0ff', '#6fc3ff'];
    let s = stone(-20, 20, 30, '#8a8580') + stone(26, 24, 22, '#7d7873') + stone(-50, 30, 14);
    s += `<g transform="translate(6,6)"><circle cx="0" cy="-14" r="30" fill="url(#mglow)"/><path d="M-12 0 L -16 -24 L -8 -40 L -2 -22 Z" fill="${cr[1]}"/><path d="M-12 0 L -16 -24 L -8 -40 Z" fill="${cr[0]}"/><path d="M0 0 L 2 -34 L 10 -52 L 16 -30 L 12 0 Z" fill="${cr[1]}"/><path d="M0 0 L 2 -34 L 10 -52 Z" fill="${cr[0]}"/><path d="M14 2 L 22 -16 L 28 -8 Z" fill="${cr[0]}"/><path d="M6 -40 L 9 -48" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`;
    s += bush(-60, 10, 18, W.leaf) + fern(54, 30, 0.8, W.leaf[1], W.leaf[2], true);
    return s;
  }
  function palms(W) {
    let s = '';
    for (const [x, y, sc, fl] of [[-20, 30, 1, 1], [34, 40, 0.8, -1]]) {
      s += shadow(x + 26 * sc, y + 2, 44 * sc, 8 * sc);
      s += `<g transform="translate(${x},${y}) scale(${sc * fl},${sc})"><path d="M-6 0 Q 4 -60 22 -120 L 30 -118 Q 14 -60 6 0 Z" fill="#a8743e"/>`;
      for (let k = 0; k < 9; k++) s += `<path d="M${f(-5 + k * 1.5)} ${-k * 13} l11 -2" stroke="#7a4f25" stroke-width="2"/>`;
      for (const a of [-160, -120, -70, -25, 15]) s += `<g transform="translate(26,-120) rotate(${a})"><path d="M0 0 Q 30 -16 64 6 Q 30 -4 0 0 Z" fill="${GREEN[1]}"/><path d="M0 0 Q 30 -10 64 6" stroke="${GREEN[3]}" stroke-width="1.6" fill="none"/></g>`;
      s += `<circle cx="22" cy="-112" r="5" fill="#6b4128"/><circle cx="30" cy="-110" r="5" fill="#7a4a24"/></g>`;
    }
    s += fern(-60, 44, 1, W.leaf[1], W.leaf[2]) + flower(60, 48, W.flw[0]) + flower(70, 44, W.flw[1]);
    return s;
  }
  function farm(W) {
    let s = '';
    for (let k = 0; k < 6; k++) s += `<rect x="${-80 + k * 30}" y="-30" width="7" height="40" rx="2" fill="#c98a4b"/><rect x="${-79 + k * 30}" y="-30" width="2" height="38" fill="#ffd9a0" opacity=".4"/>`;
    s += `<rect x="-84" y="-22" width="160" height="6" rx="2" fill="#a8682f"/><rect x="-84" y="-6" width="160" height="6" rx="2" fill="#a8682f"/>`;
    s += shadow(-20, 46, 34, 7) + `<rect x="-50" y="16" width="58" height="30" rx="8" fill="#f0c04a"/><path d="M-46 24 L 4 24 M-46 32 L 4 32 M-46 40 L 4 40" stroke="#c99a20" stroke-width="1.6"/><rect x="-50" y="16" width="58" height="8" rx="6" fill="#ffe08a" opacity=".6"/>`;
    for (const [x, y] of [[40, 40], [58, 30], [24, 26]]) s += `<path d="M${x} ${y} L ${x} ${y - 40}" stroke="#3b7a2f" stroke-width="3"/><path d="M${x} ${y - 20} q 10 -6 14 2 q -8 4 -14 -2" fill="#4bb04f"/>${[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => `<ellipse cx="${f(x + Math.cos(a * Math.PI / 180) * 8)}" cy="${f(y - 44 + Math.sin(a * Math.PI / 180) * 8)}" rx="5" ry="3" transform="rotate(${a} ${f(x + Math.cos(a * Math.PI / 180) * 8)} ${f(y - 44 + Math.sin(a * Math.PI / 180) * 8)})" fill="#ffcf2a"/>`).join('')}<circle cx="${x}" cy="${y - 44}" r="6" fill="#7a4a24"/>`;
    return s;
  }
  function pumpkins(W) {
    let s = tree(20, 0, 32, W.leaf);
    for (const [x, y, r] of [[-40, 30, 16], [-12, 38, 12], [-62, 40, 10]]) s += shadow(x + 4, y + r * 0.7, r * 1.2, r * 0.3) + `<ellipse cx="${x}" cy="${y}" rx="${r * 1.2}" ry="${r}" fill="#f28a1e"/><ellipse cx="${x}" cy="${y}" rx="${r * 0.5}" ry="${r}" fill="#ff9f3a"/><path d="M${x - r * 0.6} ${y - r * 0.9} Q ${x - r * 0.8} ${y} ${x - r * 0.6} ${y + r * 0.9} M${x + r * 0.6} ${y - r * 0.9} Q ${x + r * 0.8} ${y} ${x + r * 0.6} ${y + r * 0.9}" stroke="#d26a10" stroke-width="1.4" fill="none"/><path d="M${x} ${y - r} q 2 -6 6 -7" stroke="#4a7a2a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="${x - r * 0.5}" cy="${y - r * 0.4}" rx="${r * 0.2}" ry="${r * 0.3}" fill="#fff" opacity=".35"/>`;
    for (let k = 0; k < 5; k++) s += `<path d="M${-70 + k * 22} 56 q 6 -6 12 0 q -6 4 -12 0" fill="${['#d8661f', '#f29b2b', '#ffd36b'][k % 3]}"/>`;
    return s;
  }

  function buildMap(H, pts) {
    seed = 4242;
    const T = trail(pts), F = [], A = [], boxes = [];
    const add = (l, y0, y1, s, sy) => F.push({ l, y0, y1, s, sy: sy == null ? y1 : sy });
    // mundos: começam onde há salto grande entre pontos
    const starts = [0]; for (let i = 1; i < pts.length; i++) if (pts[i - 1].y - pts[i].y > 200) starts.push(i);
    const W = starts.map((st, wi) => { const end = (starts[wi + 1] || pts.length) - 1; return { st, end, bottom: wi ? pts[st].y + 205 : H, top: wi < starts.length - 1 ? pts[end].y - 75 : 0, river: pts[st].y + 202, ban: pts[st].y + 134 }; });
    const worldAt = (y) => { for (let w = W.length - 1; w >= 0; w--) if (y < W[w].bottom) return Math.min(w, WP.length - 1); return 0; };
    const nearPath = (x, y, d) => { for (const p of T.sm) if (Math.abs(p.y - y) < d && Math.hypot(p.x - x, p.y - y) < d) return true; return false; };
    const nearNode = (x, y) => pts.some((p) => Math.abs(p.x * 400 - x) < 76 && y > p.y - 70 && y < p.y + 78);
    const inBox = (x, y) => boxes.some((b) => x > b[0] && x < b[2] && y > b[1] && y < b[3]);
    const nearBan = (x, y) => W.some((w) => Math.abs(y - w.ban) < 48 && x > 40 && x < 360);

    /* --- céu: estrelas, lua, montanhas, nuvens --- */
    let sky = '';
    for (let k = 0; k < 70; k++) { const y = rnd() * 330, o = 0.95 - y / 380; sky += `<circle cx="${f(rnd() * 400)}" cy="${f(y)}" r="${f(0.6 + rnd() * 1.4)}" fill="#fff" opacity="${f(Math.max(0.15, o))}"/>`; }
    for (const [x, y] of [[60, 60], [300, 40], [350, 150], [150, 120]]) sky += `<path d="M${x} ${y - 6} L ${x + 1.5} ${y - 1.5} L ${x + 6} ${y} L ${x + 1.5} ${y + 1.5} L ${x} ${y + 6} L ${x - 1.5} ${y + 1.5} L ${x - 6} ${y} L ${x - 1.5} ${y - 1.5} Z" fill="#fff"/>`;
    sky += `<circle cx="318" cy="96" r="70" fill="url(#moonGlow)"/><circle cx="318" cy="96" r="26" fill="#fff6d8"/><circle cx="310" cy="90" r="4" fill="#efe0b8"/><circle cx="324" cy="106" r="3" fill="#efe0b8"/><circle cx="306" cy="104" r="2.2" fill="#efe0b8"/>`;
    add(0, 0, 340, sky);
    // cordilheiras com picos nevados, sombra lateral e névoa entre camadas
    const range = (base, peaks, fill, shade, snow) => {
      let d = `M-30 ${base + 300} L-30 ${base}`, o = '';
      peaks.forEach(([x, y], k) => {
        const nx = peaks[k + 1] ? peaks[k + 1][0] : 440, vx = (x + nx) / 2, vy = base - (base - Math.max(y, peaks[k + 1] ? peaks[k + 1][1] : y)) * 0.38;
        d += ` L${x} ${y} L${f(vx)} ${f(vy)}`;
        o += `<path d="M${x} ${y} L${f(vx)} ${f(vy)} L${f(x + (vx - x) * 0.3)} ${base} Z" fill="${shade}" opacity=".5"/>`;
        if (snow) { const h = (base - y) * 0.24, lx = x - h * 0.9, rx = x + h * 0.85; o += `<path d="M${x} ${y} L${f(rx)} ${f(y + h)} L${f(x + h * 0.4)} ${f(y + h * 0.72)} L${f(x + h * 0.1)} ${f(y + h * 1.08)} L${f(x - h * 0.3)} ${f(y + h * 0.78)} L${f(lx)} ${f(y + h * 0.98)} Z" fill="${snow}"/><path d="M${x} ${y} L${f(rx)} ${f(y + h)} L${f(x + h * 0.4)} ${f(y + h * 0.72)} Z" fill="#c9b8ea" opacity=".7"/>`; }
      });
      return `<path d="${d} L440 ${base} L440 ${base + 300} Z" fill="${fill}"/>` + o;
    };
    let mt = range(560, [[-10, 400], [80, 300], [170, 380], [250, 270], [340, 350], [420, 300]], 'url(#mt1)', '#7a6fb8', '#fff3f8');
    mt += `<rect x="0" y="400" width="400" height="200" fill="url(#haze)"/>`;
    mt += range(660, [[20, 470], [120, 420], [210, 500], [300, 430], [390, 480]], 'url(#mt2)', '#3f4f94', '#e9e4ff');
    for (const x of [96, 286]) mt += `<path d="M${x} 470 Q ${x + 5} 540 ${x - 2} 640" stroke="#e8f7ff" stroke-width="3.4" fill="none" opacity=".8"/><path d="M${x + 3} 480 Q ${x + 7} 550 ${x + 2} 640" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/><ellipse cx="${x}" cy="642" rx="14" ry="5" fill="#fff" opacity=".6"/>`;
    mt += `<rect x="0" y="540" width="400" height="200" fill="url(#haze)"/>`;
    let hills = `<path d="M-10 900 L-10 700 Q 40 650 90 680 Q 150 630 210 670 Q 270 640 320 668 Q 370 640 410 676 L410 900 Z" fill="url(#mt3)"/>`;
    for (let k = 0; k < 34; k++) { const x = rnd() * 400; hills += pine(x, 770 + rnd() * 40, 34 + rnd() * 26, ['#16384f', '#1d4660', '#2a5f7c', '#5e93b8']); }
    add(1, 280, 1200, mt + hills, 0);
    for (const [x, y, s, o] of [[60, 250, 0.8, 0.85], [330, 330, 1, 0.9], [120, 460, 1.1, 0.8], [360, 560, 0.9, 0.7], [30, 640, 1, 0.75]]) add(2, y - 50, y + 30, cloud(x, y, s, o), 0);
    A.push({ t: 'cloud', x: 40, y: 190, s: 1 }, { t: 'cloud', x: 250, y: 420, s: 1.2 }, { t: 'cloud', x: 140, y: 600, s: 0.9 });

    pts.forEach((p) => { if (p.y < SKY) add(2, p.y - 20, p.y + 60, cloud(p.x * 400, p.y + 34, 1.15, 0.95), p.y); });

    /* --- textura do chão: manchas de luz e sombra --- */
    for (let y = SKY - 40; y < H; y += 26) {
      const wp = WP[worldAt(y)];
      add(0, y - 30, y + 30, `<ellipse cx="${f(rnd() * 400)}" cy="${f(y)}" rx="${f(40 + rnd() * 70)}" ry="${f(10 + rnd() * 14)}" fill="${rnd() < 0.5 ? wp.g[0] : '#0b2a12'}" opacity="${rnd() < 0.5 ? 0.35 : 0.08}"/>`, 0);
    }

    /* --- rios entre os mundos (com ponte) --- */
    W.forEach((w, wi) => {
      if (!wi) return;
      const y = w.river, wp = WP[Math.min(wi - 1, 5)];
      let d1 = `M-10 ${y - 26}`, d2 = '', w1 = `M-10 ${y - 17}`, w2 = '';
      for (let x = 0; x <= 420; x += 40) { d1 += ` Q ${x - 20} ${f(y - 30 + Math.sin(x / 50) * 4)} ${x} ${f(y - 26 + Math.sin(x / 60) * 3)}`; w1 += ` Q ${x - 20} ${f(y - 21 + Math.sin(x / 47) * 3)} ${x} ${f(y - 17 + Math.sin(x / 55) * 3)}`; }
      for (let x = 420; x >= -10; x -= 40) { d2 += ` Q ${x + 20} ${f(y + 30 + Math.sin(x / 50) * 4)} ${x} ${f(y + 26 + Math.sin(x / 60) * 3)}`; w2 += ` Q ${x + 20} ${f(y + 21 + Math.sin(x / 47) * 3)} ${x} ${f(y + 17 + Math.sin(x / 55) * 3)}`; }
      let s = `<path d="${d1} L 420 ${y + 26}${d2} Z" fill="#d9c08a"/><path d="${d1} L 420 ${y + 26}${d2} Z" fill="#7a5a2a" opacity=".25" transform="translate(0,4)"/>`;
      s += `<path d="${w1} L 420 ${y + 17}${w2} Z" fill="url(#river${Math.min(wi - 1, 5)})"/>`;
      for (let k = 0; k < 14; k++) { const x = rnd() * 400, yy = y - 10 + rnd() * 20; s += `<path d="M${f(x)} ${f(yy)} q 6 -2 12 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>`; }
      for (let k = 0; k < 7; k++) { const x = rnd() * 400; s += stone(x, y + (rnd() < 0.5 ? -24 : 24), 4 + rnd() * 5); }
      for (let k = 0; k < 6; k++) { const x = rnd() * 400; s += tuft(x, y - 26, wp.leaf[1]) + tuft(x + 30, y + 30, wp.leaf[2]); }
      add(1, y - 40, y + 40, s, 0);
      A.push({ t: 'river', y: y - 17, h: 34 });
      boxes.push([-50, y - 32, 450, y + 32]);
    });

    /* --- paredes de floresta nas bordas --- */
    for (let y = SKY - 10; y < H + 40; y += 30) {
      const wi = worldAt(y), wp = WP[wi], L = rnd() < 0.55 ? wp.leaf : GREEN;
      for (const side of [0, 1]) {
        const x = side ? 400 + 6 - rnd() * 30 : -6 + rnd() * 30, r = 30 + rnd() * 18;
        if (W.some((w, i) => i && Math.abs(y - w.river) < 34)) continue;
        add(2, y - r * 2.2, y + 10, rnd() < 0.28 && wi !== 2 && wi !== 3 ? pine(x, y + 8, r * 2.6, L) : tree(x, y, r, L), y);
      }
    }

    /* --- marcos especiais nos espaços livres (lado oposto à trilha) --- */
    const kinds = [['falls', 'treehouse', 'pond', 'palms', 'grove'], ['falls', 'farm', 'treehouse', 'pond', 'grove'], ['treehouse', 'falls', 'pumpkins', 'grove', 'pond'], ['falls', 'treehouse', 'pond', 'grove', 'rocks'], ['falls', 'palms', 'treehouse', 'pond', 'grove'], ['rocks', 'treehouse', 'falls', 'grove', 'rocks']];
    const cnt = W.map(() => 0);
    pts.forEach((p, i) => {
      if (p.x === 0.5 || p.y < SKY + 60) return;
      const wi = worldAt(p.y), wp = WP[wi], left = p.x > 0.5, k = kinds[Math.min(wi, 5)][cnt[wi]++ % 5];
      const cx = left ? 78 : 322, by = p.y + 60;
      let s = '', y0 = p.y - 180, y1 = p.y + 120;
      if (k === 'falls') {
        const ox = left ? 0 : 400, sx = left ? 1 : -1, top = p.y - 40;
        s = `<g transform="translate(${ox},${top + 50}) scale(${sx},1)">${falls(wp)}</g>`;
        y0 = top - 160; y1 = top + 180;
        A.push({ t: 'fall', x: left ? 54 : 400 - 104, w: 50, y: top - 100, h: 230, m: !left }, { t: 'mist', x: left ? 84 : 316, y: top + 135 });
        boxes.push([left ? -20 : 240, top - 140, left ? 160 : 420, top + 175]);
      } else if (k === 'treehouse') {
        s = `<g transform="translate(${cx},${by})">${treehouse(wi === 2 || wi === 3 ? wp.leaf : (rnd() < 0.5 ? wp.leaf : GREEN), wi)}</g>`;
        y0 = by - 300; y1 = by + 20;
        A.push({ t: 'glow', x: cx - 16, y: by - 164, r: 30 }, { t: 'glow', x: cx - 60, y: by - 102, r: 26 });
        boxes.push([cx - 90, by - 260, cx + 90, by + 14]);
      } else {
        const fn = { pond, grove, rocks, palms, farm, pumpkins }[k];
        s = `<g transform="translate(${cx},${p.y - 10})">${fn(wp, wi)}</g>`;
        y0 = p.y - 160; y1 = p.y + 80;
        boxes.push([cx - 80, p.y - 70, cx + 80, p.y + 60]);
        if (k === 'rocks') A.push({ t: 'glow', x: cx + 12, y: p.y - 30, r: 34, c: wi === 3 ? 'pink' : 'blue' });
      }
      add(3, y0, y1, s, by);
      if (i % 8 === 3) A.push({ t: 'bfly', x: cx, y: p.y - 60, c: wi });
    });

    /* --- detalhes espalhados: tufos, flores, pedrinhas, cogumelos, samambaias --- */
    for (let y = SKY + 20; y < H - 10; y += 12) {
      const wi = worldAt(y), wp = WP[wi];
      for (let k = 0; k < 2; k++) {
        const x = 20 + rnd() * 360;
        if (nearPath(x, y, 34) || nearNode(x, y) || inBox(x, y) || nearBan(x, y) || W.some((w, i) => i && Math.abs(y - w.river) < 34)) continue;
        const r = rnd(); let s;
        if (r < 0.34) s = tuft(x, y, wp.leaf[rnd() < 0.5 ? 1 : 2]);
        else if (r < 0.62) s = flower(x, y, pick(wp.flw)) + (rnd() < 0.5 ? flower(x + 7, y + 3, pick(wp.flw)) : '');
        else if (r < 0.72) s = stone(x, y, 4 + rnd() * 5);
        else if (r < 0.8) s = mushroom(x, y, 0.45 + rnd() * 0.3, wi === 5 ? '#57d9ff' : '#e8443a', '#fff', wi === 5);
        else if (r < 0.9) s = fern(x, y, 0.55 + rnd() * 0.3, wp.leaf[1], wp.leaf[2], rnd() < 0.5);
        else s = bush(x, y, 10 + rnd() * 8, rnd() < 0.5 ? wp.leaf : GREEN);
        add(3, y - 40, y + 6, s, y);
      }
    }

    /* --- raios de sol e manchas de luz (por cima do cenário) --- */
    for (let y = SKY; y < H; y += 640) {
      const x = 30 + rnd() * 120;
      add(5, y - 20, y + 700, `<path d="M${f(x)} ${y} L ${f(x + 60)} ${y} L ${f(x + 330)} ${y + 680} L ${f(x + 170)} ${y + 680} Z" fill="url(#ray)" opacity=".5"/><path d="M${f(x + 90)} ${y + 30} L ${f(x + 120)} ${y + 30} L ${f(x + 300)} ${y + 520} L ${f(x + 230)} ${y + 520} Z" fill="url(#ray)" opacity=".35"/>`, 0);
    }
    for (let y = SKY; y < H; y += 60) add(5, y - 20, y + 20, `<ellipse cx="${f(rnd() * 400)}" cy="${f(y)}" rx="${f(18 + rnd() * 30)}" ry="${f(6 + rnd() * 8)}" fill="#fff6c8" opacity=".13"/>`, 0);

    /* --- névoa nos rios --- */
    W.forEach((w, wi) => { if (wi) add(5, w.river - 60, w.river + 40, `<ellipse cx="120" cy="${w.river - 18}" rx="150" ry="22" fill="#fff" opacity=".14"/><ellipse cx="320" cy="${w.river - 10}" rx="130" ry="18" fill="#fff" opacity=".12"/>`, 0); });

    // fundo (gradiente de cor por mundo)
    const stops = [[0, '#14164f'], [150, '#2c2c86'], [300, '#7a62c4'], [430, '#f0a4c4'], [560, '#ffd8b4'], [SKY, WP[5].g[1]]];
    for (let wi = W.length - 1; wi >= 0; wi--) { const w = W[wi], wp = WP[Math.min(wi, 5)]; if (wi < W.length - 1) stops.push([w.top, wp.g[0]]); stops.push([(w.top + w.bottom) / 2, wp.g[0]]); stops.push([w.bottom - 30, wp.g[1]]); }
    stops.sort((a, b) => a[0] - b[0]);
    const bg = stops.filter((s, i) => !i || s[0] > stops[i - 1][0]).map(([y, c]) => `<stop offset="${(Math.max(0, Math.min(H, y)) / H).toFixed(4)}" stop-color="${c}"/>`).join('');

    F.sort((a, b) => a.l - b.l || a.sy - b.sy);
    // trilha de tábuas com postes e corda
    let rail = '';
    for (let k = 4; k < T.sm.length - 4; k += 5) {
      const a = T.sm[k], b = T.sm[k + 1]; if (a.y < 120 || pts.some((p) => Math.hypot(p.x * 400 - a.x, p.y - a.y) < 64)) continue;
      const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      for (const sd of [-1, 1]) rail += `<rect x="${f(a.x + nx * 23 * sd - 2.5)}" y="${f(a.y + ny * 23 * sd - 9)}" width="5" height="11" rx="1.5" fill="#5a3417"/><rect x="${f(a.x + nx * 23 * sd - 2.5)}" y="${f(a.y + ny * 23 * sd - 9)}" width="2" height="9" fill="#a8682f"/>`;
    }
    const path = `<path d="${T.d}" stroke="#0b2a12" stroke-width="54" fill="none" stroke-linecap="round" opacity=".25" transform="translate(5,10)"/>
      <path d="${T.d}" stroke="#4a2a12" stroke-width="46" fill="none" stroke-linecap="round"/>
      <path d="${T.d}" stroke="#c98a4b" stroke-width="38" fill="none" stroke-linecap="round"/>
      <path d="${T.d}" stroke="#b07038" stroke-width="38" fill="none" stroke-dasharray="15 30 15 45"/>
      <path d="${T.d}" stroke="#e2a868" stroke-width="38" fill="none" stroke-dasharray="15 60" stroke-dashoffset="30" opacity=".8"/>
      <path d="${T.d}" stroke="#6e4220" stroke-width="38" fill="none" stroke-dasharray="1.6 13.4"/>
      <path d="${T.d}" stroke="#ffe0b0" stroke-width="16" fill="none" opacity=".16" transform="translate(-4,-3)"/>
      ${rail}`;
    return { H, F, A, bg, path, key: H + ':' + pts.length + ':' + pts[0].y };
  }

  function mapDefs(M) {
    const rv = WP.map((w, i) => `<linearGradient id="river${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.water[0]}"/><stop offset=".45" stop-color="${w.water[1]}"/><stop offset="1" stop-color="${w.water[2]}"/></linearGradient>`).join('');
    return `<defs>
      <linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${M.H}">${M.bg}</linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06210f" stop-opacity=".5"/><stop offset=".14" stop-color="#06210f" stop-opacity="0"/><stop offset=".86" stop-color="#06210f" stop-opacity="0"/><stop offset="1" stop-color="#06210f" stop-opacity=".5"/></linearGradient>
      <linearGradient id="fall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7ccfff"/><stop offset=".35" stop-color="#e8fbff"/><stop offset=".7" stop-color="#bfeaff"/><stop offset="1" stop-color="#5ab8f0"/></linearGradient>
      <radialGradient id="pond" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#c9f4ff"/><stop offset=".5" stop-color="#4fbdf0"/><stop offset="1" stop-color="#1f78c0"/></radialGradient>
      <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3a698"/><stop offset=".5" stop-color="#857869"/><stop offset="1" stop-color="#5a4e44"/></linearGradient>
      <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6238"/><stop offset=".45" stop-color="#7a4a2a"/><stop offset="1" stop-color="#4f2e18"/></linearGradient>
      <linearGradient id="cabinShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a1a05" stop-opacity=".3"/></linearGradient>
      <radialGradient id="winGlow"><stop offset="0" stop-color="#fff8d0"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#ff9a2a"/></radialGradient>
      <radialGradient id="lampGlow"><stop offset="0" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
      <radialGradient id="mglow"><stop offset="0" stop-color="#9ff3ff" stop-opacity=".7"/><stop offset="1" stop-color="#57c8ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="moonGlow"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
      <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6f0" stop-opacity="0"/><stop offset=".6" stop-color="#ffe6f0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe6f0" stop-opacity="0"/></linearGradient>
      <linearGradient id="mt1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a6e6"/><stop offset=".5" stop-color="#9c8fd6"/><stop offset="1" stop-color="#7f7ec8"/></linearGradient>
      <linearGradient id="mt2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b7fcf"/><stop offset="1" stop-color="#4f63a8"/></linearGradient>
      <linearGradient id="mt3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6f9a"/><stop offset="1" stop-color="${WP[5].g[1]}"/></linearGradient>
      <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity=".55"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></linearGradient>
      <pattern id="grass" width="60" height="44" patternUnits="userSpaceOnUse"><path d="M6 40 l-2 -7 M9 40 l1 -8 M12 40 l3 -6 M36 18 l-2 -6 M39 18 l1 -7 M42 18 l3 -5 M24 30 l0 -5 M52 34 l-1 -5" stroke="#0b3a14" stroke-width="1.3" stroke-linecap="round" opacity=".28"/><path d="M20 8 l-1 -5 M48 6 l1 -5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity=".14"/></pattern>
      ${rv}</defs>`;
  }

  const mapCache = {};
  function mapData(H, pts) {
    const k = H + ':' + pts.map((p) => p.x + ',' + p.y).join(';');
    return mapCache[k] || (mapCache[k] = buildMap(H, pts));
  }
  const CH = 900;
  function mapChunk(M, i) {
    const y0 = i * CH, y1 = Math.min(M.H, y0 + CH + 2), h = y1 - y0;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${y0} 400 ${h}" preserveAspectRatio="none">${mapDefs(M)}`;
    s += `<rect x="0" y="${y0}" width="400" height="${h}" fill="url(#bg)"/>`;
    if (y1 > SKY - 60) s += `<rect x="0" y="${Math.max(y0, SKY - 60)}" width="400" height="${h}" fill="url(#grass)"/>`;
    let layer = 0;
    for (const ft of M.F) {
      if (ft.l >= 4 && layer < 4) { s += M.path; layer = 4; }
      if (ft.y1 > y0 && ft.y0 < y1) s += ft.s;
    }
    if (layer < 4) s += M.path;
    s += `<rect x="0" y="${y0}" width="400" height="${h}" fill="url(#edge)"/>`;
    return s + '</svg>';
  }
  const chunkCache = {};
  function map(H, pts) { // imagem base leve (os pedaços detalhados vêm por cima)
    const M = mapData(H, pts);
    window.LUMI_SCENES._map = M;
    return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 ${H}" preserveAspectRatio="none">${mapDefs(M).replace(/<pattern[\s\S]*?<\/pattern>/, '')}<rect width="4" height="${H}" fill="url(#bg)"/></svg>`);
  }
  function mapChunks(M) { return { CH, n: Math.ceil(M.H / CH), get: (i) => { const k = M.key + '#' + i; return chunkCache[k] || (chunkCache[k] = enc(mapChunk(M, i))); } }; }


  // galhos de folhas em primeiro plano (bordas da tela do mapa)
  function mapLeaves(side) {
    seed = 77 + side * 13;
    const C = ['#1f6b34', '#2d8a44', '#3fa553', '#5cbf5c', '#86d46a'];
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 220"><g${side ? ' transform="translate(120,0) scale(-1,1)"' : ''}>`;
    s += `<path d="M-4 18 Q 40 22 62 58 Q 78 86 70 128" stroke="#4a2c18" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M30 30 Q 22 70 30 110 M56 52 Q 90 70 96 100" stroke="#5b3720" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const at = [[6, 20], [18, 26], [30, 32], [42, 40], [54, 50], [62, 62], [68, 76], [70, 92], [70, 108], [70, 124], [28, 50], [26, 70], [28, 90], [30, 108], [70, 66], [84, 78], [92, 92], [96, 104]];
    at.forEach(([x, y], k) => { const c = C[k % 5]; s += leaf(x + (rnd() - 0.5) * 6, y + 8, 150 + (rnd() - 0.5) * 80 + (k % 2 ? 40 : -40), 0.7 + rnd() * 0.4, c, '#0f3d1c'); });
    for (const [x, y] of [[8, 34], [40, 58], [64, 140], [30, 124], [96, 118]]) s += `<circle cx="${x}" cy="${y}" r="4.2" fill="#ffb3d6"/><circle cx="${x}" cy="${y}" r="1.8" fill="#ffe36b"/>`;
    s += `<circle cx="70" cy="150" r="3" fill="#fff6c8" opacity=".9"/><circle cx="70" cy="150" r="9" fill="#fff6c8" opacity=".25"/>`;
    return s + '</g></svg>';
  }

  /* ================= ESCOLA FUTURISTA (tela principal) ================= */
  const SCH = { wall: ['#c3c8fb', '#a9aef2', '#8d91e2'], ceil: ['#1e2470', '#2f3596', '#4a46b8'], cyan: '#4fe3ff', lilac: '#a98bff', pink: '#ff8ad8', navy: '#1b2a63', white: '#f7f9ff' };
  const WIN = { x: 26, y: 118, w: 338, h: 404, r: 64 }; // janela panorâmica (usada também pelas animações)
  function schoolDefs() {
    return `<defs>
      <linearGradient id="sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SCH.wall[0]}"/><stop offset=".6" stop-color="${SCH.wall[1]}"/><stop offset="1" stop-color="${SCH.wall[2]}"/></linearGradient>
      <linearGradient id="sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SCH.ceil[0]}"/><stop offset=".7" stop-color="${SCH.ceil[1]}"/><stop offset="1" stop-color="${SCH.ceil[2]}"/></linearGradient>
      <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2f8f"/><stop offset=".4" stop-color="#3f5fd6"/><stop offset=".72" stop-color="#8f72e8"/><stop offset="1" stop-color="#f29ad6"/></linearGradient>
      <radialGradient id="ssun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffdf2"/><stop offset=".35" stop-color="#fff0f8" stop-opacity=".8"/><stop offset="1" stop-color="#ffd6f2" stop-opacity="0"/></radialGradient>
      <linearGradient id="st1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f6fd6"/><stop offset=".5" stop-color="#8e8cec"/><stop offset="1" stop-color="#6461c9"/></linearGradient>
      <linearGradient id="st2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f3aa8"/><stop offset=".45" stop-color="#4a56cf"/><stop offset="1" stop-color="#26308f"/></linearGradient>
      <linearGradient id="st3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d2272"/><stop offset=".45" stop-color="#2f3596"/><stop offset="1" stop-color="#181c5e"/></linearGradient>
      <linearGradient id="sframe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e3e8ff"/><stop offset="1" stop-color="#c7cff7"/></linearGradient>
      <linearGradient id="sfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f93e0"/><stop offset=".5" stop-color="#5e62c2"/><stop offset="1" stop-color="#363a92"/></linearGradient>
      <linearGradient id="sholo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ff3ff" stop-opacity=".55"/><stop offset="1" stop-color="#3fa9ff" stop-opacity=".25"/></linearGradient>
      <linearGradient id="sbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff6ff" stop-opacity=".55"/><stop offset="1" stop-color="#bff6ff" stop-opacity="0"/></linearGradient>
      <linearGradient id="sref" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".45"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
      <linearGradient id="sdesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6dcfb"/></linearGradient>
      <radialGradient id="sbloom" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#e6fbff" stop-opacity=".22"/><stop offset=".5" stop-color="#cfe6ff" stop-opacity=".06"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="svig" cx=".5" cy=".45" r=".8"><stop offset=".55" stop-color="#1b1f6a" stop-opacity="0"/><stop offset="1" stop-color="#11145a" stop-opacity=".6"/></radialGradient>
      <radialGradient id="sglobe" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d9fbff" stop-opacity=".9"/><stop offset=".6" stop-color="#4fe3ff" stop-opacity=".45"/><stop offset="1" stop-color="#3f7fff" stop-opacity=".15"/></radialGradient>
      <filter id="sblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
      <clipPath id="swin"><rect x="${WIN.x + 10}" y="${WIN.y + 10}" width="${WIN.w - 20}" height="${WIN.h - 20}" rx="${WIN.r - 10}"/></clipPath>
    </defs>`;
  }
  function tower(x, base, w, h, top, fill, lit, cols) { // torre arredondada com janelas acesas
    let s = `<path d="M${x} ${base} L${x} ${base - h + w * 0.5} Q ${x} ${base - h} ${x + w / 2} ${base - h} Q ${x + w} ${base - h} ${x + w} ${base - h + w * 0.5} L${x + w} ${base} Z" fill="${fill}"/>`;
    s += `<rect x="${f(x + w * 0.62)}" y="${f(base - h + w * 0.3)}" width="${f(w * 0.16)}" height="${f(h - w * 0.3)}" fill="#fff" opacity=".18"/>`;
    for (let yy = base - h + w * 0.55; yy < base - 6; yy += 9) for (let c = 0; c < cols; c++) if (rnd() < 0.62) s += `<rect x="${f(x + 4 + c * ((w - 8) / cols))}" y="${f(yy)}" width="${f((w - 8) / cols - 2.5)}" height="3.2" rx="1" fill="${rnd() < 0.7 ? lit : '#fff6c4'}" opacity="${f(0.55 + rnd() * 0.45)}"/>`;
    if (top === 'antenna') s += `<line x1="${x + w / 2}" y1="${base - h}" x2="${x + w / 2}" y2="${base - h - 18}" stroke="#dfe4ff" stroke-width="2"/><circle cx="${x + w / 2}" cy="${base - h - 19}" r="2.8" fill="#ff7ad9"/>`;
    if (top === 'dome') s += `<ellipse cx="${x + w / 2}" cy="${base - h + 2}" rx="${w * 0.42}" ry="${w * 0.3}" fill="#bff6ff" opacity=".85"/>`;
    if (top === 'ring') s += `<ellipse cx="${x + w / 2}" cy="${base - h + w * 0.7}" rx="${w * 0.75}" ry="4" fill="none" stroke="${SCH.cyan}" stroke-width="2.4" opacity=".9"/>`;
    return s;
  }
  function cityView() { // cidade do futuro vista pela janela
    seed = 909;
    let s = `<g clip-path="url(#swin)"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="url(#ssky)"/>`;
    for (let i = 0; i < 26; i++) s += `<circle cx="${f(WIN.x + rnd() * WIN.w)}" cy="${f(WIN.y + 8 + rnd() * 110)}" r="${f(0.6 + rnd() * 1.1)}" fill="#fff" opacity="${f(0.3 + rnd() * 0.5)}"/>`;
    s += `<circle cx="282" cy="214" r="78" fill="url(#ssun)"/><circle cx="282" cy="214" r="20" fill="#fffaf0" opacity=".95"/>`;
    s += `<circle cx="96" cy="176" r="26" fill="#d6c8ff" opacity=".75"/><ellipse cx="96" cy="176" rx="44" ry="8" fill="none" stroke="#f4eeff" stroke-width="3" opacity=".7" transform="rotate(-14 96 176)"/>`;
    for (const [x, y, w] of [[70, 262, 90], [250, 290, 110], [160, 238, 70]]) s += `<g opacity=".75"><ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="9" fill="#fff"/><circle cx="${x - w * 0.15}" cy="${y - 7}" r="${w * 0.17}" fill="#fff"/><circle cx="${x + w * 0.12}" cy="${y - 9}" r="${w * 0.2}" fill="#fff"/></g>`;
    // camada distante (névoa lilás)
    let x = WIN.x - 4; while (x < WIN.x + WIN.w) { const w = 16 + rnd() * 22, h = 70 + rnd() * 110; s += tower(f(x), 470, f(w), f(h), rnd() < 0.3 ? 'antenna' : '', 'url(#st1)', '#ffffff', 2); x += w + 3 + rnd() * 6; }
    s += `<rect x="${WIN.x}" y="390" width="${WIN.w}" height="90" fill="#b9a2ff" opacity=".25"/>`;
    // monotrilho iluminado
    s += `<path d="M${WIN.x - 10} 404 C 120 372, 260 430, ${WIN.x + WIN.w + 10} 392" stroke="#f2f4ff" stroke-width="7" fill="none"/><path d="M${WIN.x - 10} 404 C 120 372, 260 430, ${WIN.x + WIN.w + 10} 392" stroke="${SCH.cyan}" stroke-width="2" fill="none" opacity=".9"/>`;
    // camada do meio
    x = WIN.x - 8; while (x < WIN.x + WIN.w) { const w = 22 + rnd() * 26, h = 90 + rnd() * 140; s += tower(f(x), 500, f(w), f(h), ['antenna', 'dome', 'ring', ''][Math.floor(rnd() * 4)], 'url(#st2)', SCH.cyan, 3); x += w + 6 + rnd() * 12; }
    // ponte suspensa / parque flutuante
    s += `<ellipse cx="300" cy="352" rx="40" ry="9" fill="#5a63d8"/><ellipse cx="300" cy="349" rx="38" ry="6" fill="#7be0a0"/><circle cx="288" cy="338" r="9" fill="#4cc38a"/><circle cx="304" cy="334" r="11" fill="#5fd39a"/><circle cx="318" cy="340" r="8" fill="#4cc38a"/><path d="M300 361 L296 376 L304 376 Z" fill="${SCH.cyan}" opacity=".6"/>`;
    // camada da frente
    x = WIN.x - 12; while (x < WIN.x + WIN.w) { const w = 30 + rnd() * 30, h = 70 + rnd() * 90; s += tower(f(x), 530, f(w), f(h), rnd() < 0.4 ? 'ring' : 'antenna', 'url(#st3)', SCH.cyan, 3); x += w + 10 + rnd() * 16; }
    s += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="url(#sref)" opacity=".08"/>`;
    return s + '</g>';
  }
  function holoPanel(x, y, w, h) { // tela holográfica flutuante
    let s = `<g><rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="18" fill="${SCH.cyan}" opacity=".25" filter="url(#sblur)"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="url(#sholo)" stroke="#b8f8ff" stroke-width="2"/>`;
    for (let yy = y + 6; yy < y + h; yy += 5) s += `<rect x="${x + 3}" y="${yy}" width="${w - 6}" height="1" fill="#e8feff" opacity=".18"/>`;
    s += `<text x="${x + w / 2}" y="${y + 30}" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="16" fill="#ffffff">Let's Learn</text>`;
    s += `<text x="${x + w / 2}" y="${y + 52}" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="19" fill="#fff6a8">English!</text>`;
    s += `<g font-family="Arial, sans-serif" font-weight="700" font-size="16" text-anchor="middle"><text x="${x + 22}" y="${y + h - 16}" fill="#ff9ae0">A</text><text x="${x + w / 2}" y="${y + h - 16}" fill="#9dffb8">B</text><text x="${x + w - 22}" y="${y + h - 16}" fill="#ffe27a">C</text></g>`;
    s += `<path d="M${x + 10} ${y + 6} l2.4 5.6 5.6 .8 -4 4 .8 5.6 -4.8 -2.4 -4.8 2.4 .8 -5.6 -4 -4 5.6 -.8z" fill="#fff6a8"/>`;
    return s + '</g>';
  }
  function school() {
    seed = 61;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">${schoolDefs()}`;
    // paredes claras com painéis arredondados
    s += `<rect width="390" height="844" fill="url(#sw)"/>`;
    for (const [x, y, w, h] of [[-20, 120, 40, 420], [370, 120, 40, 420]]) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#dfe2ff" opacity=".35"/>`;
    // teto curvo escuro com faixas de luz
    s += `<path d="M0 0 L390 0 L390 92 Q 195 140 0 92 Z" fill="url(#sc)"/>`;
    for (const [dy, c, o] of [[0, SCH.cyan, 1], [-14, SCH.lilac, 0.85], [-28, SCH.pink, 0.6]]) s += `<path d="M0 ${92 + dy} Q 195 ${140 + dy} 390 ${92 + dy}" stroke="${c}" stroke-width="3" fill="none" opacity="${o}"/><path d="M0 ${92 + dy} Q 195 ${140 + dy} 390 ${92 + dy}" stroke="${c}" stroke-width="10" fill="none" opacity="${o * 0.18}"/>`;
    for (const x of [70, 150, 240, 320]) s += `<ellipse cx="${x}" cy="${f(64 + Math.sin((x / 390) * Math.PI) * 22)}" rx="12" ry="4" fill="#e9fbff"/><ellipse cx="${x}" cy="${f(64 + Math.sin((x / 390) * Math.PI) * 22)}" rx="22" ry="8" fill="#bff6ff" opacity=".35"/>`;
    // janela panorâmica com a cidade
    s += `<rect x="${WIN.x - 8}" y="${WIN.y - 8}" width="${WIN.w + 16}" height="${WIN.h + 16}" rx="${WIN.r + 8}" fill="#b8c2f4" opacity=".55"/>`;
    s += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="${WIN.r}" fill="url(#sframe)"/>`;
    s += cityView();
    s += `<rect x="${WIN.x + 10}" y="${WIN.y + 10}" width="${WIN.w - 20}" height="${WIN.h - 20}" rx="${WIN.r - 10}" fill="none" stroke="${SCH.cyan}" stroke-width="2" opacity=".75"/>`;
    for (const mx of [140, 250]) s += `<rect x="${mx - 4}" y="${WIN.y + 8}" width="8" height="${WIN.h - 16}" rx="4" fill="url(#sframe)"/><rect x="${mx - 1}" y="${WIN.y + 30}" width="2" height="${WIN.h - 60}" fill="${SCH.cyan}" opacity=".45"/>`;
    s += `<rect x="${WIN.x + 6}" y="300" width="${WIN.w - 12}" height="7" rx="3.5" fill="url(#sframe)"/>`;
    // reflexo suave no vidro
    s += `<path d="M60 140 L110 140 L70 330 L36 330 Z" fill="#fff" opacity=".12"/><path d="M120 140 L134 140 L96 330 L86 330 Z" fill="#fff" opacity=".1"/>`;
    // painel holográfico à esquerda e projetor
    s += holoPanel(266, 206, 112, 100);
    // estante arredondada à direita com livros, globo holográfico e plantinha
    s += `<rect x="296" y="318" width="92" height="210" rx="22" fill="#ffffff"/><rect x="302" y="324" width="80" height="198" rx="18" fill="#e3e1ff"/>`;
    for (const yy of [380, 446, 512]) s += `<rect x="300" y="${yy}" width="84" height="7" rx="3.5" fill="#ffffff"/><rect x="304" y="${yy + 6}" width="76" height="2" fill="${SCH.cyan}" opacity=".7"/>`;
    const bk = ['#ff6fa8', '#4fc3ff', '#ffd54f', '#8f7bff', '#5fd39a', '#ff9a4d'];
    for (const [yy, n] of [[446, 6], [512, 5]]) { let bx = 310; for (let i = 0; i < n; i++) { const w = 7 + rnd() * 4, h = 30 + rnd() * 18; s += `<rect x="${f(bx)}" y="${f(yy - h)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${bk[(i + yy) % 6]}"/><rect x="${f(bx + 1.5)}" y="${f(yy - h + 4)}" width="${f(w - 3)}" height="2" fill="#fff" opacity=".6"/>`; bx += w + 2; } }
    s += `<ellipse cx="341" cy="377" rx="14" ry="3" fill="${SCH.cyan}" opacity=".6"/><circle cx="341" cy="356" r="17" fill="url(#sglobe)"/><ellipse cx="341" cy="356" rx="17" ry="6" fill="none" stroke="#e8feff" stroke-width="1.2" opacity=".8"/><ellipse cx="341" cy="356" rx="7" ry="17" fill="none" stroke="#e8feff" stroke-width="1.2" opacity=".8"/>`;
    s += `<path d="M362 378 l4 -14 q-8 -6 -4 -16 q8 2 6 14 q8 -10 14 -4 q-6 8 -14 6 l-2 14 z" fill="#4cc38a"/><rect x="356" y="370" width="22" height="10" rx="4" fill="#ffffff" opacity=".9"/>`;
    // faixa de luz e rodapé abaixo da janela
    s += `<rect x="0" y="540" width="390" height="56" fill="#f4f6ff"/><rect x="0" y="552" width="390" height="3" fill="${SCH.cyan}" opacity=".85"/><rect x="0" y="549" width="390" height="9" fill="${SCH.cyan}" opacity=".15"/>`;
    // piso brilhante com reflexos e anéis de luz
    s += `<rect x="0" y="596" width="390" height="248" fill="url(#sfloor)"/>`;
    s += `<path d="M${WIN.x + 20} 596 L${WIN.x + WIN.w - 20} 596 L${WIN.x + WIN.w + 40} 844 L${WIN.x - 40} 844 Z" fill="url(#sref)" opacity=".35"/>`;
    for (const [rx, ry, o] of [[150, 26, 0.5], [210, 42, 0.32], [280, 64, 0.18]]) s += `<ellipse cx="195" cy="690" rx="${rx}" ry="${ry}" fill="none" stroke="${SCH.lilac}" stroke-width="2" opacity="${o}"/>`;
    for (let k = 0; k < 7; k++) s += `<line x1="${f(-40 + k * 78)}" y1="596" x2="${f(-140 + k * 112)}" y2="844" stroke="#ffffff" stroke-width="1.2" opacity=".18"/>`;
    // móveis arredondados: mesinha com tablet holográfico (esq.) e pufe (dir.)
    s += `<ellipse cx="62" cy="676" rx="70" ry="16" fill="#5a5fc8" opacity=".25"/><rect x="-14" y="616" width="140" height="44" rx="22" fill="url(#sdesk)"/><rect x="-10" y="650" width="132" height="4" rx="2" fill="${SCH.cyan}" opacity=".9"/><rect x="34" y="660" width="20" height="26" rx="8" fill="#c9cff7"/>`;
    s += `<path d="M30 616 L44 588 L92 588 L80 616 Z" fill="${SCH.cyan}" opacity=".35"/><rect x="40" y="590" width="44" height="6" rx="3" fill="#e8feff" opacity=".7"/>`;
    s += `<ellipse cx="334" cy="690" rx="62" ry="14" fill="#5a5fc8" opacity=".25"/><path d="M282 690 Q 280 628 334 622 Q 390 628 388 690 Z" fill="${SCH.lilac}"/><path d="M296 650 Q 312 632 336 632" stroke="#fff" stroke-width="6" fill="none" opacity=".35" stroke-linecap="round"/><ellipse cx="334" cy="690" rx="54" ry="8" fill="#7d68e8"/>`;
    // luz geral: brilho no centro e vinheta azulada
    s += `<rect width="390" height="844" fill="url(#sbloom)"/><rect width="390" height="844" fill="url(#svig)"/>`;
    return s + '</svg>';
  }
  // camadas animadas da escola (mesmo enquadramento do fundo)
  function schoolLights() { // faixas de luz que pulsam
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs><filter id="b" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
    for (const [dy, c] of [[0, SCH.cyan], [-14, SCH.lilac], [-28, SCH.pink]]) s += `<path d="M0 ${92 + dy} Q 195 ${140 + dy} 390 ${92 + dy}" stroke="${c}" stroke-width="7" fill="none" filter="url(#b)"/>`;
    s += `<rect x="0" y="549" width="390" height="9" fill="${SCH.cyan}" filter="url(#b)"/>`;
    s += `<rect x="${WIN.x + 10}" y="${WIN.y + 10}" width="${WIN.w - 20}" height="${WIN.h - 20}" rx="${WIN.r - 10}" fill="none" stroke="${SCH.cyan}" stroke-width="5" filter="url(#b)"/>`;
    for (const [rx, ry] of [[150, 26], [210, 42]]) s += `<ellipse cx="195" cy="690" rx="${rx}" ry="${ry}" fill="none" stroke="${SCH.lilac}" stroke-width="4" filter="url(#b)"/>`;
    return s + '</svg>';
  }
  function schoolHolo() { // brilho e linhas da tela holográfica (piscam de leve)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs><filter id="b"><feGaussianBlur stdDeviation="5"/></filter><linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff6ff" stop-opacity=".0"/><stop offset=".5" stop-color="#bff6ff" stop-opacity=".55"/><stop offset="1" stop-color="#bff6ff" stop-opacity="0"/></linearGradient></defs>
      <rect x="262" y="202" width="120" height="108" rx="16" fill="none" stroke="#7ff3ff" stroke-width="5" filter="url(#b)"/>
      <circle cx="341" cy="356" r="24" fill="#7ff3ff" opacity=".35" filter="url(#b)"/></svg>`;
  }
  function schoolRays() { // feixes de luz das lâmpadas do teto
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8f8ff" stop-opacity=".5"/><stop offset="1" stop-color="#d8f8ff" stop-opacity="0"/></linearGradient></defs>
      ${[70, 150, 240, 320].map((x) => { const y = f(64 + Math.sin((x / 390) * Math.PI) * 22); return `<path d="M${x - 10} ${y} L${x + 10} ${y} L${x + 60} 640 L${x - 60} 640 Z" fill="url(#r)"/>`; }).join('')}</svg>`;
  }

  const cache = {};
  const memo = (k, fn) => cache[k] || (cache[k] = enc(fn()));
  window.LUMI_SCENES = {
    room: (theme) => memo('r' + theme, () => room(theme)),
    vines: (theme) => memo('v' + theme, () => vines(theme)),
    rays: (theme) => memo('y' + theme, () => rays(theme)),
    map: (H, pts) => map(H, pts),
    mapChunks,
    schoolLights: () => memo('sl', schoolLights),
    schoolHolo: () => memo('sh', schoolHolo),
    schoolRays: () => memo('sr', schoolRays),
    schoolWindow: WIN,
    mapLeaves: (side) => memo('ml' + side, () => mapLeaves(side)),
  };
})();
