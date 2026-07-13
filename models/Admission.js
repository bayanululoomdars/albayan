const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  phone: { type: String, required: true },
  motherName: { type: String, required: true },
  houseName: { type: String, default: '' },
  homePhone: { type: String, default: '' },
  place: { type: String, default: '' },
  postOffice: { type: String, default: '' },
  district: { type: String, default: '' },
  pincode: { type: String, default: '' },
  dob: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  educationReligious: { type: String, default: '' },
  educationSecular: { type: String, default: '' },
  guardianName: { type: String, default: '' },
  relationship: { type: String, default: '' },
  guardianPhone: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admission', admissionSchema);
