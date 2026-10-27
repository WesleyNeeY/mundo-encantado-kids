/* Lumi — app de inglês para crianças (3D) */
import { Stage } from './lumi3d.js';

const D = window.LUMI_DATA, T = window.LUMI_LINES;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- estado salvo no aparelho ---------------- */
const KEY = 'lumi_state_v1';
const fresh = () => ({ name: '', coins: 120, energy: 80, xp: 0, streak: 0, lastDay: '', giftDay: '', units: {}, owned: { 'head:none': 1, 'face:none': 1, 'neck:none': 1 }, outfit: { head: 'none', face: 'none', neck: 'none' }, sleeping: false, sleepAt: 0, seen: {} });
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} bind(); };
const level = () => Math.floor(S.xp / 300) + 1;
function bind() {
  $$('[data-bind]').forEach((el) => { const k = el.dataset.bind; el.textContent = k === 'level' ? level() : Math.round(S[k] ?? 0); });
  $$('[data-bind-w]').forEach((el) => { const k = el.dataset.bindW; el.style.width = (k === 'xp' ? (S.xp % 300) / 3 : Math.min(100, S[k])) + '%'; });
  const hn = $('#home-name'); if (hn) hn.textContent = (S.name || 'Nível') + ' · Nv ' + level();
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1900); }

/* ---------------- palco 3D ---------------- */
let stage;
try { stage = new Stage(); } catch (e) { stage = null; }
if (!stage) { $('#loading').innerHTML = '<div class="nogl">Seu aparelho não conseguiu abrir o 3D. Tente atualizar o navegador.</div>'; throw new Error('no webgl'); }
const lumi = stage.lumi;
lumi.setOutfit(S.outfit);
const PRESET = {
  splash: { fit: [0.17, 0.72], props: true },
  home: { fit: [0.22, 0.73], props: true },
  lesson: { fit: [0.2, 0.99], props: false },
  result: { fit: [0.25, 0.79], props: true },
  rest: { fit: [0.22, 0.75], props: false, night: true },
  snack: { fit: [0.2, 0.75], props: false },
  shop: { fit: [0.26, 0.61], props: false },
};

/* ---------------- voz (áudios gravados com voz de criança) ---------------- */
let AUDIO = {}, actx = null, analyser = null, speakToken = 0, curSrc = null;
const bufCache = {};
const audioReady = fetch('audio/index.json').then((r) => r.json()).then((j) => { AUDIO = j; }).catch(() => {});
function audioCtx() {
  if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); analyser = actx.createAnalyser(); analyser.fftSize = 512; analyser.connect(actx.destination); }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function getBuf(file) {
  if (!bufCache[file]) bufCache[file] = fetch('audio/' + file).then((r) => r.arrayBuffer()).then((a) => new Promise((res, rej) => actx.decodeAudioData(a, res, rej)));
  return bufCache[file];
}
const keyOf = (text, lang) => (lang === 'en' ? 'en' : 'pt') + '|' + text;
function preload(parts) { if (!audioCtx()) return; parts.forEach(([t, l]) => { const f = AUDIO[keyOf(t, l)]; if (f) getBuf(f).catch(() => {}); }); }
async function playFile(file, my) {
  const ctx = audioCtx(); if (!ctx) return false;
  let buf; try { buf = await getBuf(file); } catch (e) { return false; }
  if (my !== speakToken) return true;
  return new Promise((resolve) => {
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(analyser); curSrc = src;
    const data = new Uint8Array(analyser.fftSize); let live = true;
    const lip = () => { if (!live) return; analyser.getByteTimeDomainData(data); let s = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; s += v * v; } lumi.mouthLevel = Math.min(1, Math.sqrt(s / data.length) * 5.5); requestAnimationFrame(lip); };
    src.onended = () => { live = false; lumi.mouthLevel = null; if (my === speakToken) lumi.talk(false); curSrc = null; resolve(true); };
    lumi.talk(true); src.start(); lip();
  });
}
const synth = window.speechSynthesis;
function speakTTS(text, lang) {
  return new Promise((resolve) => {
    if (!synth) { setTimeout(resolve, 400 + text.length * 45); return; }
    const my = speakToken; const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'en' ? 'en-US' : 'pt-BR'; u.rate = lang === 'en' ? 0.85 : 1; u.pitch = 1.4;
    let done = false; const fin = () => { if (done) return; done = true; if (my === speakToken) lumi.talk(false); resolve(); };
    u.onend = fin; u.onerror = fin; setTimeout(fin, 1800 + text.length * 110); lumi.talk(true); synth.speak(u);
  });
}
async function speak(text, lang) {
  await audioReady;
  const f = AUDIO[keyOf(text, lang)];
  if (f && audioCtx()) { const ok = await playFile(f, speakToken); if (ok) return; }
  return speakTTS(text, lang);
}
function stopTalk() { if (synth) synth.cancel(); if (curSrc) { try { curSrc.onended && curSrc.onended(); curSrc.stop(); } catch (e) {} curSrc = null; } speakToken++; lumi.talk(false); lumi.mouthLevel = null; }
// fala com balão: parts = [[texto, 'pt'|'en'], ...]; retorna false se foi interrompida
async function say(bubble, parts, html) {
  if (typeof parts === 'string') parts = [[parts, 'pt']];
  stopTalk(); const my = speakToken;
  if (bubble) {
    bubble.innerHTML = html || parts.map(([t, l]) => (l === 'en' ? `<span class="en">${esc(t)}</span>` : esc(t))).join(' ');
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
  }
  for (const [t, l] of parts) { if (my !== speakToken) return false; await speak(t, l); await wait(90); }
  return my === speakToken;
}

