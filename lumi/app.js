/* Lumi — app de inglês para crianças */
(function () {
  const D = window.LUMI_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const today = () => new Date().toISOString().slice(0, 10);

  /* ---------------- estado salvo no aparelho ---------------- */
  const KEY = 'lumi_state_v1';
  const fresh = () => ({ name: '', coins: 120, energy: 80, xp: 0, streak: 0, lastDay: '', giftDay: '', units: {}, owned: { 'head:none': 1, 'face:none': 1, 'neck:none': 1 }, outfit: { head: 'none', face: 'none', neck: 'none' }, sleeping: false, sleepAt: 0, seen: {} });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} bind(); };
  const level = () => Math.floor(S.xp / 300) + 1;

  function bind() {
    $$('[data-bind]').forEach((el) => {
      const k = el.dataset.bind;
      el.textContent = k === 'level' ? level() : k === 'xpin' ? S.xp % 300 : Math.round(S[k] ?? 0);
    });
    $$('[data-bind-w]').forEach((el) => {
      const k = el.dataset.bindW;
      el.style.width = (k === 'xp' ? (S.xp % 300) / 3 : Math.min(100, S[k])) + '%';
    });
  }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800); }

  /* ---------------- voz (fala do Lumi) ---------------- */
  const synth = window.speechSynthesis;
  let voices = [];
  const loadVoices = () => { voices = synth ? synth.getVoices() : []; };
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function pickVoice(lang) {
    const L = lang.toLowerCase();
    const cands = voices.filter((v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(L.slice(0, 2)));
    const exact = cands.filter((v) => v.lang.toLowerCase().replace('_', '-') === L);
    const pool = exact.length ? exact : cands;
    const pref = L.startsWith('pt') ? [/google/i, /luciana/i, /francisca/i, /female|feminina/i] : [/google us/i, /samantha/i, /google/i, /female/i];
    for (const re of pref) { const v = pool.find((x) => re.test(x.name)); if (v) return v; }
    return pool[0] || null;
  }
  let speakToken = 0;
  // áudios gravados com voz neural (audio/index.json); se faltar, usa a voz do aparelho
  let AUDIO = {}, actx = null, analyser = null;
  const bufCache = {};
  fetch('audio/index.json').then((r) => r.json()).then((j) => { AUDIO = j; }).catch(() => {});
  function audioCtx() {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); analyser = actx.createAnalyser(); analyser.fftSize = 512; analyser.connect(actx.destination); }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }
  async function getBuf(file) {
    if (!bufCache[file]) bufCache[file] = fetch('audio/' + file).then((r) => r.arrayBuffer()).then((a) => new Promise((res, rej) => actx.decodeAudioData(a, res, rej)));
    return bufCache[file];
  }
  let curSrc = null;
  async function playFile(file, lumi, my) {
    const ctx = audioCtx(); if (!ctx) return false;
    let buf; try { buf = await getBuf(file); } catch (e) { return false; }
    if (my !== speakToken) return true;
    return new Promise((resolve) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(analyser); curSrc = src;
      const data = new Uint8Array(analyser.fftSize);
      let live = true;
      const lip = () => {
        if (!live) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        if (lumi) lumi.mouthLevel = Math.min(1, Math.sqrt(sum / data.length) * 5.5);
        requestAnimationFrame(lip);
      };
      src.onended = () => { live = false; if (lumi) { lumi.mouthLevel = null; if (my === speakToken) lumi.talk(false); } resolve(true); };
      if (lumi) lumi.talk(true);
      src.start(); lip();
    });
  }
  function speak(text, lang = 'pt-BR', lumi, opt = {}) {
    const key = (lang.startsWith('en') ? 'en' : 'pt') + '|' + text;
    if (AUDIO[key] && (window.AudioContext || window.webkitAudioContext)) {
      const my = speakToken;
      return playFile(AUDIO[key], lumi, my).then((ok) => { if (!ok) return speakTTS(text, lang, lumi, opt); });
    }
    return speakTTS(text, lang, lumi, opt);
  }
  function speakTTS(text, lang = 'pt-BR', lumi, opt = {}) {
    return new Promise((resolve) => {
      if (!synth) { setTimeout(resolve, 400 + text.length * 45); return; }
      const my = speakToken;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = pickVoice(lang); if (v) u.voice = v;
      u.rate = opt.rate || (lang.startsWith('en') ? 0.82 : 1.02);
      u.pitch = opt.pitch || (lang.startsWith('en') ? 1.15 : 1.3);
      let done = false;
      const fin = () => { if (done) return; done = true; if (lumi && my === speakToken) lumi.talk(false); resolve(); };
      u.onstart = () => lumi && lumi.talk(true);
      u.onboundary = () => lumi && lumi.pulse();
      u.onend = fin; u.onerror = fin;
      setTimeout(fin, 1800 + text.length * 110);
      if (lumi) lumi.talk(true);
      synth.speak(u);
    });
  }
  function stopTalk() { if (synth) synth.cancel(); if (curSrc) { try { curSrc.onended && curSrc.onended(); curSrc.stop(); } catch (e) {} curSrc = null; } speakToken++; Object.values(L).forEach((l) => l && l.talk(false)); }
  // fala com balão: parts = [[texto, 'pt'|'en'], ...]
  async function say(lumi, bubble, parts, opts = {}) {
    if (typeof parts === 'string') parts = [[parts, 'pt']];
    stopTalk();
    const my = speakToken;
    if (bubble) { bubble.textContent = opts.bubble || parts.map((p) => p[0]).join(' '); bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop'); }
    for (const [t, l] of parts) {
      if (my !== speakToken) return;
      await speak(t, l === 'en' ? 'en-US' : 'pt-BR', lumi);
    }
  }

  /* ---------------- reconhecimento de voz ---------------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim();
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function match(heard, target) {
    const h = norm(heard), t = norm(target);
    if (!h) return 0;
    if (h.includes(t)) return 1;
    const words = h.split(' ');
    let best = 1 - lev(h, t) / Math.max(h.length, t.length);
    for (let i = 0; i < words.length; i++) for (let k = 1; k <= 3 && i + k <= words.length; k++) {
      const c = words.slice(i, i + k).join(' ');
      best = Math.max(best, 1 - lev(c, t) / Math.max(c.length, t.length));
    }
    return best;
  }
  function listen(target) {
    return new Promise((resolve) => {
      if (!SR) return resolve({ ok: false, unsupported: true });
      const r = new SR();
      r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
      let best = { score: 0, text: '' }, done = false;
      const fin = (extra) => { if (done) return; done = true; try { r.stop(); } catch (e) {} resolve(Object.assign({ ok: best.score >= 0.6, score: best.score, heard: best.text }, extra || {})); };
      r.onresult = (ev) => {
        for (const res of ev.results) for (const alt of res) { const s = match(alt.transcript, target); if (s > best.score) best = { score: s, text: alt.transcript }; }
        fin();
      };
      r.onerror = (e) => fin({ error: e.error });
      r.onend = () => fin();
      setTimeout(() => fin(), 7000);
      try { r.start(); } catch (e) { fin({ error: 'start' }); }
    });
  }

  /* ---------------- cenários ---------------- */
  function decorate() {
    $$('[data-decor]').forEach((d) => {
      const k = d.dataset.decor;
      if (k === 'day' || k === 'map') {
        d.innerHTML = `
          <div class="cloud" style="width:110px;height:34px;left:-20px;top:120px;animation:drift 9s ease-in-out infinite alternate"></div>
          <div class="cloud" style="width:80px;height:26px;right:-10px;top:70px;animation:drift 7s ease-in-out infinite alternate-reverse"></div>
          <div class="cloud" style="width:64px;height:22px;right:70px;top:210px;opacity:.6;animation:drift 11s ease-in-out infinite alternate"></div>
          <svg viewBox="0 0 400 300" preserveAspectRatio="none" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:${k === 'map' ? 100 : 46}%">
            <path d="M0,150 C80,100 150,120 210,140 C280,165 330,110 400,120 L400,300 L0,300Z" fill="${k === 'map' ? '#8fd48a' : '#bfe9b5'}"/>
            <path d="M0,200 C90,170 170,190 240,200 C310,210 350,180 400,185 L400,300 L0,300Z" fill="${k === 'map' ? '#71c46e' : '#9fdc95'}"/>
            ${k === 'day' ? '<circle cx="340" cy="40" r="0" fill="#fff"/>' : ''}
          </svg>
          ${k === 'day' ? '<div style="position:absolute;right:-40px;top:-40px;width:170px;height:170px;border-radius:50%;background:radial-gradient(circle,#fff7c2 0%,rgba(255,231,128,.55) 40%,rgba(255,231,128,0) 70%)"></div>' : ''}`;
      } else if (k === 'night') {
        let s = '<div style="position:absolute;right:28px;top:60px;width:70px;height:70px;border-radius:50%;box-shadow:-16px 10px 0 0 #fff3b0;transform:rotate(-20deg)"></div>';
        for (let i = 0; i < 36; i++) s += `<i class="twinkle" style="left:${Math.random() * 100}%;top:${Math.random() * 60}%;animation-delay:${Math.random() * 2.4}s;transform:scale(${0.6 + Math.random()})"></i>`;
        s += '<svg viewBox="0 0 400 200" preserveAspectRatio="none" style="position:absolute;left:0;bottom:0;width:100%;height:30%"><path d="M0,90 C100,60 200,110 300,80 C350,66 380,70 400,74 L400,200 L0,200Z" fill="#2b2f74"/></svg>';
        d.innerHTML = s;
      }
    });
  }

  /* ---------------- personagens ---------------- */
  const L = {};
  function makeLumis() {
    for (const k of ['splash', 'home', 'lesson', 'result', 'rest', 'snack', 'shop']) {
      L[k] = new window.Lumi(document.getElementById('lumi-' + k), { outfit: S.outfit });
      L[k].paused = true;
    }
    L.home.onPoke = () => {
      const pick = rnd([[[['Hi! Hehe!', 'en']]], ['Hihi! Faz cócegas!'], [[['Hello!', 'en']], 'Hello, ' + (S.name || 'friend') + '!'], ['Vamos aprender juntos?']]);
      say(L.home, $('#home-bubble'), pick[0], pick[1] ? { bubble: pick[1] } : {});
    };
  }
  const dressAll = () => Object.values(L).forEach((l) => l.setOutfit(S.outfit));

  /* ---------------- navegação ---------------- */
  let current = '';
  const NAV = { home: 1, rest: 1, snack: 1, shop: 1 };
  function go(name) {
    stopTalk();
    $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-' + name));
    $('#nav').classList.toggle('on', !!NAV[name]);
    $$('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.go === name));
    Object.entries(L).forEach(([k, l]) => (l.paused = k !== name));
    current = name;
    const fn = { home: enterHome, map: enterMap, rest: enterRest, snack: enterSnack, shop: enterShop }[name];
    fn && fn();
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

  /* ---------------- energia / sono ---------------- */
  function tickSleep() {
    if (!S.sleeping) return;
    const gained = Math.floor((Date.now() - S.sleepAt) / 3000);
    if (gained > 0) { S.energy = Math.min(100, S.energy + gained); S.sleepAt += gained * 3000; save(); }
    if (S.energy >= 100 && current !== 'rest') { S.sleeping = false; save(); }
  }
  setInterval(() => { tickSleep(); if (current === 'rest') renderRest(); }, 1000);

  /* ---------------- streak ---------------- */
  function touchStreak() {
    const d = today();
    if (S.lastDay === d) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    S.streak = S.lastDay === y ? S.streak + 1 : 1;
    S.lastDay = d; save();
  }

  /* ---------------- unidades ---------------- */
  const unitIndex = () => { let i = D.units.findIndex((u) => !(S.units[u.id] && S.units[u.id].done)); return i < 0 ? D.units.length - 1 : i; };
  const unlocked = (i) => i <= unitIndex();

  /* ---------------- SPLASH ---------------- */
  function enterSplash() {
    $$('.screen').forEach((s) => s.classList.toggle('on', s.id === 's-splash'));
    L.splash.paused = false; current = 'splash';
    const inp = $('#kidname');
    if (S.name) { inp.style.display = 'none'; $('#btn-start').textContent = `Oi, ${S.name}! Toque para começar →`; }
    setTimeout(() => L.splash.doWave(2), 600);
  }
  $('#btn-start').addEventListener('click', async () => {
    const inp = $('#kidname');
    if (!S.name) {
      const n = inp.value.trim();
      if (!n) { inp.focus(); inp.placeholder = 'Digite seu nome 😊'; L.splash.encourage(); return; }
      S.name = n.charAt(0).toUpperCase() + n.slice(1); save();
    }
    if (synth) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); }
    audioCtx();
    touchStreak();
    go('home');
  });

  /* ---------------- HOME ---------------- */
  function enterHome() {
    tickSleep();
    const i = unitIndex(), u = D.units[i];
    $('#home-unit-ic').textContent = u.icon;
    $('#home-unit-name').textContent = u.name;
    $('#home-unit-meta').textContent = `${Math.min(4, u.words.length)} palavras novas · +50 XP · ⚡10`;
    $('#btn-gift').classList.toggle('glow', S.giftDay !== today());
    L.home.setMood(S.sleeping ? 'sleep' : 'idle');
    setTimeout(() => {
      if (current !== 'home') return;
      if (S.sleeping) { say(L.home, $('#home-bubble'), 'Zzz... estou dormindo. Me acorde no Descanso!'); return; }
      L.home.doWave(1.8);
      const first = !S.seen.home; S.seen.home = 1; save();
      if (S.energy < 10) say(L.home, $('#home-bubble'), 'Estou cansadinho... Vamos dormir ou comer um lanchinho?');
      else if (first) say(L.home, $('#home-bubble'), [['Olá! Eu sou o Lumi!', 'pt'], ['Vamos aprender inglês hoje?', 'pt']], { bubble: `Olá, ${S.name}! Eu sou o Lumi! Vamos aprender inglês hoje?` });
      else say(L.home, $('#home-bubble'), [['Hello!', 'en'], ['Vamos aprender inglês hoje?', 'pt']], { bubble: `Hello, ${S.name}! Vamos aprender inglês hoje?` });
    }, 350);
  }
  $('#btn-today').addEventListener('click', () => startLesson(unitIndex()));
  $('#btn-gift').addEventListener('click', () => {
    if (S.giftDay === today()) { say(L.home, $('#home-bubble'), 'Você já abriu o presente de hoje. Volte amanhã!'); return; }
    S.giftDay = today(); S.coins += 30; save();
    $('#btn-gift').classList.remove('glow');
    L.home.celebrate();
    say(L.home, $('#home-bubble'), [['Surpresa! Você ganhou 30 moedas!', 'pt'], ['Thank you!', 'en']]);
  });

  /* ---------------- MAP ---------------- */
  function enterMap() {
    const wrap = $('#mapwrap');
    const n = D.units.length, step = 150, H = n * step + 120;
    wrap.style.height = H + 'px';
    const xs = [0.5, 0.74, 0.5, 0.26];
    const pts = D.units.map((u, i) => ({ x: xs[i % 4], y: H - 90 - i * step }));
    let path = `M${pts[0].x * 400},${pts[0].y}`;
    for (let i = 1; i < n; i++) { const a = pts[i - 1], b = pts[i]; path += ` C${a.x * 400},${a.y - 75} ${b.x * 400},${b.y + 75} ${b.x * 400},${b.y}`; }
    const cur = unitIndex();
    let html = `<svg class="mapsvg" viewBox="0 0 400 ${H}" preserveAspectRatio="none"><path d="${path}" stroke="#fff" stroke-width="22" fill="none" stroke-linecap="round" opacity=".7"/><path d="${path}" stroke="#ffd76a" stroke-width="8" stroke-dasharray="2 18" fill="none" stroke-linecap="round"/></svg>`;
    D.units.forEach((u, i) => {
      const st = S.units[u.id] || {};
      const cls = st.done ? 'done' : i === cur ? 'cur' : i > cur ? 'lock' : '';
      const stars = st.stars ? '⭐'.repeat(st.stars) + '<span style="opacity:.3">' + '⭐'.repeat(3 - st.stars) + '</span>' : '';
      html += `<button class="node ${cls}" data-u="${i}" style="left:${pts[i].x * 100}%;top:${pts[i].y}px">
        <div class="disc"><span class="num">${i + 1}</span>${u.icon}${i > cur ? '<span class="lockic">🔒</span>' : ''}</div>
        <label>${u.name}</label><div class="stars">${stars}</div></button>`;
    });
    html += `<div class="minilumi" id="map-lumi" style="left:calc(${pts[cur].x * 100}% + ${pts[cur].x > 0.5 ? -150 : 50}px);top:${pts[cur].y - 70}px"></div>`;
    wrap.innerHTML = html;
    const ml = new window.Lumi($('#map-lumi'), { outfit: S.outfit });
    L.map && L.map.destroy(); L.map = ml;
    ml.doWave(2);
    const sc = $('#map-scroll');
    requestAnimationFrame(() => { sc.scrollTop = Math.max(0, pts[cur].y - sc.clientHeight / 2); });
  }
  $('#mapwrap').addEventListener('click', (e) => {
    const b = e.target.closest('.node'); if (!b) return;
    const i = +b.dataset.u;
    if (!unlocked(i)) { toast('🔒 Complete a aula anterior para abrir'); L.map && L.map.encourage(); return; }
    startLesson(i);
  });

  /* ---------------- LESSON ---------------- */
  let LS = null;
  const PRAISE_EN = ['Great job!', 'Awesome!', 'Well done!', 'Excellent!', 'Super!'];
  const PRAISE_PT = ['Muito bem!', 'Isso aí!', 'Mandou bem!', 'Perfeito!', 'Você é demais!'];
  function pic(w, cls = 'picture') {
    return w.txt ? `<span class="num">${w.txt}</span>` : w.img;
  }
  function startLesson(ui) {
    tickSleep();
    if (S.sleeping) { S.sleeping = false; save(); }
    if (S.energy < 10) { openTired(); return; }
    const u = D.units[ui];
    const seen = S.units[u.id] && S.units[u.id].seenWords || [];
    let pool = u.words.filter((w) => !seen.includes(w.en));
    if (pool.length < 4) pool = shuffle(u.words);
    const words = pool.slice(0, 4);
    const [a, b, c, d] = words;
    const steps = [
      { t: 'learn', w: a }, { t: 'learn', w: b }, { t: 'audio2pic', w: a }, { t: 'pic2word', w: b },
      { t: 'learn', w: c }, { t: 'learn', w: d }, { t: 'audio2pic', w: c }, { t: 'pic2word', w: d },
      { t: 'speak', w: rnd(words) }, { t: 'audio2pic', w: rnd([b, d]) },
    ];
    S.energy = Math.max(0, S.energy - 10); save();
    if (audioCtx()) words.forEach((w) => { ['en|' + w.en, 'pt|Olha só: ' + w.pt + '!', 'pt|Como se diz ' + w.pt + ' em inglês?'].forEach((k) => AUDIO[k] && getBuf(AUDIO[k]).catch(() => {})); });
    LS = { ui, u, words, steps, i: -1, mistakes: 0, coins: 0 };
    go('lesson');
    L.lesson.paused = false;
    nextStep();
  }
  function setNext(enabled, label) { const b = $('#btn-next'); b.disabled = !enabled; b.textContent = label || 'Próxima →'; }
  function award(n, el) {
    S.coins += n; LS.coins += n; save();
    if (el) { const r = el.getBoundingClientRect(), app = $('#app').getBoundingClientRect(); const f = document.createElement('div'); f.className = 'coinfly'; f.textContent = '+' + n + ' 🪙'; f.style.left = (r.left - app.left + r.width / 2 - 20) + 'px'; f.style.top = (r.top - app.top) + 'px'; $('#app').appendChild(f); setTimeout(() => f.remove(), 1000); }
  }
  async function correct(el, w) {
    L.lesson.celebrate();
    if (!LS.cur.miss) award(2, el);
    setNext(true, 'Próxima pergunta →');
    await say(L.lesson, $('#lesson-bubble'), [[rnd(PRAISE_EN), 'en'], [rnd(PRAISE_PT), 'pt']]);
    L.lesson.setMood('idle');
  }
  async function wrong(el) {
    LS.mistakes++; LS.cur.miss = 1;
    L.lesson.encourage();
    await say(L.lesson, $('#lesson-bubble'), rnd(['Quase! Tente de novo.', 'Hmm, não é esse. Tenta outra vez!', 'Ops! Escuta de novo e tenta.']));
    L.lesson.setMood('idle');
  }
  function nextStep() {
    stopTalk();
    LS.i++;
    $('#lesson-bar').style.width = (LS.i / LS.steps.length) * 100 + '%';
    if (LS.i >= LS.steps.length) { finishLesson(); return; }
    const st = (LS.cur = Object.assign({}, LS.steps[LS.i]));
    const w = st.w, body = $('#lesson-body');
    setNext(false);
    L.lesson.setMood('idle');
    const options = shuffle([w, ...shuffle(LS.u.words.filter((x) => x.en !== w.en)).slice(0, 2)]);
    if (st.t === 'learn') {
      body.innerHTML = `<div class="prompt">Nova palavra!<small>Escute e repita em voz alta</small></div>
        <div class="picture">${pic(w)}<button class="spk" id="spk">🔊</button></div>
        <div class="word">${w.en}<small>${w.pt}</small></div>
        <div class="row" style="margin-top:14px"><button class="btn ghost" id="again">🔊 Ouvir</button>${SR ? '<button class="btn" id="tryspeak" style="background:var(--red);box-shadow:0 5px 0 var(--redD)">🎤 Falar</button>' : ''}</div>
        <div class="heard" id="heard"></div>`;
      const hear = () => speak(w.en, 'en-US', L.lesson);
      $('#spk').onclick = hear; $('#again').onclick = hear;
      if (SR) $('#tryspeak').onclick = () => doSpeak(w, $('#tryspeak'), true);
      (async () => {
        await say(L.lesson, $('#lesson-bubble'), [['Olha só: ' + w.pt + '!', 'pt'], ['Em inglês a gente fala:', 'pt'], [w.en, 'en']], { bubble: `Olha só: ${w.pt}! Em inglês: ${w.en}!` });
        setNext(true, 'Entendi! →');
        if (LS.cur === st) say(L.lesson, $('#lesson-bubble'), [['Repete comigo:', 'pt'], [w.en, 'en']]);
      })();
    } else if (st.t === 'pic2word') {
      body.innerHTML = `<div class="prompt">Como se diz “${w.pt}” em inglês?</div>
        <div class="picture">${pic(w)}</div>
        <div class="opts">${options.map((o) => `<button class="opt" data-en="${o.en}"><span>${o.en}</span><span class="s">🔊</span></button>`).join('')}</div>`;
      say(L.lesson, $('#lesson-bubble'), `Como se diz ${w.pt} em inglês?`);
      $$('.opt', body).forEach((b) => b.onclick = async () => {
        if (b.classList.contains('ok') || $('.opt.ok', body)) return;
        stopTalk();
        await speak(b.dataset.en, 'en-US', L.lesson);
        if (b.dataset.en === w.en) { b.classList.add('ok'); $$('.opt', body).forEach((x) => x !== b && x.classList.add('dim')); correct(b, w); }
        else { b.classList.add('bad'); setTimeout(() => { b.classList.remove('bad'); b.classList.add('dim'); }, 420); wrong(b); }
      });
    } else if (st.t === 'audio2pic') {
      body.innerHTML = `<div class="prompt">Ouça e toque na figura certa</div>
        <button class="spk bigspk" id="spk">🔊</button>
        <div class="tiles">${options.map((o) => `<button class="tile" data-en="${o.en}">${pic(o)}</button>`).join('')}</div>`;
      const play = () => speak(w.en, 'en-US', L.lesson);
      $('#spk').onclick = play;
      (async () => { await say(L.lesson, $('#lesson-bubble'), 'Escute bem!'); if (LS.cur === st) play(); })();
      $$('.tile', body).forEach((b) => b.onclick = async () => {
        if ($('.tile.ok', body)) return;
        if (b.dataset.en === w.en) { b.classList.add('ok'); $$('.tile', body).forEach((x) => x !== b && x.classList.add('dim')); correct(b, w); }
        else { b.classList.add('bad'); setTimeout(() => { b.classList.remove('bad'); b.classList.add('dim'); }, 420); await wrong(b); if (LS.cur === st) play(); }
      });
    } else if (st.t === 'speak') {
      body.innerHTML = `<div class="prompt">Fale em inglês!<small>Toque no microfone e diga a palavra</small></div>
        <div class="picture">${pic(w)}<button class="spk" id="spk">🔊</button></div>
        <div class="word">${w.en}<small>${w.pt}</small></div>
        ${SR ? '<button class="mic" id="mic">🎤</button>' : '<button class="btn green" id="said" style="margin-top:16px">Eu falei! ✅</button>'}
        <div class="heard" id="heard"></div>`;
      $('#spk').onclick = () => speak(w.en, 'en-US', L.lesson);
      say(L.lesson, $('#lesson-bubble'), [['Agora é a sua vez! Fale:', 'pt'], [w.en, 'en']]);
      if (SR) $('#mic').onclick = () => doSpeak(w, $('#mic'));
      else $('#said').onclick = () => { $('#said').disabled = true; correct($('#said'), w); };
    }
  }
  async function doSpeak(w, btn, optional) {
    if (btn.classList.contains('on')) return;
    stopTalk();
    btn.classList.add('on');
    L.lesson.setMood('listen');
    $('#heard').textContent = 'Estou ouvindo...';
    const r = await listen(w.en);
    btn.classList.remove('on');
    L.lesson.setMood('idle');
    if (r.unsupported || r.error === 'not-allowed' || r.error === 'service-not-allowed') {
      $('#heard').textContent = 'Libere o microfone para falar com o Lumi.';
      if (!optional) { setNext(true); }
      return;
    }
    $('#heard').textContent = r.heard ? `Eu ouvi: “${r.heard}”` : 'Não consegui ouvir. Fale mais perto!';
    if (r.ok) {
      L.lesson.celebrate(); if (!LS.cur.miss) award(3, btn);
      setNext(true, 'Próxima →');
      const pr = rnd(PRAISE_EN);
      await say(L.lesson, $('#lesson-bubble'), [[pr, 'en'], ['Você falou', 'pt'], [w.en, 'en'], ['direitinho!', 'pt']], { bubble: `${pr} Você falou “${w.en}” direitinho!` });
      L.lesson.setMood('idle');
    } else {
      LS.cur.tries = (LS.cur.tries || 0) + 1;
      if (LS.cur.tries >= 2 || optional) {
        setNext(true, 'Próxima →');
        L.lesson.hop();
        await say(L.lesson, $('#lesson-bubble'), [['Boa tentativa! Escuta mais uma vez:', 'pt'], [w.en, 'en']]);
      } else {
        L.lesson.encourage();
        await say(L.lesson, $('#lesson-bubble'), [['Quase! Escuta e tenta de novo:', 'pt'], [w.en, 'en']]);
        L.lesson.setMood('idle');
      }
    }
  }
  $('#btn-next').addEventListener('click', nextStep);
  $('#btn-quit').addEventListener('click', () => {
    sheet(`<h2>Sair da aula?</h2><p>Você vai perder o progresso desta aula.</p>
      <div class="row"><button class="btn ghost" data-close>Continuar</button><button class="btn" style="background:var(--red);box-shadow:0 5px 0 var(--redD)" id="quitok">Sair</button></div>`);
    $('#quitok').onclick = () => { closeSheet(); go('home'); };
  });

  function finishLesson() {
    const stars = LS.mistakes <= 1 ? 3 : LS.mistakes <= 3 ? 2 : 1;
    const before = level();
    const u = LS.u, st = S.units[u.id] || {};
    st.done = true; st.stars = Math.max(st.stars || 0, stars);
    st.seenWords = [...new Set([...(st.seenWords || []), ...LS.words.map((w) => w.en)])];
    S.units[u.id] = st;
    S.coins += 20; S.xp += 50; touchStreak(); save();
    $('#result-unit').textContent = u.icon + ' ' + u.name;
    $('#result-coins').textContent = LS.coins + 20;
    $('#result-xp').textContent = 50;
    go('result');
    L.result.paused = false;
    $$('#result-stars span').forEach((s, i) => { s.classList.remove('on'); setTimeout(() => s.classList.toggle('on', i < stars), 400 + i * 350); });
    confetti();
    L.result.celebrate();
    setTimeout(() => L.result.celebrate(), 1300);
    const up = level() > before;
    say(L.result, null, up ? [['Uau! Você subiu para o nível ' + level() + '!', 'pt'], ['Amazing!', 'en']] : [['Aula completa! Você é incrível!', 'pt']], up ? {} : { bubble: `Aula completa! Você é incrível, ${S.name}!` });
  }
  $('#btn-result').addEventListener('click', () => go('home'));
  function confetti() {
    const app = $('#app'), cols = ['#ffc93c', '#2f7bf5', '#ff5b6e', '#2ec27e', '#8a5cff', '#ff9ecf'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + '%'; c.style.background = rnd(cols);
      c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'; c.style.animationDelay = Math.random() * 0.6 + 's';
      app.appendChild(c); setTimeout(() => c.remove(), 4200);
    }
  }

  /* ---------------- REST ---------------- */
  function renderRest() {
    const b = $('#btn-sleep');
    if (S.sleeping) { b.textContent = '☀️ Acordar o Lumi'; b.className = 'btn'; }
    else { b.textContent = '🌙 Colocar o Lumi para dormir'; b.className = 'btn yellow'; }
    $('#rest-hint').textContent = S.sleeping ? (S.energy >= 100 ? 'Energia cheia! Pode acordar o Lumi.' : 'Shhh... o Lumi está recuperando energia.') : 'Dormindo, o Lumi recupera 1 de energia a cada 3 segundos.';
    bind();
  }
  function enterRest() {
    tickSleep();
    L.rest.setMood(S.sleeping ? 'sleep' : 'idle');
    renderRest();
    setTimeout(() => {
      if (current !== 'rest') return;
      if (S.sleeping) { $('#rest-bubble').textContent = 'Zzz...'; return; }
      say(L.rest, $('#rest-bubble'), S.energy < 40 ? [['Estou com sono...', 'pt'], ['I am sleepy!', 'en']] : 'Quando eu ficar cansado, me coloque para dormir aqui.');
    }, 300);
  }
  $('#btn-sleep').addEventListener('click', async () => {
    if (!S.sleeping) {
      S.sleeping = true; S.sleepAt = Date.now(); save();
      await say(L.rest, $('#rest-bubble'), [['Boa noite!', 'pt'], ['Good night!', 'en']]);
      L.rest.setMood('sleep'); $('#rest-bubble').textContent = 'Zzz...';
    } else {
      tickSleep(); S.sleeping = false; save();
      L.rest.setMood('idle'); L.rest.hop();
      say(L.rest, $('#rest-bubble'), [['Bom dia!', 'pt'], ['Good morning!', 'en']]);
    }
    renderRest();
  });

  /* ---------------- SNACK ---------------- */
  function enterSnack() {
    tickSleep();
    if (S.sleeping) { S.sleeping = false; save(); }
    L.snack.setMood('idle');
    $('#foods').innerHTML = D.foods.map((f) => `<div class="food" data-id="${f.id}">
      <div class="em">${f.img}</div><b>${f.en}</b>
      <button class="en" data-say="${f.en}">🔊 ${f.pt}</button>
      <div class="meta"><span>🪙 ${f.price}</span><span style="color:#1c9a5f">+${f.energy} ⚡</span></div>
      <button class="btn sm green" data-feed="${f.id}">Dar</button></div>`).join('');
    setTimeout(() => current === 'snack' && say(L.snack, $('#snack-bubble'), [['Estou com fome!', 'pt'], ["I'm hungry!", 'en']]), 300);
  }
  $('#foods').addEventListener('click', async (e) => {
    const s = e.target.closest('[data-say]');
    if (s) { speak(s.dataset.say, 'en-US', L.snack); return; }
    const b = e.target.closest('[data-feed]'); if (!b) return;
    const f = D.foods.find((x) => x.id === b.dataset.feed);
    if (S.energy >= 100) { say(L.snack, $('#snack-bubble'), 'Estou cheio! Minha energia já está no máximo.'); return; }
    if (S.coins < f.price) { L.snack.encourage(); say(L.snack, $('#snack-bubble'), 'Faltam moedas! Faça uma aula para ganhar mais.'); return; }
    S.coins -= f.price; save();
    // comida voando até a boca
    const app = $('#app').getBoundingClientRect(), from = b.closest('.food').querySelector('.em').getBoundingClientRect(), lumiR = $('#lumi-snack').getBoundingClientRect();
    const fly = document.createElement('div'); fly.className = 'flyfood'; fly.textContent = f.img;
    fly.style.left = from.left - app.left + 'px'; fly.style.top = from.top - app.top + 'px';
    $('#app').appendChild(fly);
    requestAnimationFrame(() => { fly.style.transform = `translate(${lumiR.left + lumiR.width * 0.42 - from.left}px, ${lumiR.top + lumiR.height * 0.42 - from.top}px) scale(.4)`; fly.style.opacity = '0'; });
    setTimeout(() => fly.remove(), 900);
    await wait(650);
    L.snack.eat(2.2);
    S.energy = Math.min(100, S.energy + f.energy); save();
    await say(L.snack, $('#snack-bubble'), [['Yummy!', 'en'], [f.en + '!', 'en'], ['Que delícia!', 'pt']]);
  });

  /* ---------------- SHOP ---------------- */
  let slot = 'head', preview = null;
  function enterShop() {
    tickSleep();
    if (S.sleeping) { S.sleeping = false; save(); }
    preview = null; L.shop.setOutfit(S.outfit); L.shop.setMood('idle');
    renderShop();
    setTimeout(() => current === 'shop' && say(L.shop, $('#shop-bubble'), 'Escolha um acessório para mim!'), 300);
  }
  function renderShop() {
    $$('#shop-tabs .tab').forEach((t) => t.classList.toggle('on', t.dataset.slot === slot));
    $('#shop-items').innerHTML = D.shop[slot].map((it) => {
      const own = S.owned[slot + ':' + it.id], wear = S.outfit[slot] === it.id;
      const tag = wear ? '<span class="tag wear">Usando</span>' : own ? '<span class="tag owned">Usar</span>' : `<span class="tag">🪙 ${it.price}</span>`;
      return `<button class="item ${preview === it.id ? 'sel' : ''}" data-id="${it.id}"><div class="pv">${window.Lumi.accessory(slot, it.id)}</div><b>${it.pt}</b>${tag}</button>`;
    }).join('');
  }
  $('#shop-tabs').addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (!t) return; slot = t.dataset.slot; preview = null; L.shop.setOutfit(S.outfit); renderShop(); });
  $('#shop-items').addEventListener('click', async (e) => {
    const b = e.target.closest('.item'); if (!b) return;
    const it = D.shop[slot].find((x) => x.id === b.dataset.id);
    const key = slot + ':' + it.id;
    if (S.owned[key]) {
      S.outfit[slot] = it.id; save(); dressAll(); preview = null; renderShop();
      L.shop.hop();
      if (it.en) say(L.shop, $('#shop-bubble'), [[it.en + '!', 'en'], ['Ficou lindo!', 'pt']]); else say(L.shop, $('#shop-bubble'), 'Pronto!');
      return;
    }
    if (preview !== it.id) {
      preview = it.id; L.shop.setOutfit(Object.assign({}, S.outfit, { [slot]: it.id })); renderShop(); L.shop.hop();
      say(L.shop, $('#shop-bubble'), [[it.en + '!', 'en'], [`Custa ${it.price} moedas. Toque de novo para comprar.`, 'pt']], { bubble: `${it.en}! Custa ${it.price} moedas. Toque de novo para comprar.` });
      return;
    }
    if (S.coins < it.price) { L.shop.encourage(); say(L.shop, $('#shop-bubble'), 'Ainda faltam moedas. Faça aulas para ganhar mais!'); return; }
    S.coins -= it.price; S.owned[key] = 1; S.outfit[slot] = it.id; save(); dressAll(); preview = null; renderShop();
    L.shop.celebrate();
    say(L.shop, $('#shop-bubble'), [['Obrigado!', 'pt'], ['I love my new ' + it.en.toLowerCase() + '!', 'en']]);
  });

  /* ---------------- modais ---------------- */
  function sheet(html) { $('#sheet').innerHTML = html; $('#modal').classList.add('on'); }
  function closeSheet() { $('#modal').classList.remove('on'); }
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeSheet(); });
  function openTired() {
    go(current === 'map' ? 'map' : 'home');
    sheet(`<h2>O Lumi está cansado 😴</h2><p>Cada aula usa ⚡10 de energia. Coloque o Lumi para dormir ou dê um lanchinho.</p>
      <div class="row"><button class="btn yellow" id="t-sleep">🌙 Dormir</button><button class="btn green" id="t-snack">🍎 Lanche</button></div>`);
    $('#t-sleep').onclick = () => { closeSheet(); go('rest'); };
    $('#t-snack').onclick = () => { closeSheet(); go('snack'); };
  }

  /* ---------------- início ---------------- */
  decorate();
  makeLumis();
  bind();
  enterSplash();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
