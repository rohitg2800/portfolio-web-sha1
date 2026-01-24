/**
 * script.js — Portfolio wiring
 * - Loads data.json for projects + links
 * - Safely renders buttons (disables when missing)
 */

const LINKS = {
  githubProfile: "https://github.com/rohitg2800",
  gitlabProfile: "https://gitlab.com/rohitg2800/",
  liveSite: "https://rohit-portfolio-28.netlify.app"
};

function safeLink(aEl, href) {
  if (!href || href === "#" || href.trim() === "") {
    aEl.setAttribute("aria-disabled", "true");
    aEl.classList.add("is-disabled");
    aEl.href = "javascript:void(0)";
    aEl.removeAttribute("target");
    aEl.removeAttribute("rel");
    return;
  }
  aEl.href = href;
  // open external links in new tab safely
  if (/^https?:\/\//i.test(href)) {
    aEl.target = "_blank";
    aEl.rel = "noopener noreferrer";
  }
}

async function loadData() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load data.json: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function renderProjectsFromJson(data) {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  const projects = (data && data.projects) ? data.projects : [];
  grid.innerHTML = "";

  projects.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    const tagsHtml = (p.tags || [])
      .map(t => `<span>${t}</span>`)
      .join("");

    const links = p.links || {};
    const hasLive = !!(links.live && links.live !== "#");
    const hasGitHub = !!(links.github && links.github !== "#");
    const hasGitLab = !!(links.gitlab && links.gitlab !== "#");
    const hasReport = !!(links.report && links.report !== "#");

    card.innerHTML = `
      <h3>${p.title || "Project"}</h3>
      <p>${p.description || ""}</p>
      <div class="tags">${tagsHtml}</div>
      <div class="project-actions" style="margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn ghost project-live" href="#">Live</a>
        <a class="btn ghost project-github" href="#">GitHub</a>
        <a class="btn ghost project-gitlab" href="#">GitLab</a>
        <a class="btn ghost project-report" href="#">Report</a>
      </div>
    `;

    const liveA = card.querySelector(".project-live");
    const ghA = card.querySelector(".project-github");
    const glA = card.querySelector(".project-gitlab");
    const repA = card.querySelector(".project-report");

    safeLink(liveA, links.live || "");
    safeLink(ghA, links.github || "");
    safeLink(glA, links.gitlab || "");
    safeLink(repA, links.report || "");

    // Hide unused buttons for cleaner UI
    if (!hasLive) liveA.style.display = "none";
    if (!hasGitHub) ghA.style.display = "none";
    if (!hasGitLab) glA.style.display = "none";
    if (!hasReport) repA.style.display = "none";

    grid.appendChild(card);
  });
}

function wireYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", async () => {
  wireYear();
  const data = await loadData();
  renderProjectsFromJson(data);

  // Flood Prediction Demo logic (runs only if elements exist)
  const sliders = {
    rainfall: document.getElementById('rainfall'),
    river: document.getElementById('river-level'),
    soil: document.getElementById('soil-moisture')
  };

  const values = {
    rainfall: document.getElementById('rainfall-val'),
    river: document.getElementById('river-val'),
    soil: document.getElementById('soil-val')
  };

  const predictBtn = document.getElementById('predict-btn');

  if (sliders.rainfall && sliders.river && sliders.soil && values.rainfall && values.river && values.soil && predictBtn) {
    // Live slider updates
    Object.keys(sliders).forEach(key => {
      sliders[key].addEventListener('input', function() {
        values[key].textContent =
          key === 'rainfall' ? this.value + ' mm' :
          key === 'river' ? this.value + ' m' : this.value + '%';
      });
    });

    // Mock ML prediction (replace with actual model inference)
    predictBtn.addEventListener('click', function() {
      const inputs = {
        rainfall: parseFloat(sliders.rainfall.value),
        river_level: parseFloat(sliders.river.value),
        soil_moisture: parseFloat(sliders.soil.value)
      };

      const prediction = predictFlood(inputs);
      displayResult(prediction, inputs);

      predictBtn.textContent = 'Predict Again';
      predictBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    });
  }
});

function predictFlood(inputs) {
  const score = (inputs.rainfall * 0.4 + inputs.river_level * 30 + inputs.soil_moisture * 0.6) / 100;

  if (score > 75) return { risk: 'HIGH', probability: 92, message: 'Immediate evacuation recommended' };
  if (score > 50) return { risk: 'MEDIUM', probability: 67, message: 'Prepare emergency measures' };
  return { risk: 'LOW', probability: 23, message: 'Normal conditions - monitor updates' };
}

function displayResult(prediction, inputs) {
  const result = document.getElementById('prediction-result');
  if (!result) return;

  result.innerHTML = `
    <div class="prediction-output">
      <h3>${prediction.risk} Risk Detected</h3>
      <div class="probability">${prediction.probability}% Flood Probability</div>
      <p>${prediction.message}</p>
      <div class="input-summary">
        Rainfall: ${inputs.rainfall}mm | River: ${inputs.river_level}m | Soil: ${inputs.soil_moisture}%
      </div>
    </div>
  `;

  result.className = `result-display prediction-ready risk-${prediction.risk.toLowerCase()}`;
}
