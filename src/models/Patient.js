// src/models/Patient.js
import { Schema, model } from 'mongoose';

const patientSchema = new Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{6,10}$/, 'Patient ID must be 6-10 digits']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Left'],
    default: 'Active'
  },
  lastVisit: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt, updatedAt
});

export default model('Patient', patientSchema);