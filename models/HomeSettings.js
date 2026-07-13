const mongoose = require('mongoose');

const homeSettingsSchema = new mongoose.Schema({
  // Stats Counters
  statsStudents: { type: Number, default: 90 },
  statsUstads: { type: Number, default: 6 },
  statsYears: { type: Number, default: 50 },
  statsAlumni: { type: Number, default: 25 },

  // Principal Mudarris
  principalName: { type: String, default: 'Sheikhuna Ibrahim Baqavi Al Haithami' },
  principalTitle: { type: String, default: 'Principal Mudarris' },
  principalBio: { type: String, default: '' },
  principalImageUrl: { type: String, default: '' },

  // Assistant Mudarris List
  assistantMudarris: [{
    name: { type: String, required: true },
    role: { type: String, default: 'Assistant Mudarris' },
    imageUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' }
  }],

  // Branch & Faculty Network
  branches: [{
    name: { type: String, required: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' }
  }],

  // Footer Mudarris Info (replaces newsletter)
  footerMudarrisName: { type: String, default: 'Sheikhuna Ibrahim Baqavi Al Haithami' },
  footerMudarrisTitle: { type: String, default: 'Principal Mudarris' },
  footerMudarrisDetail: { type: String, default: 'Muttichira Bayanul Uloom Dars' },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HomeSettings', homeSettingsSchema);
