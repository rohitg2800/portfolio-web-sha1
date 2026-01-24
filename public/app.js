const $ = (s) => document.querySelector(s);

const THEME_KEY = "portfolio_theme";
let DATA = null;

function safeUrl(url) {
  try { return new URL(url).href; } catch { return null; }
}

function uniq(arr) { return [...new Set(arr)]; }

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  $("#themeBtn").textContent = theme === "light" ? "🌙" : "☀️";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return applyTheme(saved);
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  applyTheme(prefersLight ? "light" : "dark");
}

function setText(sel, val) { const n = $(sel); if (n) n.textContent = val ?? ""; }

function setLink(sel, href, text) {
  const n = $(sel);
  if (!n) return;
  const url = href ? safeUrl(href) : null;
  if (!url) {
    n.href = "#";
    n.addEventListener("click", (e) => e.preventDefault(), { once: true });
    if (text) n.textContent = text;
    return;
  }
  n.href = url;
  if (text) n.textContent = text;
}

function el(tag, cls) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
}

function renderHeader(d) {
  setText("#name", d.name);
  setText("#headline", d.headline);
  setText("#heroName", d.name);
  setText("#heroRole", d.role);
  setText("#summary", d.summary);
  setText("#location", `📍 ${d.location}`);
  setLink("#emailLink", `mailto:${d.email}`, `✉️ ${d.email}`);

  setLink("#resumeLink", d.links?.resume);
  setLink("#githubLink", d.links?.github, "GitHub");
  setLink("#linkedinLink", d.links?.linkedin, "LinkedIn");

  setLink("#contactEmail", `mailto:${d.email}`, d.email);
  setLink("#contactGitHub", d.links?.github, "GitHub");
  setLink("#contactLinkedIn", d.links?.linkedin, "LinkedIn");
  setLink("#contactResume", d.links?.resume, "Resume");

  setText("#footerName", d.name);
  setText("#year", String(new Date().getFullYear()));

  const first = (d.name || "R")[0].toUpperCase();
  $("#avatar").textContent = first;
}

function renderHighlights(d) {
  const ul = $("#highlightsList");
  ul.innerHTML = "";
  (d.highlights || []).forEach((h) => {
    const li = el("li");
    li.textContent = h;
    ul.appendChild(li);
  });
}

function renderSkills(d) {
  const grid = $("#skillsGrid");
  grid.innerHTML = "";

  (d.skills || []).forEach((g) => {
    const card = el("div", "card");
    const title = el("div", "card-title");
    title.textContent = g.group;

    const wrap = el("div", "tags");
    (g.items || []).forEach((s) => {
      const chip = el("span", "tag");
      chip.textContent = s;
      wrap.appendChild(chip);
    });

    card.appendChild(title);
    card.appendChild(wrap);
    grid.appendChild(card);
  });
}

function projectCard(p) {
  const card = el("div", "card project");

  const h = el("h3");
  h.textContent = p.title;

  const one = el("p", "one");
  one.textContent = p.oneLiner;

  const tagsWrap = el("div", "tags");
  (p.tags || []).forEach((t) => {
    const chip = el("span", "tag");
    chip.textContent = t;
    tagsWrap.appendChild(chip);
  });

  const list = el("ul", "list");
  (p.highlights || []).slice(0, 3).forEach((x) => {
    const li = el("li");
    li.textContent = x;
    list.appendChild(li);
  });

  const links = el("div", "links");
  const repo = p.links?.repo ? safeUrl(p.links.repo) : null;
  const demo = p.links?.demo ? safeUrl(p.links.demo) : null;

  if (repo) {
    const a = el("a", "link-btn");
    a.href = repo; a.target = "_blank"; a.rel = "noreferrer";
    a.textContent = "Repo";
    links.appendChild(a);
  }
  if (demo) {
    const a = el("a", "link-btn");
    a.href = demo; a.target = "_blank"; a.rel = "noreferrer";
    a.textContent = "Live Demo";
    links.appendChild(a);
  }

  card.appendChild(h);
  card.appendChild(one);
  card.appendChild(tagsWrap);
  card.appendChild(list);
  card.appendChild(links);

  return card;
}

function renderTagOptions(projects) {
  const tags = ["All", ...uniq(projects.flatMap(p => p.tags || [])).sort()];
  const sel = $("#tagFilter");
  sel.innerHTML = "";
  tags.forEach((t) => {
    const opt = el("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

function renderProjects(projects) {
  const grid = $("#projectsGrid");
  const empty = $("#emptyState");
  grid.innerHTML = "";

  if (!projects.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  projects.forEach((p) => grid.appendChild(projectCard(p)));
}

function applyFilters() {
  const q = ($("#search").value || "").trim().toLowerCase();
  const tag = $("#tagFilter").value;

  const filtered = (DATA.projects || []).filter((p) => {
    const hay = [
      p.title, p.oneLiner,
      ...(p.tags || []),
      ...(p.highlights || [])
    ].join(" ").toLowerCase();

    const mq = !q || hay.includes(q);
    const mt = (tag === "All") || (p.tags || []).includes(tag);
    return mq && mt;
  });

  renderProjects(filtered);
}

function wireEvents() {
  $("#search").addEventListener("input", applyFilters);
  $("#tagFilter").addEventListener("change", applyFilters);

  $("#clearBtn").addEventListener("click", () => {
    $("#search").value = "";
    $("#tagFilter").value = "All";
    applyFilters();
  });

  $("#themeBtn").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  $("#copyEmailBtn").addEventListener("click", async () => {
    const status = $("#copyStatus");
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(DATA.email);
      status.textContent = "Copied!";
    } catch {
      status.textContent = "Copy failed. Copy manually.";
    }
    setTimeout(() => (status.textContent = ""), 2000);
  });
}

async function init() {
  initTheme();

  const res = await fetch("./data.json", { cache: "no-store" });
  if (!res.ok) {
    alert("Could not load data.json. Run via GitLab Pages or a local server.");
    return;
  }
  DATA = await res.json();

  renderHeader(DATA);
  renderHighlights(DATA);
  renderSkills(DATA);

  renderTagOptions(DATA.projects || []);
  applyFilters();
  wireEvents();
}

document.addEventListener("DOMContentLoaded", init);
