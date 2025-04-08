import classifier from './enhanced-classifier.js';

// DOM Elements
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const wasteTypeDisplay = document.getElementById("wasteType");
const loadingIndicator = document.getElementById("loadingIndicator");

// Enhanced waste information with multiple random tips
const wasteDetails = {
  plastic: {
    dispose: [
      "Rinse and place in plastic recycling bins",
      "Check resin codes (1 & 2 most recyclable)",
      "Remove caps and labels before recycling",
      "Flatten containers to save space"
    ],
    upcycle: [
      "Create planters from bottles",
      "Make eco-bricks with clean, dry plastic",
      "Turn containers into organizers",
      "Create plastic yarn (plarn) for crafts"
    ],
    toxic: [
      "Releases microplastics harming marine life",
      "Burning produces toxic fumes",
      "Takes 450+ years to decompose",
      "Chemicals can leach into food"
    ],
    eco: [
      "Recycling one bottle saves energy to power a lightbulb for 3 hours",
      "Only 9% of plastic ever made has been recycled",
      "Recycling reduces landfill overflow",
      "Recycled plastic can become fleece clothing"
    ]
  },
  ewaste: {
    dispose: [
      "Drop off at certified e-waste centers",
      "Check manufacturer take-back programs",
      "Never dispose in regular trash",
      "Some retailers offer trade-in programs"
    ],
    upcycle: [
      "Old phones as security cameras",
      "Convert tablets into digital photo frames",
      "Use old computers for media servers",
      "Turn monitors into smart mirrors"
    ],
    toxic: [
      "Contains lead, mercury, and cadmium",
      "Improper disposal contaminates soil and water",
      "Hazardous to human health if not handled properly",
      "Circuit boards contain heavy metals"
    ],
    eco: [
      "Recycling one phone prevents 55kg of CO₂ emissions",
      "1 million laptops recycled saves energy for 3,500 homes",
      "E-waste contains valuable metals worth recovering",
      "Gold from 1 ton of phones = 70kg of gold ore"
    ]
  },
  organic: {
    dispose: [
      "Compost at home or use municipal composting",
      "Use for garden mulch",
      "Some cities offer organic waste collection",
      "Community gardens may accept food waste"
    ],
    upcycle: [
      "Use fruit peels for natural cleaners",
      "Create compost tea for plants",
      "Make vegetable stock from scraps",
      "Use coffee grounds as fertilizer"
    ],
    toxic: [
      "Produces methane in landfills",
      "Can attract pests if not stored properly",
      "May create leachate that contaminates water",
      "Decomposing without oxygen creates harmful gases"
    ],
    eco: [
      "Composting reduces greenhouse gases",
      "Improves soil structure and fertility",
      "Reduces need for chemical fertilizers",
      "Returns nutrients to the ecosystem"
    ]
  }
};

// Initialize enhanced classifier
classifier.init().then(() => {
  console.log("Enhanced waste classifier ready");
});

// Improved image classification with loading indicator
imageInput.addEventListener("change", async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  loadingIndicator.style.display = "flex";
  
  try {
    const reader = new FileReader();
    reader.onload = async function(event) {
      previewImage.src = event.target.result;
      
      await new Promise(resolve => previewImage.onload = resolve);
      
      const wasteType = await classifier.classify(previewImage);
      updateWasteDisplay(wasteType);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Classification error:", error);
    updateWasteDisplay("unknown");
  } finally {
    loadingIndicator.style.display = "none";
  }
});

// Update display with waste type
function updateWasteDisplay(wasteType) {
  classifier.currentWasteType = wasteType;
  wasteTypeDisplay.textContent = classifier.getWasteInfo(wasteType);
}

// Show random tip from available options
function showPopup(type) {
  if (!classifier.currentWasteType) {
    return alert("Please scan a waste image first!");
  }
  
  const details = wasteDetails[classifier.currentWasteType];
  if (!details || !details[type]) {
    popupContent.textContent = "Information not available for this waste type";
  } else {
    const tips = details[type];
    const randomIndex = Math.floor(Math.random() * tips.length);
    popupContent.textContent = tips[randomIndex];
  }
  
  popup.classList.add("show");
}

// Close popup
function closePopup() {
  popup.classList.remove("show");
}

// Show random eco tip
function showEcoSuggestions() {
  alert(`🌱 Eco Tip: ${classifier.getRandomEcoTip()}`);
}

// Show random bin location suggestion
function showBinLocations() {
  alert(`📍 ${classifier.getRandomBinLocation()}`);
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Expose functions to window
window.showPopup = showPopup;
window.closePopup = closePopup;
window.toggleDarkMode = toggleDarkMode;
window.showEcoSuggestions = showEcoSuggestions;
window.showBinLocations = showBinLocations;
