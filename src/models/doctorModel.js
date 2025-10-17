import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  chargePerSlot: { type: Number, required: true, default: 0 },
  availableSlots: [
    {
      date: { type: Date, required: true },
      slots: [{ type: String }] // e.g., ["10:00 AM", "11:00 AM"]
    }
  ]
});

// Check if model exists before creating it (fixes hot-reload issues)
export default mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
