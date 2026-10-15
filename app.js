(() => {
'use strict';
const P = window.PLAN;
const KEY = 'shred.v1';
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOWL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- dates ---------- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const diffDays = (a, b) => Math.round((parse(ymd(a)) - parse(ymd(b))) / 864e5);
const nice = s => { const d = parse(s); return `${DOW[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`; };
const mondayOf = d => addDays(d, -((d.getDay()+6)%7));
const today = () => { const q = new URLSearchParams(location.search).get('date'); return q ? parse(q) : new Date(); };

/* ---------- state ---------- */
let S = load();
function load(){
  let s; try { s = JSON.parse(localStorage.getItem(KEY)); } catch(e) {}
  s = s || {};
  s.settings = Object.assign({ start: ymd(mondayOf(today())), rest: 90, sound: true }, s.settings);
  s.days = s.days || {}; s.workouts = s.workouts || []; s.groceries = s.groceries || {}; s.cook = s.cook || {};
  return s;
}
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }
const day = k => (S.days[k] = S.days[k] || { meals: {}, extra: [] });

/* ---------- plan logic ---------- */
function weekNum(d){ const n = diffDays(d, parse(S.settings.start)); return n < 0 ? 0 : Math.floor(n/7)+1; }
function phase(w){ if (w >= 7) return P.ramp[3]; if (w >= 5) return P.ramp[2]; if (w >= 3) return P.ramp[1]; return P.ramp[0]; }
function sessionFor(d){
  const w = Math.max(1, weekNum(d)), dow = d.getDay();
  const e = P.schedule.find(x => x.dow === dow);
  if (!e) return null;
  return w >= e.from ? { id: e.session, ...e } : { id: e.session, locked: true, ...e };
}
function macrosFor(k){
  const rec = S.days[k]; const t = { kcal:0, protein:0, fat:0, carbs:0, sodium:0 };
  if (!rec) return t;
  const plan = P.week[parse(k).getDay()];
  P.mealSlots.forEach(sl => { if (rec.meals && rec.meals[sl.key]) { const m = P.meals[plan[sl.key][0]]; for (const x in t) t[x] += m[x]; } });
  (rec.extra || []).forEach(e => { for (const x in t) t[x] += +e[x] || 0; });
  return t;
}

/* ---------- workouts ---------- */
const exKey = n => n.toLowerCase().replace(/[^a-z0-9]/g, '');
function lastLog(name, beforeDate, excludeId){
  const k = exKey(name);
  const ws = S.workouts.filter(w => w.id !== excludeId && w.date <= beforeDate).sort((a,b) => b.date.localeCompare(a.date) || (b.ts||0)-(a.ts||0));
  for (const w of ws){
    const e = w.exercises.find(x => exKey(x.name) === k);
    if (e && e.sets.some(s => s.done)) return { date: w.date, sets: e.sets.filter(s => s.done) };
  }
  return null;
}
function getWorkout(date, sid, create){
  let w = S.workouts.find(x => x.date === date && x.session === sid);
  if (!w && create){
    const sess = P.sessions[sid];
    w = { id: date + ':' + sid, date, session: sid, ts: Date.now(), exercises: sess.exercises.map(e => {
      const last = lastLog(e.name, date);
      const lw = last ? (last.sets.filter(s => s.weight !== '' && s.weight != null).map(s => s.weight).pop() ?? '') : '';
      return { name: e.name, sets: Array.from({ length: e.sets }, () => ({ done: false, reps: e.reps ?? '', weight: lw })) };
    }) };
    S.workouts.push(w); save();
  }
  return w;
}
function hintFor(ex, last){
  const bw = ex.bodyweight || ex.ab;
  if (ex.ab) {
    const top = 15;
    if (last){ const min = Math.min(...last.sets.map(s => +s.reps || 0)); if (min >= top) return { up:true, t:`You hit ${top}+ on every set last time → add weight (or a harder variation) and reset to ${ex.reps} reps.` }; return { t:`Last: ${last.sets.map(s => s.reps).join(' / ')} reps. Add 1–2 reps per set this week (top of range: 3×15).` }; }
    return { t:'Ab rule: progress to 3×15, then add weight.' };
  }
  if (!last) return { t: ex.reps ? `First log: pick a weight you can do for ${ex.target} with 1–2 reps left in the tank.` : 'First log: go to technical failure on each set.' };
  const ws = last.sets.map(s => +s.weight || 0), w = Math.max(...ws);
  const allHit = ex.reps ? last.sets.length >= ex.sets && last.sets.every(s => (+s.reps || 0) >= ex.reps) : false;
  if (allHit && !bw) return { up:true, t:`Last time (${nice(last.date)}) you hit all ${ex.sets}×${ex.reps} at ${w} lb → try ${w + (w >= 100 ? 5 : 2.5)} lb today.` };
  if (!ex.reps) return { t:`Last: ${last.sets.map(s => s.reps || '✓').join(' / ')} reps${w ? ' @ ' + w + ' lb' : ''}. Beat at least one set.` };
  return { t:`Last (${nice(last.date)}): ${last.sets.map(s => (s.reps || '✓')).join(' / ')}${w ? ' @ ' + w + ' lb' : ''}. Stay here until you hit all ${ex.sets}×${ex.reps}.` };
}

/* ---------- ui helpers ---------- */
function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 1800); }
function ring(size, stroke, pct, color, inner){
  const r = (size - stroke)/2, c = 2*Math.PI*r, off = c * (1 - Math.min(1, Math.max(0, pct)));
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle class="bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${stroke}"/><circle class="fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${stroke}" stroke="${color}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${off}"/></svg><div class="ctr">${inner}</div></div>`;
}
function animateRings(root){ requestAnimationFrame(() => requestAnimationFrame(() => { $$('.fg[data-off]', root).forEach(c => c.style.strokeDashoffset = c.dataset.off); $$('.bar>i[data-w]', root).forEach(b => b.style.width = b.dataset.w); })); }
const fmt = n => Math.round(n).toLocaleString();
function setHeader(kicker, title){ $('#tbKicker').textContent = kicker; $('#tbTitle').textContent = title; }

/* ---------- views ---------- */
const views = {};
let wState = { sid: null, date: null };
let mealDay = null;

views.today = () => {
  const d = today(), k = ymd(d), w = weekNum(d), ph = phase(Math.max(1,w)), sess = sessionFor(d);
  setHeader(`${DOWL[d.getDay()]} · ${MON[d.getMonth()]} ${d.getDate()}`, 'Today');
  const rec = day(k), m = macrosFor(k), T = P.targets, plan = P.week[d.getDay()];
  const wk = w === 0 ? `Starts ${nice(S.settings.start)}` : `Week ${w} · ${ph.weeks}`;
  let sessHtml;
  if (sess && !sess.locked){
    const s = P.sessions[sess.id], wo = getWorkout(k, sess.id, false);
    const tot = s.exercises.reduce((a,e) => a + e.sets, 0), dn = wo ? wo.exercises.reduce((a,e) => a + e.sets.filter(x => x.done).length, 0) : 0;
    sessHtml = `<div class="chips"><span class="chip lime">${s.emoji} Lift day</span><span class="chip">${s.exercises.length} exercises · ${tot} sets</span>${sess.assumed ? '<span class="chip amber">Day assumed</span>' : ''}</div>
      <div class="big">${esc(s.name)}</div>
      <div class="muted small">EōS Anaheim · ~60 min · leave Oceanside ~5:00 PM</div>
      <div class="progress-line"><i style="width:${tot ? dn/tot*100 : 0}%"></i></div>
      <div class="row between" style="margin-top:14px"><span class="small muted">${dn}/${tot} sets done</span><a class="btn primary sm" href="#workout">${dn ? 'Continue' : 'Start workout'} →</a></div>`;
  } else {
    const isSun = d.getDay() === 0;
    const extra = w >= 3 && (d.getDay() === 2 || d.getDay() === 4) ? ' Good slot for the 25-min incline walk.' : '';
    sessHtml = `<div class="chips"><span class="chip cyan">${isSun ? '🧘 Rest' : '🚶 Recovery'}</span>${sess && sess.locked ? `<span class="chip">${esc(P.sessions[sess.id].name)} unlocks week ${sess.from}</span>` : ''}</div>
      <div class="big">${isSun ? 'Rest / meal prep' : 'No lift today'}</div>
      <div class="muted small">${isSun ? 'Sunday main prep ≈2–2¼ hr. Hit your steps.' : 'Lunch walk 20–30 min + 8–10k steps.' + extra}</div>
      ${isSun || d.getDay() === 2 || d.getDay() === 6 ? `<div class="row" style="margin-top:14px"><a class="btn sm" href="#cook">Open cook plan →</a></div>` : ''}`;
  }
  const kp = m.kcal / T.kcal;
  const mini = [['Protein', m.protein, T.protein, 'g', 'var(--cyan)'], ['Carbs', m.carbs, T.carbs, 'g', 'var(--amber)'], ['Fat', m.fat, T.fat, 'g', 'var(--violet)']];
  const steps = +rec.steps || 0;
  return `<div class="stagger">
  <section class="card hero"><div class="row between" style="margin-bottom:10px"><span class="tiny muted" style="font-weight:700;letter-spacing:.06em;text-transform:uppercase">${wk}</span><span class="tiny dim">${ph.lift} lift days/wk</span></div>${sessHtml}</section>

  <section class="card"><h2>Fuel</h2>
    <div class="rings">
      ${ring(150, 14, kp, 'url(#gl)', `<b>${fmt(m.kcal)}</b><span>of ${fmt(T.kcal)} kcal</span>`)}
      <div class="minirings">${mini.map(([l,v,t,u,c]) => `<div class="mr">${ring(44, 6, v/t, c, `<b>${Math.round(v/t*100)}%</b>`)}<div><div class="lbl">${l}</div><div class="val">${Math.round(v)} / ${t} ${u}</div></div></div>`).join('')}</div>
    </div>
    <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c6ff5a"/><stop offset="1" stop-color="#38e1ff"/></linearGradient></defs></svg>
    <div style="margin-top:16px"><div class="row between small" style="margin-bottom:6px"><span class="muted">Sodium</span><span><b>${fmt(m.sodium)}</b> <span class="dim">/ ${fmt(T.sodium)} mg</span></span></div><div class="bar"><i data-w="${Math.min(100, m.sodium/T.sodium*100)}%" style="background:var(--pink)"></i></div></div>
  </section>

  <section class="card"><div class="row between"><h2 style="margin:0">Today's meals</h2><a class="small" style="color:var(--lime);font-weight:700" href="#meals">Week plan</a></div>
    <div style="margin-top:6px">${P.mealSlots.map(sl => { const [code, note] = plan[sl.key], ml = P.meals[code], on = rec.meals[sl.key];
      return `<div class="item tap ${on ? 'on' : ''}" data-meal="${sl.key}"><div class="check">${CHECK}</div><div class="grow"><div class="t">${esc(ml.name)}</div><div class="s">${sl.label}${note ? ' · ' + esc(note) : ''}</div></div><div class="kc"><b>${ml.kcal}</b><span>${ml.protein} g P</span></div></div>`; }).join('')}
    ${(rec.extra||[]).map((e,i) => `<div class="item"><div class="badge a">+</div><div class="grow"><div class="t">${esc(e.label || 'Extra')}</div><div class="s">${e.protein||0} g P · ${e.carbs||0} g C · ${e.fat||0} g F</div></div><div class="kc"><b>${e.kcal||0}</b><button class="tiny dim" data-delextra="${i}">remove</button></div></div>`).join('')}
    </div>
    <button class="btn sm ghost" id="addExtra" style="margin-top:8px;padding:0;color:var(--mut)">+ Log something extra</button>
  </section>

  <section class="card"><h2>Quick log</h2>
    <div class="inp-row">
      <div class="field"><label>Morning weight (lb)</label><input class="inp" id="qWeight" type="number" inputmode="decimal" step="0.1" placeholder="—" value="${rec.weight ?? ''}"></div>
      <div class="field"><label>Steps</label><input class="inp" id="qSteps" type="number" inputmode="numeric" placeholder="0" value="${rec.steps ?? ''}"></div>
    </div>
    <div style="margin-top:14px"><div class="row between small" style="margin-bottom:6px"><span class="muted">Steps goal 8–10k</span><span><b>${fmt(steps)}</b> <span class="dim">/ 10,000</span></span></div><div class="bar"><i data-w="${Math.min(100, steps/10000*100)}%" style="background:linear-gradient(90deg,var(--cyan),var(--lime))"></i></div></div>
    <div class="chips" style="margin-top:12px">${[1000,2500,5000].map(n => `<button class="chip" data-addsteps="${n}">+${n/1000}k steps</button>`).join('')}</div>
    <button class="btn primary block" id="qSave" style="margin-top:14px">Save</button>
  </section>
  </div>`;
};
views.today.bind = root => {
  const k = ymd(today()), rec = day(k);
  $$('[data-meal]', root).forEach(el => el.onclick = () => { rec.meals[el.dataset.meal] = !rec.meals[el.dataset.meal]; save(); render(true); });
  $$('[data-delextra]', root).forEach(el => el.onclick = () => { rec.extra.splice(+el.dataset.delextra, 1); save(); render(true); });
  $$('[data-addsteps]', root).forEach(el => el.onclick = () => { const i = $('#qSteps'); i.value = (+i.value || 0) + +el.dataset.addsteps; });
  $('#qSave', root).onclick = () => {
    const w = $('#qWeight').value, st = $('#qSteps').value;
    rec.weight = w === '' ? undefined : +w; rec.steps = st === '' ? undefined : +st; save(); toast('Logged ✓'); render(true);
  };
  $('#addExtra', root).onclick = () => openSheet(`<h3>Log extra food</h3><p class="muted small">Anything off-plan (label macros are fine).</p>
    <div class="grp"><div class="field"><label>What</label><input class="inp" id="xL" placeholder="e.g. Protein bar" style="font-size:16px;font-weight:600"></div></div>
    <div class="grp inp-row"><div class="field"><label>kcal</label><input class="inp" id="xK" type="number" inputmode="numeric"></div><div class="field"><label>Protein g</label><input class="inp" id="xP" type="number" inputmode="decimal"></div></div>
    <div class="grp inp-row"><div class="field"><label>Carbs g</label><input class="inp" id="xC" type="number" inputmode="decimal"></div><div class="field"><label>Fat g</label><input class="inp" id="xF" type="number" inputmode="decimal"></div><div class="field"><label>Sodium mg</label><input class="inp" id="xN" type="number" inputmode="numeric"></div></div>
    <div class="grp"><button class="btn primary block" id="xSave">Add</button></div>`, sh => {
      $('#xSave', sh).onclick = () => { rec.extra.push({ label: $('#xL').value, kcal: +$('#xK').value||0, protein: +$('#xP').value||0, carbs: +$('#xC').value||0, fat: +$('#xF').value||0, sodium: +$('#xN').value||0 }); save(); closeSheet(); render(true); };
    });
};

views.workout = () => {
  const d = today(), k = ymd(d), sess = sessionFor(d);
  if (!wState.sid || wState.date !== k){ wState = { sid: sess && !sess.locked ? sess.id : null, date: k }; }
  const w = Math.max(1, weekNum(d));
  const order = ['chest-shoulders','back-abs','legs-arm','chest-abs','back','legs-arms'];
  const picker = `<div class="hscroll">${order.map(id => { const s = P.sessions[id], sch = P.schedule.find(x => x.session === id), lk = w < sch.from;
    return `<button class="spill ${wState.sid === id ? 'sel' : ''}" data-sid="${id}">${s.emoji} ${esc(s.name)} <span class="lk">${lk ? '🔒 wk' + sch.from : DOW[sch.dow]}</span></button>`; }).join('')}</div>`;
  if (!wState.sid){
    setHeader(`${DOWL[d.getDay()]} · Week ${w}`, 'Workout');
    return `${picker}<div class="card empty"><div class="e">${d.getDay() === 0 ? '🧘' : '🚶'}</div><div style="font-weight:700;font-size:18px;color:var(--txt)">No lift scheduled today</div><p class="small">Pick any session above to train anyway, or hit your lunch walk & steps.</p></div>`;
  }
  const s = P.sessions[wState.sid], wo = getWorkout(k, wState.sid, true);
  const sch = P.schedule.find(x => x.session === wState.sid);
  setHeader(`${DOW[d.getDay()]} · Week ${w} · ${phase(w).weeks}`, s.name);
  const tot = s.exercises.reduce((a,e) => a + e.sets, 0), dn = wo.exercises.reduce((a,e) => a + e.sets.filter(x => x.done).length, 0);
  return `${picker}
  ${dn === tot ? `<div class="done-banner">🏆 Session complete. Nice work — log your steps & dinner.</div>` : ''}
  <div class="card pad-s"><div class="row between"><div><div class="tiny muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.08em">Progress</div><div style="font-size:20px;font-weight:800;margin-top:2px">${dn} / ${tot} sets</div></div><div class="chips"><span class="chip">Rest ${S.settings.rest}s</span>${sch.assumed ? '<span class="chip amber">Day TBD in Notion</span>' : ''}</div></div><div class="progress-line"><i style="width:${dn/tot*100}%"></i></div>
  ${s.progression ? `<p class="small muted" style="margin:12px 0 0;line-height:1.45"><b style="color:var(--txt)">Progression:</b> ${esc(s.progression)}</p>` : `<p class="small muted" style="margin:12px 0 0;line-height:1.45"><b style="color:var(--txt)">Dashboard ab rule:</b> ${esc(P.abRule.replace(/^Ab work 3x\/week: /,''))}</p>`}</div>
  <div class="stagger">${s.exercises.map((ex, i) => {
    const log = wo.exercises[i], last = lastLog(ex.name, k, wo.id), h = hintFor(ex, last), exDone = log.sets.every(x => x.done);
    const lastTxt = last ? `Last ${nice(last.date)}: ${last.sets.map(x => (x.weight ? x.weight + '×' : '') + (x.reps || '✓')).join(', ')}` : 'No previous log';
    return `<section class="card ex ${exDone ? 'done' : ''}" data-ex="${i}"><span class="ex-num">${exDone ? '✓ ' : ''}${i+1}/${s.exercises.length}</span>
      <div class="ex-head">${ex.img ? `<img class="ex-img tap" loading="lazy" src="assets/demos/${ex.img}" alt="${esc(ex.name)} demo" data-zoom="${ex.img}" data-cap="${esc(ex.name)}">` : `<div class="ex-img none">${ex.ab ? '🔥' : '🏋️'}</div>`}
      <div class="grow"><div class="ex-name">${esc(ex.name)}</div><div class="ex-meta"><span class="chip lime">${esc(ex.target)}</span>${ex.note ? `<span class="chip amber">${esc(ex.note)}</span>` : ''}</div><div class="tiny dim" style="margin-top:7px">${esc(lastTxt)}</div></div></div>
      <div class="hint ${h.up ? 'up' : ''}">${h.up ? '⬆︎ ' : '💡 '}${esc(h.t)}</div>
      <div class="sets"><div class="sets-h"><span>Set</span><span>${ex.bodyweight ? '+lb' : 'lb'}</span><span>Reps</span><span>Done</span></div>
      ${log.sets.map((st, j) => `<div class="set ${st.done ? 'on' : ''}" data-set="${j}"><span class="n">${j+1}</span>
        <div class="unit" data-u="lb"><input class="inp" type="number" inputmode="decimal" step="0.5" data-f="weight" value="${st.weight ?? ''}" placeholder="${ex.bodyweight ? 'BW' : '—'}"></div>
        <div class="unit" data-u="reps"><input class="inp" type="number" inputmode="numeric" data-f="reps" value="${st.reps ?? ''}" placeholder="${ex.reps ? ex.reps : 'max'}"></div>
        <button class="set-btn" aria-label="Complete set ${j+1}">${CHECK}</button></div>`).join('')}</div>
    </section>`; }).join('')}</div>
  <p class="tiny dim" style="text-align:center;margin:6px 0 0">Weights auto-fill from your last log of each exercise. Demo images from your Notion workout pages.</p>`;
};
views.workout.bind = root => {
  $$('[data-sid]', root).forEach(b => b.onclick = () => { wState.sid = b.dataset.sid; render(true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $$('[data-zoom]', root).forEach(im => im.onclick = () => { const lb = $('#lightbox'); $('img', lb).src = 'assets/demos/' + im.dataset.zoom; $('.lb-cap', lb).textContent = im.dataset.cap; lb.classList.remove('hidden'); });
  if (!wState.sid) return;
  const wo = getWorkout(ymd(today()), wState.sid, true);
  $$('[data-ex]', root).forEach(card => {
    const i = +card.dataset.ex;
    $$('[data-set]', card).forEach(row => {
      const j = +row.dataset.set, st = wo.exercises[i].sets[j];
      $$('input', row).forEach(inp => inp.onchange = () => {
        st[inp.dataset.f] = inp.value === '' ? '' : +inp.value;
        if (inp.dataset.f === 'weight') { // carry weight forward to later, not-yet-done sets
          wo.exercises[i].sets.forEach((x, q) => { if (q > j && !x.done) { x.weight = st.weight; const el = $(`[data-set="${q}"] [data-f=weight]`, card); if (el) el.value = st.weight; } });
        }
        save();
      });
      $('.set-btn', row).onclick = () => {
        st.done = !st.done; st.weight = $('[data-f=weight]', row).value === '' ? '' : +$('[data-f=weight]', row).value; st.reps = $('[data-f=reps]', row).value === '' ? '' : +$('[data-f=reps]', row).value;
        save(); if (navigator.vibrate) navigator.vibrate(st.done ? 18 : 8);
        if (st.done) startTimer(S.settings.rest);
        const y = window.scrollY; render(false); window.scrollTo(0, y);
      };
    });
  });
};

views.meals = () => {
  const d = today(); if (mealDay === null) mealDay = d.getDay();
  const plan = P.week[mealDay];
  setHeader('7-day plan · ≈2,000 kcal / 175 g', 'Meals');
  const sum = P.mealSlots.reduce((a, sl) => a + P.meals[plan[sl.key][0]].kcal, 0);
  return `<div class="days">${[1,2,3,4,5,6,0].map(i => `<button class="${i === mealDay ? 'sel' : ''} ${i === d.getDay() ? 'today' : ''}" data-day="${i}">${DOW[i]}<i>${P.week[i].tag ? P.week[i].tag.split(' ')[0] : '·'}</i></button>`).join('')}</div>
  <div class="stagger">
  <section class="card"><div class="row between"><h2 style="margin:0">${DOWL[mealDay]}</h2>${plan.tag ? `<span class="chip">${esc(plan.tag)}</span>` : ''}</div>
    <div style="margin-top:8px">${P.mealSlots.map(sl => { const [code, note] = plan[sl.key], m = P.meals[code];
      return `<div class="meal"><div class="badge ${code[0] === 'L' ? 'c' : code[0] === 'D' ? 'v' : code === 'S' ? 'a' : ''}">${code}</div><div class="grow"><div class="slot">${sl.label}${sl.time ? ' · ' + sl.time : ''}</div><div class="t">${esc(m.name)}</div>
        <div class="s">${esc(m.what)}</div>${note ? `<span class="chip cyan note">${esc(note)}</span>` : ''}
        <div class="macros"><span><b>${m.kcal}</b> kcal</span><span><b>${m.protein}</b> g P</span><span><b>${m.fat}</b> g F</span><span><b>${m.carbs}</b> g C</span><span><b>${m.sodium}</b> mg Na</span></div></div></div>`; }).join('')}</div>
    <div class="total"><span>Day total (approx.)<br><span class="tiny dim">${esc(plan.total)}</span></span><b>${fmt(sum)}</b></div>
  </section>
  <div class="callout lime"><b>How this works.</b> ${esc(P.mealsHow)}</div>
  <h3 class="sec-h">Meal library <small>per serving, approx.</small></h3>
  <section class="card pad-s">${Object.values(P.meals).map(m => `<details class="lib"><summary><div class="badge ${m.code[0] === 'L' ? 'c' : m.code[0] === 'D' ? 'v' : m.code === 'S' ? 'a' : ''}">${m.code}</div><div class="grow"><div style="font-weight:700">${esc(m.name)}</div><div class="tiny muted">${m.protein} g P · ${m.fat} g F · ${m.carbs} g C · ${m.sodium} mg Na</div></div><div class="kc"><b>${m.kcal}</b><span>kcal</span></div></summary><p>${esc(m.what)}</p></details>`).join('')}</section>
  <div class="callout"><b>Weekly average:</b> ${esc(P.weeklyAvg)}</div>
  </div>`;
};
views.meals.bind = root => { $$('[data-day]', root).forEach(b => b.onclick = () => { mealDay = +b.dataset.day; render(true); }); };

views.groceries = () => {
  const all = P.groceries.flatMap(g => g.items.map(it => g.cat + '|' + it[0]));
  const n = all.filter(k => S.groceries[k]).length;
  setHeader('Weekly list · 1 person, 7 days', 'Groceries');
  return `<section class="card pad-s"><div class="row between"><div><div style="font-size:22px;font-weight:800">${n} / ${all.length}</div><div class="tiny muted">items in the cart</div></div><button class="btn sm" id="gReset">Reset list</button></div><div class="progress-line"><i style="width:${n/all.length*100}%"></i></div></section>
  <div class="stagger">${P.groceries.map(g => `<h3 class="sec-h">${esc(g.cat)} ${g.note ? `<small>${esc(g.note)}</small>` : `<small>${g.items.filter(it => S.groceries[g.cat + '|' + it[0]]).length}/${g.items.length}</small>`}</h3>
    <section class="card pad-s">${g.items.map(it => { const k = g.cat + '|' + it[0]; return `<div class="g-item tap ${S.groceries[k] ? 'on' : ''}" data-g="${esc(k)}"><div class="check">${CHECK}</div><div class="grow"><div class="t">${esc(it[0])}</div>${it[1] ? `<div class="q">${esc(it[1])}</div>` : ''}${it[2] ? `<div class="s">${esc(it[2])}</div>` : ''}</div></div>`; }).join('')}</section>`).join('')}</div>`;
};
views.groceries.bind = root => {
  $$('[data-g]', root).forEach(el => el.onclick = () => { const k = el.dataset.g; S.groceries[k] = !S.groceries[k]; save(); if (navigator.vibrate) navigator.vibrate(8); const y = scrollY; render(false); scrollTo(0, y); });
  $('#gReset', root).onclick = () => { if (confirm('Uncheck every grocery item?')) { S.groceries = {}; save(); render(true); } };
};

views.cook = () => {
  const d = today(), dow = d.getDay();
  const nextId = [...P.cook].sort((a, b) => ((a.dow - dow + 7) % 7) - ((b.dow - dow + 7) % 7))[0].id;
  const wk = ymd(addDays(d, -dow)); // week key (Sunday)
  const done = S.cook[wk] || {};
  setHeader('Sun · Tue · Sat', 'Cook');
  return `<div class="stagger"><div class="callout cyan"><b>Summary.</b> ${esc(P.cookSummary)}</div>
  ${P.cook.map(c => { const n = c.steps.filter((_, i) => done[c.id + i]).length, isNext = c.id === nextId, isToday = c.dow === dow;
    return `<section class="card cook-card ${isNext ? 'next' : ''}"><div class="row between"><div><div class="tiny" style="color:${isNext ? 'var(--lime)' : 'var(--dim)'};font-weight:800;letter-spacing:.08em;text-transform:uppercase">${isToday ? 'Today' : isNext ? 'Up next · ' + DOWL[c.dow] : DOWL[c.dow]}</div><div style="font-size:20px;font-weight:800;margin-top:3px">${esc(c.title)}</div><div class="small muted" style="margin-top:2px">${esc(c.dur)}</div></div><span class="chip ${n === c.steps.length ? 'lime' : ''}">${n}/${c.steps.length}</span></div>
      <div style="margin-top:10px">${c.steps.map((st, i) => `<div class="step tap ${done[c.id + i] ? 'on' : ''}" data-step="${c.id + i}"><div class="check ${done[c.id + i] ? 'on' : ''}">${CHECK}</div><div class="tm">${esc(st[0] || '•')}</div><div class="tx">${esc(st[1])}</div></div>`).join('')}</div></section>`; }).join('')}
  <div class="callout amber"><b>⏰ Daily rhythm.</b> ${esc(P.rhythm)}</div></div>`;
};
views.cook.bind = root => {
  const d = today(), wk = ymd(addDays(d, -d.getDay()));
  $$('[data-step]', root).forEach(el => el.onclick = () => { const m = S.cook[wk] = S.cook[wk] || {}; m[el.dataset.step] = !m[el.dataset.step]; save(); const y = scrollY; render(false); scrollTo(0, y); });
};

function weightSeries(){
  return Object.keys(S.days).filter(k => S.days[k].weight).sort().map(k => ({ k, w: +S.days[k].weight }));
}
function avg7(series, k){ const end = parse(k), start = addDays(end, -6); const xs = series.filter(p => { const d = parse(p.k); return d >= start && d <= end; }); return xs.length ? xs.reduce((a, p) => a + p.w, 0) / xs.length : null; }
function chart(series){
  if (series.length < 1) return `<div class="empty"><div class="e">⚖️</div>Log your morning weight on the Today tab to see the trend.</div>`;
  const W = 358, H = 200, pl = 34, pr = 10, pt = 12, pb = 24;
  const first = parse(series[0].k), last = parse(series[series.length - 1].k);
  const span = Math.max(6, diffDays(last, first));
  const avgs = series.map(p => ({ k: p.k, a: avg7(series, p.k) }));
  const vals = series.map(p => p.w).concat(avgs.map(p => p.a));
  let lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
  const x = k => pl + diffDays(parse(k), first) / span * (W - pl - pr), y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  const step = Math.max(1, Math.round((hi - lo) / 4));
  let g = ''; for (let v = lo; v <= hi; v += step) g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${pl - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`;
  const path = avgs.map((p, i) => (i ? 'L' : 'M') + x(p.k).toFixed(1) + ',' + y(p.a).toFixed(1)).join('');
  const area = path + `L${x(avgs[avgs.length - 1].k).toFixed(1)},${H - pb}L${x(avgs[0].k).toFixed(1)},${H - pb}Z`;
  const lbls = [series[0].k, series[series.length - 1].k].map((k, i) => `<text class="axis" x="${x(k)}" y="${H - 6}" text-anchor="${i ? 'end' : 'start'}">${MON[parse(k).getMonth()]} ${parse(k).getDate()}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c6ff5a" stop-opacity=".28"/><stop offset="1" stop-color="#c6ff5a" stop-opacity="0"/></linearGradient></defs>${g}
    <path d="${area}" fill="url(#ga)"/><path d="${path}" fill="none" stroke="#c6ff5a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="draw"/>
    ${series.map(p => `<circle cx="${x(p.k)}" cy="${y(p.w)}" r="3" fill="#0b0c10" stroke="#38e1ff" stroke-width="1.6"/>`).join('')}${lbls}</svg>
    <div class="legend"><span><i style="background:#c6ff5a"></i>7-day average</span><span><i style="background:#38e1ff"></i>Daily weigh-in</span></div>`;
}
views.progress = () => {
  const d = today(), k = ymd(d), T = P.targets, ser = weightSeries();
  setHeader('Weekly average > daily scale', 'Progress');
  const cur = avg7(ser, k), prev = avg7(ser, ymd(addDays(d, -7))), prev2 = avg7(ser, ymd(addDays(d, -14)));
  const startW = ser.length ? ser[0].w : null, latest = ser.length ? ser[ser.length - 1].w : null;
  const dlt = cur != null && prev != null ? cur - prev : null;
  const stall = cur != null && prev2 != null && cur >= prev2 - 0.1;
  const keys = [...new Set([...Object.keys(S.days), ...S.workouts.map(w => w.date)])].sort().reverse().slice(0, 30);
  const w = weekNum(d);
  return `<div class="stagger">
  <div class="stats"><div class="stat"><span>Latest</span><b>${latest ?? '—'}</b><span class="dim">lb</span></div><div class="stat"><span>7-day avg</span><b>${cur != null ? cur.toFixed(1) : '—'}</b><span class="d ${dlt == null ? 'dim' : dlt <= 0 ? 'down' : 'up'}">${dlt == null ? 'vs last wk: —' : (dlt <= 0 ? '▼ ' : '▲ ') + Math.abs(dlt).toFixed(1) + ' lb/wk'}</span></div><div class="stat"><span>Total</span><b>${startW != null && latest != null ? (latest - startW > 0 ? '+' : '') + (latest - startW).toFixed(1) : '—'}</b><span class="dim">lb since start</span></div></div>
  ${stall ? `<div class="callout amber"><b>⚠️ Weekly average hasn't dropped in 2 weeks.</b> Plan rule: add a cardio session before cutting food.</div>` : ''}
  <section class="card"><h2>Weight trend</h2>${chart(ser)}</section>
  <div class="callout lime"><b>Rule.</b> ${esc(P.rule)} <span class="muted">${esc(P.weighIn)}</span></div>
  <h3 class="sec-h">Daily targets</h3>
  <section class="card pad-s"><div class="tg"><div><b>${fmt(T.kcal)}</b><span>kcal</span></div><div><b>${T.protein} g</b><span>protein</span></div><div><b>${T.fat} g</b><span>fat</span></div><div><b>${T.carbs} g</b><span>carbs</span></div><div><b>${fmt(T.sodium)}</b><span>mg sodium</span></div><div><b>8–10k</b><span>steps</span></div></div></section>
  <h3 class="sec-h">Training ramp <small>you're in week ${w || '—'}</small></h3>
  <section class="card pad-s"><table class="ramp">${P.ramp.map((r, i) => `<tr class="${i < 4 && phase(Math.max(1, w)) === r ? 'cur' : ''}"><td>${r.weeks}</td><td>${r.lift ? r.lift + ' days' : '—'}</td><td>${esc(r.split)}${r.extras ? `<div class="tiny dim">${esc(r.extras)}</div>` : ''}</td></tr>`).join('')}</table></section>
  <h3 class="sec-h">History <small>last 30 entries</small></h3>
  <section class="card pad-s">${keys.length ? `<div class="hist h"><span>Date</span><span>Weight</span><span>Steps</span><span>kcal / P</span></div>` + keys.map(kk => { const r = S.days[kk] || {}, m = macrosFor(kk), wo = S.workouts.filter(x => x.date === kk && x.exercises.some(e => e.sets.some(s => s.done)));
    return `<div class="hist-row"><div class="hist"><span class="dt">${nice(kk).slice(4)}<div class="tiny dim">${DOW[parse(kk).getDay()]}</div></span><span>${r.weight ? r.weight + ' lb' : '<span class="dim">—</span>'}</span><span>${r.steps ? fmt(r.steps) : '<span class="dim">—</span>'}</span><span>${m.kcal ? fmt(m.kcal) + ' / ' + Math.round(m.protein) + 'g' : '<span class="dim">—</span>'}</span></div>${wo.map(x => `<div class="tiny" style="color:var(--lime);margin-top:4px">🏋️ ${esc(P.sessions[x.session].name)} · ${x.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0)} sets</div>`).join('')}</div>`; }).join('') : '<div class="empty">No logs yet.</div>'}</section>
  <h3 class="sec-h">Export</h3>
  <section class="card pad-s"><div class="sheet btns" style="all:unset;display:grid;grid-template-columns:1fr 1fr;gap:10px"><button class="btn" data-exp="json">⬇︎ JSON</button><button class="btn" data-exp="csv">⬇︎ CSV</button></div><p class="tiny dim" style="margin:10px 2px 0">CSV includes a daily log and a set-by-set workout log. Settings has import & start date.</p></section>
  </div>`;
};
views.progress.bind = root => { $$('[data-exp]', root).forEach(b => b.onclick = () => exportData(b.dataset.exp)); };

/* ---------- export / import ---------- */
function download(name, text, type){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const csvCell = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
function exportData(kind){
  const stamp = ymd(new Date());
  if (kind === 'json') { download(`shred-logs-${stamp}.json`, JSON.stringify({ app: 'shred', version: 1, exported: new Date().toISOString(), ...S }, null, 2), 'application/json'); toast('JSON exported'); return; }
  const rows = [['type','date','weekday','week','weight_lb','steps','kcal','protein_g','fat_g','carbs_g','sodium_mg','meals_eaten','session','exercise','set','weight_set_lb','reps','done']];
  Object.keys(S.days).sort().forEach(k => { const r = S.days[k], m = macrosFor(k); rows.push(['day', k, DOW[parse(k).getDay()], weekNum(parse(k)), r.weight ?? '', r.steps ?? '', m.kcal, m.protein, m.fat, m.carbs, m.sodium, Object.keys(r.meals || {}).filter(x => r.meals[x]).join(' '), '', '', '', '', '', '']); });
  [...S.workouts].sort((a, b) => a.date.localeCompare(b.date)).forEach(w => w.exercises.forEach(e => e.sets.forEach((s, i) => rows.push(['set', w.date, DOW[parse(w.date).getDay()], weekNum(parse(w.date)), '', '', '', '', '', '', '', '', P.sessions[w.session].name, e.name, i + 1, s.weight, s.reps, s.done ? 1 : 0]))));
  download(`shred-logs-${stamp}.csv`, rows.map(r => r.map(csvCell).join(',')).join('\n'), 'text/csv'); toast('CSV exported');
}

/* ---------- settings sheet ---------- */
function openSettings(){
  openSheet(`<h3>Settings</h3><p class="muted small">Everything is stored on this device only.</p>
  <div class="grp"><div class="field"><label>Plan start date (week 1, day 1)</label><input class="inp" type="date" id="stStart" value="${S.settings.start}"></div><p class="tiny dim" style="margin:6px 2px 0">Today is week ${weekNum(today()) || '0 (not started)'}. The ramp unlocks Sat Chest/Abs in week 3, Thu Back in week 5, Legs/Arms in week 7.</p></div>
  <div class="grp"><div class="field"><label>Rest timer (seconds)</label><div class="chips" id="stRest">${[60,90,120,150,180].map(n => `<button class="chip ${S.settings.rest === n ? 'lime' : ''}" data-r="${n}" style="height:40px;padding:0 16px">${n}s</button>`).join('')}</div></div></div>
  <div class="grp"><label class="small muted" style="font-weight:600">Data</label><div class="btns" style="margin-top:6px"><button class="btn sm" data-exp="json">Export JSON</button><button class="btn sm" data-exp="csv">Export CSV</button><button class="btn sm" id="stImport">Import JSON</button><button class="btn sm danger" id="stReset">Erase all</button></div><input type="file" id="stFile" accept="application/json,.json" hidden></div>
  <div class="grp"><button class="btn primary block" id="stDone">Done</button></div>
  <p class="tiny dim" style="text-align:center;margin-top:14px">Plan content copied from your Notion Health Dashboard · Shred v1</p>`, sh => {
    $('#stStart', sh).onchange = e => { if (e.target.value) { S.settings.start = e.target.value; save(); toast('Start date set'); } };
    $$('[data-r]', sh).forEach(b => b.onclick = () => { S.settings.rest = +b.dataset.r; save(); $$('[data-r]', sh).forEach(x => x.classList.toggle('lime', x === b)); });
    $$('[data-exp]', sh).forEach(b => b.onclick = () => exportData(b.dataset.exp));
    $('#stImport', sh).onclick = () => $('#stFile', sh).click();
    $('#stFile', sh).onchange = async e => { try { const j = JSON.parse(await e.target.files[0].text()); ['settings','days','workouts','groceries','cook'].forEach(k => { if (j[k]) S[k] = j[k]; }); save(); toast('Imported ✓'); closeSheet(); render(true); } catch (err) { alert('Could not import: ' + err.message); } };
    $('#stReset', sh).onclick = () => { if (confirm('Erase all logs on this device? Export first if unsure.')) { localStorage.removeItem(KEY); S = load(); save(); closeSheet(); render(true); } };
    $('#stDone', sh).onclick = () => { closeSheet(); render(true); };
  });
}
function openSheet(html, bind){ const w = $('#sheet'); $('#sheetBody').innerHTML = html; w.classList.remove('hidden'); bind && bind($('#sheetBody')); }
function closeSheet(){ $('#sheet').classList.add('hidden'); }

/* ---------- rest timer ---------- */
let tEnd = 0, tTotal = 0, tInt = null, actx = null;
function startTimer(sec){
  tTotal = sec; tEnd = Date.now() + sec * 1000; const el = $('#timer'); el.classList.remove('hidden', 'done');
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
  clearInterval(tInt); tick(); tInt = setInterval(tick, 250);
}
function tick(){
  const left = Math.max(0, Math.round((tEnd - Date.now()) / 1000)), el = $('#timer');
  $('#timerTime').textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  $('#timerArc').style.strokeDashoffset = 119.4 * (1 - left / Math.max(1, tTotal));
  if (left <= 0 && !el.classList.contains('done')) {
    el.classList.add('done'); $('.timer-label').textContent = 'Go!'; if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    if (actx) { [0, .18, .36].forEach(t => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.0001, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(.3, actx.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + t + .15); o.connect(g).connect(actx.destination); o.start(actx.currentTime + t); o.stop(actx.currentTime + t + .16); }); }
    clearInterval(tInt); setTimeout(() => { if (el.classList.contains('done')) stopTimer(); }, 6000);
  } else if (left > 0) $('.timer-label').textContent = 'Rest';
}
function stopTimer(){ clearInterval(tInt); $('#timer').classList.add('hidden'); }
$$('.timer-btn').forEach(b => b.onclick = () => { const t = b.dataset.t; if (t === 'skip') return stopTimer(); tEnd += +t * 1000; tTotal = Math.max(tTotal, Math.round((tEnd - Date.now()) / 1000)); if (tEnd < Date.now()) tEnd = Date.now(); $('#timer').classList.remove('done'); clearInterval(tInt); tick(); tInt = setInterval(tick, 250); });

/* ---------- router ---------- */
const TABS = ['today','workout','meals','groceries','cook','progress'];
let curTab = null;
function render(anim){
  const tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today';
  const v = $('#view');
  v.innerHTML = views[tab]();
  views[tab].bind && views[tab].bind(v);
  if (anim !== false && (anim || tab !== curTab)) { v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter'); }
  if (tab !== curTab) window.scrollTo(0, 0);
  curTab = tab;
  $$('.tabbar a').forEach((a, i) => { const on = a.dataset.tab === tab; a.classList.toggle('act', on); if (on) $('#tabInd').style.transform = `translateX(${i * 100}%)`; });
  animateRings(v);
}
window.addEventListener('hashchange', () => render(true));
$('#settingsBtn').onclick = openSettings;
$('#sheet').addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeSheet(); });
$('#lightbox').onclick = () => $('#lightbox').classList.add('hidden');
document.addEventListener('visibilitychange', () => { if (!document.hidden && curTab === 'today') render(false); });
if (!localStorage.getItem(KEY)) save();
render(true);

if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
