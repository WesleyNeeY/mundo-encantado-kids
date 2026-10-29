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
const fresh = () => ({ name: '', coins: 120, energy: 80, xp: 0, streak: 0, lastDay: '', giftDay: '', units: {}, owned: { 'head:none': 1, 'face:none': 1, 'neck:none': 1 }, outfit: {}, sleeping: false, sleepAt: 0, seen: {} });
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
// guarda-roupa e ovo: completa estados antigos
for (const k of Object.keys(D.shop)) { if (!S.outfit[k]) S.outfit[k] = 'none'; S.owned[k + ':none'] = 1; }
const doneCount = () => D.units.filter((u) => S.units[u.id] && S.units[u.id].done).length;
const growIdx = (n = doneCount()) => { let i = 0; D.grow.forEach((g, k) => { if (n >= g.min) i = k; }); return i; };
if (S.hatched === undefined) S.hatched = doneCount() > 0;
S.awards = S.awards || {}; S.chests = S.chests || [];
const LEG = D.legendary.flatMap((c) => c.items.map((it) => Object.assign({ col: c }, it)));
const legOwned = (it) => !!S.owned[it.slot + ':' + it.id];
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} bind(); };
const level = () => Math.floor(S.xp / 300) + 1;
function bind() {
  $$('[data-bind]').forEach((el) => { const k = el.dataset.bind; el.textContent = k === 'level' ? level() : k === 'xpin' ? S.xp % 300 : Math.round(S[k] ?? 0); });
  $$('[data-bind-w]').forEach((el) => { const k = el.dataset.bindW; el.style.width = (k === 'xp' ? (S.xp % 300) / 3 : Math.min(100, S[k])) + '%'; });
  const n = doneCount(), gi = growIdx(n), g = D.grow[gi], nx = D.grow[gi + 1];
  const ic = $('#grow-ic'); if (ic) ic.textContent = S.hatched ? g.icon : '🚀';
  const hn = $('#home-name'); if (hn) hn.textContent = !S.hatched ? 'Vai chegar!' : 'Lumi ' + g.name;
  const gb = $('#grow-bar'); if (gb) gb.style.width = (!S.hatched ? 0 : nx ? ((n - g.min) / (nx.min - g.min)) * 100 : 100) + '%';
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1900); }

/* ---------------- palco 3D ---------------- */
let stage;
try { stage = new Stage(); } catch (e) { stage = null; }
if (!stage) { $('#loading').innerHTML = '<div class="nogl">Seu aparelho não conseguiu abrir o 3D. Tente atualizar o navegador.</div>'; throw new Error('no webgl'); }
const lumi = stage.lumi;
lumi.setOutfit(S.outfit);
lumi.setGrowth(growIdx(), true);
setTimeout(() => updateFx(), 0);
if (!S.hatched) stage.setEgg(true);
const PRESET = {
  splash: { fit: [0.2, 0.7], scene: 'room', above: '.splashui' },
  home: { fit: [0.2, 0.62], x: 0.55, scene: 'room', above: '.hcards' },
  lesson: { fit: [0.075, 0.52], x: 0.6, scene: 'room', above: '.lbody' },
  result: { fit: [0.26, 0.74], scene: 'room', above: '.rbox' },
  rest: { fit: [0.18, 0.6], night: true, tilt: 4, above: '.pbottom' },
  snack: { fit: [0.15, 0.55], scene: 'room', above: '.pbottom' },
  shop: { fit: [0.14, 0.5], scene: 'room', above: '.spanel' },
  talk: { fit: [0.15, 0.6], scene: 'room', above: '.tpanel' },
};
// o Lumi ocupa só o espaço livre acima dos cards (vale para qualquer altura de tela)
function presetFor(name) {
  const P = Object.assign({}, PRESET[name] || {}), sc = $('#s-' + name);
  if (!sc || !P.fit) return P;
  const H = sc.clientHeight || innerHeight, top = sc.getBoundingClientRect().top, fr = (el) => (el.getBoundingClientRect().top - top) / H;
  const hdr = sc.querySelector('.ltop, .ptop'); let a = P.fit[0];
  if (hdr) a = Math.max(a, (hdr.getBoundingClientRect().bottom - top) / H + 0.01);
  let b = P.fit[1];
  if (P.above) { const el = sc.querySelector(P.above); if (el && el.offsetHeight) b = fr(el) - 0.012; }
  if (P.peek) { const el = sc.querySelector(P.peek[0]); if (el) b = fr(el) + P.peek[1]; a = P.fit[0]; }
  if (b - a < 0.25) a = Math.max(0.04, b - 0.25);
  P.fit = [a, b]; return P;
}
// cenários pintados e barra de baixo
addEventListener('resize', () => { if (current) { const host = $('#s-' + current + ' [data-host]'); if (host) stage.mount(host, presetFor(current)); } });
$$('[data-scene]').forEach((el) => { el.style.backgroundImage = window.LUMI_SCENES.room(el.dataset.scene); });
$$('[data-nav]').forEach((n) => { n.innerHTML = [['home', '🏠', 'Início'], ['rest', '🌙', 'Descanso'], ['snack', '🍎', 'Lanche'], ['shop', '🎩', 'Acessórios']].map(([g, i, l]) => `<button data-go="${g}"><span>${i}</span>${l}</button>`).join(''); });

/* ---------------- voz (áudios gravados com voz de criança) ---------------- */
let AUDIO = {}, actx = null, analyser = null, speakToken = 0, curSrc = null;
const bufCache = {};
const audioReady = fetch('audio/index.json').then((r) => r.json()).then((j) => { AUDIO = j; }).catch(() => {});
// iPhone (Safari 17+): volta o áudio para o alto-falante depois do microfone
function setSession(t) { try { if (navigator.audioSession) navigator.audioSession.type = t; } catch (e) {} }
function audioCtx() {
  if (!actx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    setSession('playback');
    actx = new C(); analyser = actx.createAnalyser(); analyser.fftSize = 512;
    // reforço de volume com limitador (o celular abaixa o som depois de usar o microfone)
    const boost = actx.createGain(); boost.gain.value = 1.8;
    const lim = actx.createDynamicsCompressor(); lim.threshold.value = -14; lim.knee.value = 6; lim.ratio.value = 8; lim.attack.value = 0.003; lim.release.value = 0.2;
    analyser.connect(boost); boost.connect(lim); lim.connect(actx.destination);
  }
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
// iPhone com o app aberto pelo ícone: a Apple bloqueia o reconhecimento de voz,
// então o Lumi escuta direto pelo microfone (percebe quando a criança fala)
const IOS_APP = navigator.standalone === true || (/iPhone|iPad|iPod/.test(navigator.userAgent) && matchMedia('(display-mode: standalone)').matches);
const CAN_REC = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
let srBroken = !SR || IOS_APP, vadBroken = !CAN_REC;
let micBroken = srBroken && vadBroken;
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
// escuta pelo microfone: detecta voz pela energia do som (sem conferir a palavra)
let vadStop = null;
function listenVAD() {
  return new Promise(async (resolve) => {
    const ctx = audioCtx(); let stream;
    try { setSession('play-and-record'); stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { vadBroken = true; micBroken = srBroken && vadBroken; setSession('playback'); return resolve({ broken: micBroken, error: 'vad' }); }
    if (!ctx) { stream.getTracks().forEach((t) => t.stop()); vadBroken = true; micBroken = srBroken; return resolve({ broken: micBroken }); }
    const src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser(); an.fftSize = 1024; src.connect(an);
    const buf = new Float32Array(an.fftSize), mic = $('#mic'), t0 = performance.now();
    let floor = 0.006, voiced = 0, lastVoice = 0, done = false, prev = t0;
    const fin = (res) => {
      if (done) return; done = true; vadStop = null; clearInterval(iv);
      try { src.disconnect(); } catch (e) {} stream.getTracks().forEach((t) => t.stop());
      if (mic) mic.style.removeProperty('--lv');
      setSession('playback'); setTimeout(() => { if (actx && actx.state !== 'running') actx.resume(); resolve(res); }, 350);
    };
    vadStop = () => fin({ ok: false, heardAny: false, aborted: true });
    let iv = 0;
    const step = () => {
      const now = performance.now();
      if (done) return;
      an.getFloatTimeDomainData(buf); let e = 0; for (let i = 0; i < buf.length; i++) e += buf[i] * buf[i];
      const rms = Math.sqrt(e / buf.length), dt = Math.min(120, now - prev); prev = now;
      // ruído do ambiente: desce rápido no silêncio e sobe devagar (a voz da criança não vira "ruído")
      floor = rms < floor ? floor * 0.7 + rms * 0.3 : Math.min(0.05, floor + (rms - floor) * 0.003);
      const thr = Math.max(0.016, floor * 3);
      if (mic) mic.style.setProperty('--lv', Math.min(1, rms / (thr * 2.2)).toFixed(2));
      if (rms > thr && now - t0 > 250) { voiced += dt; lastVoice = now; }
      if (voiced > 260 && now - lastVoice > 650) return fin({ ok: true, score: 1, heard: '', heardAny: true, vad: true });
      if (now - t0 > 7000) return fin(voiced > 260 ? { ok: true, score: 1, heard: '', heardAny: true, vad: true } : { ok: false, heardAny: voiced > 80, heard: '' });
    };
    iv = setInterval(step, 40); // mede o som 25x por segundo, independente do desenho da tela
  });
}
function listen(target) {
  if (srBroken) return vadBroken ? Promise.resolve({ broken: true }) : listenVAD();
  return new Promise((resolve) => {
    if (micBroken) return resolve({ broken: true });
    const r = new SR(); curRec = r;
    r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
    let best = { score: 0, text: '' }, done = false, heardAny = false;
    const fin = (extra) => {
      if (done) return; done = true; curRec = null; try { r.abort(); } catch (e) {}
      const res = Object.assign({ ok: best.score >= 0.55, score: best.score, heard: best.text, heardAny }, extra || {});
      // devolve o som ao alto-falante e espera o Android liberar o áudio antes do Lumi falar
      setSession('playback'); setTimeout(() => { if (actx && actx.state !== 'running') actx.resume(); resolve(res); }, 550);
    };
    r.onresult = (ev) => {
      heardAny = true;
      for (const res of ev.results) for (const alt of res) { const s = match(alt.transcript, target); if (s > best.score) best = { score: s, text: alt.transcript }; }
      if (best.score >= 0.55) fin();
      else if (ev.results[ev.results.length - 1].isFinal) fin();
    };
    r.onerror = (e) => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported'].includes(e.error)) {
        // reconhecimento indisponível: passa a escutar direto pelo microfone
        srBroken = true; micBroken = srBroken && vadBroken;
        if (!vadBroken && !done) { done = true; curRec = null; try { r.abort(); } catch (x) {} return listenVAD().then(resolve); }
      }
      fin({ error: e.error, broken: micBroken });
    };
    r.onend = () => fin();
    setTimeout(() => fin(), 6500);
    setSession('play-and-record');
    try { r.start(); } catch (e) { srBroken = true; micBroken = vadBroken; if (!vadBroken) { done = true; curRec = null; return listenVAD().then(resolve); } fin({ broken: true }); }
  });
}
function stopListen() { if (curRec) { try { curRec.abort(); } catch (e) {} } if (vadStop) vadStop(); }

