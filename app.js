(() => {
/* ---------- Exercise catalogue ---------- */
// type: reps (reps × secPerRep, one block) | hold (sets × hold seconds, rest between)
const AREAS = {
  lingua: "Lingua",
  palato: "Palato molle",
  gola: "Gola e laringe",
  viso: "Labbra e guance",
  resp: "Respirazione e deglutizione"
};
const EX = [
  { id: "spazzola", area: "lingua", name: "Spazzolamento della lingua", type: "reps", reps: 15, spr: 2,
    how: ["Con lo spazzolino spazzola la parte superiore della lingua, poi il lato destro e il lato sinistro.", "Circa 5 passate per zona. La lingua reagisce contraendosi: è proprio questo lo stimolo."],
    why: "Attiva la muscolatura intrinseca della lingua. Fa parte del protocollo usato nello studio di Guimarães (2009) su pazienti con apnea moderata.",
    tags: ["apnea", "russamento"] },
  { id: "scivola", area: "lingua", name: "Punta al palato e scivola indietro", type: "reps", reps: 20, spr: 2,
    how: ["Appoggia la punta della lingua dietro gli incisivi superiori.", "Falla scivolare all'indietro lungo il palato, premendo, fin dove arrivi.", "Torna avanti e ripeti."],
    why: "Rinforza il genioglosso, il muscolo che tiene la lingua in avanti e impedisce che cada indietro durante il sonno.",
    tags: ["apnea", "russamento"] },
  { id: "risucchio", area: "lingua", name: "Lingua aspirata al palato", type: "reps", reps: 20, spr: 3,
    how: ["Aspira tutta la lingua verso l'alto, come per preparare uno schiocco.", "Tienila incollata al palato per 2 secondi, poi rilascia."],
    why: "Allena la lingua a stare nella posizione corretta, alta contro il palato, che libera lo spazio in gola.",
    tags: ["apnea", "bocca"] },
  { id: "dorso", area: "lingua", name: "Base della lingua in basso", type: "reps", reps: 20, spr: 2,
    how: ["Tieni la punta della lingua a contatto con gli incisivi inferiori.", "Spingi con forza il dorso e la base della lingua verso il basso, poi rilassa."],
    why: "Lavora la parte posteriore della lingua, quella che più spesso ostruisce la gola da sdraiati.",
    tags: ["apnea"] },
  { id: "fuori", area: "lingua", name: "Lingua fuori e tesa", type: "hold", sets: 5, hold: 10,
    how: ["Tira fuori la lingua il più possibile, dritta e tesa.", "Mantieni senza appoggiarla alle labbra."],
    why: "Contrazione isometrica dei muscoli protrusori della lingua.",
    tags: ["apnea"] },
  { id: "cucchiaio", area: "lingua", name: "Lingua contro resistenza", type: "hold", sets: 8, hold: 5,
    how: ["Metti un cucchiaio sulla punta della lingua.", "Spingi contro il cucchiaio verso l'alto, poi in basso, a destra e a sinistra.", "Due giri: 5 secondi per direzione."],
    why: "Aumenta la forza della lingua. Una lingua più forte collassa meno nelle vie aeree.",
    tags: ["apnea"] },
  { id: "a_scatti", area: "palato", name: "«A» a scatti", type: "reps", reps: 20, spr: 2,
    how: ["Davanti allo specchio apri la bocca e pronuncia «A» breve e decisa.", "Guarda l'ugola e il palato molle che si sollevano a ogni «A»."],
    why: "Esercizio isotonico per i muscoli del palato molle, la struttura che vibra quando russi.",
    tags: ["russamento", "apnea"] },
  { id: "a_lunga", area: "palato", name: "«A» sostenuta", type: "hold", sets: 4, hold: 15,
    how: ["Pronuncia una «A» lunga e costante, mantenendo il palato sollevato.", "Voce media, senza sforzare la gola."],
    why: "Esercizio isometrico per il palato molle. Nello studio di Guimarães era previsto per alcuni minuti al giorno.",
    tags: ["russamento", "apnea"] },
  { id: "kaga", area: "palato", name: "Sillabe «KA-GA»", type: "hold", sets: 3, hold: 20,
    how: ["Ripeti velocemente «KA-GA-KA-GA».", "Senti il retro della lingua che batte contro il palato molle."],
    why: "Coordina e rinforza insieme la base della lingua e il palato molle.",
    tags: ["russamento"] },
  { id: "gargarismo", area: "gola", name: "Gargarismi", type: "hold", sets: 3, hold: 20,
    how: ["Prendi un sorso d'acqua, testa leggermente indietro.", "Fai gargarismi profondi, sentendo vibrare la gola. Sputa tra una serie e l'altra."],
    why: "Attiva i muscoli della faringe e la base della lingua. Da fare in bagno.",
    tags: ["russamento", "apnea"] },
  { id: "sirena", area: "gola", name: "Sirena vocale su «NG»", type: "reps", reps: 8, spr: 5,
    how: ["A bocca chiusa produci il suono «ng» (come la fine di «ping»).", "Scivola dalla nota più grave alla più acuta e torna giù, come una sirena."],
    why: "Il canto allena faringe e palato molle. Uno studio su cantanti amatoriali (Ojay e Ernst, 2000) ha mostrato meno russamento dopo 3 mesi.",
    tags: ["russamento"] },
  { id: "deglutizione_forte", area: "gola", name: "Deglutizione energica", type: "reps", reps: 10, spr: 4,
    how: ["Deglutisci la saliva spingendo con forza: lingua contro il palato e gola che stringe.", "Pausa e ripeti."],
    why: "Rinforza i muscoli costrittori della faringe.",
    tags: ["apnea"] },
  { id: "masako", area: "gola", name: "Deglutizione a lingua trattenuta", type: "reps", reps: 8, spr: 4,
    how: ["Tieni la punta della lingua delicatamente tra i denti.", "Deglutisci la saliva senza ritirare la lingua."],
    why: "Manovra di Masako: obbliga la parete posteriore della gola a lavorare di più.",
    tags: ["apnea"] },
  { id: "shaker", area: "gola", name: "Sollevamento del capo", type: "hold", sets: 3, hold: 20, neck: true,
    how: ["Sdraiati sulla schiena, spalle ben appoggiate.", "Solleva solo la testa fino a vedere le punte dei piedi e mantieni.", "Riposa tra le serie."],
    why: "Esercizio di Shaker: rinforza i muscoli sopra l'osso ioide, che tengono aperta la gola e sollevano la laringe.",
    caution: "Evitalo se hai dolore o problemi alla cervicale.",
    tags: ["apnea"] },
  { id: "guancia", area: "viso", name: "Guancia contro dito", type: "reps", reps: 20, spr: 2,
    how: ["Con un dito pulito dentro la bocca spingi la guancia verso l'esterno.", "Con il muscolo della guancia resisti e riporta la guancia verso i denti.", "10 volte per lato."],
    why: "Rinforza il buccinatore. Inserito nel protocollo di Guimarães per il tono di guance e mandibola.",
    tags: ["bocca", "russamento"] },
  { id: "bacio", area: "viso", name: "Bacio e sorriso", type: "reps", reps: 15, spr: 2,
    how: ["Porta le labbra in avanti, chiuse, come per un bacio.", "Poi sorridi ampio a labbra chiuse. Alterna."],
    why: "Allena l'orbicolare della bocca: labbra più toniche restano chiuse durante il sonno.",
    tags: ["bocca"] },
  { id: "angoli", area: "viso", name: "Angoli della bocca in alto", type: "reps", reps: 20, spr: 2,
    how: ["Con la bocca leggermente aperta solleva l'angolo destro della bocca, poi il sinistro.", "Alterna lentamente, 10 volte per lato."],
    why: "Lavora i muscoli che sollevano gli angoli della bocca e stabilizzano la mandibola.",
    tags: ["bocca"] },
  { id: "palloncino", area: "resp", name: "Palloncino", type: "reps", reps: 5, spr: 10,
    how: ["Inspira profondamente dal naso.", "Gonfia il palloncino con un'espirazione lunga e forzata, senza toglierlo dalla bocca.", "Inspira di nuovo dal naso e ripeti."],
    why: "Coordina respirazione nasale e chiusura del palato molle, e rinforza labbra e guance.",
    tags: ["bocca", "russamento"] },
  { id: "nasale", area: "resp", name: "Respirazione nasale lenta", type: "hold", sets: 1, hold: 120, rest: 0,
    how: ["Bocca chiusa, denti a contatto leggero, lingua appoggiata al palato.", "Inspira dal naso per 4 secondi, espira dal naso per 6."],
    why: "Abitua alla respirazione dal naso con la lingua in posizione corretta, la stessa che dovresti avere di notte.",
    tags: ["bocca"] },
  { id: "deglutizione", area: "resp", name: "Deglutizione corretta", type: "reps", reps: 10, spr: 4,
    how: ["Prendi un piccolo sorso d'acqua.", "Lingua contro il palato, denti in contatto, deglutisci senza stringere le labbra."],
    why: "Corregge la deglutizione atipica, frequente in chi respira con la bocca.",
    tags: ["bocca", "apnea"] }
];
const EXMAP = Object.fromEntries(EX.map(e => [e.id, e]));
const HABITS = [
  { id: "riposo", text: "Lingua a riposo contro il palato durante il giorno", sub: "Controllala ogni volta che guardi il telefono." },
  { id: "masticazione", text: "Masticazione alternata ai pasti", sub: "Mastica un boccone a destra e il successivo a sinistra." },
  { id: "fianco", text: "Dormire sul fianco", sub: "Sulla schiena la lingua scivola più facilmente indietro." }
];
const FOCUS = {
  russamento: { label: "Russamento", sub: "Più lavoro su palato molle e gola" },
  apnea: { label: "Apnee", sub: "Più lavoro su lingua e faringe" },
  bocca: { label: "Bocca aperta", sub: "Respirazione nasale, labbra, deglutizione" }
};
const PHASES = [
  { from: 1, to: 2, name: "Apprendimento", f: 0.6, text: "Dosi ridotte. Impara a eseguire bene ogni esercizio, meglio se allo specchio." },
  { from: 3, to: 4, name: "Adattamento", f: 0.8, text: "Le ripetizioni salgono. I muscoli possono essere un po' affaticati: è normale." },
  { from: 5, to: 8, name: "Costruzione", f: 1.0, text: "Dose piena. È la fase in cui gli studi vedono i primi miglioramenti." },
  { from: 9, to: 12, name: "Consolidamento", f: 1.2, text: "Carico massimo e tenute più lunghe. A fine settimana 12 valuta i risultati." }
];
const LEVEL = { 1: { label: "Principiante", f: 0.8 }, 2: { label: "Intermedio", f: 1 }, 3: { label: "Avanzato", f: 1.25 } };
const SNORE = ["Nessuno", "Lieve", "Moderato", "Forte"];
const TIRED = ["Riposato", "Un po' stanco", "Stanco", "Esausto"];

/* ---------- Dates ---------- */
const pad = n => String(n).padStart(2, "0");
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((parseKey(dkey(b)) - parseKey(dkey(a))) / 86400000);
const fmtDay = d => d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
const fmtShort = d => d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
const TODAY = () => new Date();

/* ---------- State ---------- */
const defaults = () => ({ focus: "russamento", level: 1, minutes: 15, neck: false, start: dkey(TODAY()) });
const state = { settings: defaults(), sessions: {}, nights: {}, tab: "oggi", settingsSaved: false };

/* ---------- Storage: this device only ---------- */
const LS_KEY = "gola-libera-v1";
function lsRead() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch { return null; } }
function lsWrite() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ settings: state.settings, sessions: state.sessions, nights: state.nights })); } catch {}
}
async function put(kind, key, data) {
  if (kind === "settings") state.settings = data;
  else if (kind === "s") state.sessions[key] = data;
  else if (kind === "n") state.nights[key] = data;
  lsWrite();
}
async function remove(kind, key) {
  if (kind === "n") delete state.nights[key];
  lsWrite();
}
function loadLocal() {
  const d = lsRead();
  if (d) {
    if (d.settings) { state.settings = { ...defaults(), ...d.settings }; state.settingsSaved = true; }
    state.sessions = d.sessions || {}; state.nights = d.nights || {};
  }
}
function saveFile(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------- Program engine ---------- */
function programPos(date) {
  const day = Math.max(0, daysBetween(parseKey(state.settings.start), date));
  const week = Math.min(12, Math.floor(day / 7) + 1);
  const phase = PHASES.find(p => week >= p.from && week <= p.to);
  return { day, week, phase, finished: day >= 84 };
}
function dose(ex, factor) {
  if (ex.type === "reps") {
    const reps = Math.max(3, Math.round(ex.reps * factor));
    return { reps, label: `${reps} ripetizioni`, secs: reps * ex.spr + 8 };
  }
  const hold = ex.sets === 1 ? Math.round(ex.hold * Math.min(1.5, Math.max(0.75, factor))) : Math.max(4, Math.round(ex.hold * Math.min(1.5, factor)));
  const sets = ex.sets;
  const rest = ex.rest ?? 6;
  return { sets, hold, rest, label: sets === 1 ? fmtDur(hold) : `${sets} × ${hold} s`, secs: sets * hold + (sets - 1) * rest + 8 };
}
function fmtDur(s) { return s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? " " + (s % 60) + " s" : ""}` : `${s} s`; }
// deterministic shuffle so each day of the week rotates the secondary exercises
function seeded(n) { let x = (n * 9301 + 49297) % 233280; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
function planFor(date) {
  const s = state.settings;
  const pos = programPos(date);
  const factor = LEVEL[s.level].f * pos.phase.f;
  const budget = s.minutes * 60;
  const rnd = seeded(pos.day + 7);
  const pool = EX.filter(e => !(e.neck && s.neck)).map(e => ({ e, score: (e.tags.includes(s.focus) ? 2 : 0) + (e.tags[0] === s.focus ? 1 : 0) + rnd() * 1.6, d: dose(e, factor) }));
  pool.sort((a, b) => b.score - a.score);
  const picked = []; let used = 0;
  const maxItems = Math.max(5, Math.round(s.minutes * 0.6));
  const fits = p => picked.length < maxItems && (used + p.d.secs <= budget || picked.length < 3);
  // one per area first, so every muscle group is trained each day
  for (const area of Object.keys(AREAS)) {
    const p = pool.find(x => x.e.area === area && !picked.includes(x));
    if (p && fits(p)) { picked.push(p); used += p.d.secs; }
  }
  for (const p of pool) { if (!picked.includes(p) && fits(p)) { picked.push(p); used += p.d.secs; } }
  const order = Object.keys(AREAS);
  picked.sort((a, b) => order.indexOf(a.e.area) - order.indexOf(b.e.area));
  return { pos, factor, items: picked.map(p => ({ id: p.e.id, ...p.d })), secs: used };
}

/* ---------- Render ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = $("#view");

function renderSaveState() {
  const el = $("#save-state"); if (!el) return;
  el.textContent = "Salvato su questo telefono";
}
function header(eyebrow, title) {
  return `<div class="top"><div class="stack" style="gap:4px"><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1></div><div class="save-state" id="save-state"></div></div>`;
}
function streak() {
  let n = 0, d = TODAY();
  if (!state.sessions[dkey(d)]?.complete) d = addDays(d, -1);
  while (state.sessions[dkey(d)]?.complete) { n++; d = addDays(d, -1); }
  return n;
}

function renderOggi() {
  const today = TODAY(); const key = dkey(today);
  const plan = planFor(today); const sess = state.sessions[key] || {};
  const done = new Set(sess.done || []);
  const pos = plan.pos;
  const weekStart = addDays(parseKey(state.settings.start), (pos.week - 1) * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const doneWeek = days.filter(d => state.sessions[dkey(d)]?.complete).length;
  const remaining = plan.items.filter(i => !done.has(i.id)).length;
  const st = streak();
  view.innerHTML = `
    ${header(fmtDay(today), pos.finished ? "Programma completato" : "Allenamento di oggi")}
    ${!state.settingsSaved ? `<div class="note"><strong>Programma di esempio</strong><span>Obiettivo russamento, livello principiante, 15 minuti al giorno. Personalizzalo in <button class="linkish" data-go="programma" style="text-decoration:underline">Programma</button>.</span></div>` : ""}
    <section class="panel">
      <div class="row" style="justify-content:space-between">
        <div class="stack" style="gap:2px"><span class="eyebrow">Settimana ${pos.week} di 12</span><h3>Fase: ${esc(pos.phase.name)}</h3></div>
        <div class="stack" style="gap:2px;text-align:right"><span class="eyebrow">Serie</span><h3 style="font-variant-numeric:tabular-nums">${st} ${st === 1 ? "giorno" : "giorni"}</h3></div>
      </div>
      <div class="phase" aria-label="Avanzamento: settimana ${pos.week} di 12">${Array.from({ length: 12 }, (_, i) => `<span class="${i + 1 < pos.week ? "on" : i + 1 === pos.week ? "now" : ""}"></span>`).join("")}</div>
      <div class="week">${days.map(d => {
        const k = dkey(d); const c = state.sessions[k]?.complete;
        return `<div class="day"><span>${d.toLocaleDateString("it-IT", { weekday: "narrow" })}</span><span class="dot ${c ? "done" : ""} ${k === key ? "today" : ""}">${c ? "✓" : d.getDate()}</span></div>`;
      }).join("")}</div>
      <p class="small muted">${doneWeek} sessioni su 7 questa settimana. Obiettivo: almeno 5.</p>
    </section>
    <section class="stack">
      <div class="row" style="justify-content:space-between"><h2>${plan.items.length} esercizi</h2><span class="muted small">circa ${Math.round(plan.secs / 60)} minuti</span></div>
      <ul class="ex-list panel" style="gap:0;padding-block:4px">
        ${plan.items.map(it => { const e = EXMAP[it.id]; return `
          <li><span class="check ${done.has(it.id) ? "on" : ""}" aria-label="${done.has(it.id) ? "Fatto" : "Da fare"}">${done.has(it.id) ? "✓" : ""}</span>
          <div class="min"><button class="linkish name" data-info="${e.id}">${esc(e.name)}</button><div><span class="chip ${e.tags.includes(state.settings.focus) ? "focus" : ""}">${AREAS[e.area]}</span></div></div>
          <span class="dose">${esc(it.label)}</span></li>`; }).join("")}
      </ul>
      <button class="primary big" id="start">${remaining === 0 ? "Ripeti la sessione" : done.size ? `Continua: ${remaining} rimasti` : "Inizia la sessione"}</button>
    </section>
    <section class="panel">
      <h3>Abitudini di oggi</h3>
      ${HABITS.map(h => `<label class="habit"><input type="checkbox" id="h-${h.id}" data-habit="${h.id}" ${(sess.habits || []).includes(h.id) ? "checked" : ""}><span><strong>${esc(h.text)}</strong><br><span class="small muted">${esc(h.sub)}</span></span></label>`).join("")}
    </section>
    <div class="note">
      <strong>Prima di iniziare</strong>
      <span>Gli esercizi miofunzionali riducono russamento e apnee in molti studi, ma non sostituiscono la diagnosi. Se hai pause respiratorie notturne, sonnolenza di giorno o ipertensione, fai una polisonnografia o un monitoraggio cardiorespiratorio. Se usi la CPAP non sospenderla senza parlarne con il medico.</span>
    </div>`;
  renderSaveState();
  $("#start").onclick = () => startSession(plan, remaining === 0);
  view.querySelectorAll("[data-habit]").forEach(cb => cb.onchange = () => {
    const s = { ...(state.sessions[key] || { done: [] }) };
    const set = new Set(s.habits || []); cb.checked ? set.add(cb.dataset.habit) : set.delete(cb.dataset.habit);
    s.habits = [...set]; put("s", key, s);
  });
}

function renderProgramma() {
  const s = state.settings; const pos = programPos(TODAY());
  const opt = (name, val, label, cur, sub) => `<label><input type="radio" name="${name}" id="${name}-${val}" value="${val}" ${String(cur) === String(val) ? "checked" : ""}><span>${esc(label)}</span></label>`;
  view.innerHTML = `
    ${header("Il tuo piano di 12 settimane", "Programma")}
    <form class="panel" id="settings" style="gap:20px">
      <fieldset><legend>Obiettivo principale</legend>
        <div class="seg">${Object.entries(FOCUS).map(([k, f]) => opt("focus", k, f.label, s.focus)).join("")}</div>
        <p class="small muted" id="focus-sub">${esc(FOCUS[s.focus].sub)}</p></fieldset>
      <fieldset><legend>Livello</legend>
        <div class="seg">${Object.entries(LEVEL).map(([k, l]) => opt("level", k, l.label, s.level)).join("")}</div></fieldset>
      <fieldset><legend>Minuti al giorno</legend>
        <div class="seg">${[10, 15, 20, 30].map(m => opt("minutes", m, m + " min", s.minutes)).join("")}</div>
        <p class="small muted">Gli studi usano circa 30 minuti al giorno, anche divisi in due momenti.</p></fieldset>
      <fieldset><legend>Data di inizio</legend><input type="date" id="start-date" name="start" value="${esc(s.start)}"></fieldset>
      <label class="habit"><input type="checkbox" id="neck" name="neck" ${s.neck ? "checked" : ""}><span><strong>Ho problemi alla cervicale</strong><br><span class="small muted">Esclude il sollevamento del capo.</span></span></label>
      <button type="submit" class="primary big">Salva il programma</button>
      <p class="small muted" id="saved-msg" aria-live="polite"></p>
    </form>
    <section class="stack">
      <h2>Come cresce il carico</h2>
      <div class="panel phases">
        ${PHASES.map(p => `<div class="${pos.week >= p.from && pos.week <= p.to ? "cur" : ""}"><span class="wk">Sett. ${p.from}–${p.to}</span><div><h3>${esc(p.name)} · ${Math.round(p.f * LEVEL[s.level].f * 100)}%</h3><p class="small muted">${esc(p.text)}</p></div></div>`).join("")}
      </div>
      <p class="small muted">Ogni giorno la sessione allena tutti e cinque i gruppi muscolari e ruota gli esercizi secondari. Quelli legati al tuo obiettivo compaiono più spesso.</p>
    </section>
    <section class="panel">
      <h3>Promemoria giornaliero</h3>
      <p class="small muted">Aggiunge al calendario del telefono un evento ripetuto ogni giorno, con avviso. Funziona anche ad app chiusa.</p>
      <div class="row"><label for="rem-time" class="small"><strong>Ora</strong></label><input type="time" id="rem-time" value="${esc(s.reminder || "21:00")}" style="width:auto"><button id="rem-add">Aggiungi al calendario</button></div>
      <p class="small muted" id="rem-msg" aria-live="polite"></p>
    </section>
    <section class="panel">
      <h3>Backup</h3>
      <p class="small muted">I dati restano solo su questo telefono. Salva un backup ogni tanto, o prima di cambiare telefono.</p>
      <div class="row"><button id="bk-export">Esporta backup</button><label class="btn" for="bk-import">Importa backup</label><input type="file" id="bk-import" accept="application/json,.json" hidden></div>
      <p class="small muted" id="bk-msg" aria-live="polite"></p>
    </section>
    <section class="panel">
      <h3>Ricomincia da capo</h3>
      <p class="small muted">Cancella sessioni e diario e riporta il programma alla settimana 1.</p>
      <div class="row"><button class="danger" id="reset">Cancella tutto</button><span id="reset-confirm" hidden class="row"><span class="small">Sicuro?</span><button class="danger" id="reset-yes">Sì, cancella</button><button id="reset-no">Annulla</button></span></div>
    </section>`;
  renderSaveState();
  const form = $("#settings");
  form.querySelectorAll('input[name=focus]').forEach(r => r.onchange = () => { $("#focus-sub").textContent = FOCUS[r.value].sub; });
  form.onsubmit = async ev => {
    ev.preventDefault();
    const f = new FormData(form);
    const next = { focus: f.get("focus"), level: Number(f.get("level")), minutes: Number(f.get("minutes")), neck: !!f.get("neck"), start: f.get("start") || dkey(TODAY()), reminder: state.settings.reminder };
    state.settingsSaved = true;
    await put("settings", null, next);
    $("#saved-msg").textContent = "Programma salvato. Lo trovi in Oggi.";
  };
  $("#rem-add").onclick = () => {
    const t = $("#rem-time").value || "21:00";
    const [hh, mm] = t.split(":").map(Number);
    put("settings", null, { ...state.settings, reminder: t });
    const begin = new Date(); begin.setHours(hh, mm, 0, 0);
    const end = new Date(begin.getTime() + 15 * 60000);
    const local = x => dkey(x).replace(/-/g, "") + "T" + pad(x.getHours()) + pad(x.getMinutes()) + "00";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Gola Libera//IT", "BEGIN:VEVENT",
      "UID:gola-libera-" + Date.now() + "@gola-libera", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART:" + local(begin), "DTEND:" + local(end),
      "RRULE:FREQ=DAILY;COUNT=84", "SUMMARY:Esercizi Gola Libera", "DESCRIPTION:Apri l'app Gola Libera e fai la sessione di oggi.",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Esercizi Gola Libera", "TRIGGER:PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    saveFile("gola-libera-promemoria.ics", ics, "text/calendar");
    $("#rem-msg").textContent = "Apri il file scaricato e conferma l'aggiunta al calendario.";
  };
  $("#bk-export").onclick = () => {
    saveFile(`gola-libera-backup-${dkey(TODAY())}.json`, JSON.stringify({ app: "gola-libera", version: 1, settings: state.settings, sessions: state.sessions, nights: state.nights }, null, 2), "application/json");
    $("#bk-msg").textContent = "Backup scaricato.";
  };
  $("#bk-import").onchange = async ev => {
    const file = ev.target.files?.[0]; if (!file) return;
    try {
      const d = JSON.parse(await file.text());
      if (d.app !== "gola-libera") throw new Error();
      state.settings = { ...defaults(), ...d.settings }; state.sessions = d.sessions || {}; state.nights = d.nights || {};
      state.settingsSaved = true; lsWrite(); render();
      $("#bk-msg").textContent = "Backup importato.";
    } catch { $("#bk-msg").textContent = "Questo file non è un backup di Gola Libera."; }
  };
  $("#reset").onclick = () => { $("#reset-confirm").hidden = false; };
  $("#reset-no").onclick = () => { $("#reset-confirm").hidden = true; };
  $("#reset-yes").onclick = async () => {
    state.sessions = {}; state.nights = {};
    await put("settings", null, { ...state.settings, start: dkey(TODAY()) });
    render();
  };
}

function renderEsercizi() {
  view.innerHTML = `
    ${header(EX.length + " esercizi in 5 gruppi", "Esercizi")}
    <p class="muted">Eseguili seduto con la schiena dritta, se possibile davanti allo specchio. Un leggero affaticamento è normale; il dolore no: in quel caso fermati.</p>
    ${Object.entries(AREAS).map(([a, label]) => `
      <section class="stack"><h2>${esc(label)}</h2><div class="panel" style="gap:0;padding-block:6px">
      ${EX.filter(e => e.area === a).map(e => `
        <details class="ex" id="ex-${e.id}"><summary>${esc(e.name)}</summary><div class="body">
          ${window.GolaAnim?.has(e.id) ? `<div class="anim" data-anim="${e.id}"></div><p class="anim-cap">${esc(GolaAnim.caption(e.id))}</p>` : ""}
          <ol class="steps">${e.how.map(h => `<li>${esc(h)}</li>`).join("")}</ol>
          <p class="small muted">${esc(e.why)}</p>
          ${e.caution ? `<p class="small caution">${esc(e.caution)}</p>` : ""}
          <div class="row">${e.tags.map(t => `<span class="chip ${t === state.settings.focus ? "focus" : ""}">${FOCUS[t].label}</span>`).join("")}<span class="small muted">Dose piena: ${esc(dose(e, 1).label)}</span></div>
        </div></details>`).join("")}
      </div></section>`).join("")}
    <div class="note"><strong>Da dove vengono</strong><span>Il nucleo viene dal protocollo di Guimarães e colleghi (2009), che in 3 mesi ha ridotto l'indice di apnea di circa il 40% in pazienti con apnea moderata. Una meta-analisi di Camacho (2015) ha trovato riduzioni medie dell'indice di apnea di circa il 50% negli adulti e del russamento. Gli esercizi vocali e di deglutizione vengono dalla logopedia.</span></div>`;
  view.querySelectorAll("details.ex").forEach(d => d.addEventListener("toggle", () => {
    const box = d.querySelector("[data-anim]"); if (!box) return;
    if (d.open) box._anim = GolaAnim.mount(box, box.dataset.anim);
    else { box._anim?.stop(); box.innerHTML = ""; }
  }));
  renderSaveState();
}

function renderDiario() {
  const key = dkey(TODAY()); const cur = state.nights[key] || {};
  const keys = Object.keys(state.nights).sort().reverse();
  const last = Array.from({ length: 14 }, (_, i) => dkey(addDays(TODAY(), i - 13)));
  const W = 320, H = 120, bw = W / 14;
  const bars = last.map((k, i) => {
    const n = state.nights[k]; const x = i * bw + 3; const w = bw - 6;
    const h = n ? Math.max(3, (n.snore / 3) * 84) : 0;
    const lbl = i % 2 === 1 ? `<text x="${x + w / 2}" y="${H - 2}" text-anchor="middle">${parseKey(k).getDate()}</text>` : "";
    return (n ? `<rect x="${x}" y="${96 - h}" width="${w}" height="${h}" rx="3" fill="var(--night)"><title>${fmtShort(parseKey(k))}: ${SNORE[n.snore]}</title></rect>` : `<rect x="${x}" y="94" width="${w}" height="2" fill="var(--line)"></rect>`) + lbl;
  }).join("");
  const grid = [0, 1, 2, 3].map(v => `<line x1="0" x2="${W}" y1="${96 - v * 28}" y2="${96 - v * 28}" stroke="var(--line)" stroke-width="${v ? 0.5 : 1}"></line>`).join("");
  const radio = (name, i, label, curv) => `<label><input type="radio" name="${name}" id="${name}-${i}" value="${i}" ${curv === i ? "checked" : ""}><span>${esc(label)}</span></label>`;
  view.innerHTML = `
    ${header("Diario del sonno", "Notti")}
    <form class="panel" id="night" style="gap:18px">
      <h3>La notte scorsa</h3>
      <fieldset><legend>Russamento</legend><div class="seg night">${SNORE.map((l, i) => radio("snore", i, l, cur.snore)).join("")}</div></fieldset>
      <fieldset><legend>Come lo sai</legend><div class="seg night">${["Partner", "App di registrazione", "Sensazione"].map((l, i) => radio("source", i, l, cur.source ?? 0)).join("")}</div></fieldset>
      <fieldset><legend>Al risveglio</legend><div class="seg night">${TIRED.map((l, i) => radio("tired", i, l, cur.tired)).join("")}</div></fieldset>
      <label class="habit"><input type="checkbox" id="choke" name="choke" ${cur.choke ? "checked" : ""}><span><strong>Risvegli con senso di soffocamento</strong><br><span class="small muted">O pause nel respiro notate da qualcuno.</span></span></label>
      <fieldset><legend>Note</legend><textarea id="night-note" name="note" placeholder="Alcol, cena tardi, raffreddore, posizione…">${esc(cur.note || "")}</textarea></fieldset>
      <button class="primary big" type="submit">Salva la notte</button>
      <p class="small muted" id="night-msg" aria-live="polite"></p>
    </form>
    <section class="panel">
      <div class="row" style="justify-content:space-between"><h3>Russamento, ultime 2 settimane</h3><span class="small muted">0 = nessuno, 3 = forte</span></div>
      ${keys.length ? `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Russamento delle ultime 14 notti">${grid}${bars}</svg>` : `<p class="muted small">Ancora nessuna notte registrata. Compila il modulo qui sopra ogni mattina: dopo qualche settimana vedrai l'andamento.</p>`}
    </section>
    ${keys.length ? `<section class="stack"><h2>Storico</h2><ul class="nights panel" style="padding-block:4px">${keys.slice(0, 30).map(k => { const n = state.nights[k]; return `<li><span class="d">${fmtShort(parseKey(k))}</span><span><span class="lvl">${SNORE[n.snore]}</span> · ${TIRED[n.tired] ?? ""}${n.choke ? ' · <span class="caution">soffocamento</span>' : ""}${n.note ? `<br><span class="muted">${esc(n.note)}</span>` : ""}</span></li>`; }).join("")}</ul></section>` : ""}
    <div class="note"><strong>Misurare i progressi</strong><span>La sensazione inganna. Un'app che registra il russamento dà un dato più affidabile; per le apnee serve un nuovo esame del sonno dopo le 12 settimane, da confrontare con quello iniziale. Se i risvegli con soffocamento sono frequenti, parlane con il medico senza aspettare.</span></div>`;
  renderSaveState();
  $("#night").onsubmit = async ev => {
    ev.preventDefault();
    const f = new FormData(ev.target);
    if (f.get("snore") == null || f.get("tired") == null) { $("#night-msg").textContent = "Scegli il livello di russamento e come ti sei svegliato."; return; }
    await put("n", key, { snore: Number(f.get("snore")), source: Number(f.get("source")), tired: Number(f.get("tired")), choke: !!f.get("choke"), note: String(f.get("note") || "").slice(0, 500) });
    renderDiario(); $("#night-msg").textContent = "Notte salvata.";
  };
}

