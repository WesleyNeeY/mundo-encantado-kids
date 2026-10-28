/* Camada visual: folhas que balançam, raios de luz, partículas mágicas e ícones desenhados.
   Só aparência — não mexe em regras, valores ou navegação. */
let uid = 0;
const id = (p) => p + ++uid;

/* ---------- ícones (SVG com volume e brilho) ---------- */
export const ICONS = {
  gift() { const a = id('g'), b = id('g'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a8a"/><stop offset="1" stop-color="#e2324a"/></linearGradient><linearGradient id="${b}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#f5b400"/></linearGradient></defs>
    <rect x="7" y="20" width="34" height="23" rx="4" fill="url(#${a})"/><rect x="4" y="14" width="40" height="10" rx="3" fill="url(#${a})"/><rect x="21" y="14" width="6" height="29" fill="url(#${b})"/><rect x="4" y="18" width="40" height="3" fill="#fff" opacity=".25"/>
    <path d="M24 14 C 14 4, 8 12, 16 14 Z M24 14 C 34 4, 40 12, 32 14 Z" fill="url(#${b})" stroke="#d99a00" stroke-width="1"/><rect x="9" y="24" width="4" height="15" rx="2" fill="#fff" opacity=".3"/></svg>`; },
  sparkle() { const a = id('s'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff59d"/><stop offset=".5" stop-color="#ffca28"/><stop offset="1" stop-color="#ff8f00"/></linearGradient></defs>
    <path d="M22 4 L26.5 17.5 L40 22 L26.5 26.5 L22 40 L17.5 26.5 L4 22 L17.5 17.5 Z" fill="url(#${a})" stroke="#e08a00" stroke-width="1"/><path d="M38 30 L40 36 L46 38 L40 40 L38 46 L36 40 L30 38 L36 36 Z" fill="#b388ff"/><path d="M38 4 L39.5 9 L44 10 L39.5 11.5 L38 16 L36.5 11.5 L32 10 L36.5 9 Z" fill="#80d8ff"/><circle cx="19" cy="17" r="2.5" fill="#fff" opacity=".9"/></svg>`; },
  map() { const a = id('m'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#2f86ff"/></linearGradient></defs>
    <path d="M5 10 L17 6 L31 10 L43 6 L43 38 L31 42 L17 38 L5 42 Z" fill="url(#${a})" stroke="#1a5fd1" stroke-width="1.5"/><path d="M17 6 L17 38 M31 10 L31 42" stroke="#1a5fd1" stroke-width="1.2" opacity=".5"/><path d="M8 34 C 14 26, 20 30, 24 22 S 34 14, 40 12" stroke="#fff" stroke-width="2.4" fill="none" stroke-dasharray="3 3"/>
    <path d="M36 8 C 31 8, 30 14, 36 21 C 42 14, 41 8, 36 8 Z" fill="#ff4f5e" stroke="#c62838"/><circle cx="36" cy="12.5" r="2.2" fill="#fff"/><path d="M8 12 L14 10 L14 18 L8 20 Z" fill="#5fe08a"/></svg>`; },
  home() { const a = id('h'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset="1" stop-color="#e2442a"/></linearGradient></defs>
    <rect x="10" y="22" width="28" height="20" rx="3" fill="#fff3dc" stroke="#d9a35c" stroke-width="1.5"/><path d="M4 24 L24 6 L44 24 L39 27 L24 13 L9 27 Z" fill="url(#${a})" stroke="#b8321c" stroke-width="1"/><rect x="20" y="29" width="9" height="13" rx="2" fill="#5aa0ff"/><rect x="13" y="27" width="5" height="5" rx="1" fill="#7fd0ff"/><rect x="31" y="27" width="5" height="5" rx="1" fill="#7fd0ff"/></svg>`; },
  moon() { const a = id('n'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff59d"/><stop offset="1" stop-color="#ffb300"/></linearGradient></defs>
    <path d="M30 6 A 18 18 0 1 0 42 32 A 14 14 0 1 1 30 6 Z" fill="url(#${a})" stroke="#e09a00" stroke-width="1"/><circle cx="36" cy="12" r="1.8" fill="#b388ff"/><circle cx="42" cy="20" r="1.3" fill="#80d8ff"/><path d="M15 26 Q 17 30 21 30" stroke="#e09a00" stroke-width="1.6" fill="none"/></svg>`; },
  apple() { const a = id('a'); return `<svg viewBox="0 0 48 48"><defs><radialGradient id="${a}" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ff8a80"/><stop offset=".6" stop-color="#e53935"/><stop offset="1" stop-color="#b71c1c"/></radialGradient></defs>
    <path d="M24 14 C 14 8, 5 16, 7 27 C 9 39, 17 45, 24 41 C 31 45, 39 39, 41 27 C 43 16, 34 8, 24 14 Z" fill="url(#${a})"/><path d="M24 14 Q 23 8 26 4" stroke="#6d4c41" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M26 9 C 30 4, 37 5, 38 9 C 33 12, 29 11, 26 9 Z" fill="#66bb6a"/><ellipse cx="15" cy="21" rx="3" ry="5" fill="#fff" opacity=".45" transform="rotate(-25 15 21)"/></svg>`; },
  hat() { const a = id('c'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb6ff"/><stop offset="1" stop-color="#1f62d8"/></linearGradient></defs>
    <path d="M8 30 C 8 14, 40 10, 40 28 Z" fill="url(#${a})" stroke="#174ea8" stroke-width="1.2"/><path d="M6 30 C 18 26, 34 26, 46 34 C 34 36, 16 36, 6 30 Z" fill="#174ea8"/><circle cx="24" cy="14" r="2.6" fill="#ffd21f"/><path d="M24 18 L25.8 22.5 L30.5 22.8 L26.8 25.6 L28 30 L24 27.4 L20 30 L21.2 25.6 L17.5 22.8 L22.2 22.5 Z" fill="#ffd21f"/><path d="M13 22 Q 16 16 22 15" stroke="#fff" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/></svg>`; },
  coin() { const a = id('k'); return `<svg viewBox="0 0 48 48"><defs><radialGradient id="${a}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff7b0"/><stop offset=".55" stop-color="#ffc21a"/><stop offset="1" stop-color="#d98800"/></radialGradient></defs>
    <circle cx="24" cy="24" r="21" fill="#c27a00"/><circle cx="24" cy="22" r="20" fill="url(#${a})"/><circle cx="24" cy="22" r="14.5" fill="none" stroke="#e8a000" stroke-width="2"/><path d="M24 12 L26.8 18.6 L33.8 19 L28.4 23.5 L30.2 30.4 L24 26.6 L17.8 30.4 L19.6 23.5 L14.2 19 L21.2 18.6 Z" fill="#fff3a0" stroke="#e8a000" stroke-width="1"/></svg>`; },
  fire() { const a = id('f'); return `<svg viewBox="0 0 48 48"><defs><linearGradient id="${a}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset=".6" stop-color="#ff9100"/><stop offset="1" stop-color="#ffd54f"/></linearGradient></defs>
    <path d="M24 3 C 28 12, 38 16, 38 29 C 38 38, 31 45, 24 45 C 16 45, 10 38, 10 30 C 10 22, 16 18, 17 11 C 21 15, 21 19, 21 22 C 24 18, 26 11, 24 3 Z" fill="url(#${a})"/><path d="M24 26 C 27 30, 31 32, 30 37 C 29 41, 26 43, 24 43 C 21 43, 18 40, 18 36 C 18 32, 22 30, 24 26 Z" fill="#fff3a0"/></svg>`; },
};

/* ---------- aplica ícones na interface existente (mesmas posições e funções) ---------- */
function setIcon(el, name) { if (el && ICONS[name]) el.innerHTML = ICONS[name](); }
document.querySelectorAll('#btn-gift > span').forEach((e) => setIcon(e, 'gift'));
document.querySelectorAll('#btn-legend > span').forEach((e) => setIcon(e, 'sparkle'));
document.querySelectorAll('.sbtn[data-go="map"] > span').forEach((e) => setIcon(e, 'map'));
const tabIcon = { home: 'home', rest: 'moon', snack: 'apple', shop: 'hat' };
document.querySelectorAll('.tabbar button').forEach((b) => setIcon(b.querySelector('span'), tabIcon[b.dataset.go]));
document.querySelectorAll('.ic.coin').forEach((e) => { e.classList.add('svgic'); setIcon(e, 'coin'); });
document.querySelectorAll('.ic.fire').forEach((e) => { e.classList.add('svgic'); setIcon(e, 'fire'); });

/* ---------- camadas animadas do cenário ---------- */
const S = window.LUMI_SCENES;
document.querySelectorAll('.screen[data-scene]').forEach((sc) => {
  const t = sc.dataset.scene;
  const rays = document.createElement('div'); rays.className = 'fx fx-rays'; rays.style.backgroundImage = S.rays(t);
  const vines = document.createElement('div'); vines.className = 'fx fx-vines'; vines.style.backgroundImage = S.vines(t);
  const dust = document.createElement('div'); dust.className = 'fx fx-dust' + (t === 'night' ? ' night' : '');
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('i');
    p.style.left = (6 + Math.random() * 88).toFixed(1) + '%'; p.style.top = (14 + Math.random() * 60).toFixed(1) + '%';
    p.style.animationDelay = (-Math.random() * 9).toFixed(2) + 's'; p.style.animationDuration = (7 + Math.random() * 6).toFixed(2) + 's';
    const s = 3 + Math.random() * 4; p.style.width = p.style.height = s.toFixed(1) + 'px';
    dust.appendChild(p);
  }
  const host = sc.querySelector('[data-host]');
  sc.insertBefore(rays, host || sc.firstChild);
  if (host) host.after(vines, dust); else sc.append(vines, dust);
});
