// AI Waste Classifier using TensorFlow.js
class WasteClassifier {
  constructor() {
    this.CLASSES = {
      0: 'organic',
      1: 'ewaste',
      2: 'plastic'
    };
    this.model = null;
    this.currentWasteType = '';
  }

  async init() {
    try {
      // Load the model
      this.model = await tf.loadLayersModel('model/model.json');
      console.log('Model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }

  preprocessImage(imageElement) {
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
      return tensor.div(255.0);
    });
  }

  async classify(imageElement) {
    if (!this.model) {
      console.warn('Model not loaded, using mock detection');
      return this.mockDetection();
    }

    try {
      const tensor = this.preprocessImage(imageElement);
      const predictions = await this.model.predict(tensor).data();
      tf.dispose(tensor);

      const results = Array.from(predictions)
        .map((p, i) => ({
          className: this.CLASSES[i],
          probability: p
        }))
        .sort((a, b) => b.probability - a.probability);

      return results[0].className;
    } catch (error) {
      console.error('Classification error:', error);
      return this.mockDetection();
    }
  }

  mockDetection() {
    const types = ["plastic", "ewaste", "organic"];
    return types[Math.floor(Math.random() * types.length)];
  }

  getWasteInfo(type) {
    const wasteMap = {
      plastic: "🧴 Plastic Waste (e.g., Bottle)",
      ewaste: "📱 Electronic Waste (e.g., Phone)",
      organic: "🍌 Organic Waste (e.g., Banana Peel)",
    };
    return wasteMap[type] || '';
  }
}

// Initialize and export the classifier
const classifier = new WasteClassifier();
classifier.init().then(() => {
  console.log('Waste Classifier ready');
});

export default classifier;
