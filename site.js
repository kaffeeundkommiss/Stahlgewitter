/* Gemeinsame Funktionen aller Seiten:
   1. Glossar: erklärt Fachbegriffe beim ersten Vorkommen je Seite per Antippen (funktioniert ohne Hover, also auch am Handy).
   2. Kontextzeile auf Seiten ohne Einführungskasten.
   3. Belege in Ablaufkarten und Zahlenkästen einklappbar machen (Inhalt zuerst). */
(() => {
"use strict";

// Quellen der Glossar-Erklärungen. Alle am 06.11.2026 abgerufen; „Suchauszug“ = nur der Auszug in der Suchergebnisliste gelesen.
const GSRC = {
  g1: ["LeMO (Deutsches Historisches Museum): Der Stellungskrieg", "https://www.dhm.de/lemo/kapitel/erster-weltkrieg/kriegsverlauf/stellungskrieg"],
  g2: ["Wikipedia (de): Westfront (Erster Weltkrieg), Suchauszug", "https://de.wikipedia.org/wiki/Westfront_(Erster_Weltkrieg)"],
  g7: ["Wikipedia (de): Pour le Mérite, Suchauszug", "https://de.wikipedia.org/wiki/Pour_le_M%C3%A9rite"],
  g8: ["LeMO (Deutsches Historisches Museum): Der Orden Pour le Mérite, Suchauszug", "https://www.dhm.de/lemo/kapitel/kaiserreich/innenpolitik/der-orden-pour-le-merite"],
  h1: ["David T. Zabecki: Valor | The Last Blue Max, HistoryNet, 08.12.2017 (abgerufen 10.11.2026)", "https://historynet.com/valor-last-blue-max/"],
  web: ["Angaben dieser Website (Karte und Unterseiten mit eigenen Quellen)", "quellen-karte.html"]
};

// Begriffe. re = Suchmuster im Text; src = Belege (leer = reine Worterklärung ohne Einzelbeleg).
// Die Quellen g1, g2, g7 und g8 wurden für die Seiten zum Jagdgeschwader Richthofen am 06.11.2026 abgerufen.
const GLOSSAR = [
  { id: "westfront", t: "Westfront", re: "Westfront", src: ["g1", "g2"],
    d: "Im Ersten Weltkrieg (1914–1918) die Frontlinie in Belgien und Frankreich. Ab Herbst 1914 standen sich dort deutsche Truppen und die Alliierten in Stellungen gegenüber, von der belgischen Küste bis zur Schweizer Grenze." },
  { id: "plm", t: "Pour le Mérite", re: "Pour le Mérite", src: ["g7", "g8"],
    d: "Die höchste Tapferkeitsauszeichnung, die der König von Preußen an Offiziere verlieh." },
  { id: "kfw", t: "Kriegsfreiwilliger", re: "Kriegsfreiwillige[rn]?", src: [],
    d: "Jemand, der sich bei Kriegsbeginn freiwillig zum Militär meldet, ohne schon eingezogen worden zu sein." },
  { id: "notabitur", t: "Notabitur", re: "Notabitur", src: [],
    d: "Vorgezogene, verkürzte Reifeprüfung für Schüler, die bei Kriegsbeginn zum Militär gingen." },
  { id: "fahnenjunker", t: "Fahnenjunker, Fähnrich", re: "Fahnenjunker|Fähnrich", src: [],
    d: "Anwärter auf die Offizierslaufbahn. Der Fahnenjunker ist der Einstieg, der Fähnrich die nächste Stufe vor der Beförderung zum Leutnant." },
  { id: "leutnant", t: "Leutnant", re: "Leutnant", src: [],
    d: "Niedrigster Offiziersdienstgrad. Ein Leutnant der Infanterie führte meist einen Zug, also einen Teil einer Kompanie." },
  { id: "kompanie", t: "Kompanie, Bataillon, Regiment", re: "Kompanie|Bataillon|Regiment(?:s)?", src: [],
    d: "Gliederung der Infanterie: Mehrere Züge bilden eine Kompanie, mehrere Kompanien ein Bataillon, mehrere Bataillone ein Regiment." },
  { id: "fuesilier", t: "Füsilier-Regiment Nr. 73", re: "Füsilier-Regiment(?: Nr\\. 73)?", src: ["web"],
    d: "Jüngers Regiment, ein Infanterieregiment der preußischen Armee mit Garnison in Hannover. „Füsilier“ ist eine überlieferte Bezeichnung für Infanteristen." },
  { id: "ersatz", t: "Ersatzbataillon, Ersatztransport", re: "Ersatzbataillon|Ersatztransport", src: [],
    d: "Das Ersatzbataillon in der Heimatgarnison bildete Rekruten aus und schickte sie als Ersatz für Verluste an die Front, oft in geschlossenen Transporten." },
  { id: "lazarett", t: "Lazarett", re: "Lazarett(?:zug)?", src: [],
    d: "Militärkrankenhaus. Verwundete kamen von der Front über Verbandplätze in Feldlazarette und von dort oft in Lazarette in der Heimat." },
  { id: "spaehtrupp", t: "Spähtrupp, Stoßtrupp", re: "Spähtrupp(?:s|unternehmen)?|Stoßtrupp(?:führer)?", src: [],
    d: "Kleine Gruppe von Soldaten. Ein Spähtrupp erkundet die gegnerische Stellung, ein Stoßtrupp greift sie überraschend an." },
  { id: "etappe", t: "Etappe", re: "Etappe", src: [],
    d: "Das Gebiet hinter der Front mit Quartieren, Lagern, Lehrgängen und Verwaltung." },
  { id: "siegfried", t: "Siegfriedstellung", re: "Siegfriedstellung", src: ["web"],
    d: "Ausgebaute deutsche Verteidigungslinie hinter der Somme-Front, in die sich das deutsche Heer im März 1917 zurückzog. Britisch: Hindenburg Line." },
  { id: "michael", t: "Frühjahrsoffensive 1918", re: "Frühjahrsoffensive|Unternehmen Michael", src: ["web"],
    d: "Deutscher Großangriff an der Westfront ab dem 21. März 1918, der erste Teil hieß „Unternehmen Michael“. Jünger nannte ihn in seinem Buch „Die große Schlacht“." },
  { id: "ek", t: "Eisernes Kreuz", re: "Eiserne[ns]? Kreuz(?:es)?", src: [],
    d: "Preußische Kriegsauszeichnung in zwei Klassen; die I. Klasse ist die höhere und setzt die II. Klasse voraus." },
  { id: "hausorden", t: "Hausorden von Hohenzollern", re: "Hausordens? von Hohenzollern", src: [],
    d: "Orden des preußischen Königshauses. Das Ritterkreuz mit Schwertern wurde im Krieg an Offiziere verliehen." },
  { id: "verwabz", t: "Verwundetenabzeichen", re: "Verwundetenabzeichen", src: ["h1"],
    d: "Abzeichen für im Krieg erlittene Verwundungen, in mehreren Stufen verliehen. Die Stufe Gold gab es laut HistoryNet für fünf und mehr Verwundungen (nur eine Quelle)." }
];
window.GLOSSAR = GLOSSAR; window.GSRC = GSRC;

const BY_ID = Object.fromEntries(GLOSSAR.map(g => [g.id, g]));
let RX = null;
try {
  RX = new RegExp("(?<![\\p{L}\\p{N}])(" + GLOSSAR.map(g => "(?<" + g.id + ">" + g.re + ")").join("|") + ")(?![\\p{L}\\p{N}])", "gu");
} catch (e) { RX = null; } // sehr alte Browser ohne Lookbehind: keine Markierung, Seite bleibt lesbar

// Bereiche, in denen nichts markiert wird
const SKIP = "script,style,svg,a,button,select,label,summary,h1,h2,h3,nav,.b,.chip,.uchip,.bel,.legend,.count,.t,.day,.eyebrow,.ruler,.nowdate,ol.srcs,ol.srclist,.sources,.src,.glpop,.glnone,thead,.dates,.num";

function markIn(root, used, excl) {
  if (!RX || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (!p || p.closest(SKIP) || p.closest("[hidden]")) return NodeFilter.FILTER_REJECT;
      if (excl && p.closest(excl)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = []; let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const node of nodes) {
    const text = node.nodeValue; RX.lastIndex = 0;
    let m, last = 0, frag = null;
    while ((m = RX.exec(text))) {
      const id = Object.keys(m.groups).find(k => m.groups[k] !== undefined);
      if (!id || used.has(id)) continue;
      used.add(id);
      frag = frag || document.createDocumentFragment();
      frag.append(text.slice(last, m.index));
      const b = document.createElement("button");
      b.type = "button"; b.className = "gl"; b.dataset.g = id; b.textContent = m[0];
      b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-haspopup", "dialog");
      frag.append(b); last = m.index + m[0].length;
    }
    if (frag) { frag.append(text.slice(last)); node.replaceWith(frag); }
  }
}

// Erklärfeld
let pop = null, popFor = null;
function closePop(focusBack) {
  if (!pop) return;
  pop.remove(); pop = null;
  if (popFor) { popFor.setAttribute("aria-expanded", "false"); if (focusBack) popFor.focus(); }
  popFor = null;
}
function openPop(btn) {
  const g = BY_ID[btn.dataset.g]; if (!g) return;
  closePop(false);
  pop = document.createElement("div");
  pop.className = "glpop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", g.t);
  const onGlossar = /glossar\.html$/.test(location.pathname);
  pop.innerHTML = `<b></b><p></p><span class="glmore">${onGlossar ? "" : `<a href="glossar.html#${g.id}">Alle Begriffe im Glossar</a>`}</span><button type="button" class="glx" aria-label="Schließen">×</button>`;
  pop.querySelector("b").textContent = g.t;
  pop.querySelector("p").textContent = g.d;
  document.body.appendChild(pop);
  const r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  let x = r.left + scrollX, y = r.bottom + scrollY + 6;
  x = Math.max(scrollX + 16, Math.min(x, scrollX + document.documentElement.clientWidth - w - 16));
  if (r.bottom + h + 12 > innerHeight && r.top - h - 6 > 0) y = r.top + scrollY - h - 6;
  pop.style.left = x + "px"; pop.style.top = y + "px";
  btn.setAttribute("aria-expanded", "true"); popFor = btn;
  pop.querySelector(".glx").addEventListener("click", () => closePop(true));
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("button.gl");
  if (b) { e.preventDefault(); e.stopPropagation(); if (popFor === b) closePop(false); else openPop(b); return; }
  if (pop && !pop.contains(e.target)) closePop(false);
}, true);
document.addEventListener("keydown", e => { if (e.key === "Escape" && pop) closePop(true); });
addEventListener("resize", () => closePop(false));

// Kontextzeile auf Seiten ohne Einführungskasten
function addContext() {
  if (document.getElementById("intro") || document.querySelector(".ctx")) return;
  const header = document.querySelector("header"); if (!header) return;
  const navs = header.querySelectorAll("nav"); const after = navs[navs.length - 1]; if (!after) return;
  const p = document.createElement("p"); p.className = "ctx";
  p.innerHTML = 'Ernst Jünger an der Westfront 1914–1918. Neu im Thema? <a href="index.html#intro">Worum es geht</a> · <a href="glossar.html">Glossar</a>';
  after.after(p);
}

// Belege einklappen: Inhalt zuerst, Belegstatus und Quellen auf Wunsch
const ORDER = ["wid", "self", "one", "part", "ok"];
function foldEvidence() {
  const boxes = document.querySelectorAll(".card, .stat");
  let count = 0;
  boxes.forEach(box => {
    const items = [...box.children].filter(c => c.matches(".meta, .why"));
    if (!items.length) return;
    const d = document.createElement("details"); d.className = "belege";
    const s = document.createElement("summary");
    s.append("Belege");
    const kinds = new Set();
    items.forEach(it => it.querySelectorAll(".b").forEach(b => ORDER.forEach(k => b.classList.contains(k) && kinds.add(k))));
    ORDER.filter(k => kinds.has(k)).forEach(k => {
      const src = items.map(it => it.querySelector(".b." + k)).find(Boolean);
      const c = src.cloneNode(true); c.setAttribute("aria-hidden", "false"); s.append(c);
    });
    const inner = document.createElement("div"); inner.className = "belin";
    items.forEach(it => inner.appendChild(it));
    d.append(s, inner); box.appendChild(d); count++;
  });
  if (!count) return;
  // Legende „Belegstatus“ einklappen
  const st = document.getElementById("stH");
  if (st) {
    const sec = st.closest("section");
    const d = document.createElement("details"); d.className = "statuslegend";
    const s = document.createElement("summary"); s.textContent = "Wie die Aussagen belegt sind";
    d.appendChild(s);
    [...sec.children].filter(c => c !== st).forEach(c => d.appendChild(c));
    st.remove(); sec.appendChild(d);
    sec.removeAttribute("aria-labelledby"); sec.setAttribute("aria-label", "Belegstatus");
  }
  // Schalter „Alle Belege zeigen“ am Ablauf
  const tl = document.getElementById("tlH");
  if (tl) {
    const head = document.createElement("div"); head.className = "belhead";
    tl.replaceWith(head); head.appendChild(tl);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "beltoggle";
    btn.textContent = "Alle Belege zeigen"; btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      document.querySelectorAll("details.belege").forEach(x => x.open = on);
      btn.setAttribute("aria-pressed", String(on)); btn.textContent = on ? "Belege ausblenden" : "Alle Belege zeigen";
    });
    head.appendChild(btn);
  }
  // Sprung zu einem Beleg: zugehöriges Feld öffnen
  const openFor = () => { const t = location.hash && document.getElementById(location.hash.slice(1)); const d = t && t.closest("details"); if (d) d.open = true; };
  addEventListener("hashchange", openFor); openFor();
}

function init() {
  addContext();
  foldEvidence();
  const wrap = document.querySelector(".wrap") || document.body;
  // Kartenpanel und dynamische Listen werden neu gefüllt: dort bei jeder Änderung neu markieren
  const panel = document.getElementById("panel");
  markIn(wrap, new Set(), "#panel, [data-gl-dynamic]");
  const dyn = [...document.querySelectorAll("[data-gl-dynamic]")];
  if (panel) dyn.push(panel);
  dyn.forEach(el => {
    const run = () => { mo.disconnect(); markIn(el, new Set()); mo.observe(el, { childList: true, subtree: true }); };
    const mo = new MutationObserver(() => { clearTimeout(run.t); run.t = setTimeout(run, 30); });
    run();
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