/* ---------------- reconhecimento de voz ---------------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let micBroken = !SR;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim();
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function match(heard, target) {
  const h = norm(heard), t = norm(target); if (!h) return 0; if (h.includes(t)) return 1;
  const words = h.split(' '); let best = 1 - lev(h, t) / Math.max(h.length, t.length);
  for (let i = 0; i < words.length; i++) for (let k = 1; k <= 3 && i + k <= words.length; k++) { const c = words.slice(i, i + k).join(' '); best = Math.max(best, 1 - lev(c, t) / Math.max(c.length, t.length)); }
  return best;
}
let curRec = null;
function listen(target) {
  return new Promise((resolve) => {
    if (micBroken) return resolve({ broken: true });
    const r = new SR(); curRec = r;
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
    let best = { score: 0, text: '' }, done = false, heardAny = false;
    const fin = (extra) => { if (done) return; done = true; curRec = null; try { r.abort(); } catch (e) {} resolve(Object.assign({ ok: best.score >= 0.55, score: best.score, heard: best.text, heardAny }, extra || {})); };
    r.onresult = (ev) => {
      heardAny = true;
      for (const res of ev.results) for (const alt of res) { const s = match(alt.transcript, target); if (s > best.score) best = { score: s, text: alt.transcript }; }
      if (best.score >= 0.55) fin();
      else if (ev.results[ev.results.length - 1].isFinal) fin();
    };
    r.onerror = (e) => { if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported'].includes(e.error)) micBroken = true; fin({ error: e.error, broken: micBroken }); };
    r.onend = () => fin();
    setTimeout(() => fin(), 6500);
    try { r.start(); } catch (e) { micBroken = true; fin({ broken: true }); }
  });
}
function stopListen() { if (curRec) { try { curRec.abort(); } catch (e) {} } }

/* ---------------- cenários CSS ---------------- */
$$('[data-clouds]').forEach((d) => {
  d.innerHTML = [[120, 36, -30, 16, 9], [90, 28, 72, 9, 7], [70, 22, 40, 25, 11], [100, 30, 85, 33, 8]]
    .map(([w, h, x, y, s], i) => `<div class="cloud" style="width:${w}px;height:${h}px;left:${x}%;top:${y}%;animation:drift ${s}s ease-in-out infinite alternate${i % 2 ? '-reverse' : ''}"></div>`).join('');
});
$$('[data-stars]').forEach((d) => { let s = ''; for (let i = 0; i < 40; i++) s += `<i class="twinkle" style="left:${Math.random() * 100}%;top:${Math.random() * 55}%;animation-delay:${Math.random() * 2.4}s;transform:scale(${0.5 + Math.random()})"></i>`; d.innerHTML = s; });

