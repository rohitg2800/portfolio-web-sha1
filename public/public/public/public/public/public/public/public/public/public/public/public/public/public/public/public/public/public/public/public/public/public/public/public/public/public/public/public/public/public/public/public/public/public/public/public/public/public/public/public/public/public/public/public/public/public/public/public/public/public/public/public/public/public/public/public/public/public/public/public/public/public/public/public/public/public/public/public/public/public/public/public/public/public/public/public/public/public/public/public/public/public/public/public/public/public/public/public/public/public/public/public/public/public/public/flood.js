// flood.js
const API_URL = "https://flood-api.onrender.com";

const form = document.getElementById("predictForm");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");

const statusPill = document.getElementById("statusPill");
const diag = document.getElementById("diag");

const severityValue = document.getElementById("severityValue");
const confidenceValue = document.getElementById("confidenceValue");
const recommendationValue = document.getElementById("recommendationValue");

const gaugePointer = document.getElementById("gaugePointer");
const riskLabel = document.getElementById("riskLabel");
const confidenceFill = document.getElementById("confidenceFill");
const confidenceHint = document.getElementById("confidenceHint");

document.getElementById("year").textContent = new Date().getFullYear();

const SAMPLE = {
  "Peak Flood Level (m)": 8.8,
  "Event Duration (days)": 5,
  "Time to Peak (days)": 2,
  "Recession Time (day)": 3,
  "T1d": 75.2,
  "T2d": 163.4,
  "T3d": 253.0,
  "T4d": 308.0,
  "T5d": 340.0,
  "T6d": 352.0,
  "T7d": 360.0
};

function setStatus(text){ statusPill.textContent = text; }
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function setRiskUI(prob){
  if (!gaugePointer || !riskLabel || !confidenceFill || !confidenceHint) return;

  const p = clamp(prob ?? 0, 0, 1);
  const percent = p * 100;

  // 180deg (low) -> 0deg (high)
  const deg = 180 - (p * 180);
  gaugePointer.style.transform = `translateX(-50%) rotate(${deg}deg)`;

  let label = "Low";
  if (p > 0.7) label = "High";
  else if (p > 0.4) label = "Medium";

  riskLabel.textContent = `${label} (${percent.toFixed(1)}%)`;
  confidenceFill.style.width = `${percent}%`;

  confidenceHint.textContent =
    label === "High" ? "High confidence — consider alerting actions." :
    label === "Medium" ? "Moderate confidence — monitor closely." :
    "Low confidence — routine monitoring.";
}

function fillForm(obj){
  for(const [k,v] of Object.entries(obj)){
    const el = form.querySelector(`[name="${CSS.escape(k)}"]`);
    if(el) el.value = v;
  }
}

function clearUI(){
  severityValue.textContent = "—";
  confidenceValue.textContent = "—";
  recommendationValue.textContent = "—";
  setRiskUI(0);
}

function clearAll(){
  form.reset();
  clearUI();
  setStatus("Ready");
}

sampleBtn.addEventListener("click", ()=>{
  fillForm(SAMPLE);
  setStatus("Sample loaded");
});

clearBtn.addEventListener("click", clearAll);

// Quick API check
(async function apiHealth(){
  try{
    const res = await fetch(`${API_URL}/`, { method: "GET" });
    if(!res.ok) throw new Error("API not ok");
    diag.textContent = `API: online (${API_URL})`;
  }catch(e){
    diag.textContent = `API: offline or blocked (CORS).`;
  }
})();

form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  // Build payload
  const data = {};
  const inputs = form.querySelectorAll("input");
  for(const input of inputs){
    const key = input.name;
    const val = Number(input.value);
    if(Number.isNaN(val)){
      setStatus("Invalid input");
      alert(`Please enter a valid number for: ${key}`);
      return;
    }
    data[key] = val;
  }

  try{
    setStatus("Predicting…");
    diag.textContent = `Calling: ${API_URL}/predict`;

    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data),
    });

    const out = await res.json();

    if(!res.ok){
      setStatus("Error");
      recommendationValue.textContent = out.detail || "Prediction failed";
      setRiskUI(0);
      return;
    }

    // Show values
    severityValue.textContent = out.severity ?? "—";
    recommendationValue.textContent = out.recommendation ?? "—";

    const prob =
      (typeof out.confidence === "number") ? out.confidence :
      (typeof out.probability === "number") ? out.probability :
      null;

    if(prob !== null){
      confidenceValue.textContent = `${(prob*100).toFixed(1)}%`;
      setRiskUI(prob);
    }else if(out.confidence_percent){
      confidenceValue.textContent = out.confidence_percent;
      const parsed = parseFloat(String(out.confidence_percent).replace("%",""));
      setRiskUI(Number.isNaN(parsed) ? 0 : parsed/100);
    }else{
      confidenceValue.textContent = "—";
      setRiskUI(0);
    }

    setStatus("Done");
    diag.textContent = `OK: response received`;
  }catch(err){
    setStatus("Offline");
    diag.textContent = `Failed to reach API. If on GitHub Pages, you likely need CORS enabled on backend.`;
    recommendationValue.textContent = "Could not reach API. Check deployment / CORS.";
    setRiskUI(0);
  }
});

// init
clearAll();