function render() {
  document.querySelectorAll("nav.tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === state.tab)));
  ({ oggi: renderOggi, programma: renderProgramma, esercizi: renderEsercizi, diario: renderDiario })[state.tab]();
  view.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  view.querySelectorAll("[data-info]").forEach(b => b.onclick = () => { go("esercizi"); const d = document.getElementById("ex-" + b.dataset.info); if (d) { d.open = true; d.scrollIntoView({ block: "center" }); } });
}
function go(tab) { state.tab = tab; try { localStorage.setItem(LS_KEY + "-tab", tab); } catch {} render(); window.scrollTo(0, 0); }
document.querySelectorAll("nav.tabs button").forEach(b => b.onclick = () => go(b.dataset.tab));

/* ---------- Session player ---------- */
const player = $("#player");
let audio = null, wake = null, timer = null;
function beep(freq = 660, ms = 120, vol = 0.15) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; g.gain.value = vol; o.connect(g); g.connect(audio.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000); o.stop(audio.currentTime + ms / 1000 + 0.02);
  } catch {}
}
async function lockScreen() { try { wake = await navigator.wakeLock?.request("screen"); } catch { wake = null; } }
function releaseScreen() { try { wake?.release(); } catch {} wake = null; }

function segmentsFor(it) {
  const e = EXMAP[it.id];
  if (e.type === "reps") return [{ kind: "work", secs: it.reps * e.spr, spr: e.spr, reps: it.reps }];
  const segs = [];
  for (let i = 0; i < it.sets; i++) {
    segs.push({ kind: "work", secs: it.hold, set: i + 1, sets: it.sets });
    if (i < it.sets - 1 && it.rest) segs.push({ kind: "rest", secs: it.rest });
  }
  return segs;
}

