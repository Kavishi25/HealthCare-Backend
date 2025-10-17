import Patient from "../models/patientModel.js";
import HealthCard from "../models/healthCardModel.js";
import { generateQRCode } from "../services/qrService.js";

export const registerPatient = async (req, res) => {
  console.log("Incoming data:", req.body);

  try {
    const { fullName, dob, nic, gender, email, phone, address, emergencyContact, medicalInfo } = req.body;

    // ✅ Check for duplicates (NIC or email)
    const existingPatient = await Patient.findOne({ $or: [{ nic }, { email }] });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient with the same NIC or email already exists" });
    }

    // ✅ Generate next patientId automatically
    const latestPatient = await Patient.findOne().sort({ createdAt: -1 }).lean();
    let nextNumber = 1;

    if (latestPatient && latestPatient.patientId) {
      const lastNum = parseInt(latestPatient.patientId.split("-")[1]);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    const formattedId = `PT-${String(nextNumber).padStart(4, "0")}`;

    // ✅ Create patient record
    const patient = await Patient.create({
      patientId: formattedId,
      fullName,
      dob,
      nic,
      gender,
      email,
      phone,
      address,
      emergencyContact,
      medicalInfo,
    });

    if (!patient || !patient._id) {
      return res.status(500).json({ message: "Failed to create patient record" });
    }

    // ✅ Generate health card
    const cardId = `HSP-${Date.now()}`;
    const qrData = `http://healthcare-system.com/patient/${patient._id}`;
    const qrCodeUrl = await generateQRCode(qrData);

    const healthCard = await HealthCard.create({
      patientId: patient._id,
      cardId,
      qrCodeUrl,
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });

    return res.status(201).json({
      message: "Patient registered successfully",
      patient,
      healthCard,
    });
  } catch (error) {
    console.error("Error registering patient:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });

//appeared from a merge
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};
