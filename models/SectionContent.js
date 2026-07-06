const mongoose = require('mongoose');

const sectionContentSchema = new mongoose.Schema({
  sectionId: { 
    type: String, 
    required: true,
    unique: true // 'latestNews', 'gallery', 'admission', 'aboutUs', 'contact'
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  readMoreLink: { type: String, default: '#' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SectionContent', sectionContentSchema);
