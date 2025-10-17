import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true },
  status: { type: String, enum: ["Booked", "Cancelled", "Completed"], default: "Booked" },
  paymentStatus: { 
    type: String, 
    enum: ["unpaid", "pending", "paid", "failed", "refunded"], 
    default: "unpaid" 
  },
  paymentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Payment", 
    required: false 
  }
}, { timestamps: true });

// Check if model exists before creating it (fixes hot-reload issues)
export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
