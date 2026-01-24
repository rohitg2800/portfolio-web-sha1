const PROJECTS = [
  {
    title: "Flood Prediction System (ML + API)",
    description:
      "Random Forest model predicting flood severity using rainfall & flood-level features. Includes confidence & recommendations.",
    demo: "flood.html",
    repo: "https://github.com/YOUR_USERNAME/flood-prediction-ml",
  },
  {
    title: "Automobile Sales Dashboard",
    description:
      "Interactive Dash + Plotly dashboard with KPIs, filters, and recession analysis.",
    demo: "#",
    repo: "#",
  },
];

const grid = document.getElementById("projectGrid");

PROJECTS.forEach(p => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h3>${p.title}</h3>
    <p>${p.description}</p>
    <a href="${p.demo}">Live Demo</a> ·
    <a href="${p.repo}" target="_blank">Repo</a>
  `;

  grid.appendChild(card);
});

document.getElementById("year").textContent = new Date().getFullYear();
// Flood Prediction Demo
document.addEventListener('DOMContentLoaded', function() {
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
    const result = document.getElementById('prediction-result');
    
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
        
        // Simulate your trained Random Forest model
        const prediction = predictFlood(inputs);
        
        displayResult(prediction, inputs);
        predictBtn.textContent = 'Predict Again';
        predictBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    });
});

function predictFlood(inputs) {
    // Your trained model logic here (92% accuracy demo)
    const score = (inputs.rainfall * 0.4 + inputs.river_level * 30 + inputs.soil_moisture * 0.6) / 100;
    
    if (score > 75) return { risk: 'HIGH', probability: 92, message: 'Immediate evacuation recommended' };
    if (score > 50) return { risk: 'MEDIUM', probability: 67, message: 'Prepare emergency measures' };
    return { risk: 'LOW', probability: 23, message: 'Normal conditions - monitor updates' };
}

function displayResult(prediction, inputs) {
    const result = document.getElementById('prediction-result');
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
