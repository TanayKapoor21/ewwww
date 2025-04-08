import * as tf from '@tensorflow/tfjs';

class WasteClassifier {
  constructor() {
    this.model = null;
    this.categories = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash'];
    this.currentWasteType = null;
    this.modelLoading = false;
  }

  async init() {
    if (this.modelLoading) return;
    this.modelLoading = true;
    
    try {
      console.log('Loading model...');
      
      // Load model with progress tracking
      this.model = await tf.loadLayersModel('model/model.json', {
        onProgress: (p) => console.log(`Loading: ${Math.round(p*100)}%`)
      });

      // Warm up model
      const warmup = tf.zeros([1, 224, 224, 3]);
      await this.model.predict(warmup).data();
      warmup.dispose();
      
      console.log('Model ready');
    } catch (error) {
      console.error('Model load failed:', error);
      throw error;
    } finally {
      this.modelLoading = false;
    }
  }

  async classify(imageElement) {
    if (!this.model) await this.init();

    try {
      // Create canvas with aspect ratio preservation
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      
      // Fill background white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate aspect-preserving dimensions
      const ratio = Math.min(
        canvas.width / imageElement.width,
        canvas.height / imageElement.height
      );
      const newWidth = imageElement.width * ratio;
      const newHeight = imageElement.height * ratio;
      const offsetX = (canvas.width - newWidth) / 2;
      const offsetY = (canvas.height - newHeight) / 2;
      
      // Draw centered image
      ctx.drawImage(imageElement, offsetX, offsetY, newWidth, newHeight);

      // Convert to tensor and normalize
      const tensor = tf.tidy(() => {
        return tf.browser.fromPixels(canvas)
          .toFloat()
          .div(255.0)
          .expandDims();
      });

      // Predict with timeout and memory management
      const predictions = await Promise.race([
        this.model.predict(tensor).data(),
        new Promise((_, reject) => 
          setTimeout(() => reject('Prediction timeout'), 3000)
        )
      ]);

      // Process results with confidence threshold
      const maxIdx = predictions.indexOf(Math.max(...predictions));
      const confidence = predictions[maxIdx];
      
      if (confidence < 0.6) { // Minimum confidence threshold
        return {
          category: 'unknown',
          confidence: 0,
          subcategories: ['unknown'],
          message: 'Low confidence prediction'
        };
      }

      return {
        category: this.categories[maxIdx],
        confidence: Math.round(confidence * 100),
        subcategories: [this.categories[maxIdx]],
        allPredictions: this.categories.map((cat, i) => ({
          class: cat,
          confidence: Math.round(predictions[i] * 100)
        }))
      };

    } catch (error) {
      console.error('Classification error:', error);
      return {
        category: 'unknown',
        confidence: 0,
        subcategories: ['unknown']
      };
    }
  }
}

export default new WasteClassifier();