/* ---------------- navegação ---------------- */
let current = '';
function show(name) {
  stopTalk(); stopListen();
  if (current === 'shop') { preview = null; lumi.setOutfit(S.outfit); }
  $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-' + name));
  current = name;
  const host = $('#s-' + name + ' [data-host]');
  if (host) stage.mount(host, PRESET[name] || {});
}
function go(name) {
  if (name !== 'lesson') LS = null;
  show(name);
  ({ home: enterHome, map: enterMap, rest: enterRest, snack: enterSnack, shop: enterShop }[name] || (() => {}))();
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) { audioCtx(); go(b.dataset.go); } });
stage.onPoke = () => {
  if (current === 'home' && !S.sleeping) { const p = rnd([[[T.en.hi, 'en']], [[T.pt.tickle, 'pt']], [[T.en.hello, 'en'], [T.pt.letsLearn, 'pt']]]); say($('#home-bubble'), p); }
  else if (current === 'rest' && S.sleeping) lumi.setMood('sleep');
};

/* ---------------- energia / sono / sequência ---------------- */
function tickSleep() {
  if (!S.sleeping) return;
  const gained = Math.floor((Date.now() - S.sleepAt) / 3000);
  if (gained > 0) { S.energy = Math.min(100, S.energy + gained); S.sleepAt += gained * 3000; save(); }
}
setInterval(() => { tickSleep(); if (current === 'rest') renderRest(); }, 1000);
function touchStreak() {
  const d = today(); if (S.lastDay === d) return;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = d; save();
}
function wake() { if (S.sleeping) { tickSleep(); S.sleeping = false; save(); } }
const unitIndex = () => { const i = D.units.findIndex((u) => !(S.units[u.id] && S.units[u.id].done)); return i < 0 ? D.units.length - 1 : i; };

/* ---------------- SPLASH ---------------- */
function enterSplash() {
  show('splash');
  lumi.setMood('idle');
  if (S.name) { $('#kidname').style.display = 'none'; $('#btn-start').textContent = `Oi, ${S.name}! ▶`; }
  setTimeout(() => lumi.doWave(2), 700);
}
$('#btn-start').addEventListener('click', () => {
  const inp = $('#kidname');
  if (!S.name) {
    const n = inp.value.trim();
    if (!n) { inp.focus(); inp.placeholder = 'Escreva seu nome 😊'; lumi.encourage(); return; }
    S.name = cap(n); save();
  }
  audioCtx(); touchStreak(); go('home');
});

/* ---------------- HOME ---------------- */
function enterHome() {
  tickSleep();
  const i = unitIndex(), u = D.units[i];
  $('#play-sub').textContent = `Aula ${i + 1} · ${u.name}`;
  $('#btn-gift').classList.toggle('glow', S.giftDay !== today());
  lumi.setMood(S.sleeping ? 'sleep' : 'idle');
  bind();
  setTimeout(() => {
    if (current !== 'home') return;
    if (S.sleeping) { say($('#home-bubble'), T.pt.sleeping); return; }
    lumi.doWave(1.8);
    const first = !S.seen.home; S.seen.home = 1; save();
    if (S.energy < 10) say($('#home-bubble'), T.pt.tired);
    else if (first) say($('#home-bubble'), [[T.pt.hello, 'pt'], [T.pt.letsLearn, 'pt']], `Olá, ${esc(S.name)}! Eu sou o Lumi! Vamos aprender inglês?`);
    else say($('#home-bubble'), [[T.en.hello, 'en'], [T.pt.play, 'pt']], `<span class="en">Hello</span>, ${esc(S.name)}! Vamos jogar?`);
  }, 400);
}
$('#btn-play').addEventListener('click', () => { audioCtx(); startLesson(unitIndex()); });
$('#btn-gift').addEventListener('click', () => {
  audioCtx();
  if (S.giftDay === today()) { say($('#home-bubble'), T.pt.giftDone); return; }
  S.giftDay = today(); S.coins += 30; save();
  $('#btn-gift').classList.remove('glow'); lumi.celebrate(); confetti(30);
  say($('#home-bubble'), [[T.pt.gift, 'pt'], [T.en.thanks, 'en']], 'Surpresa! Você ganhou <b>30 moedas</b>! 🪙');
});

