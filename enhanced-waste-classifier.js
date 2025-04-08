import classifier from './enhanced-classifier.js';

// DOM Elements
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const wasteTypeDisplay = document.getElementById("wasteType");
const loadingIndicator = document.getElementById("loadingIndicator");
const wasteDetails = document.getElementById("wasteDetails");
const imagePlaceholder = document.getElementById("imagePlaceholder");

// Initialize enhanced classifier
classifier.init().then(() => {
  console.log("Enhanced waste classifier ready");
});

// Fixed image preview and classification
imageInput.addEventListener("change", async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  loadingIndicator.style.display = "flex";
  imagePlaceholder.style.display = "none";
  previewImage.style.display = "none";
  wasteTypeDisplay.textContent = "";
  wasteDetails.textContent = "";
  
  try {
    const reader = new FileReader();
    reader.onload = async function(event) {
      previewImage.src = event.target.result;
      
      await new Promise(resolve => previewImage.onload = resolve);
      
      // Show the image
      previewImage.style.display = "block";

      // Get classification results
      const result = await classifier.classify(previewImage);
      updateWasteDisplay(result);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error("Classification error:", error);
    updateWasteDisplay("unknown");
  } finally {
    loadingIndicator.style.display = "none";
  }
});

// Improved waste display with proper confidence values
function updateWasteDisplay(result) {
  if (result === 'unknown' || !result.confidence) {
    wasteTypeDisplay.textContent = '❓ Unknown Waste';
    wasteDetails.innerHTML = 'Unable to classify this waste type';
    return;
  }

  classifier.currentWasteType = result.category;
  const subcategory = result.subcategories[0];
  const wasteEmoji = {
    organic: '🍌',
    ewaste: '📱',
    plastic: '🧴',
    paper: '📄',
    metal: '🔩',
    glass: '🍷',
    hazardous: '☢️',
    textile: '👕',
    construction: '🏗️',
    mixed: '🗑️'
  }[result.category] || '♻️';

  wasteTypeDisplay.textContent = 
    `${wasteEmoji} ${result.category.toUpperCase()}: ${subcategory}`;
  
  // Ensure confidence is a valid number
  const confidence = isNaN(result.confidence) ? 0 : Math.round(result.confidence * 100);
  
  wasteDetails.innerHTML = 
    `<strong>Confidence:</strong> ${confidence}%<br>
     <strong>Subcategories:</strong> ${result.subcategories.join(', ')}<br>
     <strong>Disposal Tip:</strong> ${getDisposalTip(result.category)}`;
}

function getDisposalTip(category) {
  const tips = {
    organic: 'Compost if possible',
    ewaste: 'Take to e-waste recycling center',
    plastic: 'Check local recycling guidelines',
    paper: 'Recycle if clean and dry',
    metal: 'Most metals are recyclable',
    glass: 'Separate by color when recycling',
    hazardous: 'Handle with care - special disposal needed',
    textile: 'Donate if in good condition',
    construction: 'Check for special collection services',
    mixed: 'Try to separate components if possible'
  };
  return tips[category] || 'Check local waste management guidelines';
}

// Rest of the existing functions remain unchanged
window.showPopup = showPopup;
window.closePopup = closePopup;
window.toggleDarkMode = toggleDarkMode;
window.showEcoSuggestions = showEcoSuggestions;
window.showBinLocations = showBinLocations;
