import classifier from './ai-classifier.js';

// DOM Elements
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const wasteTypeDisplay = document.getElementById("wasteType");

// Waste information database
const wasteDetails = {
  plastic: {
    dispose: "Rinse and place in plastic recycling bins. Avoid burning. Recycle codes 1 & 2 are most accepted.",
    upcycle: "Turn into planters, organizers, eco-bricks, or creative art with kids.",
    toxic: "Releases microplastics that harm marine life. Burning produces toxic fumes.",
    eco: "Recycling one bottle saves enough energy to power a lightbulb for 3 hours and reduces landfill overflow."
  },
  ewaste: {
    dispose: "Drop off at certified e-waste centers. Never toss in regular bins. Check city waste programs.",
    upcycle: "Old phones = security cams or music players. Use apps like AlfredCamera or Kodi.",
    toxic: "Contains lead, mercury, and cadmium — harmful to soil, water, and health if dumped improperly.",
    eco: "Recycling one phone prevents 55kg of CO₂ emissions and reduces demand for raw minerals."
  },
  organic: {
    dispose: "Compost at home or use local composting bins. Ideal for gardens and city composting drives.",
    upcycle: "Use peels for leaf shine, DIY natural cleaners, or to enrich your soil.",
    toxic: "Can attract pests and release methane in landfills if not composted properly.",
    eco: "Composting reduces methane (a greenhouse gas) and creates nutrient-rich soil."
  }
};

// Initialize classifier when page loads
classifier.init().then(() => {
  console.log("Waste classifier ready");
});

// Handle image upload and classification
imageInput.addEventListener("change", async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    previewImage.src = event.target.result;
    
    // Wait for image to load
    await new Promise(resolve => previewImage.onload = resolve);
    
    // Classify the waste
    const wasteType = await classifier.classify(previewImage);
    updateWasteDisplay(wasteType);
  };
  reader.readAsDataURL(file);
});

// Update the waste type display
function updateWasteDisplay(wasteType) {
  classifier.currentWasteType = wasteType;
  wasteTypeDisplay.textContent = classifier.getWasteInfo(wasteType);
}

// Popup functions
function showPopup(type) {
  if (!classifier.currentWasteType) {
    return alert("Please scan a waste image first!");
  }
  popupContent.textContent = wasteDetails[classifier.currentWasteType][type];
  popup.classList.add("show");
}

function closePopup() {
  popup.classList.remove("show");
}

// UI interaction functions
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function showEcoSuggestions() {
  alert("🌱 Tip: Bring your own reusable bag, bottle, or straw to avoid plastic!");
}

function showBinLocations() {
  alert("📍 Try searching 'Recycle bins near me' on Google Maps for accurate bin locations.");
}

// Expose functions to global scope for HTML onclick handlers
window.showPopup = showPopup;
window.closePopup = closePopup;
window.toggleDarkMode = toggleDarkMode;
window.showEcoSuggestions = showEcoSuggestions;
window.showBinLocations = showBinLocations;
