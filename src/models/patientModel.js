import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  nic: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContact: String,
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    chronicConditions: [String],
  },
  verified: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);
