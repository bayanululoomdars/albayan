const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String, default: '' },
  daysActive: { type: Number, default: 1 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate expiresAt before saving
storySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('daysActive')) {
    this.expiresAt = new Date(Date.now() + this.daysActive * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Story', storySchema);
