const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  phone: { type: String, required: true },
  motherName: { type: String, required: true },
  houseName: { type: String, required: true },
  homePhone: { type: String },
  place: { type: String, required: true },
  postOffice: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String, required: true },
  dob: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  educationReligious: { type: String, required: true },
  educationSecular: { type: String, required: true },
  guardianName: { type: String, required: true },
  relationship: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admission', admissionSchema);