/* ---------------- cenários CSS ---------------- */
$$('[data-clouds]').forEach((d) => {
  d.innerHTML = [[120, 36, -30, 16, 9], [90, 28, 72, 9, 7], [70, 22, 40, 25, 11], [100, 30, 85, 33, 8]]
    .map(([w, h, x, y, s], i) => `<div class="cloud" style="width:${w}px;height:${h}px;left:${x}%;top:${y}%;animation:drift ${s}s ease-in-out infinite alternate${i % 2 ? '-reverse' : ''}"></div>`).join('');
});
$$('[data-stars]').forEach((d) => { let s = ''; for (let i = 0; i < 40; i++) s += `<i class="twinkle" style="left:${Math.random() * 100}%;top:${Math.random() * 55}%;animation-delay:${Math.random() * 2.4}s;transform:scale(${0.5 + Math.random()})"></i>`; d.innerHTML = s; });

/* ---------------- navegação ---------------- */
let current = '';
function show(name) {
  stopTalk(); stopListen(); if (name !== 'splash') stopParrot();
  if (current === 'shop') { preview = null; lumi.setOutfit(S.outfit); }
  $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-' + name));
  $$('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.go === name));
  current = name;
  if (stage.egg.visible !== !S.hatched) stage.setEgg(!S.hatched);
  const host = $('#s-' + name + ' [data-host]');
  if (host) stage.mount(host, presetFor(name));
}
function go(name) {
  if (!S.hatched && ['map', 'snack', 'rest', 'shop', 'talk'].includes(name)) { toast('🚀 Primeiro abra a cápsula do Lumi!'); speak(T.pt.eggTap, 'pt'); return; }
  if (name !== 'lesson') LS = null;
  show(name);
  ({ home: enterHome, map: enterMap, rest: enterRest, snack: enterSnack, shop: enterShop, talk: enterTalk }[name] || (() => {}))();
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
  setTimeout(startParrot, 1600); // Lumi papagaio: fala que ele repete
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
  $('#home-unit-ic').textContent = u.icon; $('#home-unit-name').textContent = u.name;
  $('#home-unit-meta').textContent = `Fase ${u.num} · ${worldOf(u).name} · +50 XP`;
  $('#btn-gift').classList.toggle('glow', S.giftDay !== today());
  renderChestBtn(); renderMissionBtn();
  lumi.setMood(S.sleeping ? 'sleep' : 'idle');
  bind();
  setTimeout(() => {
    if (current !== 'home') return;
    if (!S.hatched) { say($('#home-bubble'), T.pt.eggTap, 'Toca na cápsula 3 vezes para ela abrir! 🚀'); return; }
    if (S.sleeping) { say($('#home-bubble'), T.pt.sleeping); return; }
    lumi.doWave(1.8);
    const first = !S.seen.home; S.seen.home = 1; save();
    if (S.energy < 10) say($('#home-bubble'), T.pt.tired);
    else if (!first && missionReady()) say($('#home-bubble'), T.pt.missionReady);
    else if (!first && !S.seen.missionHi) { S.seen.missionHi = 1; save(); say($('#home-bubble'), T.pt.missionIntro); }
    else if (first) say($('#home-bubble'), [[T.pt.hello, 'pt'], [T.pt.letsLearn, 'pt']], `Olá, ${esc(S.name)}! Eu sou o Lumi! Vamos aprender inglês?`);
    else say($('#home-bubble'), [[T.en.hello, 'en'], [T.pt.play, 'pt']], `<span class="en">Hello</span>, ${esc(S.name)}! Vamos jogar?`);
  }, 400);
}
$('#btn-play').addEventListener('click', () => { audioCtx(); if (!S.hatched) { toast('🚀 Toque na cápsula para o Lumi chegar!'); say($('#home-bubble'), T.pt.eggTap); stage.tapEgg(Math.min(3, eggTaps)); return; } startLesson(unitIndex()); });
// ovo: 3 toques e o Lumi nasce
let eggTaps = 0, hatching = false;
stage.onEggTap = async () => {
  if (hatching || S.hatched || current !== 'home') return;
  audioCtx(); eggTaps++; stage.tapEgg(Math.min(3, eggTaps));
  if (eggTaps === 2) say($('#home-bubble'), T.pt.eggCrack);
  if (eggTaps < 3) return;
  hatching = true; stopTalk(); $('#home-bubble').textContent = '';
  await stage.hatch();
  S.hatched = true; save(); confetti(70); avatarURL = null;
  await say($('#home-bubble'), [[T.pt.hatched, 'pt'], [T.en.hello, 'en']], `Oi, ${esc(S.name)}! Eu cheguei! Eu sou o Lumi! 🚀`);
  lumi.doWave(2);
  if (current === 'home') await say($('#home-bubble'), T.pt.growHint);
  hatching = false;
};
$('#btn-gift').addEventListener('click', () => {
  audioCtx();
  if (S.giftDay === today()) { say($('#home-bubble'), T.pt.giftDone); return; }
  S.giftDay = today(); S.coins += 30;
  const lucky = Math.random() < 0.15; if (lucky) S.chests.push('raro');
  save(); renderChestBtn();
  $('#btn-gift').classList.remove('glow'); lumi.celebrate(); confetti(30);
  if (lucky) say($('#home-bubble'), [[T.pt.gift, 'pt'], [T.pt.chestWon, 'pt']], 'Surpresa! <b>30 moedas</b> 🪙 e um <b>baú raro</b>! 🎁');
  else say($('#home-bubble'), [[T.pt.gift, 'pt'], [T.en.thanks, 'en']], 'Surpresa! Você ganhou <b>30 moedas</b>! 🪙');
});

/* ---------------- MAPA (6 mundos) ---------------- */
let avatarURL = null;
const worldOf = (u) => D.worlds[u.wi];
const unitById = (id) => D.units.find((x) => x.id === id);
const poolWords = (ids) => { const seen = new Set(); return ids.flatMap((id) => unitById(id).words).filter((w) => !seen.has(w.en) && seen.add(w.en)); };
function enterMap() {
  const wrap = $('#mapwrap'), n = D.units.length, step = 150, BAN = 130;
  const H = n * step + D.worlds.length * BAN + 120;
  wrap.style.height = H + 'px';
  const xs = [0.5, 0.76, 0.5, 0.24];
  const pts = []; let y = H - 70 - BAN;
  D.units.forEach((u, i) => { if (i > 0) y -= step + (u.wi !== D.units[i - 1].wi ? BAN : 0); pts.push({ x: xs[i % 4], y }); });
  let path = `M${pts[0].x * 400},${pts[0].y}`;
  for (let i = 1; i < n; i++) { const a = pts[i - 1], b = pts[i]; const d = (a.y - b.y) / 2; path += ` C${a.x * 400},${a.y - d} ${b.x * 400},${b.y + d} ${b.x * 400},${b.y}`; }
  const cur = unitIndex();
  let html = '';
  // faixas coloridas de cada mundo
  D.worlds.forEach((w, wi) => {
    const idx = D.units.map((u, i) => (u.wi === wi ? i : -1)).filter((i) => i >= 0);
    const bottom = pts[idx[0]].y + step / 2 + BAN, top = wi === D.worlds.length - 1 ? 0 : pts[idx[idx.length - 1]].y - step / 2;
    const done = idx.filter((i) => S.units[D.units[i].id] && S.units[D.units[i].id].done).length;
    html += `<div class="band" style="top:${top}px;height:${bottom - top}px;background:linear-gradient(180deg,${w.color}10,${w.color}38)"></div>`;
    html += `<div class="wban" style="top:${bottom - BAN / 2 - 6}px;--wc:${w.color}"><span class="wi">${w.icon}</span><div><b>Mundo ${wi + 1} · ${w.name}</b><small>${done}/${idx.length} fases</small></div></div>`;
  });
  void path;
  D.units.forEach((u, i) => {
    const st = S.units[u.id] || {};
    const cls = (st.done ? 'done' : i === cur ? 'cur' : i > cur ? 'lock' : '') + (u.type === 'game' ? ' game' : '');
    const stars = st.stars ? '⭐'.repeat(st.stars) + '<span style="opacity:.3">' + '⭐'.repeat(3 - st.stars) + '</span>' : '';
    html += `<button class="node ${cls}" data-u="${i}" style="left:${pts[i].x * 100}%;top:${pts[i].y}px"><div class="disc">${i > cur ? '<span class="lk">🔒</span>' : `<span class="n">${u.num}</span>`}<span class="ico">${u.icon}</span></div><label>${u.name}</label><div class="st">${stars}</div></button>`;
  });
  if (!avatarURL) avatarURL = stage.snapshot(220, 220);
  html += `<img class="mapav" src="${avatarURL}" alt="" style="left:calc(${pts[cur].x * 100}% + ${pts[cur].x > 0.5 ? -88 : 88}px);top:${pts[cur].y + 40}px">`;
  wrap.innerHTML = html;
  wrap.style.backgroundImage = window.LUMI_SCENES.map(H, pts.map((q) => ({ x: q.x, y: q.y })));
  const sc = $('#map-scroll');
  requestAnimationFrame(() => { sc.scrollTop = Math.max(0, pts[cur].y - sc.clientHeight / 2); });
}
$('#mapwrap').addEventListener('click', (e) => {
  const b = e.target.closest('.node'); if (!b) return;
  const i = +b.dataset.u;
  if (i > unitIndex()) { toast('🔒 Termine a fase anterior para abrir'); speak(T.pt.locked, 'pt'); return; }
  startLesson(i);
});

/* ---------------- FASE: aula (escuta → repete → joga) ou mini-jogo ---------------- */
let LS = null;
const STARS = 8;
function picHTML(w) { return w.txt ? `<span class="num">${w.txt}</span>` : w.img; }
function setStars() { $('#lbar').style.width = (LS.stars / STARS) * 100 + '%'; $('#lcount').textContent = LS.stars + '/' + STARS; $('#ltitle').textContent = (LS.u.type === 'game' ? 'Fase ' : 'Aula ') + LS.u.num; }
function addStar(el) {
  LS.stars = Math.min(STARS, LS.stars + 1); setStars();
  if (el) coinFly(el, '+2 🪙'); S.coins += 2; LS.coins += 2; save();
}
function coinFly(el, txt) {
  const r = el.getBoundingClientRect(), app = $('#app').getBoundingClientRect();
  const f = document.createElement('div'); f.className = 'coinfly'; f.textContent = txt;
  f.style.left = r.left - app.left + r.width / 2 - 30 + 'px'; f.style.top = r.top - app.top + 'px';
  $('#app').appendChild(f); setTimeout(() => f.remove(), 1000);
}
const give = (en) => 'Give me the ' + en.toLowerCase() + '!';
function startLesson(ui) {
  tickSleep(); wake();
  if (S.energy < 10) { openTired(); return; }
  const u = D.units[ui], world = worldOf(u);
  let words = [], items = [];
  if (u.type === 'lesson') {
    const seenW = (S.units[u.id] && S.units[u.id].seenWords) || [];
    let pool = shuffle(u.words.filter((w) => !seenW.includes(w.en)));
    if (pool.length < 4) pool = pool.concat(shuffle(u.words.filter((w) => seenW.includes(w.en))));
    words = pool.slice(0, 4);
    words.forEach((w) => preload([[w.en, 'en'], [cap(w.pt) + '! ' + T.pt.inEn, 'pt']]));
    preload([[T.pt.yourTurn, 'pt'], [T.pt.where, 'pt'], [T.pt.again, 'pt']]);
  } else if (u.game === 'simon') {
    items = shuffle(u.pool.flatMap((k) => D.simon[k])).slice(0, 8);
    items.forEach((c) => preload([[c.en, 'en']])); preload([[T.pt.simonSays, 'pt'], [T.pt.doAndSay, 'pt']]);
  } else {
    items = poolWords(u.pool);
    const n = u.game === 'memory' ? 4 : 8;
    words = shuffle(items).slice(0, n);
    words.forEach((w) => preload([[u.game === 'feed' ? give(w.en) : w.en, 'en']]));
  }
  S.energy = Math.max(0, S.energy - 10); save();
  const welcome = world.units[0] === u && !S.seen['w-' + world.id];
  LS = { id: Symbol(), ui, u, world, words, items, stars: 0, coins: 0, misses: 0, welcome };
  lumi.action = null;
  show('lesson'); lumi.setMood('idle'); setStars();
  runLesson(LS);
}
const alive = (ls) => LS === ls && current === 'lesson';
async function runLesson(ls) {
  await wait(500);
  if (ls.welcome) {
    S.seen['w-' + ls.world.id] = 1; save();
    $('#lbody').innerHTML = `<div class="wcard in" style="--wc:${ls.world.color}"><div class="wic">${ls.world.icon}</div><b>Mundo ${ls.u.wi + 1}</b><h2>${ls.world.name}</h2></div>`;
    lumi.celebrate(); confetti(40);
    await say($('#lesson-bubble'), [[ls.world.welcome, 'pt']]);
    if (!alive(ls)) return; await wait(300);
  }
  const g = ls.u.type === 'lesson' ? null : ls.u.game;
  if (!g) {
    for (const w of ls.words) { if (!alive(ls)) return; await teachWord(ls, w); }
    if (!alive(ls)) return;
    await quizIntro(ls);
    let qi = 0; for (const w of shuffle(ls.words)) { if (!alive(ls)) return; await (qi++ % 2 ? quizWord2(ls, w) : quizWord(ls, w)); }
  } else if (g === 'simon') await playSimon(ls);
  else if (g === 'balloon') await playBalloon(ls);
  else if (g === 'feed') await playFeed(ls);
  else if (g === 'memory') await playMemory(ls);
  if (alive(ls)) finishLesson(ls);
}
function turnHTML() { return `<div class="turn" id="turn"><div class="turnlbl" id="tlbl"></div><button class="mic idle" id="mic" aria-label="Falar">🎤</button><button class="skip" id="skip" style="visibility:hidden">Pular ›</button></div>`; }
// 1) apresenta a palavra e 2) a criança repete
async function teachWord(ls, w) {
  const B = $('#lbody'), bub = $('#lesson-bubble');
  B.innerHTML = `<div class="card in"><button class="spk" id="spk" aria-label="Ouvir">🔊</button><div class="pic" id="pic">${picHTML(w)}</div><div class="wen">${esc(w.en)}</div><div class="wpt">${esc(w.pt)}</div></div>${turnHTML()}`;
  $('#spk').onclick = () => { stopListen(); speak(w.en, 'en'); $('#pic').classList.remove('bounce'); void $('#pic').offsetWidth; $('#pic').classList.add('bounce'); };
  const ptw = cap(w.pt) + '!';
  lumi.setMood('idle');
  if (!(await say(bub, [[ptw + ' ' + T.pt.inEn, 'pt'], [w.en, 'en']], `${esc(ptw)} Em inglês é <span class="en">${esc(w.en)}</span>!`))) return;
  $('#pic').classList.add('bounce');
  await wait(250); if (!alive(ls)) return;
  await turnLoop(ls, w, T.pt.yourTurn, 'Agora você! Fala:');
}
// vez da criança: até 2 tentativas
async function turnLoop(ls, w, firstLine, firstTxt, onRetry) {
  const bub = $('#lesson-bubble');
  let tries = 0, last = '', silent = 0;
  while (alive(ls)) {
    const [line, txt] = tries === 0 ? [firstLine, firstTxt] : last === 'silent' ? [T.pt.louder, 'Não ouvi! Fala mais alto:'] : [T.pt.again, 'Escuta de novo:'];
    if (tries > 0 && onRetry) onRetry();
    if (!(await say(bub, [[line, 'pt'], [w.en, 'en']], `${txt} <span class="en">${esc(w.en)}</span>`))) return;
    const r = await childTurn(ls, w);
    if (!alive(ls) || r === 'gone') return;
    last = r; if (r === 'silent') silent++;
    if (r === 'skip') { lumi.setMood('idle'); return; }
    if (r === 'ok') {
      lumi.celebrate(); addStar($('#mic')); missionAdd('palavras');
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
      const r = await listen(w.key || w.en);
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
// 3) jogo da aula: "Cadê... dog?" com 3 figuras
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
  await new Promise((resolve) => {
    $$('.tile', B).forEach((b) => b.onclick = async () => {
      if ($('.tile.ok', B) || !alive(ls)) return;
      if (b.dataset.en === w.en) {
        b.classList.add('ok'); $$('.tile', B).forEach((x) => x !== b && x.classList.add('dim'));
        lumi.celebrate(); addStar(b);
        await say(bub, [[w.en, 'en'], [rnd(T.en.praise), 'en']]);
        lumi.setMood('idle'); resolve();
      } else {
        ls.misses++;
        b.classList.add('bad'); setTimeout(() => { b.classList.remove('bad'); b.classList.add('dim'); }, 450);
        lumi.encourage();
        await say(bub, [[T.pt.notThis, 'pt'], [w.en, 'en']], `Não é esse! Cadê <span class="en">${esc(w.en)}</span>?`);
        lumi.setMood('idle');
      }
    });
    ls.abort = resolve;
  });
}

// "Como se diz ... em inglês?" com 3 palavras (ouve cada uma ao tocar)
async function quizWord2(ls, w) {
  const B = $('#lbody'), bub = $('#lesson-bubble');
  const opts = shuffle([w, ...shuffle(ls.u.words.filter((x) => x.en !== w.en)).slice(0, 2)]);
  B.innerHTML = `<div class="qcard in card"><button class="spk" id="qspk">🔊</button><div class="pic">${picHTML(w)}</div><div class="qtxt">Como se diz “${esc(w.pt)}” em inglês?</div>
    <div class="wopts">${opts.map((o) => `<button class="wopt" data-en="${esc(o.en)}">${esc(o.en)}</button>`).join('')}</div></div>`;
  $('#qspk').onclick = () => speak(w.en, 'en');
  say(bub, [[cap(w.pt) + '! ' + T.pt.inEn, 'pt']], `Como se diz <b>${esc(w.pt)}</b> em inglês?`);
  await new Promise((resolve) => {
    ls.abort = resolve; let busy = false;
    $$('.wopt', B).forEach((b) => b.onclick = async () => {
      if (busy || $('.wopt.ok', B) || !alive(ls)) return;
      busy = true; stopTalk(); await speak(b.dataset.en, 'en'); busy = false;
      if (b.dataset.en === w.en) {
        b.classList.add('ok'); $$('.wopt', B).forEach((x) => x !== b && x.classList.add('dim'));
        lumi.celebrate(); addStar(b);
        await say(bub, [[rnd(T.en.praise), 'en'], [rnd(T.pt.praise), 'pt']]);
        lumi.setMood('idle'); resolve();
      } else {
        ls.misses++; b.classList.add('bad'); setTimeout(() => { b.classList.remove('bad'); b.classList.add('dim'); }, 450);
        lumi.encourage(); await say(bub, [[T.pt.notThis, 'pt']]); lumi.setMood('idle');
      }
    });
  });
}

/* ---------- MINI-JOGO 1: Lumi diz ---------- */
async function playSimon(ls) {
  const bub = $('#lesson-bubble');
  $('#lbody').innerHTML = '<div class="qtitle" style="margin-top:30px">🙌 Lumi diz!</div><p class="ghint">Faça o que o Lumi mandar e fale junto!</p>';
  lumi.act('dance', 2.4);
  await say(bub, [[T.pt.simonIntro, 'pt']]); if (!alive(ls)) return;
  for (const c of ls.items) {
    if (!alive(ls)) return;
    $('#lbody').innerHTML = `<div class="card in simon"><div class="pic" id="pic">${c.img}</div><div class="wen">${esc(c.en)}</div><div class="wpt">${esc(c.pt)}</div></div>${turnHTML()}`;
    lumi.setMood('idle');
    const show = () => lumi.act(c.act, 2.8);
    show();
    if (!(await say(bub, [[T.pt.simonSays, 'pt'], [c.en, 'en']], `Lumi diz: <span class="en">${esc(c.en)}</span>`))) return;
    await wait(600); if (!alive(ls)) return;
    await turnLoop(ls, c, T.pt.doAndSay, 'Agora você! Faz e fala:', show);
  }
}

/* ---------- MINI-JOGO 2: Estoura balão ---------- */
const BCOLS = ['#ff4f6a', '#2f86ff', '#2fc46a', '#ffc928', '#9a55ff', '#ff8a1f', '#ff6fae', '#10b5c9'];
async function playBalloon(ls) {
  const bub = $('#lesson-bubble');
  $('#lbody').innerHTML = '<div class="bplay" id="bplay"><div class="qtitle" style="margin-top:30px">🎈 Estoura balão!</div></div>';
  lumi.hop();
  await say(bub, [[T.pt.balloonIntro, 'pt']]); if (!alive(ls)) return;
  const area = $('#bplay'); area.innerHTML = '<button class="spk bspk" id="bspk">🔊</button>';
  { const sc = $('#s-lesson'); sc.classList.add('bfull');
    const fitArea = () => { const lb = $('#lbody'), hd = $('#s-lesson .ltop'); if (!lb || !$('#bplay')) return; area.style.top = -(lb.getBoundingClientRect().top - (hd ? hd.getBoundingClientRect().bottom : 0)) + 'px'; };
    fitArea(); addEventListener('resize', fitArea); const mo = new MutationObserver(() => { if (!$('#bplay')) { sc.classList.remove('bfull'); removeEventListener('resize', fitArea); mo.disconnect(); } }); mo.observe($('#lbody'), { childList: true }); }
  let target = null;
  $('#bspk').onclick = () => target && speak(target.en, 'en');
  const pool = ls.items;
  for (const w of ls.words) {
    if (!alive(ls)) return;
    target = w;
    const others = shuffle(pool.filter((x) => x.en !== w.en && (x.img || x.txt || x.color) !== (w.img || w.txt || w.color))).slice(0, 3);
    const set = shuffle([w, ...others]);
    const lanes = shuffle([0.13, 0.38, 0.62, 0.87]);
    const AH = area.clientHeight, AW = area.clientWidth;
    const balls = set.map((x, i) => {
      const el = document.createElement('button'); el.className = 'balloon';
      const col = x.color || BCOLS[Math.floor(Math.random() * BCOLS.length)];
      el.style.setProperty('--bc', col); if (x.color === '#ffffff') el.classList.add('white');
      el.innerHTML = x.color ? '' : `<span>${x.txt ? `<b>${x.txt}</b>` : x.img}</span>`;
      el.dataset.en = x.en; area.appendChild(el);
      return { el, x, lane: lanes[i], y: AH * (0.3 + 0.17 * i) + Math.random() * 30, sp: AH / (6 + Math.random() * 2.5), ph: Math.random() * 6 };
    });
    let running = true, last = performance.now();
    const tick = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      for (const b of balls) {
        if (b.popped) continue;
        b.y -= b.sp * dt; if (b.y < -130) b.y = AH + 30;
        b.el.style.transform = `translate(${b.lane * AW - 44 + Math.sin(now / 700 + b.ph) * 10}px, ${b.y}px) rotate(${Math.sin(now / 900 + b.ph) * 6}deg)`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    say(bub, [[T.pt.pop, 'pt'], [w.en, 'en']], `Estoura o balão: <span class="en">${esc(w.en)}</span>!`);
    await new Promise((resolve) => {
      ls.abort = resolve;
      for (const b of balls) b.el.onclick = async () => {
        if (b.popped || !alive(ls) || balls.some((q) => q.win)) return;
        if (b.x.en === w.en) {
          b.popped = b.win = true; b.el.classList.add('pop'); burst(b.el);
          addStar(b.el); lumi.celebrate();
          await say(bub, [[w.en, 'en'], [rnd(T.en.praise), 'en']]);
          resolve();
        } else {
          ls.misses++; b.el.classList.remove('wob'); void b.el.offsetWidth; b.el.classList.add('wob');
          lumi.encourage();
          await say(bub, [[T.pt.notThis, 'pt'], [w.en, 'en']], `Não é esse! Estoura: <span class="en">${esc(w.en)}</span>`);
          lumi.setMood('idle');
        }
      };
    });
    running = false; balls.forEach((b) => setTimeout(() => b.el.remove(), b.win ? 400 : 0));
    lumi.setMood('idle'); await wait(250);
  }
}
function burst(el) {
  const r = el.getBoundingClientRect(), app = $('#app').getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('i'); p.className = 'spark';
    const a = (i / 14) * Math.PI * 2, d = 50 + Math.random() * 40;
    p.style.left = r.left - app.left + r.width / 2 + 'px'; p.style.top = r.top - app.top + r.height / 2.5 + 'px';
    p.style.background = rnd(BCOLS); p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px');
    $('#app').appendChild(p); setTimeout(() => p.remove(), 700);
  }
}

/* ---------- MINI-JOGO 3: Dar comida (arrastar até a boca) ---------- */
async function playFeed(ls) {
  const bub = $('#lesson-bubble');
  $('#lbody').innerHTML = '<div class="qtitle" style="margin-top:30px">🍽️ Hora do lanche!</div>';
  lumi.setMood('idle');
  await say(bub, [[T.pt.feedIntro, 'pt'], [T.pt.feedHint, 'pt']]); if (!alive(ls)) return;
  for (const w of ls.words) {
    if (!alive(ls)) return;
    const opts = shuffle([w, ...shuffle(ls.items.filter((x) => x.en !== w.en)).slice(0, 2)]);
    $('#lbody').innerHTML = `<div class="qtitle"><span class="en">${esc(give(w.en))}</span> <button class="spk" id="qspk" style="display:inline-grid;width:40px;height:40px;font-size:18px;vertical-align:middle">🔊</button></div>
      <p class="ghint">Arraste ou toque na comida certa</p><div class="tray">${opts.map((o) => `<div class="fooditem" data-en="${esc(o.en)}">${o.img}</div>`).join('')}</div>`;
    $('#qspk').onclick = () => speak(give(w.en), 'en');
    lumi.setMood('listen');
    say(bub, [[give(w.en), 'en']]);
    await new Promise((resolve) => {
      ls.abort = resolve; let busy = false;
      $$('.fooditem').forEach((el) => {
        el.onpointerdown = (e) => {
          if (busy || !alive(ls)) return;
          e.preventDefault(); el.setPointerCapture(e.pointerId);
          const r0 = el.getBoundingClientRect(), sx = e.clientX, sy = e.clientY; let moved = 0;
          el.classList.add('drag');
          el.onpointermove = (ev) => { moved = Math.max(moved, Math.hypot(ev.clientX - sx, ev.clientY - sy)); el.style.transform = `translate(${ev.clientX - sx}px, ${ev.clientY - sy}px) scale(1.15)`; };
          el.onpointerup = async (ev) => {
            el.onpointermove = el.onpointerup = null; el.classList.remove('drag');
            const m = stage.project(lumi.p.mouth), r = el.getBoundingClientRect();
            const near = Math.hypot(r.left + r.width / 2 - m.x, r.top + r.height / 2 - m.y) < 140;
            if (!near && moved > 25) { el.style.transform = ''; return; } // soltou longe: volta
            busy = true;
            el.style.transition = 'transform .45s cubic-bezier(.3,-.3,.6,1), opacity .2s .35s';
            el.style.transform = `translate(${m.x - (r0.left + r0.width / 2)}px, ${m.y - (r0.top + r0.height / 2)}px) scale(.35)`;
            await wait(420);
            if (el.dataset.en === w.en) {
              el.style.opacity = '0'; lumi.eat(1.8); addStar(el);
              await say(bub, [[T.en.yummy, 'en'], [w.en + '!', 'en']], `<span class="en">Yummy! ${esc(w.en)}!</span> 😋`);
              resolve();
            } else {
              ls.misses++; lumi.act('no', 1.2);
              el.style.transition = 'transform .4s ease'; el.style.transform = '';
              await say(bub, [[T.en.noThanks, 'en'], [give(w.en), 'en']], `<span class="en">No, thank you! ${esc(give(w.en))}</span>`);
              setTimeout(() => (el.style.transition = ''), 400);
              busy = false; lumi.setMood('listen');
            }
          };
        };
      });
    });
    lumi.setMood('idle'); await wait(300);
  }
}

/* ---------- MINI-JOGO 4: Jogo da memória ---------- */
async function playMemory(ls) {
  const bub = $('#lesson-bubble');
  const cards = shuffle([...ls.words, ...ls.words].map((w, i) => ({ w, i })));
  $('#lbody').innerHTML = `<div class="mgrid">${cards.map((c, k) => `<button class="mcard" data-k="${k}"><span class="back">❓</span><span class="face">${picHTML(c.w)}</span></button>`).join('')}</div><p class="ghint">Vire duas cartas e ache os pares!</p>`;
  lumi.hop();
  await say(bub, [[T.pt.memoryIntro, 'pt']]); if (!alive(ls)) return;
  await new Promise((resolve) => {
    ls.abort = resolve; let open = [], lock = false, found = 0;
    $$('.mcard').forEach((el) => el.onclick = async () => {
      if (lock || el.classList.contains('up') || !alive(ls)) return;
      const c = cards[+el.dataset.k]; el.classList.add('up'); open.push({ el, c });
      speak(c.w.en, 'en');
      if (open.length < 2) return;
      lock = true; const [a, b] = open; open = [];
      await wait(900);
      if (a.c.w.en === b.c.w.en) {
        a.el.classList.add('ok'); b.el.classList.add('ok'); found++;
        addStar(a.el); addStar(b.el); lumi.celebrate();
        await say(bub, [[a.c.w.en, 'en'], [T.en.match, 'en']], `<span class="en">${esc(a.c.w.en)}</span>! Achou um par! 🎉`);
        lumi.setMood('idle');
        if (found === ls.words.length) { await wait(300); resolve(); }
      } else {
        ls.misses += 0.5; a.el.classList.add('no'); b.el.classList.add('no');
        await wait(500); a.el.classList.remove('up', 'no'); b.el.classList.remove('up', 'no');
      }
      lock = false;
    });
  });
}
$('#btn-quit').addEventListener('click', () => {
  sheet(`<h2>Sair da fase?</h2><p>O Lumi vai sentir sua falta! 🥺</p>
    <div class="row"><button class="big sm blue" data-close>Continuar</button><button class="big sm" style="background:linear-gradient(180deg,#ff8aa0,#ff4f6a);box-shadow:0 6px 0 var(--redD)" id="quitok">Sair</button></div>`);
  $('#quitok').onclick = () => { closeSheet(); go('home'); };
});

/* ---------------- RESULTADO ---------------- */
function finishLesson(ls) {
  const stars = ls.misses <= 1 ? 3 : ls.misses <= 3 ? 2 : 1;
  const before = level(), gBefore = growIdx();
  const u = ls.u, st = S.units[u.id] || {};
  st.done = true; st.stars = Math.max(st.stars || 0, stars);
  st.seenWords = [...new Set([...(st.seenWords || []), ...ls.words.map((w) => w.en)])];
  S.units[u.id] = st; S.coins += 20; S.xp += 50; touchStreak(); save();
  LS = null; avatarURL = null; missionAdd('aula');
  show('result');
  $('#result-title').textContent = ls.u.type === 'game' ? 'Fase completa!' : 'Aula completa!';
  $('#result-coins').textContent = ls.coins + 20; $('#result-xp').textContent = 50;
  $$('#result-stars span').forEach((s, i) => { s.classList.remove('on'); setTimeout(() => s.classList.toggle('on', i < stars), 500 + i * 380); });
  confetti(70); lumi.celebrate(); setTimeout(() => current === 'result' && lumi.celebrate(), 1400);
  const up = level() > before, gAfter = growIdx();
  const won = checkAwards(before, gBefore);
  $('#result-chest').innerHTML = won.length ? won.map((t) => `<span class="chip ${t}">🎁 Baú ${D.rarity[t].name.replace(/a$/, 'o')}</span>`).join('') : '';
  if (won.length) setTimeout(() => current === 'result' && say(null, [[T.pt.chestWon, 'pt']]), gAfter > gBefore ? 7500 : 4200);
  if (gAfter > gBefore) setTimeout(async () => {
    if (current !== 'result') return;
    $('#result-title').textContent = 'O Lumi cresceu! 🎉';
    lumi.growTo(gAfter); confetti(90); avatarURL = null; for (const k in thumbs) delete thumbs[k];
    await say(null, [[T.pt.grow[gAfter - 1], 'pt']]);
  }, 3000);
  say(null, up ? [[T.pt.levelUp, 'pt'], [T.en.amazing, 'en']] : [[T.pt.done, 'pt'], [T.en.amazing, 'en']]);
}
$('#btn-result').addEventListener('click', () => { go('home'); if (S.chests.length) setTimeout(openChest, 600); });

/* ---------------- BAÚS E COLEÇÕES LENDÁRIAS ---------------- */
// regras: nível novo = raro; mundo completo = épico; 3 estrelas em todo o mundo = lendário;
// sequência de 3/7/14/30 dias; cada vez que o Lumi cresce; 15% de chance no presente diário
function checkAwards(levelBefore, growBefore) {
  const won = []; const give = (key, tier) => { if (S.awards[key]) return; S.awards[key] = 1; S.chests.push(tier); won.push(tier); };
  for (let l = levelBefore + 1; l <= level(); l++) give('level-' + l, 'raro');
  D.worlds.forEach((w) => {
    const st = w.units.map((u) => S.units[u.id] || {});
    if (st.every((x) => x.done)) give('world-' + w.id, 'epico');
    if (st.every((x) => x.done && x.stars >= 3)) give('stars-' + w.id, 'lendario');
  });
  [[3, 'raro'], [7, 'epico'], [14, 'lendario'], [30, 'lendario']].forEach(([d, t]) => { if (S.streak >= d) give('streak-' + d, t); });
  for (let g = growBefore + 1; g <= growIdx(); g++) give('grow-' + g, ['raro', 'raro', 'epico', 'lendario', 'lendario'][g]);
  save(); renderChestBtn();
  return won;
}
function renderChestBtn() { const b = $('#btn-chest'); if (!b) return; b.style.display = S.chests.length ? '' : 'none'; $('#chest-n').textContent = S.chests.length; }
$('#btn-chest').addEventListener('click', () => { audioCtx(); openChest(); });
$('#btn-legend').addEventListener('click', () => { audioCtx(); slot = 'legend'; go('shop'); });

/* ---------------- MISSÃO DO DIA: 3 tarefinhas que valem um baú ---------------- */
const CHEST_SVG = '<svg viewBox="0 0 38 32"><rect x="2" y="12" width="34" height="18" rx="3" fill="#c0392b" stroke="#7a1f14" stroke-width="2"/><path d="M2 14 Q2 2 19 2 Q36 2 36 14 Z" fill="#e74c3c" stroke="#7a1f14" stroke-width="2"/><rect x="2" y="12" width="34" height="4" fill="#f1c40f"/><rect x="16" y="11" width="6" height="9" rx="1.5" fill="#f1c40f" stroke="#a87b00"/><rect x="8" y="2.5" width="3" height="27" fill="#f1c40f" opacity=".9"/><rect x="27" y="2.5" width="3" height="27" fill="#f1c40f" opacity=".9"/></svg>';
const MISSION = [
  { k: 'aula', n: 1, ic: '📖', txt: 'Fazer 1 aula', go: () => startLesson(unitIndex()) },
  { k: 'comida', n: 1, ic: '🍎', txt: 'Dar comida ao Lumi', go: () => go('snack') },
  { k: 'palavras', n: 5, ic: '🗣️', txt: 'Falar 5 palavras em inglês', go: () => go('talk') },
];
function mission() { const d = today(); if (!S.mission || S.mission.day !== d) S.mission = { day: d, aula: 0, comida: 0, palavras: 0, got: false }; return S.mission; }
const missionCount = (m = mission()) => MISSION.filter((t) => m[t.k] >= t.n).length;
const missionReady = (m = mission()) => missionCount(m) === MISSION.length && !m.got;
function missionAdd(k, n = 1) {
  const m = mission(), t = MISSION.find((x) => x.k === k); if (!t || m[k] >= t.n) return;
  m[k] = Math.min(t.n, m[k] + n); save(); renderMissionBtn();
  if (m[k] >= t.n) toast(missionReady(m) ? '🎯 Missão completa! Pegue seu baú! 🎁' : `🎯 Missão: ${t.txt} ✓`);
}
function renderMissionBtn() {
  const m = mission(), b = $('#btn-mission'), n = $('#mission-n'); if (!b) return;
  const ready = missionReady(m);
  b.classList.toggle('glow', ready || (!m.got && !S.seen.mission));
  n.className = 'sbadge' + (m.got ? ' ok' : ''); n.textContent = m.got ? '✓' : ready ? '🎁' : missionCount(m) + '/' + MISSION.length;
}
function openMission() {
  const m = mission(), ready = missionReady(m);
  sheet(`<h2>🎯 Missão do dia</h2><p>Faça as 3 tarefinhas e ganhe um baú!</p>
    <div class="mlist">${MISSION.map((t) => { const ok = m[t.k] >= t.n;
      return `<button class="mrow ${ok ? 'done' : ''}" data-k="${t.k}"><span class="mi">${t.ic}</span><span class="mt"><b>${t.txt}</b><span class="mbar"><i style="width:${(Math.min(m[t.k], t.n) / t.n) * 100}%"></i></span></span><span class="mck">${ok ? '✓' : t.n > 1 ? m[t.k] + '/' + t.n : 'Ir ›'}</span></button>`; }).join('')}</div>
    <div class="mprize ${m.got ? 'got' : ready ? 'ready' : ''}">${CHEST_SVG}<p>${m.got ? 'Baú de hoje já ganho! Volte amanhã para uma nova missão ⭐' : ready ? 'Missão completa! O baú é seu!' : 'Complete tudo e o baú é seu!'}</p></div>
    ${ready ? '<button class="big yellow" id="mclaim">Abrir baú! 🎁</button>' : '<button class="big sm blue" data-close>Fechar</button>'}`);
  $$('#sheet .mrow').forEach((r) => (r.onclick = () => {
    const t = MISSION.find((x) => x.k === r.dataset.k); if (m[t.k] >= t.n) return;
    closeSheet(); if (!S.hatched) { toast('🚀 Primeiro abra a cápsula do Lumi!'); return; } t.go();
  }));
  const c = $('#mclaim');
  if (c) c.onclick = () => { m.got = true; S.chests.push('raro'); save(); renderMissionBtn(); renderChestBtn(); closeSheet(); lumi.celebrate(); confetti(50); openChest(); };
  if (!S.seen.mission) { S.seen.mission = 1; save(); renderMissionBtn(); }
  say($('#home-bubble'), [[m.got ? T.pt.missionDone : ready ? T.pt.chestWon : T.pt.missionIntro, 'pt']]);
}
$('#btn-mission').addEventListener('click', () => { audioCtx(); openMission(); });

/* ---------------- Lumi papagaio: a criança fala e ele repete com voz fininha (tipo Talking Tom) ----------------
   Na abertura ele fica ouvindo sozinho (sem tocar em nada); na tela principal, pelo botão 🎤 Repete.
   Tudo no aparelho: o áudio não é salvo nem enviado para lugar nenhum. */
const ECHO_RATE = 1.62; // voz bem fininha e rapidinha
let echoBusy = false, parrot = null;
function showBubble(b, html) { if (!b) return; b.innerHTML = html; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
async function openMic() { // sem filtros do sistema: eles cortavam o começo das palavras
  setSession('play-and-record');
  return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
}
function closeMic(stream) { try { stream.getTracks().forEach((t) => t.stop()); } catch (e) {} setSession('playback'); }
// grava uma fala: guarda o som de antes (o começo não corta), começa quando ouve voz e termina no silêncio
function recordPhrase(ctx, stream, onLevel, alive) {
  return new Promise((resolve) => {
    const src = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(2048, 1, 1), mute = ctx.createGain(); mute.gain.value = 0;
    src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
    const SRt = ctx.sampleRate, PRE = Math.ceil((SRt * 0.6) / 2048), chunks = [], lv = [], t0 = performance.now();
    let floor = 0.003, thr = 0.008, voiced = 0, lastVoice = 0, start = -1, done = false, lastCb = performance.now();
    const end = (ok) => {
      if (done) return; done = true; clearInterval(guard); proc.onaudioprocess = null; try { src.disconnect(); proc.disconnect(); mute.disconnect(); } catch (e) {}
      if (ok === 'stall') return resolve('stall');
      if (!ok || start < 0) return resolve(null);
      // corta o silêncio: começa um pouquinho antes da primeira sílaba e termina logo depois da última
      let a = start; while (a > 0 && lv[a - 1] > thr * 0.35) a--; a = Math.max(0, a - 2);
      let z = lv.length - 1; while (z > a && lv[z] < thr * 0.7) z--; z = Math.min(lv.length - 1, z + 3);
      const n = chunks.slice(a, z + 1).reduce((m, c) => m + c.length, 0), buf = ctx.createBuffer(1, n, SRt), out = buf.getChannelData(0);
      let o = 0, peak = 0.0001; for (let k = a; k <= z; k++) { out.set(chunks[k], o); o += chunks[k].length; }
      for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
      const g = Math.min(8, 0.92 / peak), fade = Math.floor(SRt * 0.01);
      for (let i = 0; i < n; i++) out[i] *= g * Math.min(1, i / fade, (n - 1 - i) / fade);
      resolve(buf);
    };
    const guard = setInterval(() => { // saiu da tela, ou o áudio do celular travou (sem som chegando): recomeça a escuta
      if (!alive()) return end(false);
      const tr = stream.getAudioTracks()[0];
      if (performance.now() - lastCb > 1500 || (tr && tr.readyState === 'ended')) end('stall');
    }, 200);
    proc.onaudioprocess = (ev) => {
      if (done) return; lastCb = performance.now();
      const d = new Float32Array(ev.inputBuffer.getChannelData(0)); let e = 0; for (let i = 0; i < d.length; i++) e += d[i] * d[i];
      const rms = Math.sqrt(e / d.length), now = performance.now(), ms = (d.length / SRt) * 1000;
      if (start < 0) floor = rms < floor ? floor * 0.7 + rms * 0.3 : Math.min(0.03, floor + (rms - floor) * 0.003);
      thr = Math.max(0.007, floor * 3.2);
      chunks.push(d); lv.push(rms); if (start < 0 && chunks.length > PRE) { chunks.shift(); lv.shift(); }
      if (onLevel) onLevel(Math.min(1, rms / (thr * 2.2)));
      if (now - t0 > 120 && (rms > thr || (start >= 0 && rms > thr * 0.6))) { if (start < 0) start = chunks.length - 1; voiced += ms; lastVoice = now; } // depois que começa, ouve até a voz baixinha
      const secs = start < 0 ? 0 : ((chunks.length - start) * d.length) / SRt;
      if (start >= 0 && voiced > 90 && now - lastVoice > 600) end(true); // palavras curtinhas ("oi!") também valem
      else if (secs > 7) end(voiced > 90);
      else if (start >= 0 && voiced <= 90 && now - lastVoice > 700) { start = -1; voiced = 0; while (chunks.length > PRE) { chunks.shift(); lv.shift(); } } // foi só um estalo
    };
  });
}
// toca a fala com a voz fininha do Lumi, mexendo a boca no ritmo
function playFunny(ctx, buf) {
  return new Promise((resolve) => {
    const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = ECHO_RATE; s.connect(analyser); curSrc = s;
    const data = new Uint8Array(analyser.fftSize); let live = true;
    const lip = () => { if (!live) return; analyser.getByteTimeDomainData(data); let q = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; q += v * v; } lumi.mouthLevel = Math.min(1, Math.sqrt(q / data.length) * 5.5); requestAnimationFrame(lip); };
    s.onended = () => { if (!live) return; live = false; lumi.mouthLevel = null; lumi.talk(false); if (curSrc === s) curSrc = null; resolve(); };
    lumi.talk(true); s.start(); lip();
  });
}
async function audioReadyToPlay(ctx) { await wait(120); if (ctx.state !== 'running') await ctx.resume().catch(() => {}); return ctx.state === 'running'; }

// tela principal: botão 🎤 Repete (uma fala por toque)
async function echoTalk() {
  if (echoBusy) return;
  const bub = $('#home-bubble'), btn = $('#btn-echo');
  if (S.sleeping) { say(bub, T.pt.sleeping); return; }
  const ctx = audioCtx();
  if (!ctx || !CAN_REC || !ctx.createScriptProcessor) { toast('🎤 O microfone não funciona neste aparelho'); return; }
  echoBusy = true; stopTalk(); lumi.setMood('listen'); btn.classList.add('rec'); showBubble(bub, 'Fala alguma coisa que eu repito! 🎤');
  let stream; try { stream = await openMic(); } catch (e) { setSession('playback'); btn.classList.remove('rec'); lumi.setMood('idle'); echoBusy = false; showBubble(bub, 'Preciso do microfone para ouvir você! 🎤'); return; }
  if (ctx.state !== 'running') await ctx.resume().catch(() => {});
  let buf = await recordPhrase(ctx, stream, (v) => btn.style.setProperty('--lv', v.toFixed(2)), () => current === 'home');
  if (buf === 'stall') buf = null;
  closeMic(stream); btn.classList.remove('rec'); btn.style.removeProperty('--lv');
  await audioReadyToPlay(ctx);
  if (!buf || current !== 'home') { lumi.setMood('idle'); echoBusy = false; if (current === 'home') showBubble(bub, 'Não ouvi nada... Toca no 🎤 e fala de novo!'); return; }
  lumi.setMood('idle'); showBubble(bub, '🤖 🎶'); await playFunny(ctx, buf); echoBusy = false;
  if (current === 'home') { lumi.setMood('happy'); lumi.doWave && lumi.doWave(1.6); showBubble(bub, 'Hihi! Fala mais! 😄'); setTimeout(() => { if (!echoBusy && lumi.mood === 'happy') lumi.setMood(S.sleeping ? 'sleep' : 'idle'); }, 1800); }
}
$('#btn-echo').addEventListener('click', () => { audioCtx(); echoTalk(); });

// abertura: o Lumi fica ouvindo sozinho — a criança fala e ele repete, sem tocar em nada
async function startParrot() {
  if (parrot || !S.hatched || current !== 'splash' || document.hidden || !CAN_REC) return;
  const ctx = audioCtx(); if (!ctx || !ctx.createScriptProcessor) return;
  const P = (parrot = { on: true, stream: null, wake: null }), badge = $('#echo-badge'), bub = $('#splash-bubble'), alive = () => P.on && current === 'splash' && !document.hidden;
  let first = true;
  let stalls = 0;
  while (alive()) {
    try { P.stream = await openMic(); } catch (e) { break; } // sem permissão do microfone: a abertura segue normal
    if (!alive()) break;
    if (ctx.state !== 'running') await ctx.resume().catch(() => {});
    if (ctx.state !== 'running') { // o celular só libera o som depois do primeiro toque: pede um toque e segue sozinho
      lumi.setMood('idle'); showBubble(bub, 'Toca em mim e fala comigo! 👆'); first = false;
      await new Promise((r) => (P.wake = r)); P.wake = null; if (!alive()) break; await ctx.resume().catch(() => {});
    }
    badge.classList.add('on'); lumi.setMood('listen');
    if (first) { showBubble(bub, 'Fala comigo! Eu repito! 🎤'); first = false; } else if (bub.textContent.includes('👆')) bub.innerHTML = '';
    const buf = await recordPhrase(ctx, P.stream, (v) => badge.style.setProperty('--lv', v.toFixed(2)), alive);
    closeMic(P.stream); P.stream = null; badge.classList.remove('on'); badge.style.removeProperty('--lv');
    if (!alive()) break;
    if (buf === 'stall') { if (++stalls > 4) break; await wait(300); continue; } // áudio travou: reabre o microfone
    stalls = 0;
    if (!buf) continue;
    if (!(await audioReadyToPlay(ctx))) { // o celular só deixa tocar som depois do primeiro toque
      lumi.setMood('idle'); showBubble(bub, 'Toca em mim que eu repito! 👆');
      await new Promise((r) => (P.wake = r)); P.wake = null; if (!alive()) break; await ctx.resume().catch(() => {});
    }
    bub.innerHTML = ''; lumi.setMood('idle'); await playFunny(ctx, buf);
    if (!alive()) break; lumi.setMood('happy'); // já volta a ouvir na hora (sem pausa: a criança costuma falar logo em seguida)
  }
  if (P.stream) closeMic(P.stream); badge.classList.remove('on'); if (parrot === P) parrot = null;
  if (current === 'splash' && lumi.mood !== 'sleep') lumi.setMood('idle');
}
function stopParrot() { const P = parrot; if (!P) return; P.on = false; if (P.stream) { closeMic(P.stream); P.stream = null; } if (P.wake) P.wake(); parrot = null; $('#echo-badge').classList.remove('on'); $('#splash-bubble').innerHTML = ''; }
$('#s-splash').addEventListener('pointerdown', (e) => { if (e.target.closest('#btn-start, #kidname')) return; audioCtx(); if (parrot && parrot.wake) parrot.wake(); else if (!parrot) startParrot(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopParrot(); else if (current === 'splash') setTimeout(startParrot, 600); });
function wornSet() { return D.legendary.find((c) => c.items.every((it) => (it.slot === 'costume' ? S.outfit.costume === it.id : S.outfit[it.slot] === it.id && (!S.outfit.costume || S.outfit.costume === 'none' || !COVERED.includes(it.slot))))); }
function updateFx(announce) {
  const c = wornSet(); lumi.setEffect(c ? c.fx : null);
  if (c && announce && S.awards['set-' + c.id] !== 2) { S.awards['set-' + c.id] = 2; save(); confetti(80); lumi.celebrate(); return c; }
  return null;
}
function pickDrop(tier) {
  const pool = LEG.filter((it) => !legOwned(it));
  if (!pool.length) return null;
  const same = pool.filter((it) => it.rarity === tier);
  return rnd(same.length ? same : pool);
}
let chestOpen = false;
function openChest() {
  if (chestOpen || !S.chests.length) return;
  chestOpen = true;
  const tier = S.chests[0], R = D.rarity[tier];
  const M = $('#chestmodal'); M.className = 'chestmodal on ' + tier;
  M.innerHTML = `<div class="rays"></div><h2>Baú ${R.name.replace(/a$/, 'o')}!</h2>
    <div class="chest" id="chestbox"><div class="lid"></div><div class="box"><span class="lock"></span></div></div>
    <p class="ctip">Toque no baú para abrir!</p>`;
  say(null, [[T.pt.chestTap, 'pt']]);
  $('#chestbox').onclick = async () => {
    if (M.classList.contains('open')) return;
    stopTalk(); M.classList.add('open');
    S.chests.shift();
    const it = pickDrop(tier);
    if (!it) { S.coins += 300; save(); renderChestBtn(); confetti(60);
      M.insertAdjacentHTML('beforeend', `<div class="reveal"><div class="rcard"><div class="big">🪙</div><b>+300 moedas</b><small>Você já tem todas as peças lendárias!</small></div><button class="big" id="chestok">Oba! ▶</button></div>`);
      $('#chestok').onclick = closeChest; return; }
    S.owned[it.slot + ':' + it.id] = 1; save(); renderChestBtn();
    const img = thumb(it.slot, it.id, 220);
    const have = it.col.items.filter(legOwned).length;
    await wait(700); confetti(tier === 'lendario' ? 120 : 70);
    M.insertAdjacentHTML('beforeend', `<div class="reveal"><div class="rcard" style="--rc:${D.rarity[it.rarity].color}"><span class="rtag">${D.rarity[it.rarity].name}</span><img src="${img}" alt=""><b>${esc(it.pt)}</b><small>${it.col.icon} ${esc(it.col.name)} · ${have}/${it.col.items.length}</small></div>
      <div class="row"><button class="big sm blue" id="chestlater">Depois</button><button class="big sm" id="chestwear">Vestir agora ✨</button></div></div>`);
    say(null, [[{ raro: T.pt.gotRare, epico: T.pt.gotEpic, lendario: T.pt.gotLegend }[it.rarity], 'pt'], [it.en + '!', 'en']]);
    $('#chestlater').onclick = closeChest;
    $('#chestwear').onclick = () => { S.outfit = outfitWith(it.slot, it.id); save(); lumi.setOutfit(S.outfit); avatarURL = null; const done = updateFx(true); closeChest(); lumi.celebrate(); if (done) say($('#home-bubble'), [[T.pt.setDone, 'pt']], `Coleção <b>${esc(done.name)}</b> completa! ${done.icon}`); };
  };
}
function closeChest() { const M = $('#chestmodal'); M.className = 'chestmodal'; M.innerHTML = ''; chestOpen = false; stopTalk(); if (S.chests.length) setTimeout(openChest, 400); }
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
  const secs = Math.max(0, (100 - S.energy) * 3); $('#rest-hint').textContent = S.energy >= 100 ? 'Energia cheia! ⚡' : S.sleeping ? `${Math.floor(secs / 60)}min ${secs % 60}s` : `${Math.ceil(secs / 60)} min dormindo`;
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
  $('#foods').innerHTML = D.foods.map((f) => `<button class="food" data-id="${f.id}"><span class="em">${f.img}</span><b>${f.pt}</b><span class="pr"><span>${f.price} 🪙</span><span style="color:var(--greenD)">+${f.energy} ⚡</span></span><span class="dar">Dar</span></button>`).join('');
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
  lumi.eat(2.2); S.energy = Math.min(100, S.energy + f.energy); save(); missionAdd('comida');
  await say($('#snack-bubble'), [[T.en.yummy, 'en'], [f.en + '!', 'en'], [T.pt.yummy, 'pt']]);
});

/* ---------------- ROUPAS ---------------- */
const SLOTS = [['legend', '✨ Lendárias'], ['costume', '🐻 Fantasias'], ['body', '👕 Camisetas'], ['legs', '👖 Calças'], ['head', '🎩 Chapéus'], ['face', '👓 Óculos'], ['back', '🦋 Costas'], ['neck', '🎀 Pescoço']];
const COVERED = ['head', 'body', 'legs'];
let slot = 'costume', preview = null;
const thumbs = {};
function thumb(slotName, id, size = 140) {
  const k = slotName + ':' + id + ':' + size;
  if (!(k in thumbs)) { const o = {}; Object.keys(D.shop).forEach((x) => (o[x] = 'none')); o[slotName] = id; thumbs[k] = stage.outfitSnapshot(o, id === 'parrot' ? 'costume' : slotName, size); }
  return thumbs[k];
}
function outfitWith(sl, id) {
  const o = Object.assign({}, S.outfit, { [sl]: id });
  if (COVERED.includes(sl) && id !== 'none') o.costume = 'none';
  return o;
}
$('#shop-tabs').innerHTML = SLOTS.map(([k, l]) => `<button class="tab" data-slot="${k}">${l}</button>`).join('');
function enterShop() {
  tickSleep(); wake(); preview = null; lumi.setOutfit(S.outfit); lumi.setMood('idle');
  renderShop();
  setTimeout(() => current === 'shop' && say($('#shop-bubble'), T.pt.pickOutfit), 350);
}
function renderLegend() {
  $('#shop-items').innerHTML = D.legendary.map((c) => {
    const have = c.items.filter(legOwned).length, full = have === c.items.length;
    return `<div class="lcol ${full ? 'full' : ''}"><div class="lhead"><span>${c.icon}</span><b>${esc(c.name)}</b><em>${have}/${c.items.length}</em></div>
      <div class="lfx">${full ? '✨ Use tudo junto: ' + c.fxName + '!' : 'Coleção completa ganha ' + c.fxName}</div>
      <div class="litems">${c.items.map((it) => { const own = legOwned(it), wear = S.outfit[it.slot] === it.id; const R = D.rarity[it.rarity];
        return `<button class="item leg ${own ? '' : 'locked'} ${wear ? 'wear' : ''}" data-slot="${it.slot}" data-id="${it.id}" style="--rc:${R.color}"><img src="${thumb(it.slot, it.id)}" alt=""><small>${own ? esc(it.pt) : '???'}</small><span class="tag rar">${own ? (wear ? 'Usando' : 'Usar') : '🔒 ' + R.name}</span></button>`; }).join('')}</div></div>`;
  }).join('') + '<p class="lnote">🎁 Ganhe baús terminando mundos, fazendo 3 estrelas, subindo de nível, jogando vários dias seguidos e quando o Lumi cresce.</p>';
}
function renderShop() {
  $$('#shop-tabs .tab').forEach((t) => t.classList.toggle('on', t.dataset.slot === slot));
  $('#shop-items').classList.toggle('legend', slot === 'legend');
  if (slot === 'legend') return renderLegend();
  const costumeOn = S.outfit.costume && S.outfit.costume !== 'none';
  $('#shop-items').innerHTML = D.shop[slot].map((it) => {
    const own = S.owned[slot + ':' + it.id], wear = S.outfit[slot] === it.id && !(costumeOn && COVERED.includes(slot) && it.id !== 'none');
    const tag = wear ? '<span class="tag wearing">Usando</span>' : own ? '<span class="tag own">Usar</span>' : `<span class="tag">🪙${it.price}</span>`;
    const img = it.id === 'none' ? '<span class="none">🚫</span>' : `<img src="${thumb(slot, it.id)}" alt="${esc(it.pt)}">`;
    return `<button class="item ${preview === it.id ? 'sel' : ''} ${wear ? 'wear' : ''}" data-id="${it.id}">${img}<small>${esc(it.pt)}</small>${tag}</button>`;
  }).join('');
}
$('#shop-tabs').addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (!t) return; slot = t.dataset.slot; preview = null; lumi.setOutfit(S.outfit); renderShop(); $('#shop-items').scrollTop = 0; t.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' }); });
$('#shop-items').addEventListener('click', (e) => {
  const b = e.target.closest('.item'); if (!b) return;
  audioCtx();
  if (b.classList.contains('leg')) {
    const it = LEG.find((x) => x.id === b.dataset.id && x.slot === b.dataset.slot);
    if (!legOwned(it)) { lumi.encourage(); toast('🔒 Só sai em baús!'); say($('#shop-bubble'), T.pt.legendHint); return; }
    const off = S.outfit[it.slot] === it.id;
    S.outfit = off ? Object.assign({}, S.outfit, { [it.slot]: 'none' }) : outfitWith(it.slot, it.id); save(); lumi.setOutfit(S.outfit); avatarURL = null; lumi.hop();
    const done = updateFx(true); renderShop();
    if (done) say($('#shop-bubble'), [[T.pt.setDone, 'pt']], `Coleção <b>${esc(done.name)}</b> completa! ${done.icon}`);
    else if (!off) say($('#shop-bubble'), [[it.en + '!', 'en'], [T.pt.pretty, 'pt']]);
    return;
  }
  const it = D.shop[slot].find((x) => x.id === b.dataset.id), key = slot + ':' + it.id;
  const cheer = () => (slot === 'costume' && it.id !== 'none' ? [[it.en + '!', 'en'], [T.pt.costume, 'pt']] : it.en ? [[it.en + '!', 'en'], [T.pt.pretty, 'pt']] : [[T.pt.pretty, 'pt']]);
  if (S.owned[key]) {
    S.outfit = outfitWith(slot, it.id); save(); lumi.setOutfit(S.outfit); preview = null; renderShop(); lumi.hop(); avatarURL = null; updateFx();
    say($('#shop-bubble'), cheer());
    return;
  }
  if (preview !== it.id) {
    preview = it.id; lumi.setOutfit(outfitWith(slot, it.id)); renderShop(); lumi.hop();
    say($('#shop-bubble'), [[it.en + '!', 'en'], [T.pt.tapBuy, 'pt']], `<span class="en">${esc(it.en)}!</span> ${esc(it.pt)} · 🪙${it.price}<br>Toca de novo para comprar.`);
    return;
  }
  if (S.coins < it.price) { lumi.encourage(); say($('#shop-bubble'), T.pt.noCoins); return; }
  S.coins -= it.price; S.owned[key] = 1; S.outfit = outfitWith(slot, it.id); save(); lumi.setOutfit(S.outfit); preview = null; renderShop(); avatarURL = null; updateFx();
  lumi.celebrate(); confetti(30);
  say($('#shop-bubble'), [[T.pt.thanks, 'pt'], ...cheer().slice(0, 1)]);
});

/* ---------------- COMO SE DIZ? A criança fala em português e o Lumi ensina em inglês ----------------
   Só com as palavras das aulas (figuras e áudios que já estão no app). Onde o celular não deixa reconhecer
   a fala (app do iPhone aberto pelo ícone), a criança toca na figura. */
const VOCAB = (() => { const out = [], seen = new Set(); D.units.forEach((u) => { if (u.type !== 'lesson') return; u.words.forEach((w) => { const k = w.pt.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(Object.assign({ wi: u.wi }, w)); } }); }); return out; })();
const ptNorm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const ptLow = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const PT_BY_LOW = new Map(VOCAB.map((w) => [ptLow(w.pt), w])), PT_BY_NORM = new Map(), PT_AMBIG = new Set();
VOCAB.forEach((w) => { const k = ptNorm(w.pt); if (PT_BY_NORM.has(k) && PT_BY_NORM.get(k).en !== w.en) PT_AMBIG.add(k); else if (!PT_BY_NORM.has(k)) PT_BY_NORM.set(k, w); });
const PT_SYN = { cao: 'cachorro', cachorra: 'cachorro', mae: 'mamae', pai: 'papai', oi: 'ola', obrigada: 'obrigado', nenem: 'bebe', ave: 'passaro', olho: 'olhos', dente: 'dentes', tchauzinho: 'tchau' };
const PT_SYN_ACC = { 'vó': 'vovó', 'avó': 'vovó', 'vô': 'vovô', 'avô': 'vovô' };
const PT_STOP = new Set('como se diz fala falar fale e o a os as de do da dos das em no na que qual eu quero sei saber ingles portugues palavra isso e ai la me te por favor agora'.split(' '));
function findWord(text) {
  const low = ' ' + ptLow(text) + ' ', nrm = ' ' + ptNorm(text) + ' ';
  let best = null;
  for (const w of VOCAB) { // 1) a palavra (ou frase) inteira, com e sem acento; a mais comprida ganha
    const a = ' ' + ptLow(w.pt) + ' ', b = ' ' + ptNorm(w.pt) + ' ';
    let i = low.indexOf(a), sc = 3, len = a.length;
    if (i < 0) { i = PT_AMBIG.has(b.trim()) ? -1 : nrm.indexOf(b); sc = 2; len = b.length; }
    if (i >= 0 && (!best || len > best.len || (len === best.len && sc > best.sc))) best = { w, sc, len };
  }
  if (best) return best.w;
  const toks = ptLow(text).split(' ').filter(Boolean);
  for (const t of toks) { // 2) número falado em algarismos, apelidos, plural e diminutivo
    const n = ptNorm(t); if (!n || PT_STOP.has(n)) continue;
    let w = /^\d+$/.test(n) ? VOCAB.find((x) => x.txt === String(+n)) : null;
    if (!w && PT_SYN_ACC[t]) w = PT_BY_LOW.get(PT_SYN_ACC[t]);
    if (!w && PT_SYN[n]) w = PT_BY_NORM.get(PT_SYN[n]);
    if (!w) for (const v of [n.replace(/oes$|aes$/, 'ao'), n.replace(/es$/, ''), n.replace(/s$/, ''), n.replace(/zinh[oa]s?$/, ''), n.replace(/inh([oa])s?$/, '$1'), n.replace(/ões$/, 'ao')]) { if (v !== n && !PT_AMBIG.has(v) && PT_BY_NORM.has(v)) { w = PT_BY_NORM.get(v); break; } }
    if (w) return w;
  }
  let bs = 0, bw = null; // 3) falou parecido (a criança ainda está aprendendo a falar)
  for (const t of toks) { const n = ptNorm(t); if (n.length < 4 || PT_STOP.has(n)) continue;
    for (const w of VOCAB) { const p = ptNorm(w.pt); if (p.includes(' ') || PT_AMBIG.has(p)) continue; const sc = 1 - lev(n, p) / Math.max(n.length, p.length); if (sc > bs) { bs = sc; bw = w; } } }
  return bs >= 0.75 ? bw : null;
}
let srPTBroken = false;
const canHearPT = () => !!SR && !IOS_APP && !srPTBroken;
function hearPT(onLive) {
  return new Promise((resolve) => {
    const r = new SR(); curRec = r; r.lang = 'pt-BR'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
    let alts = [], live = '', done = false, any = false;
    const fin = (extra) => {
      if (done) return; done = true; if (curRec === r) curRec = null; try { r.abort(); } catch (e) {}
      if (!alts.length && live) alts = [live];
      setSession('playback'); setTimeout(() => { if (actx && actx.state !== 'running') actx.resume(); resolve(Object.assign({ alts, heardAny: any || !!alts.length }, extra || {})); }, 450);
    };
    r.onresult = (ev) => { any = true; const res = ev.results[ev.results.length - 1]; live = res[0].transcript; if (onLive) onLive(live); if (res.isFinal) { alts = [...res].map((a) => a.transcript); fin(); } };
    r.onerror = (e) => fin(['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported'].includes(e.error) ? { broken: true, error: e.error } : { error: e.error });
    r.onend = () => fin();
    setTimeout(() => fin(), 8000);
    setSession('play-and-record');
    try { r.start(); } catch (e) { fin({ broken: true }); }
  });
}
let TK = null, talkWorld = 0;
const talkAlive = (tk) => TK === tk && current === 'talk';
function enterTalk() {
  tickSleep(); wake(); lumi.setMood('idle');
  talkWorld = D.units[unitIndex()].wi || 0;
  $('#ttabs').innerHTML = D.worlds.map((w, i) => `<button data-wi="${i}"><span>${w.icon}</span>${esc(w.name)}</button>`).join('');
  renderTalkGrid(); talkIdle((TK = {}), true);
}
function renderTalkGrid() {
  $$('#ttabs button').forEach((b) => b.classList.toggle('on', +b.dataset.wi === talkWorld));
  $('#tgrid').innerHTML = VOCAB.map((w, i) => (w.wi === talkWorld ? `<button data-i="${i}" aria-label="${esc(w.pt)}"><span class="e">${picHTML(w)}</span><small>${esc(w.pt)}</small></button>` : '')).join('');
  $('#tgrid').scrollLeft = 0;
}
async function talkIdle(tk, first) {
  const can = canHearPT(), bub = $('#talk-bubble');
  lumi.setMood('idle');
  $('#tstage').innerHTML = can ? `<button class="mic" id="tmic" aria-label="Falar">🎤</button><div class="tlbl" id="tlbl">${first ? 'Toque no 🎤 e fale uma palavra em português' : 'Fala outra palavra!'}<small>ou toque numa figura 👇</small></div>`
    : `<div class="tlbl solo">👇 Toque numa figura<small>que o Lumi te ensina em inglês!</small></div>`;
  if (can) $('#tmic').onclick = () => { audioCtx(); hearAndTeach((TK = {})); };
  const ok = await say(bub, [[can ? (first ? T.pt.talkIntro : T.pt.talkMore) : (first ? T.pt.talkTap : T.pt.talkMoreTap), 'pt']]);
  if (ok && first && can && talkAlive(tk)) hearAndTeach(tk); // na primeira vez já começa a ouvir sozinho
}
async function hearAndTeach(tk) {
  stopTalk(); stopListen(); await wait(60); if (!talkAlive(tk)) return;
  const mic = $('#tmic'), lbl = $('#tlbl'); if (!mic) return;
  mic.className = 'mic listen'; lbl.innerHTML = 'Estou ouvindo... 👂<small>fale uma palavra em português</small>'; lumi.setMood('listen');
  const r = await hearPT((t) => { if (talkAlive(tk)) lbl.innerHTML = `“${esc(t)}”<small>estou ouvindo... 👂</small>`; });
  if (!talkAlive(tk)) return;
  lumi.setMood('idle'); mic.className = 'mic';
  if (r.broken) { srPTBroken = true; return talkIdle(tk, true); } // sem reconhecimento de voz aqui: vira "toque na figura"
  let w = null; for (const a of r.alts) { w = findWord(a); if (w) break; }
  if (w) return teachTalk(tk, w);
  lumi.encourage();
  if (!r.alts.length) { lbl.innerHTML = 'Não ouvi! 🤔<small>toque no 🎤 e fale de novo</small>'; say($('#talk-bubble'), [[T.pt.talkNotHeard, 'pt']]); return; }
  lbl.innerHTML = `Eu ouvi: “${esc(r.alts[0])}”<small>essa eu ainda não sei 🤔</small>`; say($('#talk-bubble'), [[T.pt.talkUnknown, 'pt']]);
}
async function teachTalk(tk, w) {
  const bub = $('#talk-bubble'), ptw = cap(w.pt) + '!';
  $$('#tgrid button').forEach((b) => b.classList.toggle('sel', VOCAB[+b.dataset.i] === w));
  $('#tstage').innerHTML = `<div class="tcard"><div class="tpic">${picHTML(w)}</div><div class="tw"><b class="ten">${esc(w.en)}</b><span class="tpt">${esc(w.pt)}</span><span class="tok" id="tok"></span></div><button class="spk" id="tspk" aria-label="Ouvir">🔊</button></div>`;
  $('#tspk').onclick = () => { audioCtx(); stopListen(); speak(w.en, 'en'); };
  lumi.hop && lumi.hop();
  if (!(await say(bub, [[ptw + ' ' + T.pt.inEn, 'pt'], [w.en, 'en']], `${esc(ptw)} Em inglês é <span class="en">${esc(w.en)}</span>!`)) || !talkAlive(tk)) return;
  for (let tries = 0; tries < 2; tries++) { // a vez da criança: repete em inglês (vale para a missão do dia)
    if (!(await say(bub, [[tries ? T.pt.again : T.pt.yourTurn, 'pt'], [w.en, 'en']], `${tries ? 'Escuta de novo:' : 'Agora você! Fala:'} <span class="en">${esc(w.en)}</span>`)) || !talkAlive(tk)) return;
    const sp = $('#tspk'); sp.outerHTML = `<button class="mic listen" id="tsay" aria-label="Falar">${micBroken ? '✅' : '🎤'}</button>`;
    const btn = $('#tsay'), tok = $('#tok'); lumi.setMood('listen');
    let r;
    if (micBroken) { tok.textContent = 'Fale e toque no ✅'; r = await new Promise((res) => (btn.onclick = () => res({ ok: true }))); }
    else { tok.textContent = 'Sua vez! 👂'; r = await listen(w.key || w.en); if (r.broken) { btn.textContent = '✅'; tok.textContent = 'Fale e toque no ✅'; r = await new Promise((res) => (btn.onclick = () => res({ ok: true }))); } }
    if (!talkAlive(tk)) return;
    lumi.setMood('idle'); btn.className = 'mic idle';
    if (r.ok) {
      lumi.celebrate(); missionAdd('palavras'); tok.textContent = '🎉 Isso!'; coinFly(btn, '⭐');
      await say(bub, [[rnd(T.en.praise), 'en'], [rnd(T.pt.praise), 'pt']]); break;
    }
    tok.textContent = r.heardAny ? (r.heard ? `Eu ouvi: “${r.heard}”` : '') : 'Não ouvi 🤔'; lumi.encourage();
    if (tries === 1) { lumi.hop(); await say(bub, [[T.pt.goodTry, 'pt'], [w.en, 'en']], `Boa tentativa! <span class="en">${esc(w.en)}</span> 👍`); }
    else await wait(400);
    if (!talkAlive(tk)) return;
    const b2 = $('#tsay'); if (b2) b2.outerHTML = '<button class="spk" id="tspk" aria-label="Ouvir">🔊</button>';
  }
  if (!talkAlive(tk)) return;
  await wait(700); if (talkAlive(tk)) talkIdle(tk, false);
}
$('#ttabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; talkWorld = +b.dataset.wi; renderTalkGrid(); b.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' }); });
$('#tgrid').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; audioCtx(); stopTalk(); stopListen(); teachTalk((TK = {}), VOCAB[+b.dataset.i]); });

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
window.__lumi = { S, stage, go, startLesson, openChest, checkAwards, updateFx, findWord, get LS() { return LS; }, setMicBroken: (v) => { micBroken = v; }, get micMode() { return micBroken ? 'tap' : srBroken ? 'vad' : 'sr'; } };
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  const SW = navigator.serviceWorker, hadSW = !!SW.controller;
  SW.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    // o iPhone só "retoma" o app quando ele volta para a tela: procura versão nova nessa hora
    document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
  }).catch(() => {});
  // chegou versão nova do app: recarrega sozinho quando estiver na abertura ou no início (nunca no meio de aula, jogo ou janela aberta)
  SW.addEventListener('controllerchange', () => {
    if (!hadSW) return;
    const tryReload = () => { if (!LS && (current === 'splash' || current === 'home') && !$('#modal').classList.contains('on')) { location.reload(); return true; } return false; };
    if (!tryReload()) { const iv = setInterval(() => { if (tryReload()) clearInterval(iv); }, 4000); }
  });
}