/* ---------------- MAPA ---------------- */
let avatarURL = null;
function enterMap() {
  const wrap = $('#mapwrap'), n = D.units.length, step = 160, H = n * step + 160;
  wrap.style.height = H + 'px';
  const xs = [0.5, 0.76, 0.5, 0.24];
  const pts = D.units.map((u, i) => ({ x: xs[i % 4], y: H - 100 - i * step }));
  let path = `M${pts[0].x * 400},${pts[0].y}`;
  for (let i = 1; i < n; i++) { const a = pts[i - 1], b = pts[i]; path += ` C${a.x * 400},${a.y - 80} ${b.x * 400},${b.y + 80} ${b.x * 400},${b.y}`; }
  const cur = unitIndex();
  let html = `<svg class="mapsvg" viewBox="0 0 400 ${H}" preserveAspectRatio="none"><path d="${path}" stroke="rgba(255,255,255,.75)" stroke-width="26" fill="none" stroke-linecap="round"/><path d="${path}" stroke="#ffc928" stroke-width="9" stroke-dasharray="1 22" fill="none" stroke-linecap="round"/></svg>`;
  D.units.forEach((u, i) => {
    const st = S.units[u.id] || {};
    const cls = st.done ? 'done' : i === cur ? 'cur' : i > cur ? 'lock' : '';
    const stars = st.stars ? '⭐'.repeat(st.stars) + '<span style="opacity:.3">' + '⭐'.repeat(3 - st.stars) + '</span>' : '';
    html += `<button class="node ${cls}" data-u="${i}" style="left:${pts[i].x * 100}%;top:${pts[i].y}px"><div class="disc"><span class="n">${i + 1}</span>${u.icon}${i > cur ? '<span class="lk">🔒</span>' : ''}</div><label>${u.name}</label><div class="st">${stars}</div></button>`;
  });
  if (!avatarURL) avatarURL = stage.snapshot(220, 220);
  html += `<img class="mapav" src="${avatarURL}" alt="" style="left:calc(${pts[cur].x * 100}% + ${pts[cur].x > 0.5 ? -88 : 88}px);top:${pts[cur].y + 40}px">`;
  wrap.innerHTML = html;
  const sc = $('#map-scroll');
  requestAnimationFrame(() => { sc.scrollTop = Math.max(0, pts[cur].y - sc.clientHeight / 2); });
}
$('#mapwrap').addEventListener('click', (e) => {
  const b = e.target.closest('.node'); if (!b) return;
  const i = +b.dataset.u;
  if (i > unitIndex()) { toast('🔒 Termine a aula anterior para abrir'); speak(T.pt.locked, 'pt'); return; }
  startLesson(i);
});

