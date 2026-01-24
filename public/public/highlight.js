/* highlights.js - data-driven main point highlighting (no frameworks) */
(() => {
  "use strict";

  const CFG_URL = "highlights.json";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function ensureStyleHelpers() {
    // Adds minimal CSS helpers if you didn't define them already.
    // (Safe: only adds once.)
    if ($("#_hl_style")) return;
    const style = document.createElement("style");
    style.id = "_hl_style";
    style.textContent = `
      .hl-panel {
        margin-top: 14px;
        padding: 14px 14px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(255,255,255,.04);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }
      .hl-title { font-weight: 800; letter-spacing:-0.02em; margin-bottom: 10px; }
      .hl-points { display:flex; gap:10px; flex-wrap:wrap; margin:0; padding:0; list-style:none; }
      .hl-point {
        padding: 8px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(255,255,255,.03);
        font-size: 13px;
        opacity: .92;
        transform: translateZ(0);
      }

      .hl-hero-row { display:flex; gap:10px; flex-wrap:wrap; margin-top: 14px; }
      .hl-pill {
        padding: 10px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(255,255,255,.03);
        display:flex; gap:8px; align-items:center;
      }
      .hl-pill b { font-size: 13px; }
      .hl-pill span { font-size: 12px; opacity: .8; }

      .hl-spotlight {
        margin-top: 16px;
        padding: 14px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(255,255,255,.035);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 12px;
      }
      .hl-spotlight .meta { display:flex; flex-direction:column; gap:4px; }
      .hl-spotlight .meta b { font-size: 14px; }
      .hl-spotlight .meta small { opacity: .8; }
      .hl-spotlight a {
        white-space:nowrap;
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.14);
        background: rgba(255,255,255,.05);
        transition: transform .18s ease;
      }
      .hl-spotlight a:hover { transform: translateY(-2px); }

      .hl-active-glow {
        outline: 1px solid rgba(255,255,255,.06);
        box-shadow: 0 28px 90px rgba(0,0,0,.35), 0 0 0 6px rgba(67,56,202,.12);
        transform: translateY(-2px);
        transition: box-shadow .25s ease, transform .25s ease;
      }

      .hl-pulse {
        animation: hlPulse 1.4s ease-in-out infinite;
      }
      @keyframes hlPulse {
        0% { box-shadow: 0 0 0 0 rgba(67,56,202,.0); transform: translateY(0); }
        40% { box-shadow: 0 0 0 10px rgba(67,56,202,.10); transform: translateY(-2px); }
        100% { box-shadow: 0 0 0 0 rgba(67,56,202,.0); transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  function injectHeroHighlights(cfg) {
    // Finds hero-left or hero section; inserts highlight pills + spotlight.
    const hero = $(".hero") || $("#home") || document.body;
    const heroLeft = $(".hero-left") || hero;

    const row = document.createElement("div");
    row.className = "hl-hero-row scroll-reveal";

    (cfg.heroHighlights || []).forEach((h) => {
      const pill = document.createElement("div");
      pill.className = "hl-pill";
      pill.innerHTML = `<span aria-hidden="true">${h.icon || "✨"}</span>
                        <div><b>${escapeHtml(h.label)}</b><br><span>${escapeHtml(h.value)}</span></div>`;
      row.appendChild(pill);
    });

    heroLeft.appendChild(row);

    // Spotlight box
    if (cfg.spotlight?.enabled) {
      const s = document.createElement("div");
      s.className = "hl-spotlight scroll-reveal";
      s.id = "hlSpotlight";
      s.innerHTML = `
        <div class="meta">
          <b id="hlSpotTitle">Spotlight</b>
          <small id="hlSpotNote" class="muted">Highlighting your best work</small>
        </div>
        <a href="#projects" id="hlSpotJump">Open</a>
      `;
      heroLeft.appendChild(s);
    }
  }

  function injectSectionHighlights(cfg) {
    (cfg.sectionHighlights || []).forEach((sh) => {
      const section = document.getElementById(sh.sectionId);
      if (!section) return;

      // Avoid double insert
      if (section.querySelector(`[data-hl-panel="${sh.sectionId}"]`)) return;

      // Insert after the section-head if present
      const head = section.querySelector(".section-head");
      const panel = document.createElement("div");
      panel.className = "hl-panel scroll-reveal";
      panel.setAttribute("data-hl-panel", sh.sectionId);

      const title = document.createElement("div");
      title.className = "hl-title";
      title.textContent = sh.title || "Highlights";

      const ul = document.createElement("ul");
      ul.className = "hl-points";
      (sh.points || []).forEach((p) => {
        const li = document.createElement("li");
        li.className = "hl-point";
        li.textContent = p;
        ul.appendChild(li);
      });

      panel.appendChild(title);
      panel.appendChild(ul);

      if (head && head.parentElement === section) {
        head.insertAdjacentElement("afterend", panel);
      } else {
        section.insertAdjacentElement("afterbegin", panel);
      }
    });
  }

  function setupSpotlight(cfg) {
    if (!cfg.spotlight?.enabled) return;
    const items = cfg.spotlight.items || [];
    if (!items.length) return;

    const titleEl = $("#hlSpotTitle");
    const noteEl = $("#hlSpotNote");
    const jumpEl = $("#hlSpotJump");

    if (!titleEl || !noteEl || !jumpEl) return;

    let i = 0;

    const setItem = (idx) => {
      const it = items[idx];
      titleEl.textContent = it.title || "Spotlight";
      noteEl.textContent = it.note || "";
      const target = it.sectionId ? `#${it.sectionId}` : "#projects";
      jumpEl.setAttribute("href", target);
      jumpEl.textContent = "Jump →";
    };

    setItem(i);

    const every = clamp(Number(cfg.spotlight.rotateEveryMs || 2600), 800, 12000);
    setInterval(() => {
      i = (i + 1) % items.length;
      setItem(i);
    }, every);
  }

  function setupActiveSectionGlow(cfg) {
    // Highlights the section card currently in view using IntersectionObserver
    const accent = cfg.brand?.accentGlow || "rgba(91,94,216,0.28)";

    // Set CSS variable if you want to use it elsewhere
    document.documentElement.style.setProperty("--hlAccentGlow", accent);

    const sections = ["about", "projects", "skills", "security", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          // remove glow from all
          sections.forEach((s) => s.classList.remove("hl-active-glow"));
          // add to current
          e.target.classList.add("hl-active-glow");
        });
      },
      { threshold: 0.38 }
    );

    sections.forEach((s) => io.observe(s));
  }

  function setupAutoPulse(cfg) {
    if (!cfg.autoPulse?.enabled) return;

    const targets = cfg.autoPulse.targets || [];
    targets.forEach((t) => {
      const nodes = $$(t.selector);
      const max = clamp(Number(t.max || 1), 1, 6);
      nodes.slice(0, max).forEach((n) => n.classList.add("hl-pulse"));
    });
  }

  function ensureScrollRevealHook() {
    // If your page already has scroll-reveal logic, this will still work fine.
    // If not, this provides a minimal reveal observer.
    const els = $$(".scroll-reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.18 }
    );

    els.forEach((el) => io.observe(el));
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function init() {
    ensureStyleHelpers();

    let cfg;
    try {
      const res = await fetch(CFG_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${CFG_URL}`);
      cfg = await res.json();
    } catch (err) {
      console.error("[highlights] config load error:", err);
      return;
    }

    injectHeroHighlights(cfg);
    injectSectionHighlights(cfg);

    // Ensure reveal works for injected elements too
    ensureScrollRevealHook();

    setupSpotlight(cfg);
    setupActiveSectionGlow(cfg);
    setupAutoPulse(cfg);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
