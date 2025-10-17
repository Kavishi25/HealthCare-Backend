import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    match: [/^\d{6,10}$/, 'Patient ID must be 6-10 digits']
  },
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    unique: true,
    sparse: true, // Allows null values
    lowercase: true,
    trim: true
  },
  phone: { type: String, trim: true },
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

// Check if model exists before creating it (fixes hot-reload issues)
export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);