/* ---------------- LIÇÃO: escuta → repete → joga ---------------- */
let LS = null;
const STARS = 8;
function picHTML(w) { return w.txt ? `<span class="num">${w.txt}</span>` : w.img; }
function setStars() { $('#stars').innerHTML = Array.from({ length: STARS }, (_, i) => `<span class="${i < LS.stars ? 'on' : ''}">⭐</span>`).join(''); }
function addStar(el) {
  LS.stars++; setStars();
  if (el) coinFly(el, '+2 🪙'); S.coins += 2; LS.coins += 2; save();
}
function coinFly(el, txt) {
  const r = el.getBoundingClientRect(), app = $('#app').getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'coinfly'; f.textContent = txt;
  f.style.left = r.left - app.left + r.width / 2 - 30 + 'px'; f.style.top = r.top - app.top + 'px';
  $('#app').appendChild(f); setTimeout(() => f.remove(), 1000);
}
function startLesson(ui) {
  tickSleep(); wake();
  if (S.energy < 10) { openTired(); return; }
  const u = D.units[ui];
  const seenW = (S.units[u.id] && S.units[u.id].seenWords) || [];
  let pool = shuffle(u.words.filter((w) => !seenW.includes(w.en)));
  if (pool.length < 4) pool = pool.concat(shuffle(u.words.filter((w) => seenW.includes(w.en))));
  const words = pool.slice(0, 4);
  S.energy = Math.max(0, S.energy - 10); save();
  words.forEach((w) => preload([[w.en, 'en'], [cap(w.pt) + '! ' + T.pt.inEn, 'pt']]));
  preload([[T.pt.look, 'pt'], [T.pt.inEn, 'pt'], [T.pt.yourTurn, 'pt'], [T.pt.where, 'pt'], [T.pt.again, 'pt']]);
  LS = { id: Symbol(), ui, u, words, stars: 0, coins: 0, misses: 0 };
  show('lesson'); lumi.setMood('idle'); setStars();
  runLesson(LS);
}
const alive = (ls) => LS === ls && current === 'lesson';
async function runLesson(ls) {
  await wait(500);
  for (const w of ls.words) { if (!alive(ls)) return; await teachWord(ls, w); }
  if (!alive(ls)) return;
  await quizIntro(ls);
  for (const w of shuffle(ls.words)) { if (!alive(ls)) return; await quizWord(ls, w); }
  if (alive(ls)) finishLesson(ls);
}
// 1) apresenta a palavra e 2) a criança repete
async function teachWord(ls, w) {
  const B = $('#lbody'), bub = $('#lesson-bubble');
  B.innerHTML = `<div class="card in"><button class="spk" id="spk" aria-label="Ouvir">🔊</button><div class="pic" id="pic">${picHTML(w)}</div><div class="wen">${esc(w.en)}</div><div class="wpt">${esc(w.pt)}</div></div>
    <div class="turn" id="turn"><div class="turnlbl" id="tlbl"></div><button class="mic idle" id="mic" aria-label="Falar">🎤</button><button class="skip" id="skip" style="visibility:hidden">Pular ›</button></div>`;
  $('#spk').onclick = () => { stopListen(); speak(w.en, 'en'); $('#pic').classList.remove('bounce'); void $('#pic').offsetWidth; $('#pic').classList.add('bounce'); };
  const ptw = cap(w.pt) + '!';
  lumi.setMood('idle');
  if (!(await say(bub, [[ptw + ' ' + T.pt.inEn, 'pt'], [w.en, 'en']], `${esc(ptw)} Em inglês é <span class="en">${esc(w.en)}</span>!`))) return;
  $('#pic').classList.add('bounce');
  await wait(250); if (!alive(ls)) return;
  // vez da criança
  let tries = 0, last = '', silent = 0;
  while (alive(ls)) {
    const [line, txt] = tries === 0 ? [T.pt.yourTurn, 'Agora você! Fala:'] : last === 'silent' ? [T.pt.louder, 'Não ouvi! Fala mais alto:'] : [T.pt.again, 'Escuta de novo:'];
    if (!(await say(bub, [[line, 'pt'], [w.en, 'en']], `${txt} <span class="en">${esc(w.en)}</span>`))) return;
    const r = await childTurn(ls, w);
    if (!alive(ls) || r === 'gone') return;
    last = r; if (r === 'silent') silent++;
    if (r === 'skip') { lumi.setMood('idle'); return; }
    if (r === 'ok') {
      lumi.celebrate(); addStar($('#mic'));
      $('#tlbl').innerHTML = '🎉 Isso!';
      await say(bub, [[rnd(T.en.praise), 'en'], [rnd(T.pt.praise), 'pt']]);
      lumi.setMood('idle'); await wait(300); return;
    }
    tries++; ls.misses++;
    if (tries >= 2) {
      // duas palavras seguidas sem ouvir nada: usa o botão "Eu falei!"
      if (silent >= 2) { ls.silentWords = (ls.silentWords || 0) + 1; if (ls.silentWords >= 2) micBroken = true; } else ls.silentWords = 0;
      lumi.hop(); addStar(null);
      await say(bub, [[T.pt.goodTry, 'pt'], [w.en, 'en']], `Boa tentativa! <span class="en">${esc(w.en)}</span> 👍`);
      lumi.setMood('idle'); await wait(300); return;
    }
    lumi.encourage(); await wait(500); lumi.setMood('idle');
  }
}
// microfone automático; se não houver microfone, botão "Eu falei!"
function childTurn(ls, w) {
  return new Promise(async (resolve) => {
    const mic = $('#mic'), lbl = $('#tlbl'), skip = $('#skip');
    if (!mic) return resolve('gone');
    let settled = false; const done = (v) => { if (settled) return; settled = true; mic.onclick = null; skip.onclick = null; resolve(v); };
    skip.style.visibility = 'visible';
    skip.onclick = () => { stopListen(); done('skip'); };
    if (micBroken) {
      mic.className = 'mic'; mic.textContent = '✅';
      lbl.innerHTML = `Fale <span class="en">${esc(w.en)}</span> e toque aqui!`;
      lumi.setMood('listen');
      mic.onclick = () => { lumi.setMood('idle'); done('ok'); };
      return;
    }
    const attempt = async () => {
      mic.className = 'mic listen'; mic.textContent = '🎤';
      lbl.innerHTML = `Sua vez! Fale: <span class="en">${esc(w.en)}</span>`;
      lumi.setMood('listen');
      const r = await listen(w.en);
      if (settled || !alive(ls)) return done('gone');
      mic.className = 'mic idle'; lumi.setMood('idle');
      if (r.broken) { mic.className = 'mic'; mic.textContent = '✅'; lbl.innerHTML = `Fale <span class="en">${esc(w.en)}</span> e toque aqui!`; mic.onclick = () => done('ok'); return; }
      if (r.ok) return done('ok');
      if (!r.heardAny) { lbl.innerHTML = '🤔'; return done('silent'); }
      lbl.innerHTML = `Eu ouvi: “${esc(r.heard)}”`;
      done('miss');
    };
    attempt();
  });
}
// 3) jogo: "Cadê... dog?" com 3 figuras
async function quizIntro(ls) {
  $('#lbody').innerHTML = '<div class="qtitle" style="margin-top:30px">🎮 Hora do jogo!</div>';
  lumi.hop();
  await say($('#lesson-bubble'), [[T.pt.quiz, 'pt']]);
}
async function quizWord(ls, w) {
  const B = $('#lbody'), bub = $('#lesson-bubble');
  const opts = shuffle([w, ...shuffle(ls.u.words.filter((x) => x.en !== w.en)).slice(0, 2)]);
  B.innerHTML = `<div class="qtitle">Cadê… <span class="en">${esc(w.en)}</span>? <button class="spk" id="qspk" style="display:inline-grid;width:40px;height:40px;font-size:18px;vertical-align:middle">🔊</button></div>
    <div class="tiles">${opts.map((o) => `<button class="tile" data-en="${esc(o.en)}">${picHTML(o)}</button>`).join('')}</div><div class="turn" style="min-height:40px"></div>`;
  $('#qspk').onclick = () => speak(w.en, 'en');
  say(bub, [[T.pt.where, 'pt'], [w.en, 'en']], `Cadê… <span class="en">${esc(w.en)}</span>?`);
  let missed = false;
  await new Promise((resolve) => {
    $$('.tile', B).forEach((b) => b.onclick = async () => {
      if ($('.tile.ok', B) || !alive(ls)) return;
      if (b.dataset.en === w.en) {
        b.classList.add('ok'); $$('.tile', B).forEach((x) => x !== b && x.classList.add('dim'));
        lumi.celebrate(); addStar(b);
        await say(bub, [[w.en, 'en'], [rnd(T.en.praise), 'en']]);
        lumi.setMood('idle'); resolve();
      } else {
        missed = true; ls.misses++;
        b.classList.add('bad'); setTimeout(() => { b.classList.remove('bad'); b.classList.add('dim'); }, 450);
        lumi.encourage();
        await say(bub, [[T.pt.notThis, 'pt'], [w.en, 'en']], `Não é esse! Cadê <span class="en">${esc(w.en)}</span>?`);
        lumi.setMood('idle');
      }
    });
  });
  void missed;
}
$('#btn-quit').addEventListener('click', () => {
  sheet(`<h2>Sair da aula?</h2><p>O Lumi vai sentir sua falta! 🥺</p>
    <div class="row"><button class="big sm blue" data-close>Continuar</button><button class="big sm" style="background:linear-gradient(180deg,#ff8aa0,#ff4f6a);box-shadow:0 6px 0 var(--redD)" id="quitok">Sair</button></div>`);
  $('#quitok').onclick = () => { closeSheet(); go('home'); };
});

