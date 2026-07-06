const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  mediaUrl: { type: String, required: true },
  mediaType: { 
    type: String, 
    enum: ['image', 'video'],
    required: true 
  },
  cloudinaryId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slider', sliderSchema);
