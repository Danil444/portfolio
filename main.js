document.documentElement.classList.add("js");

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");
const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>'
};
const P = window.PROJECTS || [];
const detailed = P.filter((p) => p.lead);
const compact = P.filter((p) => !p.lead);

/* ---------- Тема ---------- */
(function theme() {
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-btn")) return;
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();

/* ---------- Шапка ---------- */
const header = $(".header");
const onScroll = () => header && header.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Московское время ---------- */
const clockFmt = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" });
const tick = () => $$("[data-clock]").forEach((n) => (n.textContent = clockFmt.format(new Date())));
tick(); setInterval(tick, 15000);
$$("[data-since]").forEach((n) => {
  const [y, m] = n.dataset.since.split("-").map(Number), now = new Date();
  const total = (now.getFullYear() - y) * 12 + now.getMonth() + 1 - m + 1;
  const yy = Math.floor(total / 12), mm = total % 12;
  n.textContent = [yy ? `${yy} г.` : "", mm ? `${mm} мес.` : ""].filter(Boolean).join(" ");
});
$$("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));

/* ---------- Медиа ---------- */
function media(p, cls = "") {
  // Экраны интерфейса в рамках устройств, если они заданы в projects.js
  if (p.screens && (p.screens.desktop || p.screens.mobile)) {
    return `<div class="devices">
      ${p.screens.desktop ? `<div class="dev-desktop"><img src="${p.screens.desktop}" alt="${esc(p.client)}: веб-интерфейс" loading="lazy"></div>` : ""}
      ${p.screens.mobile ? `<div class="dev-phone"><img src="${p.screens.mobile}" alt="${esc(p.client)}: мобильный интерфейс" loading="lazy"></div>` : ""}
    </div>`;
  }
  if (p.video) {
    return `<video class="${cls}" src="${p.video}"${p.cover ? ` poster="${p.cover}"` : ""} muted loop playsinline preload="metadata" aria-label="${esc(p.client)}"></video>`;
  }
  return `<img class="${cls}" src="${p.cover}" alt="${esc(p.client)}: ${esc(p.title)}" loading="lazy">`;
}
const vio = new IntersectionObserver((es) => es.forEach((en) => (en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause())), { threshold: 0.25 });
const watchVideos = (scope) => !reduced && $$("video", scope).forEach((v) => vio.observe(v));

/* ---------- Большая карточка кейса ---------- */
function caseHTML(p, i) {
  const imgs = [p.cover, ...(p.gallery || [])].filter(Boolean);
  return `
  <article class="case reveal${i % 2 ? " flip" : ""}" id="${p.id}" data-cats="${p.cats.join(" ")}">
    <div class="case-main">
      <div class="case-media" data-gallery='${JSON.stringify(imgs)}' data-start="0" role="button" tabindex="0" aria-label="Открыть изображения проекта">${media(p)}</div>
      <div class="case-info">
        <span class="case-num"><span class="n">${pad(i + 1)}</span> · ${esc(p.client)}</span>
        <h3 class="case-title">${esc(p.title)}</h3>
        <p class="case-lead">${esc(p.lead)}</p>
        <button class="case-toggle" aria-expanded="false" aria-controls="${p.id}-more">
          <span class="lbl">Подробнее</span><span class="pm">${ICON.plus}</span>
        </button>
      </div>
    </div>
    <div class="case-more" id="${p.id}-more"><div>
      <div class="case-body">
        <div class="case-facts"><span>Роль<b>${esc(p.role)}</b></span><span>Платформа<b>${esc(p.platform)}</b></span><span>Отрасль<b>${esc(p.industry)}</b></span></div>
        <div><h4>Задача</h4><p>${esc(p.task)}</p></div>
        <div><h4>Что я сделал</h4><ol>${(p.done || []).map((d) => `<li>${esc(d)}</li>`).join("")}</ol></div>
        <div class="case-result"><h4>Результат</h4><p>${esc(p.result)}</p>${p.link ? `<a class="case-link" href="${p.link}" target="_blank" rel="noopener">Открыть сайт ↗</a>` : ""}</div>
      </div>
      ${(p.gallery || []).length ? `<div class="case-gallery">${p.gallery.map((g, k) => `<button data-gallery='${JSON.stringify(imgs)}' data-start="${k + 1}" aria-label="Увеличить изображение ${k + 1}"><img src="${g}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
    </div></div>
  </article>`;
}

function miniHTML(p) {
  return `
  <div class="mini reveal" data-cats="${p.cats.join(" ")}">
    <div class="m-media">${media(p)}</div>
    <div class="m-body">
      <b>${esc(p.client)}</b><span>${esc(p.title)} · ${esc(p.industry)}</span>
      ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener">Живой сайт ↗</a>` : ""}
    </div>
  </div>`;
}

function setOpen(card, open) {
  card.classList.toggle("open", open);
  const b = $(".case-toggle", card);
  b.setAttribute("aria-expanded", open);
  $(".lbl", b).textContent = open ? "Свернуть" : "Подробнее";
}
document.addEventListener("click", (e) => {
  const t = e.target.closest(".case-toggle");
  if (!t) return;
  const card = t.closest(".case");
  setOpen(card, !card.classList.contains("open"));
});

const featuredEl = $("#featured-cases");
if (featuredEl) {
  featuredEl.innerHTML = P.filter((p) => p.featured).map(caseHTML).join("");
  watchVideos(featuredEl);
}

const allEl = $("#all-cases");
if (allEl) {
  allEl.innerHTML = detailed.map(caseHTML).join("");
  const miniEl = $("#mini-cases");
  miniEl.innerHTML = compact.map(miniHTML).join("");
  watchVideos(allEl); watchVideos(miniEl);

  // Фильтры
  const fEl = $("#filters");
  const count = (c) => (c === "all" ? P.length : P.filter((p) => p.cats.includes(c)).length);
  fEl.innerHTML = Object.entries(window.CATEGORIES)
    .map(([k, v]) => `<button class="filter" data-cat="${k}" aria-pressed="${k === "all"}">${v}<sup>${count(k)}</sup></button>`).join("");
  fEl.addEventListener("click", (e) => {
    const b = e.target.closest(".filter");
    if (!b) return;
    $$(".filter", fEl).forEach((x) => x.setAttribute("aria-pressed", x === b));
    const c = b.dataset.cat;
    let n = 0;
    $$(".case", allEl).forEach((card) => {
      const show = c === "all" || card.dataset.cats.split(" ").includes(c);
      card.hidden = !show;
      if (show) { $(".case-num .n", card).textContent = pad(++n); card.classList.toggle("flip", (n - 1) % 2 === 1); card.classList.add("in"); }
    });
    let m = 0;
    $$(".mini", miniEl).forEach((x) => { x.hidden = !(c === "all" || x.dataset.cats.split(" ").includes(c)); if (!x.hidden) { m++; x.classList.add("in"); } });
    $("#mini-wrap").hidden = m === 0;
  });

  // Раскрыть все
  const ea = $("#expand-all");
  ea && ea.addEventListener("click", () => {
    const open = ea.dataset.state !== "open";
    $$(".case", allEl).forEach((c) => setOpen(c, open));
    ea.dataset.state = open ? "open" : "";
    ea.textContent = open ? "Свернуть все" : "Раскрыть все";
  });

  // Ссылка вида portfolio.html#vsk сразу открывает кейс
  const fromHash = () => {
    const id = location.hash.slice(1);
    const card = id && document.getElementById((window.CASE_ALIASES || {})[id] || id);
    if (card && card.classList.contains("case")) {
      setOpen(card, true); card.classList.add("in");
      setTimeout(() => card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }), 60);
    }
  };
  fromHash();
  addEventListener("hashchange", fromHash);
}

/* ---------- Индекс остальных проектов (главная) ---------- */
const indexEl = $("#index");
if (indexEl) {
  const rest = P.filter((p) => !p.featured && p.lead && !p.cats.includes("web3")).slice(0, 6);
  indexEl.innerHTML = rest.map((p, i) => `
    <a href="portfolio.html${p.lead ? "#" + p.id : ""}" data-img="${p.cover || ""}">
      <span class="i-n">${pad(i + 1 + P.filter((x) => x.featured).length)}</span>
      <span class="i-c">${esc(p.client)}</span>
      <span class="i-t">${esc(p.title)}</span>
      <span class="i-a">${ICON.arrow}</span>
    </a>`).join("");
  const prev = document.createElement("div");
  prev.className = "index-preview";
  prev.innerHTML = "<img alt=''>";
  document.body.appendChild(prev);
  const img = $("img", prev);
  let x = 0, y = 0, cx = 0, cy = 0, raf;
  const loop = () => { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; prev.style.left = cx + "px"; prev.style.top = cy + "px"; raf = requestAnimationFrame(loop); };
  indexEl.addEventListener("mousemove", (e) => { x = e.clientX + 170; y = e.clientY; });
  indexEl.addEventListener("mouseover", (e) => {
    const a = e.target.closest("a");
    if (!a || !a.dataset.img) return prev.classList.remove("on");
    if (img.getAttribute("src") !== a.dataset.img) img.src = a.dataset.img;
    prev.classList.add("on");
  });
  indexEl.addEventListener("mouseenter", (e) => { cx = x = e.clientX + 170; cy = y = e.clientY; if (!raf) loop(); });
  indexEl.addEventListener("mouseleave", () => { prev.classList.remove("on"); cancelAnimationFrame(raf); raf = null; });
}

/* ---------- Первый экран: переключатель аудиторий ---------- */
const AUDIENCES = { team: ["evraz", "vsk", "nts"], client: ["pushkincard", "aromaros", "gkclinic"] };
const audSwitch = $(".aud-switch");
const stack = $("#hero-stack");
if (audSwitch && stack) {
  const onHome = (id) => !!P.find((p) => p.id === id && p.featured);
  const renderStack = (aud) => {
    stack.innerHTML = AUDIENCES[aud].map((id, i) => {
      const p = P.find((x) => x.id === id);
      return `<a class="st-card" data-i="${i}" href="${onHome(id) ? "#" + id : "portfolio.html#" + id}" ${i ? 'tabindex="-1" aria-hidden="true"' : ""}>
        <img src="${p.cover}" alt="${esc(p.client)}">
        <span class="st-cap"><span class="mono">${esc(p.client)}</span><b>${esc(p.title)}</b></span>
      </a>`;
    }).join("");
  };
  const setAud = (aud, animate) => {
    audSwitch.dataset.active = aud;
    $$("button", audSwitch).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.aud === aud)));
    $$(".aud-panel").forEach((panel) => {
      const on = panel.dataset.aud === aud;
      panel.hidden = !on;
      if (on && animate) { panel.classList.remove("enter"); void panel.offsetWidth; panel.classList.add("enter"); }
    });
    if (animate && !reduced) {
      stack.classList.add("swap");
      setTimeout(() => { renderStack(aud); requestAnimationFrame(() => stack.classList.remove("swap")); }, 280);
    } else renderStack(aud);
    try { localStorage.setItem("aud", aud); } catch (e) {}
  };
  audSwitch.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-aud]");
    if (b && b.dataset.aud !== audSwitch.dataset.active) setAud(b.dataset.aud, true);
  });
  audSwitch.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = audSwitch.dataset.active === "team" ? "client" : "team";
    setAud(next, true);
    $(`button[data-aud="${next}"]`, audSwitch).focus();
  });
  // ?for=client или ?for=team в ссылке выбирает вариант сразу
  let start = new URLSearchParams(location.search).get("for");
  if (!AUDIENCES[start]) { try { start = localStorage.getItem("aud"); } catch (e) {} }
  setAud(AUDIENCES[start] ? start : "team", false);
}

/* ---------- Видео на первом экране (для будущего шоурила) ---------- */
const hv = $("#hero-video");
if (hv) {
  const video = $("video", hv), btn = $(".hv-toggle", hv);
  if (reduced) { video.removeAttribute("autoplay"); video.pause(); btn.setAttribute("aria-pressed", "true"); }
  btn.addEventListener("click", () => {
    const paused = btn.getAttribute("aria-pressed") === "true";
    paused ? video.play().catch(() => {}) : video.pause();
    btn.setAttribute("aria-pressed", String(!paused));
    btn.setAttribute("aria-label", paused ? "Пауза" : "Воспроизвести");
  });
  // Раскрытие до краёв: отступ сжимается от ширины контента до нуля, скругление пропадает
  const update = () => {
    const wrap = $(".wrap");
    const pad = parseFloat(getComputedStyle(wrap).paddingLeft) || 16;
    const start = Math.max(0, (innerWidth - wrap.offsetWidth) / 2) + pad;
    const k = reduced ? 0 : Math.min(1, scrollY / (innerHeight * 0.6));
    hv.style.setProperty("--inset", (start * (1 - k)).toFixed(1) + "px");
    hv.style.setProperty("--r", (28 * (1 - k)).toFixed(1) + "px");
  };
  update();
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
}

/* ---------- Лайтбокс ---------- */
const lb = document.createElement("dialog");
lb.className = "lightbox";
lb.innerHTML = `<div class="lb-inner"><img alt=""></div>
  <button class="lb-close" aria-label="Закрыть">${ICON.close}</button>
  <button class="lb-prev" aria-label="Назад">${ICON.left}</button>
  <button class="lb-next" aria-label="Вперёд">${ICON.right}</button>
  <span class="lb-count"></span>`;
document.body.appendChild(lb);
let lbList = [], lbI = 0;
const lbShow = (i) => {
  lbI = (i + lbList.length) % lbList.length;
  $("img", lb).src = lbList[lbI];
  $(".lb-count", lb).textContent = `${lbI + 1} / ${lbList.length}`;
  const many = lbList.length > 1;
  $(".lb-prev", lb).hidden = $(".lb-next", lb).hidden = !many;
};
const openLb = (el) => {
  lbList = JSON.parse(el.dataset.gallery || "[]");
  if (!lbList.length || typeof lb.showModal !== "function") return;
  lbShow(+el.dataset.start || 0);
  lb.showModal();
};
document.addEventListener("click", (e) => {
  const g = e.target.closest("[data-gallery]");
  if (g) openLb(g);
});
document.addEventListener("keydown", (e) => {
  const g = e.target.closest && e.target.closest(".case-media");
  if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLb(g); }
  if (lb.open && e.key === "ArrowRight") lbShow(lbI + 1);
  if (lb.open && e.key === "ArrowLeft") lbShow(lbI - 1);
});
$(".lb-close", lb).onclick = () => lb.close();
$(".lb-prev", lb).onclick = () => lbShow(lbI - 1);
$(".lb-next", lb).onclick = () => lbShow(lbI + 1);
lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-inner")) lb.close(); });

/* ---------- Появление при скролле ---------- */
const rio = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } }), { threshold: 0.06, rootMargin: "0px 0px -40px 0px" })
  : null;
$$(".reveal").forEach((n) => (rio ? rio.observe(n) : n.classList.add("in")));