/* ---------------- RESULTADO ---------------- */
function finishLesson(ls) {
  const stars = ls.misses <= 1 ? 3 : ls.misses <= 3 ? 2 : 1;
  const before = level();
  const u = ls.u, st = S.units[u.id] || {};
  st.done = true; st.stars = Math.max(st.stars || 0, stars);
  st.seenWords = [...new Set([...(st.seenWords || []), ...ls.words.map((w) => w.en)])];
  S.units[u.id] = st; S.coins += 20; S.xp += 50; touchStreak(); save();
  LS = null; avatarURL = null;
  show('result');
  $('#result-coins').textContent = ls.coins + 20; $('#result-xp').textContent = 50;
  $$('#result-stars span').forEach((s, i) => { s.classList.remove('on'); setTimeout(() => s.classList.toggle('on', i < stars), 500 + i * 380); });
  confetti(70); lumi.celebrate(); setTimeout(() => current === 'result' && lumi.celebrate(), 1400);
  const up = level() > before;
  say(null, up ? [[T.pt.levelUp, 'pt'], [T.en.amazing, 'en']] : [[T.pt.done, 'pt'], [T.en.amazing, 'en']]);
}
$('#btn-result').addEventListener('click', () => go('home'));
function confetti(n) {
  const app = $('#app'), cols = ['#ffc928', '#2f86ff', '#ff5d73', '#34c96b', '#9a63ff', '#ff9ecf'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%'; c.style.background = rnd(cols);
    c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'; c.style.animationDelay = Math.random() * 0.6 + 's';
    app.appendChild(c); setTimeout(() => c.remove(), 4200);
  }
}

