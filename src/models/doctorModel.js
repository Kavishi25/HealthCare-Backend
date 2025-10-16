import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  availableSlots: [
    {
      date: { type: Date, required: true },
      slots: [{ type: String }] // e.g., ["10:00 AM", "11:00 AM"]
    }
  ]
});

export default mongoose.model("Doctor", doctorSchema);
