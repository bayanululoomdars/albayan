const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Programme', 'Collections', 'Design'],
    required: true 
  },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