/* ---------------- DESCANSO ---------------- */
function renderRest() {
  const b = $('#btn-sleep');
  b.textContent = S.sleeping ? '☀️ Acordar o Lumi' : '🌙 Colocar para dormir';
  b.className = S.sleeping ? 'big blue' : 'big yellow';
  $('#rest-hint').textContent = S.sleeping ? (S.energy >= 100 ? 'Energia cheia! Pode acordar o Lumi.' : 'Shhh… o Lumi está recuperando energia.') : 'Dormindo, o Lumi recupera energia rapidinho.';
  $('#zzz').classList.toggle('on', S.sleeping);
  bind();
}
function enterRest() {
  tickSleep(); lumi.setMood(S.sleeping ? 'sleep' : 'idle'); renderRest();
  setTimeout(() => {
    if (current !== 'rest' || S.sleeping) return;
    say($('#rest-bubble'), S.energy < 50 ? [[T.pt.sleepy, 'pt']] : [[T.pt.restHint, 'pt']]);
  }, 350);
}
$('#btn-sleep').addEventListener('click', async () => {
  audioCtx();
  if (!S.sleeping) {
    S.sleeping = true; S.sleepAt = Date.now(); save(); renderRest();
    const ok = await say($('#rest-bubble'), [[T.pt.goodnight, 'pt'], [T.en.goodnight, 'en']]);
    if (ok && S.sleeping) { lumi.setMood('sleep'); $('#rest-bubble').textContent = ''; }
  } else {
    wake(); lumi.setMood('idle'); lumi.hop(); renderRest();
    say($('#rest-bubble'), [[T.pt.goodmorning, 'pt'], [T.en.goodmorning, 'en']]);
  }
});

/* ---------------- LANCHE ---------------- */
function enterSnack() {
  tickSleep(); wake(); lumi.setMood('idle');
  $('#foods').innerHTML = D.foods.map((f) => `<button class="food" data-id="${f.id}"><span class="em">${f.img}</span><b>${f.en}</b><span class="pr"><span>🪙${f.price}</span><span style="color:var(--greenD)">⚡+${f.energy}</span></span></button>`).join('');
  setTimeout(() => current === 'snack' && say($('#snack-bubble'), [[T.pt.hungry, 'pt'], [T.en.hungry, 'en']]), 350);
}
$('#foods').addEventListener('click', async (e) => {
  const b = e.target.closest('.food'); if (!b) return;
  audioCtx();
  const f = D.foods.find((x) => x.id === b.dataset.id);
  if (S.energy >= 100) { say($('#snack-bubble'), T.pt.full); return; }
  if (S.coins < f.price) { lumi.encourage(); say($('#snack-bubble'), T.pt.noCoins); return; }
  S.coins -= f.price; save();
  const from = b.querySelector('.em').getBoundingClientRect(), to = stage.project(lumi.p.mouth);
  const fly = document.createElement('div'); fly.className = 'flyfood'; fly.textContent = f.img;
  fly.style.left = from.left + 'px'; fly.style.top = from.top + 'px'; document.body.appendChild(fly);
  lumi.setMood('listen');
  requestAnimationFrame(() => requestAnimationFrame(() => { fly.style.transform = `translate(${to.x - from.left - 28}px, ${to.y - from.top - 30}px) scale(.35)`; fly.style.opacity = '0'; }));
  setTimeout(() => fly.remove(), 950);
  await wait(650);
  lumi.eat(2.2); S.energy = Math.min(100, S.energy + f.energy); save();
  await say($('#snack-bubble'), [[T.en.yummy, 'en'], [f.en + '!', 'en'], [T.pt.yummy, 'pt']]);
});

