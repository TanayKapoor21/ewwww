import * as tf from '@tensorflow/tfjs';

class WasteClassifier {
  constructor() {
    this.model = null;
    this.categories = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash'];
    this.currentWasteType = null;
  }

  async init() {
    try {
      // Load the pre-trained model
      this.model = await tf.loadLayersModel('model/model.json');
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }

  async classify(imageElement) {
    if (!this.model) {
      throw new Error('Model not loaded. Call init() first.');
    }

    // Preprocess the image
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();

    // Normalize the image
    const offset = tf.scalar(127.5);
    const normalized = tensor.sub(offset).div(offset);

    // Make prediction
    const predictions = await this.model.predict(normalized).data();
    const results = this.processPredictions(predictions);

    // Dispose tensors to avoid memory leaks
    tensor.dispose();
    normalized.dispose();

    return results;
  }

  processPredictions(predictions) {
    // Get the index of the highest probability
    const maxIndex = predictions.indexOf(Math.max(...predictions));
    const category = this.categories[maxIndex];
    const confidence = predictions[maxIndex];

    return {
      category,
      confidence,
      subcategories: [category] // Can be expanded with specific types
    };
  }
}

export default new WasteClassifier();
