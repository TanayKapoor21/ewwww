// Waste classification model using TensorFlow.js
const CLASSES = {
  0: 'organic',
  1: 'ewaste',
  2: 'plastic'
};

// Load MobileNet model and modify for our classes
async function loadModel() {
  const model = await tf.loadLayersModel('model/model.json');
  return model;
}

// Preprocess image for model input
function preprocessImage(image) {
  const tensor = tf.browser.fromPixels(image)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();
  return tensor.div(255.0);
}

// Classify waste image
async function classifyWaste(imageElement) {
  try {
    const model = await loadModel();
    const tensor = preprocessImage(imageElement);
    const predictions = await model.predict(tensor).data();
    const results = Array.from(predictions)
      .map((p, i) => ({
        className: CLASSES[i],
        probability: p
      }))
      .sort((a, b) => b.probability - a.probability);
    
    return results[0].className;
  } catch (error) {
    console.error('AI classification failed:', error);
    return null;
  }
}

export { classifyWaste };