let P = null, playerAnim = null;
function startSession(plan, again) {
  const key = dkey(TODAY());
  const done = new Set(again ? [] : (state.sessions[key]?.done || []));
  const queue = plan.items.filter(i => !done.has(i.id));
  P = { key, plan, queue, idx: 0, seg: 0, t: 0, running: false, done };
  player.hidden = false; document.body.style.overflow = "hidden";
  lockScreen(); renderPlayer();
}
function closePlayer() {
  playerAnim?.stop(); playerAnim = null;
  clearInterval(timer); timer = null; releaseScreen();
  player.hidden = true; document.body.style.overflow = ""; P = null; render();
}
function current() { const it = P.queue[P.idx]; return { it, ex: EXMAP[it.id], segs: segmentsFor(it) }; }
async function markDone(id) {
  P.done.add(id);
  const prev = state.sessions[P.key] || {};
  const complete = P.plan.items.every(i => P.done.has(i.id));
  await put("s", P.key, { ...prev, done: [...P.done], complete, week: P.plan.pos.week });
}
function nextExercise() {
  clearInterval(timer); timer = null;
  P.idx++; P.seg = 0; P.t = 0; P.running = false;
  renderPlayer();
}
function tick() {
  const { it, segs } = current(); const seg = segs[P.seg];
  P.t += 0.25;
  if (seg.kind === "work" && seg.spr) {
    const rep = Math.floor(P.t / seg.spr);
    if (Math.abs(P.t - rep * seg.spr) < 0.01 && rep > 0 && rep < seg.reps) beep(520, 70, 0.08);
  }
  if (P.t >= seg.secs) {
    P.seg++; P.t = 0;
    if (P.seg >= segs.length) {
      beep(880, 220); setTimeout(() => beep(1175, 260), 240);
      clearInterval(timer); timer = null; P.running = false;
      markDone(it.id); P.finishedEx = true; renderPlayer(); return;
    }
    beep(segs[P.seg].kind === "rest" ? 440 : 760, 160);
  }
  updateRing();
}
function toggleRun() {
  if (P.running) { clearInterval(timer); timer = null; P.running = false; }
  else { if (P.t === 0 && P.seg === 0) beep(760, 160); P.running = true; timer = setInterval(tick, 250); }
  renderPlayer();
}
function updateRing() {
  const { segs } = current(); const seg = segs[P.seg]; if (!seg) return;
  const C = 2 * Math.PI * 46;
  const frac = Math.min(1, P.t / seg.secs);
  const fg = player.querySelector(".ring-fg");
  if (fg) { fg.style.strokeDashoffset = String(C * (1 - frac)); fg.classList.toggle("rest", seg.kind === "rest"); }
  const num = player.querySelector(".ring-num"), lbl = player.querySelector(".ring-lbl");
  if (!num) return;
  if (seg.kind === "rest") { num.textContent = Math.ceil(seg.secs - P.t); lbl.textContent = "pausa"; }
  else if (seg.spr) { num.textContent = Math.min(seg.reps, Math.floor(P.t / seg.spr) + (P.running || P.t > 0 ? 1 : 0)) || 0; lbl.textContent = `di ${seg.reps} ripetizioni`; }
  else { num.textContent = Math.ceil(seg.secs - P.t); lbl.textContent = seg.sets > 1 ? `secondi · serie ${seg.set} di ${seg.sets}` : "secondi"; }
}
function renderPlayer() {
  if (!P) return;
  const total = P.plan.items.length;
  if (P.idx >= P.queue.length) {
    playerAnim?.stop(); playerAnim = null;
    clearInterval(timer); timer = null; releaseScreen();
    const complete = P.plan.items.every(i => P.done.has(i.id));
    player.innerHTML = `<div class="wrap"><div class="done-hero">
      <span class="eyebrow">Settimana ${P.plan.pos.week} · ${esc(P.plan.pos.phase.name)}</span>
      <h1>${complete ? "Sessione completata" : "Sessione interrotta"}</h1>
      <p class="muted">${complete ? `Serie attuale: ${streak()} ${streak() === 1 ? "giorno" : "giorni"}. Domani gli esercizi secondari cambiano.` : "Gli esercizi fatti sono salvati. Puoi riprendere da Oggi."}</p>
    </div><button class="primary big" id="p-close">Torna a Oggi</button></div>`;
    $("#p-close").onclick = closePlayer; return;
  }
  const { it, ex, segs } = current();
  const doneCount = P.plan.items.filter(i => P.done.has(i.id)).length;
  const C = 2 * Math.PI * 46;
  const finished = P.finishedEx;
  player.innerHTML = `<div class="wrap">
    <div class="row" style="justify-content:space-between"><span class="eyebrow">Esercizio ${doneCount + (finished ? 0 : 1)} di ${total}</span><button class="ghost" id="p-exit">Esci</button></div>
    <div class="pbar">${P.plan.items.map(i => `<span class="${P.done.has(i.id) ? "on" : ""}"></span>`).join("")}</div>
    <div class="stack" style="gap:6px"><span class="chip" style="align-self:flex-start">${AREAS[ex.area]}</span><h1>${esc(ex.name)}</h1><p class="muted">${esc(it.label)}</p></div>
    ${window.GolaAnim?.has(ex.id) ? `<div class="anim anim-player" id="p-anim"></div>` : ""}
    <div class="ring-wrap ${window.GolaAnim?.has(ex.id) ? "small" : ""}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-bg" cx="50" cy="50" r="46" fill="none" stroke-width="6"></circle><circle class="ring-fg" cx="50" cy="50" r="46" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${finished ? 0 : C}"></circle></svg>
      <div class="ring-center"><span class="ring-num">${finished ? "✓" : ""}</span><span class="ring-lbl">${finished ? "fatto" : ""}</span></div></div>
    <div class="controls">
      <button id="p-skip">Salta</button>
      ${finished ? `<button class="primary" id="p-next">${P.idx + 1 < P.queue.length ? "Prossimo" : "Fine"}</button>` : `<button class="primary" id="p-run">${P.running ? "Pausa" : P.t || P.seg ? "Riprendi" : "Via"}</button>`}
      <button id="p-done">Fatto</button>
    </div>
    <section class="panel"><ol class="steps">${ex.how.map(h => `<li>${esc(h)}</li>`).join("")}</ol>${ex.caution ? `<p class="small caution">${esc(ex.caution)}</p>` : ""}</section>
  </div>`;
  if (!finished) updateRing();
  playerAnim?.stop(); playerAnim = null;
  const animBox = $("#p-anim"); if (animBox) playerAnim = GolaAnim.mount(animBox, ex.id);
  $("#p-exit").onclick = closePlayer;
  $("#p-skip").onclick = () => { P.finishedEx = false; nextExercise(); };
  $("#p-done").onclick = async () => { if (!finished) await markDone(it.id); P.finishedEx = false; nextExercise(); };
  if (finished) $("#p-next").onclick = () => { P.finishedEx = false; nextExercise(); };
  else $("#p-run").onclick = toggleRun;
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && P && !player.hidden) lockScreen(); });

/* ---------- Boot ---------- */
loadLocal();
try { const t = localStorage.getItem(LS_KEY + "-tab"); if (t && ["oggi", "programma", "esercizi", "diario"].includes(t)) state.tab = t; } catch {}
if (location.hash && ["#oggi", "#programma", "#esercizi", "#diario"].includes(location.hash)) state.tab = location.hash.slice(1);
render();
try { navigator.storage?.persist?.(); } catch {}
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
})();