/* ---------------- ROUPAS ---------------- */
let slot = 'head', preview = null;
const thumbs = {};
function thumb(slotName, id) { const k = slotName + ':' + id; if (!(k in thumbs)) thumbs[k] = stage.accessorySnapshot(slotName, id, 140); return thumbs[k]; }
function enterShop() {
  tickSleep(); wake(); preview = null; lumi.setOutfit(S.outfit); lumi.setMood('idle');
  renderShop();
  setTimeout(() => current === 'shop' && say($('#shop-bubble'), T.pt.pickOutfit), 350);
}
function renderShop() {
  $$('#shop-tabs .tab').forEach((t) => t.classList.toggle('on', t.dataset.slot === slot));
  $('#shop-items').innerHTML = D.shop[slot].map((it) => {
    const own = S.owned[slot + ':' + it.id], wear = S.outfit[slot] === it.id;
    const tag = wear ? '<span class="tag wearing">Usando</span>' : own ? '<span class="tag own">Usar</span>' : `<span class="tag">🪙${it.price}</span>`;
    const img = it.id === 'none' ? '<span class="none">🚫</span>' : `<img src="${thumb(slot, it.id)}" alt="${esc(it.pt)}">`;
    return `<button class="item ${preview === it.id ? 'sel' : ''} ${wear ? 'wear' : ''}" data-id="${it.id}">${img}${tag}</button>`;
  }).join('');
}
$('#shop-tabs').addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (!t) return; slot = t.dataset.slot; preview = null; lumi.setOutfit(S.outfit); renderShop(); });
$('#shop-items').addEventListener('click', (e) => {
  const b = e.target.closest('.item'); if (!b) return;
  audioCtx();
  const it = D.shop[slot].find((x) => x.id === b.dataset.id), key = slot + ':' + it.id;
  if (S.owned[key]) {
    S.outfit[slot] = it.id; save(); lumi.setOutfit(S.outfit); preview = null; renderShop(); lumi.hop(); avatarURL = null;
    if (it.en) say($('#shop-bubble'), [[it.en + '!', 'en'], [T.pt.pretty, 'pt']]); else say($('#shop-bubble'), T.pt.pretty);
    return;
  }
  if (preview !== it.id) {
    preview = it.id; lumi.setOutfit(Object.assign({}, S.outfit, { [slot]: it.id })); renderShop(); lumi.hop();
    say($('#shop-bubble'), [[it.en + '!', 'en'], [T.pt.tapBuy, 'pt']], `<span class="en">${esc(it.en)}!</span> ${esc(it.pt)} · 🪙${it.price}<br>Toca de novo para comprar.`);
    return;
  }
  if (S.coins < it.price) { lumi.encourage(); say($('#shop-bubble'), T.pt.noCoins); return; }
  S.coins -= it.price; S.owned[key] = 1; S.outfit[slot] = it.id; save(); lumi.setOutfit(S.outfit); preview = null; renderShop(); avatarURL = null;
  lumi.celebrate(); confetti(30);
  say($('#shop-bubble'), [[T.pt.thanks, 'pt'], [it.en + '!', 'en']]);
});

/* ---------------- modais ---------------- */
function sheet(html) { $('#sheet').innerHTML = html; $('#modal').classList.add('on'); }
function closeSheet() { $('#modal').classList.remove('on'); }
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeSheet(); });
function openTired() {
  if (current !== 'home') go('home');
  lumi.setMood('sad'); say($('#home-bubble'), T.pt.tired);
  sheet(`<h2>O Lumi está cansado 😴</h2><p>Cada aula usa ⚡10 de energia. Coloque o Lumi para dormir ou dê um lanchinho.</p>
    <div class="row"><button class="big sm yellow" id="t-sleep">🌙 Dormir</button><button class="big sm" id="t-snack">🍎 Lanche</button></div>`);
  $('#t-sleep').onclick = () => { closeSheet(); go('rest'); };
  $('#t-snack').onclick = () => { closeSheet(); go('snack'); };
}

/* ---------------- início ---------------- */
bind();
enterSplash();
setTimeout(() => $('#loading').classList.add('off'), 250);
window.__lumi = { S, stage, go, startLesson, get LS() { return LS; }, setMicBroken: (v) => { micBroken = v; } };
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
