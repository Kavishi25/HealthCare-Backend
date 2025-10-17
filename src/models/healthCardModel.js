import mongoose from "mongoose";

const healthCardSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, unique: true },
    cardId: { type: String, required: true, unique: true },
    qrCodeUrl: String,
    issuedAt: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
}, { timestamps: true });

export default mongoose.model("HealthCard", healthCardSchema);
